# Step 3: Tạo Service

Đọc trước [`profile-contract.md`](../../docs-to-code/rules/profile-contract.md). Khóa profile của bước này: `1.2.3`, `1.2.4`, `2.1.4`, `2.2.4`, `2.2.5`, `3.3.1`, `3.3.5`, `3.3.6`, `4.1.5`, `4.4.1`, `4.4.2`, `4.4.5`.

Ví dụ: [`assets/service.templates.md`](../assets/service.templates.md). Cú pháp ORM (TypeORM): [`orm-typeorm.conventions.md`](./orm-typeorm.conventions.md) và [`assets/orm-typeorm.templates.md`](../assets/orm-typeorm.templates.md).

Service hiện thực logic xử lý của một API: mỗi dòng trong bảng `Processing Flow > Detail` của wiki trở thành một khối code có comment `// Step N`. Service truy cập MySQL thông qua Repository; cú pháp TypeORM nằm ở file ORM riêng.

## Đầu vào

- Một file wiki theo template chuẩn.
- DTO (step 1) và Controller (step 2) của API. Service phải khớp với cách Controller gọi nó.
- TypeORM entity cho các bảng trong `Entity/Schema`. Skill này **không** tạo entity. Nếu thiếu entity nào, hãy dừng lại, liệt kê các bảng còn thiếu và yêu cầu người dùng tạo entity trước (dùng skill tạo entity nếu có).

## Các section của wiki được sử dụng

| Wiki section                                | Mục đích                                                          |
| ------------------------------------------- | ----------------------------------------------------------------- |
| `Endpoint` (Module, Handler)                | Tên Service và method (nếu wiki không có, dùng giá trị suy ra theo `SKILL.md`) |
| `Request`                                   | Tên và kiểu tham số của method                                    |
| `Processing Flow > Entity/Schema`           | Các bảng cần inject và liên kết đến tài liệu cấu trúc bảng        |
| `Processing Flow > Detail`                  | Các khối `#### Step N: Action` (các bước xử lý)                   |
| `Response > Error`                          | Status và thông báo lỗi cho từng bước (cột `Raised at`)           |
| `Response > Success` (bảng Property ngay dưới bảng Status) | Hình dạng của giá trị trả về            |

## Step 3.1: Xác nhận ORM và tìm Entity

Đối chiếu khóa `2.1.4` với source rồi đọc file ORM tương ứng. Với MySQL/TypeORM: [`orm-typeorm.conventions.md`](./orm-typeorm.conventions.md) (xác nhận ORM, tìm Entity và tên property, ánh xạ thao tác dữ liệu, `save`/`insert`, cú pháp `QueryRunner`). Nếu ORM khác hoặc không khớp source, dừng lại và hỏi người dùng. Service không chứa cú pháp ORM trực tiếp: gọi method Repository (khóa `1.2.4`/`3.3.1`), thao tác mới thì thêm vào Repository theo `2.2.5`.

## Step 3.2: Đọc các khối Detail

Mỗi bước là một khối `#### Step <N>: <Action>` (tiêu đề cho số bước và `Action`), theo sau là danh sách `Target`, `Details` (có thể gồm nhiều gạch đầu dòng), `Output`, `Next`, `On failure`.

- `Target`: bảng hoặc biến chịu tác động của bước.
- `Details`: gộp tất cả gạch đầu dòng con để hiểu điều kiện, phép gán field và điều kiện lỗi.
- `Output`: tên biến chứa kết quả của bước. Dùng đúng tên này (`const <Output> = ...`).
- `Next`: bước kế tiếp. Có thể chỉ định nhánh có điều kiện ("Step 5 if ..., Step 7 otherwise"); hiện thực bằng `if/else` hoặc return sớm.
- `On failure`: lỗi cần ném khi bước thất bại. Đối chiếu với `Response > Error` bằng số bước trong cột `Raised at` để lấy HTTP status; dùng đúng thông báo trong wiki.

Phân loại `Action` bằng các từ khóa bên dưới (không phân biệt hoa thường, tiếng Việt hoặc tiếng Anh). Nếu không thể phân loại action, hãy hỏi người dùng; không đoán.

