# Step 3: Tạo Service

Đọc trước [`workflow.md`](../../docs-to-code/rules/workflow.md) và khảo sát cơ chế dữ liệu, lỗi và transaction của dự án.

Ví dụ: [`assets/service.templates.md`](../assets/service.templates.md). Cú pháp ORM (TypeORM): [`orm-typeorm.conventions.md`](./orm-typeorm.conventions.md) và [`assets/orm-typeorm.templates.md`](../assets/orm-typeorm.templates.md).

Service hiện thực từng bước runtime trong `Processing Flow > Detail`. Mặc định đánh dấu `// Step N`; nếu dự án có quy ước khác thì theo dự án.

## Đầu vào

- Một file wiki theo template chuẩn.
- DTO (step 1) và Controller (step 2) của API. Service phải khớp với cách Controller gọi nó.
- Model/schema phù hợp với cơ chế dữ liệu dự án cho các bảng trong `Entity/Schema`. Skill này **không** tạo entity hay migration. Nếu thiếu, dừng và hỏi người dùng.

## Các section của wiki được sử dụng

| Wiki section                                | Mục đích                                                          |
| ------------------------------------------- | ----------------------------------------------------------------- |
| `Endpoint` (Module, Handler)                | Tên Service và method (nếu wiki không có, dùng giá trị suy ra theo `SKILL.md`) |
| `Request`                                   | Tên và kiểu tham số của method                                    |
| `Processing Flow > Entity/Schema`           | Các bảng cần inject và liên kết đến tài liệu cấu trúc bảng        |
| `Processing Flow > Detail`                  | Mỗi khối `<details>` là một bước; tiêu đề và metadata nằm trong `<summary>` |
| `Response > Error`                          | Status và thông báo lỗi cho từng bước (cột `Raised at`)           |
| `Response > Success` (bảng Property ngay dưới bảng Status) | Hình dạng của giá trị trả về            |

## Step 3.1: Xác nhận ORM và tìm Entity

Xác nhận ORM/driver từ dependency và source. Với TypeORM đọc [`orm-typeorm.conventions.md`](./orm-typeorm.conventions.md); ORM khác thì dùng model, API và mẫu đã có trong dự án, không áp dụng cú pháp TypeORM. Nếu không xác minh được ORM hoặc thao tác cần thiết, dừng và hỏi. Tái sử dụng tầng Repository nếu dự án có; nếu không, theo cấu trúc hợp lệ của dự án.

## Step 3.2: Đọc các khối Detail

Nhận diện bước và các định dạng wiki cũ theo mục 3 của [`workflow.md`](../../docs-to-code/rules/workflow.md).

- `Target`: bảng hoặc biến chịu tác động của bước.
- `Details`: gộp tất cả gạch đầu dòng con để hiểu điều kiện, phép gán field và điều kiện lỗi.
- `Output`: tên biến chứa kết quả của bước. Dùng đúng tên này (`const <Output> = ...`).
- `Next`: bước kế tiếp lấy từ trường `Next` trong nội dung khối của template hiện tại, hoặc từ `<summary>` nếu dùng mẫu cũ. Có thể chỉ định nhánh có điều kiện ("Step 5 if ..., Step 7 otherwise"); hiện thực bằng `if/else` hoặc return sớm.
- `On failure`: lỗi cần ném khi bước thất bại. Đối chiếu với `Response > Error` bằng số bước trong cột `Raised at` để lấy HTTP status; dùng đúng thông báo trong wiki.

## Giá trị nghiệp vụ dùng chung

- Trước khi đưa giá trị nghiệp vụ đã xác nhận vào điều kiện Service (ví dụ `document.type` bằng `PDF` được xác nhận là `1`), tìm enum hoặc constant dùng chung hiện có trong source.
- Nếu đã có member tương ứng, dùng member đó; không so sánh trực tiếp bằng magic number/string và không tạo bản sao.
- Nếu chưa có member, thêm giá trị vào enum/constant dùng chung phù hợp theo cấu trúc dự án, rồi import và dùng member trong Service. Không tự tạo enum/constant riêng trong Service.
- Chỉ thêm mapping mà wiki hoặc người dùng đã xác nhận. Nếu chưa rõ giá trị, nơi dùng chung phù hợp, hoặc mapping mâu thuẫn với source, dừng và hỏi; không đoán hay mở rộng enum từ các giá trị chưa được giải nghĩa.
- Không áp dụng máy móc cho giá trị vốn là dữ liệu động từ request/database hoặc literal vốn có ý nghĩa riêng như `null`; mục tiêu là các mã/trạng thái nghiệp vụ có tên.

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

