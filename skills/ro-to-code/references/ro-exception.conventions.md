# Step 4: Tạo RO (Response Object) và Exception

Đọc trước [`profile-contract.md`](../../docs-to-code/rules/profile-contract.md). Khóa profile của bước này: `1.2.6`, `1.3.3`, `2.2.2`, `3.3.4`, `4.3.2`, `4.4.1`, `4.4.3`, `4.4.5`, `4.4.7`, `4.4.8`, `5.1.5`.

Ví dụ:

- RO: [`assets/ro.templates.md`](../assets/ro.templates.md)
- Lỗi trùng khóa trong database: [`assets/duplicate-key.templates.md`](../assets/duplicate-key.templates.md)

Bước này hoàn thiện đầu ra của API dựa trên section `Response`: kiểu dữ liệu response và các lỗi. Dữ liệu response dùng **RO** (Response Object), không dùng DTO; DTO chỉ dành cho dữ liệu đầu vào (step 1). Phần lớn bước này là chuẩn hóa những gì step 3 đã tạo và đối chiếu với wiki.

## Đầu vào

- Một file wiki theo template chuẩn.
- Service từ step 3 (với object literal được trả về và các câu lệnh `throw`). Nếu Service chưa tồn tại, hãy thực hiện step 3 trước hoặc thông báo cho người dùng.

## Các section của wiki được sử dụng

| Wiki section                                   | Mục đích                                      |
| ---------------------------------------------- | --------------------------------------------- |
| `Response > Success` (Status, bảng Property) | Tạo RO và kiểm tra `@HttpCode`                |
| `Response > Error` (Status, Message, Raised at) | Kiểm tra các exception được ném trong Service |
| `Endpoint` (Method, Path)                      | Cùng Module và Handler suy ra từ `SKILL.md`: đặt tên file và class |

- `Success`: bảng có cột `Property` nằm ngay dưới bảng `Status` là Body của response. Nếu không có bảng `Property` (hoặc đánh dấu `<no>`), không tạo RO. Wiki không có `Example`; chỉ đối chiếu theo bảng.
- `Error` không có khối JSON: tên lỗi (`error`) lấy theo exception dựng sẵn ứng với `Status` (xem Step 4.3). Nếu `Status` không có exception dựng sẵn tương ứng, hỏi người dùng.
## Step 4.1: RO (Response Object)

- Thư mục: thư mục con RO của module (khóa `3.1.4`). File theo mẫu khóa `1.2.6` (dựa trên resource của Handler); class theo mẫu khóa `1.3.3` (đúng hoa/thường hậu tố; ví dụ trong tài liệu viết `RO`). Ví dụ: `permission.ro.ts`, `CreatePermissionRO`.
- Nếu file RO đã tồn tại, đọc toàn bộ và thêm class mới vào cuối, giữ nguyên các class hiện có. Nếu đã có class cùng tên, hãy dừng lại và hỏi.
- Chuyển mỗi dòng trong bảng `Property` (các cột `Property`, `Type`, `Description`) thành một property có kiểu TypeScript, decorator `@Expose()` và một dòng JSDoc lấy từ `Description`. Không thêm validator vì đây là dữ liệu đầu ra. Thêm Swagger theo khóa `5.1.5` nếu có quy định.
- Chỉ các property có `@Expose()` mới xuất hiện trong kết quả (thông qua `excludeExtraneousValues: true` ở step 4.2). Điều này ngăn các field nhạy cảm (danh sách ở khóa `4.3.2`) bị lộ: các field không được khai báo sẽ không được trả về.
- Ánh xạ kiểu: `string` → `string`; `number`/`integer` → `number`; `boolean` → `boolean`; `date`/`datetime` → `Date` (JSON chuyển thành chuỗi ISO 8601); `array of X` → `X[]`; `object` → một class RO lồng nhau riêng; nếu mô tả ghi "nullable", dùng `| null`; nếu ghi "optional", để property là tùy chọn với `?`.
- Với property là `object` hoặc `array of object`, thêm `@Type(() => NestedRO)` ngay dưới `@Expose()` và khai báo class RO lồng nhau (cùng file hoặc file riêng). Nếu thiếu `@Type`, `plainToInstance` sẽ không áp dụng `@Expose()` cho các property lồng nhau.
- Với kết quả phân trang, giữ nguyên tên property mà wiki quy định (ví dụ `items`, `meta`, `total`, `page`).
- Dùng kiểu `id` do cả Entity và wiki định nghĩa: `number` cho khóa tự tăng và `string` cho UUID.
- Không dùng `@Exclude`; dùng `@Expose()` cho mọi field được phép có trong response.