| Loại    | Từ khóa thường gặp                              | Ý nghĩa                                                          |
| ------- | ----------------------------------------------- | ---------------------------------------------------------------- |
| Find    | Find, Query, Get, Select (`Tìm`, `Truy vấn`, `Lấy`) | Đọc dữ liệu từ database                                       |
| Check   | Check, Validate, Verify (`Kiểm tra`, `Xác thực`)  | Áp dụng logic lên biến đã có; ném lỗi nếu không đạt            |
| Create  | Create, Add, Insert, Save (`Tạo`, `Thêm`, `Lưu mới`) | Thêm một bản ghi mới                                        |
| Update  | Update, Modify (`Cập nhật`, `Sửa`)               | Cập nhật một bản ghi                                            |
| Delete  | Delete, Remove (`Xóa`, `Gỡ`)                     | Xóa một bản ghi (xóa cứng hoặc xóa mềm)                         |
| Compute | Hash, Compare passwords, Generate token, Calculate (`Mã hóa`, `So sánh mật khẩu`, `Sinh token`, `Tính toán`) | Gọi một thư viện hoặc helper |
| Create helper | Create helper, Add helper, Define helper (`Tạo helper`, `Tạo hàm dùng chung`) | Tạo hàm dùng chung theo cấu trúc dự án nếu chưa có |
| Call    | Call a service, Call an external API (`Gọi service`, `Gọi API ngoài`) | Gọi service khác của dự án hoặc hệ thống bên ngoài |
| Return  | Return, Map result (`Trả về`, `Map kết quả`)     | Tạo giá trị trả về                                              |

`Create helper` là bước hướng dẫn tạo mã nguồn, không phải thao tác chạy trong mỗi request. Dùng bước này khi flow cần một hàm dùng chung nhưng dự án chưa có hàm phù hợp; action này không phụ thuộc vào loại bước sẽ sử dụng hàm:

- Kiểm tra helper hiện có trước; nếu đã có hàm phù hợp thì tái sử dụng, không tạo bản trùng.
- `Target` phải chỉ rõ file sẽ chứa helper theo cấu trúc dùng chung đã khảo sát. `Details` phải nêu tên hàm, tham số, kết quả và quy tắc xử lý đủ để cài đặt.
- Chỉ tạo hàm dùng chung cần thiết; không tạo service hoặc dependency mới cho bước này.
- Đặt bước `Create helper` trước bước sử dụng hàm đó, bất kể action của bước sử dụng là `Compute`, `Check`, `Create` hay loại khác. `Output` của bước này là tên hàm; output dữ liệu runtime thuộc về bước sử dụng helper.
- Không coi việc thêm helper là một bước runtime của Service và không ánh xạ `On failure` của bước này thành lỗi HTTP.

## Step 3.3: Ánh xạ thao tác dữ liệu

Cú pháp và API cho từng loại `Action` (Find, Check tồn tại, Create, Update, Delete, phân trang, relation) lấy từ file ORM ở Step 3.1, mục "Ánh xạ thao tác dữ liệu" và "Chọn `save` hay `insert`". Điều kiện và payload chỉ chứa các field có trong Entity đã đọc. Chỉ dùng transaction khi wiki hoặc người dùng yêu cầu rõ (ví dụ "run in a transaction"). Nếu có từ hai bước ghi trở lên mà không ai nhắc đến transaction, **không thêm**; ghi chú trong báo cáo cuối để người dùng quyết định.

## Transaction (chỉ khi được yêu cầu)

Cơ chế transaction theo khóa `3.3.5`. Cú pháp `QueryRunner` nằm ở [`orm-typeorm.conventions.md`](./orm-typeorm.conventions.md) (mục "Transaction bằng `QueryRunner`"); cơ chế khác thì giữ nguyên các nguyên tắc dưới đây.

Quy tắc:

- Các bước **đọc/kiểm tra** (Find, Check) thực hiện **trước** khi mở transaction, bằng repository thường. Transaction chỉ bao các bước **ghi** (Create, Update, Delete).
- Khi lỗi: rollback rồi **ném lại đúng lỗi gốc**; không nuốt lỗi, không trả về thành công giả. Luôn giải phóng tài nguyên trong `finally`.
- Mọi thao tác ghi trong transaction phải đi qua cùng một ngữ cảnh transaction; không gọi repository thường bên trong khối transaction.
- Tách hàm con: hàm điều phối (mở/commit/rollback/release) ngắn gọn, phần ghi dữ liệu nằm trong hàm con `private async` nhận ngữ cảnh transaction làm tham số, mỗi hàm tối đa khoảng 30 dòng.
- Giá trị trả về dựng sau khi commit (hoặc trả trong `try` ngay sau commit), theo mục "Giá trị trả về".