Cú pháp và API cho từng `Action` theo ORM đã xác nhận ở Step 3.1; chỉ áp dụng bảng TypeORM nếu dự án dùng TypeORM. Điều kiện và payload chỉ chứa field có trong model đã đọc. Chỉ dùng transaction khi wiki hoặc người dùng yêu cầu rõ. Nếu có từ hai bước ghi trở lên mà chưa rõ yêu cầu tính nhất quán, hỏi người dùng trước khi triển khai.

## Transaction (chỉ khi được yêu cầu)

Cơ chế transaction theo dự án và ORM đã xác nhận. Cú pháp TypeORM `QueryRunner` nằm ở [`orm-typeorm.conventions.md`](./orm-typeorm.conventions.md).

Quy tắc:

- Các bước đọc/kiểm tra cần tính nhất quán với ghi phải nằm trong cùng transaction với isolation/locking phù hợp; nếu wiki không rõ ranh giới hoặc điều kiện cạnh tranh, hỏi người dùng. Không mặc định chuyển mọi bước đọc ra ngoài transaction.
- Khi lỗi: rollback rồi **ném lại đúng lỗi gốc**; không nuốt lỗi, không trả về thành công giả. Luôn giải phóng tài nguyên trong `finally`.
- Mọi thao tác ghi trong transaction phải đi qua cùng một ngữ cảnh transaction; không gọi repository thường bên trong khối transaction.
- Giữ hàm điều phối và thao tác trong transaction ngắn, rõ ràng; theo cấu trúc dự án.
- Giá trị trả về dựng sau khi commit (hoặc trả trong `try` ngay sau commit), theo mục "Giá trị trả về".

Ví dụ đầy đủ: [`assets/orm-typeorm.templates.md`](../assets/orm-typeorm.templates.md) (mục "Ví dụ có Transaction"); ví dụ khung Service, Create helper, Check và Return: [`assets/service.templates.md`](../assets/service.templates.md).

## Chữ ký method và cấu trúc Service

- File và class: theo Service tương tự của dự án, mặc định `<resource>.service.ts` và `<Resource>Service`.
- Nếu file đã tồn tại, đọc toàn bộ, thêm method mới vào cuối class và thêm dependency vào constructor hiện có. Không tạo constructor thứ hai hoặc xóa method hiện có. Nếu đã có method cùng tên, hãy dừng lại và hỏi.
- Dùng đúng tên method là Handler đã suy ra (theo `SKILL.md`). Tham số phải có cùng tên và thứ tự với những gì Controller truyền vào (Param, Query, Body, Headers), với kiểu DTO từ step 1.
- Chỉ dùng `async` khi cần; mặc định đánh dấu từng bước runtime bằng `// Step N`, trừ khi quy ước dự án khác.
- Giữ hàm ngắn, rõ ràng; tách hàm con khi giúp dễ hiểu và theo cấu trúc dự án.
- Tên hàm con mô tả đúng hành động của bước (động từ + đối tượng), đặt sau method chính trong class, có kiểu tham số và kiểu trả về tường minh. Lỗi `On failure` được ném bên trong hàm con của bước tương ứng.
- Nếu Detail cần người dùng hiện tại, dùng cơ chế đã xác minh của dự án và giữ Controller/Service nhất quán; nếu chưa có hoặc không rõ, dừng và hỏi. Không tạo decorator mới.
- Inject mọi bảng được liệt kê trong `Entity/Schema` mà có dùng, nhưng không inject các bảng không dùng.
- Đăng ký Service và dependency dữ liệu trong Module theo cơ chế ORM và module đã khảo sát; chỉ dùng `forFeature` khi phù hợp với dự án.

## Xử lý lỗi

