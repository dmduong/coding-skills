# Step 4: Tạo RO (Response Object) và Exception

Đọc trước [`workflow.md`](../../docs-to-code/rules/workflow.md); khảo sát cơ chế response và exception hiện có.

Ví dụ:

- RO: [`assets/ro.templates.md`](../assets/ro.templates.md)
- Lỗi trùng khóa trong database: [`assets/duplicate-key.templates.md`](../assets/duplicate-key.templates.md)

Bước này hoàn thiện đầu ra dựa trên `Response`: kiểu dữ liệu và lỗi. Theo cách dự án gọi và tổ chức response DTO/RO; nếu chưa có quy ước, dùng object tường minh hoặc response class phù hợp, không bắt buộc thêm thư viện.

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
- `Error` không có khối JSON: đối chiếu exception và filter đang dùng; không tự giả định shape lỗi cuối. Nếu body cần trả về chưa rõ, hỏi người dùng.
## Step 4.1: RO (Response Object)

- Thư mục, tên file/class theo response tương tự của dự án; nếu chưa có, dùng tên rõ nghĩa trong module.
- Nếu file RO đã tồn tại, đọc toàn bộ và thêm class mới vào cuối, giữ nguyên các class hiện có. Nếu đã có class cùng tên, hãy dừng lại và hỏi.
- Chuyển mỗi dòng `Property` thành property có kiểu TypeScript; comment và Swagger theo dự án. Không thêm validator đầu vào cho response.
- Dùng serializer của dự án hoặc dựng object tường minh để chỉ trả các field được wiki cho phép, kể cả với object lồng nhau.
- Ánh xạ kiểu: `string` → `string`; `number`/`integer` → `number`; `boolean` → `boolean`; `date`/`datetime` → `Date` (JSON chuyển thành chuỗi ISO 8601); `array of X` → `X[]`; `object` → một class RO lồng nhau riêng; nếu mô tả ghi "nullable", dùng `| null`; nếu ghi "optional", để property là tùy chọn với `?`.
- Nếu dự án dùng `class-transformer`, với object hoặc mảng object dùng `@Expose()` và `@Type(() => NestedRO)` cho từng lớp lồng nhau.
- Với kết quả phân trang, giữ nguyên tên property mà wiki quy định (ví dụ `items`, `meta`, `total`, `page`).
- Dùng kiểu `id` do cả Entity và wiki định nghĩa: `number` cho khóa tự tăng và `string` cho UUID.
- Khi dùng `excludeExtraneousValues`, khai báo `@Expose()` cho các field được phép.

## Step 4.2: Kết nối RO với Service

Giá trị trả về phải **khớp wiki**; chọn Service, Controller hoặc serializer theo cấu trúc đã xác minh của dự án.

- Nếu dự án dùng `class-transformer`, có thể chuyển bằng `plainToInstance(RO, data, { excludeExtraneousValues: true })`; nếu không, dùng serializer hiện có hoặc map object tường minh. Không tự thêm dependency.
- Nếu bước `Return` dựng kết quả từ nhiều biến, gộp thành object có đúng key wiki.
- Nếu dự án đã bọc kết quả, dùng wrapper hiện có và bảo đảm shape cuối khớp wiki. Không tạo cơ chế mới.
- Nếu API trả về 204 hoặc wiki không có bảng `Property` (hoặc đánh dấu `<no>`), không tạo RO và không gọi `plainToInstance`.
- Không thay đổi bất kỳ phần nào khác của Service. Nếu thêm kiểu trả về, dùng kiểu RO.

## Step 4.3: Kiểm tra và chuẩn hóa Exception

Định dạng body lỗi theo filter dự án; exception NestJS có định dạng mặc định tùy exception. Không tạo class tùy chỉnh nếu cơ chế hiện có đáp ứng wiki. Với mỗi dòng `Response > Error`:

1. Tìm `throw` tương ứng trong Service ở bước được chỉ định bởi cột `Raised at`. Thêm nếu còn thiếu; nếu có các `throw` thừa không được liệt kê trong bảng, hãy báo cho người dùng và không xóa.
2. Kiểm tra status khớp với cột `Status` và thông báo khớp chính xác với cột `Message`.
3. Chọn lớp lỗi theo dự án và bảng trong [`service.conventions.md`](../../service-to-code/references/service.conventions.md#xử-lý-lỗi). Với status không có exception dựng sẵn, hỏi nếu wiki chưa đủ thông tin body lỗi.
4. Thực hiện mục 4 của [`workflow.md`](../../docs-to-code/rules/workflow.md): tái sử dụng constant phù hợp hoặc thông báo wiki trực tiếp nếu dự án không có.

**Lỗi 400 từ DTO validation** (không thuộc các bước của Service): `ValidationPipe` mặc định trả `message` là một mảng chuỗi. Nếu wiki quy định `Message` là một chuỗi đơn:

- Kiểm tra cách dự án cấu hình pipe validate tại nơi đã đối chiếu.
- Nếu không khớp, đề xuất dùng `exceptionFactory` cho `ValidationPipe`. Đây là thay đổi toàn cục ảnh hưởng đến mọi API, nên hãy hỏi người dùng trước khi sửa bootstrap/config.
- Nếu thông báo trong decorator của DTO (step 1) đã theo wiki, nêu rõ trong báo cáo rằng hành vi này vẫn cần được quyết định.

## Step 4.4: Lỗi trùng khóa trong database (tùy chọn, có điều kiện)

Khi wiki yêu cầu lỗi trùng lặp, kiểm tra ràng buộc unique và cơ chế ánh xạ lỗi của dự án. Hai request đồng thời có thể vượt qua kiểm tra trước khi database từ chối một request; xử lý lỗi tương ứng theo wiki và driver đã xác minh, không đổi các lỗi khác.

- Dùng lại helper phát hiện lỗi trùng khóa nếu có. Nếu chưa có, hỏi trước khi tạo file helper; không mặc định đường dẫn hoặc driver.
- Helper và cách dùng trong Service làm ví dụ: [`assets/duplicate-key.templates.md`](../assets/duplicate-key.templates.md).
- Nếu không xác minh được ràng buộc hoặc cách ánh xạ lỗi, hỏi người dùng. Nếu có áp dụng, ghi chú thay đổi trong báo cáo.

## Kiểm tra trước khi hoàn tất

- [ ] Response có đúng property và kiểu theo wiki, kể cả dữ liệu lồng nhau.
- [ ] Response dùng serializer hoặc phép map đã xác minh; kết quả JSON khớp wiki.
- [ ] Kết quả không chứa field nào không có trong wiki (đặc biệt là mật khẩu, token nội bộ hay `__v`).
- [ ] `@HttpCode` của Controller khớp với status trong `Response > Success`.
- [ ] Mỗi dòng trong `Response > Error` có đúng một `throw` tương ứng với đúng status, thông báo và (nếu không phải mặc định) tên lỗi.
- [ ] Thông báo/mã lỗi đúng wiki và dùng constant hiện có khi phù hợp.
- [ ] Nếu có thể, chạy lệnh kiểm tra biên dịch (xem `workflow.md`) và xác nhận không có lỗi mới từ các file đã tạo hoặc sửa.

## Báo cáo cuối

Liệt kê ngắn gọn các file đã tạo hoặc sửa, các điểm không khớp giữa wiki và code cần người dùng quyết định (lỗi validation, tên lỗi tùy chỉnh, `throw` thừa) và công việc còn lại.

## Ngoài phạm vi của Step 4

- Không tạo class exception, filter hay interceptor toàn cục tùy chỉnh khi exception dựng sẵn đã tạo ra đúng body wiki quy định.
- Không sửa NestJS bootstrap entry point hoặc cấu hình toàn cục khi chưa hỏi.
- Không thêm vào RO các field không có trong wiki.
- Không thay đổi business logic của Service ngoài việc kết nối RO và chuẩn hóa exception.
- Không sửa file wiki.