Ví dụ đầy đủ: [`assets/orm-typeorm.templates.md`](../assets/orm-typeorm.templates.md) (mục "Ví dụ có Transaction"); ví dụ khung Service, Create helper, Check và Return: [`assets/service.templates.md`](../assets/service.templates.md).

## Chữ ký method và cấu trúc Service

- File và class: theo mẫu khóa `1.2.3` và `1.3.1`, đặt ở thư mục module (khớp với Service mà Controller inject ở step 2).
- Nếu file đã tồn tại, đọc toàn bộ, thêm method mới vào cuối class và thêm dependency vào constructor hiện có. Không tạo constructor thứ hai hoặc xóa method hiện có. Nếu đã có method cùng tên, hãy dừng lại và hỏi.
- Dùng đúng tên method là Handler đã suy ra (theo `SKILL.md`). Tham số phải có cùng tên và thứ tự với những gì Controller truyền vào (Param, Query, Body, Headers), với kiểu DTO từ step 1.
- Mọi method phải là `async`. Mỗi Step phải là một khối code (hoặc một lời gọi hàm con) có comment `// Step N: <mô tả ngắn từ wiki>` để đối chiếu với wiki.
- Giới hạn độ dài hàm: tuân theo `profile-contract.md` (tối đa khoảng 30 dòng/hàm, kể cả method chính và hàm con).
- Mỗi bước nên được tách thành một hàm con `private async` riêng (ví dụ `findRoleOrFail`, `assertNameNotExists`, `createUser`). Method chính chỉ điều phối: gọi tuần tự các hàm con theo thứ tự các Step, mỗi lời gọi có comment `// Step N: ...`. Có thể gộp các bước rất nhỏ liên quan chặt chẽ vào một hàm con nếu vẫn dễ đối chiếu với wiki.
- Tên hàm con mô tả đúng hành động của bước (động từ + đối tượng), đặt sau method chính trong class, có kiểu tham số và kiểu trả về tường minh. Lỗi `On failure` được ném bên trong hàm con của bước tương ứng.
- Nếu Detail dùng thông tin về người dùng đang đăng nhập (ví dụ `userId` từ token) mà Controller không truyền, thêm một tham số cho Service và báo người dùng cập nhật Controller theo cơ chế lấy người dùng hiện tại của khóa `4.1.5`. Không tạo decorator mới.
- Inject mọi bảng được liệt kê trong `Entity/Schema` mà có dùng, nhưng không inject các bảng không dùng.
- Đăng ký Service và các `forFeature` của các bảng trong Module nếu chưa có.

## Xử lý lỗi

- Chuyển mỗi `On failure` thành một `throw` ở bước tương ứng, dùng lớp lỗi theo khóa `4.4.1` và ánh xạ tình huống → lỗi của khóa `4.4.5`. Status trong `Response > Error` là giá trị cuối cùng; nếu `4.4.5` cho lớp khác với status wiki thì theo status wiki. Bảng dưới là mặc định khi profile dùng exception dựng sẵn của NestJS:

| Status | Exception                                                   |
| ------ | ----------------------------------------------------------- |
| 400    | `BadRequestException`                                       |
| 401    | `UnauthorizedException`                                     |
| 403    | `ForbiddenException`                                        |
| 404    | `NotFoundException`                                         |
| 409    | `ConflictException`                                         |
| 422    | `UnprocessableEntityException`                              |
| 500    | `InternalServerErrorException`                              |
| Khác   | `new HttpException({ message, error, statusCode }, status)` |