## Step 4.2: Kết nối RO với Service

Giá trị trả về phải **khớp với giá trị wiki định nghĩa** và **đi qua `plainToInstance`** với RO từ step 4.1, tại nơi khóa `3.3.4` quy định: Service (nếu khóa cho Service trả RO) hoặc Controller (nếu khóa cho Service trả Entity/kiểu nội bộ và Controller chuyển sang RO).

- Tại nơi đã xác định, thay object literal hoặc Entity bằng `plainToInstance(<Action><Resource>RO, <Output>, { excludeExtraneousValues: true })`. Import `plainToInstance` từ `class-transformer`.
- `excludeExtraneousValues: true` là bắt buộc để chỉ giữ lại các property được đánh dấu `@Expose()`.
- Nếu bước `Return` dựng kết quả từ nhiều biến, gộp chúng thành một object có đúng các key của wiki rồi truyền vào `plainToInstance`.
- Nếu dự án đã bọc kết quả (khóa `3.3.4`, hoặc wrapper dùng chung như base service), đặt kết quả `plainToInstance` vào bên trong wrapper hiện có. Không tạo cơ chế mới.
- Nếu API trả về 204 hoặc wiki không có bảng `Property` (hoặc đánh dấu `<no>`), không tạo RO và không gọi `plainToInstance`.
- Không thay đổi bất kỳ phần nào khác của Service. Nếu thêm kiểu trả về, dùng kiểu RO.

## Step 4.3: Kiểm tra và chuẩn hóa Exception

Định dạng body lỗi do bộ lọc lỗi của dự án quyết định (khóa `4.4.3`); mặc định của exception dựng sẵn NestJS là `{ "message", "error", "statusCode" }`. Khi dự án dùng exception dựng sẵn (khóa `4.4.1`) và định dạng mặc định, **không cần class exception tùy chỉnh**. Với mỗi dòng trong bảng `Response > Error`:

1. Tìm `throw` tương ứng trong Service ở bước được chỉ định bởi cột `Raised at`. Thêm nếu còn thiếu; nếu có các `throw` thừa không được liệt kê trong bảng, hãy báo cho người dùng và không xóa.
2. Kiểm tra status khớp với cột `Status` và thông báo khớp chính xác với cột `Message`.
3. Chọn lớp lỗi theo khóa `4.4.5` và `4.4.1`. Khi dùng exception dựng sẵn của NestJS: 400 `Bad Request`, 401 `Unauthorized`, 403 `Forbidden`, 404 `Not Found`, 409 `Conflict`, 422 `Unprocessable Entity`, 500 `Internal Server Error`. Với status không có exception dựng sẵn, ném `new HttpException({ message, error: '<name>', statusCode: <status> }, <status>)` sau khi hỏi người dùng về tên lỗi.
4. Thông báo/mã lỗi phải nằm trong enum, không để literal trong `throw`: thực hiện mục 4 của [`profile-contract.md`](../../docs-to-code/rules/profile-contract.md) (nơi lưu theo khóa `4.4.7`). Nếu step 3 đã thực hiện thì chỉ kiểm tra lại; nếu còn `throw` dùng literal, chuyển sang member enum. Nếu dự án chưa có enum, hỏi người dùng trước khi tạo hoặc giữ literal.