- Ánh xạ `On failure` sang exception theo wiki và cơ chế dự án; nếu mâu thuẫn về hợp đồng, hỏi. Bảng dưới là mặc định khi dùng exception NestJS:

| Status | Exception                                                   |
| ------ | ----------------------------------------------------------- |
| 400    | `BadRequestException`                                       |
| 401    | `UnauthorizedException`                                     |
| 403    | `ForbiddenException`                                        |
| 404    | `NotFoundException`                                         |
| 409    | `ConflictException`                                         |
| 422    | `UnprocessableEntityException`                              |
| 500    | `InternalServerErrorException`                              |
| Khác   | `new HttpException(message, status)` nếu body mặc định khớp wiki và filter dự án; nếu không, xác minh hợp đồng trước |

- Dùng đúng thông báo trong wiki. Không diễn đạt lại.
- Trước `throw` đầu tiên, thực hiện mục 4 của [`workflow.md`](../../docs-to-code/rules/workflow.md): tái sử dụng constant nếu dự án có; nếu không, dùng thông báo wiki trực tiếp.
- Khi một `try/catch` bao nhiều bước và wiki gán cùng một lỗi cho tất cả, ném lỗi theo mục 4 của workflow và giữ nguyên cause hoặc log theo cơ chế dự án; không nuốt lỗi.
- Không dùng `try/catch` để nuốt lỗi. Log theo yêu cầu wiki và quy ước dự án, không log dữ liệu nhạy cảm.
- Nếu `On failure` mâu thuẫn với `Response > Error` (khác status hoặc thông báo), hãy dừng lại và hỏi.
- Xem [`ro-exception.conventions.md`](../../ro-to-code/references/ro-exception.conventions.md) để biết chi tiết về chuẩn hóa exception.

## Dịch vụ và thư viện bên ngoài

- Với các bước `Compute` hoặc `Call` (băm mật khẩu, JWT, gọi service khác, v.v.), dùng các thư viện đã có trong `package.json` hoặc các service đã có trong dự án. Nếu chưa có, ghi chú trong báo cáo; không cài dependency hoặc tạo service mới.
- Không hard-code secret, thời hạn token hay URL (xem `workflow.md`, mục 3).

## Giá trị trả về

Bước `Return` phải dựng một giá trị có đúng các property trong bảng `Property` của `Response > Success`, không thừa không thiếu, và có giá trị theo quy định của wiki. Không trả về toàn bộ Entity nếu có thể làm lộ field nhạy cảm.

Chọn nơi chuyển response theo dự án; mặc định dựng object tường minh đúng wiki. Chỉ dùng `plainToInstance` nếu dự án dùng cơ chế đó. Nếu response class chưa tồn tại, step 4 hoàn thiện và nối chuyển đổi nếu cần.

## Kiểm tra trước khi hoàn tất

- [ ] Flow khớp các bước runtime và nhánh `Next`; hàm rõ ràng và theo quy ước dự án.
- [ ] Tên biến khớp với cột `Output`; tên property khớp với Entity.
- [ ] Mỗi `On failure` của bước runtime đều được ánh xạ sang lỗi với đúng status và thông báo.
- [ ] Lỗi dùng constant hiện có khi phù hợp và giữ đúng thông báo wiki.
- [ ] Giá trị trả về có đúng các property trong `Response > Success` và theo cơ chế response dự án.
- [ ] Chữ ký method khớp với cách Controller gọi.
- [ ] Service và dependency dữ liệu đã được đăng ký đúng trong Module.
- [ ] Nếu có thể, chạy lệnh kiểm tra biên dịch (xem `workflow.md`) và xác nhận không có lỗi mới từ file đã tạo.

## Báo cáo cuối

Nêu ngắn gọn bằng chứng về ORM và cấu trúc dữ liệu, các file đã tạo hoặc sửa, lỗi đã dùng, các giả định và công việc còn lại.

## Ngoài phạm vi của Step 3

- Không tạo Entity, DTO hay Controller.
- Không thêm bước, điều kiện, field hay transaction không có trong wiki (hoặc yêu cầu của người dùng).
- Không trả về toàn bộ Entity.
- Không sửa file wiki.