- Dùng đúng thông báo trong wiki. Không diễn đạt lại.
- **Thông báo lỗi lấy từ enum, không viết literal trong `throw`.** Trước khi viết `throw` đầu tiên, thực hiện mục 4 của [`profile-contract.md`](../../docs-to-code/rules/profile-contract.md) (nơi lưu theo khóa `4.4.7`; chưa có thì hỏi người dùng). Các `throw` trong ví dụ chỉ minh họa; dùng enum và hình dạng exception thực tế của dự án.
- Khi một `try/catch` bao nhiều bước và wiki gán cùng một lỗi cho tất cả (ví dụ `ERR_CREATE_DOCUMENT_FAILED` ở nhiều bước), ném lỗi đó một lần từ `catch` bằng member enum, giữ nguyên lỗi gốc qua `{ cause: error }` hoặc theo cách dự án ghi log lỗi; không nuốt lỗi.
- Không dùng `try/catch` để nuốt lỗi. Không log trừ khi wiki yêu cầu.
- Nếu `On failure` mâu thuẫn với `Response > Error` (khác status hoặc thông báo), hãy dừng lại và hỏi.
- Xem [`ro-exception.conventions.md`](./ro-exception.conventions.md) để biết chi tiết về chuẩn hóa exception.

## Dịch vụ và thư viện bên ngoài

- Với các bước `Compute` hoặc `Call` (băm mật khẩu, JWT, gọi service khác, v.v.), dùng các thư viện đã có trong `package.json` hoặc các service đã có trong dự án. Nếu chưa có, ghi chú trong báo cáo; không cài dependency hoặc tạo service mới.
- Không hard-code secret, thời hạn token hay URL (xem `profile-contract.md`, mục 3).

## Giá trị trả về

Bước `Return` phải dựng một giá trị có đúng các property trong bảng `Property` của `Response > Success`, không thừa không thiếu, và có giá trị theo quy định của wiki. Không trả về toàn bộ Entity vì có thể làm lộ các field nhạy cảm (khóa `4.3.2`).

Nơi chuyển sang RO theo khóa `3.3.4` (profile ưu tiên). Nếu khóa quy định Service trả Entity hoặc kiểu nội bộ và Controller chuyển sang RO, Service chỉ dựng giá trị đúng các property của bảng `Property` và **không** gọi `plainToInstance`; việc chuyển nằm ở Controller (step 2/4). Nếu khóa quy định Service trả RO, đặt việc dựng object và gọi `plainToInstance(<RO>, <data>, { excludeExtraneousValues: true })` trong một hàm con (ví dụ `toCreatePermissionRO`). Nếu RO chưa tồn tại, trước tiên trả về object literal; step 4 tạo RO và nối việc chuyển ở nơi khóa `3.3.4` quy định.

## Kiểm tra trước khi hoàn tất

- [ ] Không hàm nào dài quá khoảng 30 dòng; mỗi bước đã được tách thành hàm con.
- [ ] Số khối `// Step N` khớp với số dòng trong Detail, đúng thứ tự và theo các nhánh `Next`.
- [ ] Tên biến khớp với cột `Output`; tên property khớp với Entity.
- [ ] Mỗi `On failure` đều có một `throw` với đúng status và thông báo.
- [ ] Không có `throw` nào dùng chuỗi literal; mọi thông báo/mã lỗi tham chiếu member enum (`profile-contract.md` mục 4), và các member mới đã được thêm vào enum.
- [ ] Giá trị trả về có đúng các property trong bảng `Property` của `Response > Success` và sẽ được chuyển sang RO ở nơi khóa `3.3.4` quy định (step 4).
- [ ] Chữ ký method khớp với cách Controller gọi.
- [ ] Service và các `forFeature` đã được đăng ký trong Module.
- [ ] Nếu có thể, chạy lệnh kiểm tra biên dịch (xem `profile-contract.md`) và xác nhận không có lỗi mới từ file đã tạo.

## Báo cáo cuối

Nêu ngắn gọn bằng chứng dự án dùng TypeORM, các file đã tạo hoặc sửa, enum lỗi đã dùng hoặc tạo cùng các member đã thêm, các giả định và công việc còn lại (thiếu Entity, thiếu thư viện, tham số bổ sung mà Controller phải truyền, hoặc các bước ghi không có transaction).

## Ngoài phạm vi của Step 3

- Không tạo Entity, DTO hay Controller.
- Không thêm bước, điều kiện, field hay transaction không có trong wiki (hoặc yêu cầu của người dùng).
- Không trả về toàn bộ Entity.
- Không sửa file wiki.