**Lỗi 400 từ DTO validation** (không thuộc các bước của Service): `ValidationPipe` mặc định trả `message` là một mảng chuỗi. Nếu wiki quy định `Message` là một chuỗi đơn:

- Kiểm tra cách dự án cấu hình pipe validate (khóa `4.3.3`) tại nơi đã đối chiếu.
- Nếu không khớp, đề xuất dùng `exceptionFactory` cho `ValidationPipe`. Đây là thay đổi toàn cục ảnh hưởng đến mọi API, nên hãy hỏi người dùng trước khi sửa bootstrap/config.
- Nếu thông báo trong decorator của DTO (step 1) đã theo wiki, nêu rõ trong báo cáo rằng hành vi này vẫn cần được quyết định.

## Step 4.4: Lỗi trùng khóa trong database (tùy chọn, có điều kiện)

Chỉ áp dụng khi khóa `4.4.8` quy định xử lý lỗi trùng khóa (không phải `N/A`) **và** cả hai điều kiện sau đều thỏa: Detail kiểm tra trùng lặp trước khi tạo bản ghi, và Entity khai báo field đó là unique. Hai request đồng thời có thể cùng vượt qua bước kiểm tra, sau đó database từ chối một trong hai. Bắt lỗi trùng khóa trong thao tác create và ném **cùng exception** như bước kiểm tra trùng lặp (theo `4.4.8`).

- Dùng lại helper phát hiện lỗi trùng khóa (`ER_DUP_ENTRY` với MySQL) nếu dự án đã có. Nếu chưa có, đặt theo thư mục helper của khóa `3.2.10` và hỏi người dùng trước khi tạo file mới; không mặc định đường dẫn.
- Helper và cách dùng trong Service làm ví dụ: [`assets/duplicate-key.templates.md`](../assets/duplicate-key.templates.md).
- Nếu không thỏa cả hai điều kiện, bỏ qua mục này. Nếu có áp dụng, ghi chú trong báo cáo rằng đã thêm một `try/catch` ngoài những gì wiki quy định.

## Kiểm tra trước khi hoàn tất

- [ ] RO có số property bằng số dòng trong bảng `Property`; mỗi property có `@Expose()` cùng đúng tên và kiểu.
- [ ] Giá trị trả về đi qua `plainToInstance(<RO>, ..., { excludeExtraneousValues: true })`; tại nơi khóa `3.3.4` quy định; khi chuyển sang JSON, kết quả có cùng các key với bảng `Property` của wiki.
- [ ] Kết quả không chứa field nào không có trong wiki (đặc biệt là mật khẩu, token nội bộ hay `__v`).
- [ ] `@HttpCode` của Controller khớp với status trong `Response > Success`.
- [ ] Mỗi dòng trong `Response > Error` có đúng một `throw` tương ứng với đúng status, thông báo và (nếu không phải mặc định) tên lỗi.
- [ ] Không còn `throw` nào dùng chuỗi literal; thông báo/mã lỗi đều lấy từ enum.
- [ ] Nếu có thể, chạy lệnh kiểm tra biên dịch (xem `profile-contract.md`) và xác nhận không có lỗi mới từ các file đã tạo hoặc sửa.

## Báo cáo cuối

Liệt kê ngắn gọn các file đã tạo hoặc sửa, các điểm không khớp giữa wiki và code cần người dùng quyết định (lỗi validation, tên lỗi tùy chỉnh, `throw` thừa) và công việc còn lại.

## Ngoài phạm vi của Step 4

- Không tạo class exception, filter hay interceptor toàn cục tùy chỉnh khi exception dựng sẵn đã tạo ra đúng body wiki quy định.
- Không sửa NestJS bootstrap entry point hoặc cấu hình toàn cục khi chưa hỏi.
- Không thêm vào RO các field không có trong wiki.
- Không thay đổi business logic của Service ngoài việc kết nối RO và chuẩn hóa exception.
- Không sửa file wiki.

