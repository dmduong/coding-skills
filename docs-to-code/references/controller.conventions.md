# Step 2: Tạo Controller

Đọc trước [`profile-contract.md`](../rules/profile-contract.md). Khóa profile của bước này: `1.2.2`, `1.3.1`, `1.5.1`–`1.5.6`, `2.2.3`, `3.3.2`, `4.1.3`, `4.1.4`, `4.2.2`, `4.2.5`, `5.1.2`–`5.1.4`.

Ví dụ: [`assets/controller.templates.md`](../assets/controller.templates.md).

Mỗi wiki mô tả đúng một API và tương ứng với đúng một handler. Một Controller thường chứa nhiều handler (từ nhiều file wiki), nên bước này có hai trường hợp: tạo file Controller mới hoặc thêm handler vào Controller đã có.

## Đầu vào

- Một file wiki theo template chuẩn.
- DTO của API phải đã được tạo ở step 1. Nếu wiki có section Request nhưng file DTO tương ứng chưa tồn tại, hãy thực hiện step 1 trước (hoặc thông báo cho người dùng) rồi mới tạo Controller.

## Các section của wiki được sử dụng

| Wiki section                                                  | Mục đích                                                         |
| ------------------------------------------------------------- | ---------------------------------------------------------------- |
| `Purpose`                                                     | Viết comment mô tả handler                                       |
| `Endpoint` (Method, Path, Roles)                              | Xác định route và phân quyền; tên Controller, Handler suy ra theo `SKILL.md` |
| `Header`                                                      | Xác định header nào handler phải đọc trực tiếp                   |
| `Request`                                                     | Xác định tham số handler (dùng DTO từ step 1)                    |
| `Response > Success` (Status)                                 | Xác định HTTP response status                                    |

`Endpoint` của wiki chỉ có `Method`, `Path`, `Roles`: suy ra Module, Controller, Handler theo mục "Suy ra Module, Controller, Handler" trong [`SKILL.md`](../SKILL.md) và dùng đúng các giá trị đó (nêu trong báo cáo). `Request > Body (Raw)` dùng `@Body() body: <Name>Dto`; `Body (Form data)` dùng `@Body() body: <Name>FormDto`, và với field kiểu file thì thêm `@UseInterceptors(...)` cùng `@UploadedFile()` theo cơ chế upload của dự án (hỏi người dùng nếu dự án chưa có).

Không đọc `Processing Flow` ở bước này. Logic xử lý thuộc về step 3.

## Workflow

1. **Đọc wiki** và trích xuất Method, Path, Roles và Status thành công, rồi suy ra Module, Controller, Handler.
2. **Đối chiếu dự án**: tìm các file Controller và Module hiện có; xác nhận cơ chế phân quyền (khóa `4.1.x`, `4.2.x`) và global prefix (khóa `1.5.1`) đúng như profile ghi, tại các file đã xác định ở bước đối chiếu. Dùng Glob/Grep; không đoán.
3. **Xác định route** theo các quy tắc bên dưới.
4. **Tạo hoặc cập nhật Controller**.
5. **Đăng ký Controller** trong `controllers: []` của Module nếu chưa có.
6. **Chạy các kiểm tra** (xem mục Kiểm tra) và đưa ra báo cáo ngắn gọn.

## Vị trí và đặt tên

- File: theo mẫu khóa `1.2.2`, đặt ở thư mục module (khóa `3.1.4`). Ví dụ với mẫu `x-y.controller.ts`: `AuthController` → `auth.controller.ts`.
- Dùng đúng tên class Controller và tên handler đã suy ra (theo `SKILL.md`). Không tự đổi tên Controller/handler đã có trong dự án.
- Nếu file Controller đã tồn tại, đọc toàn bộ file và thêm handler mới vào cuối class, giữ nguyên các handler hiện có. Không tạo file Controller thứ hai cho cùng một class.
- Nếu đã có handler cùng tên trong Controller, hoặc đã có handler cùng Method + Path, hãy dừng lại và hỏi người dùng. Không ghi đè.

## Quy tắc xác định route

Wiki quy định Path đầy đủ, ví dụ `/auth/login`. Tách Path thành prefix của Controller và route của handler:

- Segment đầu tiên của Path là prefix của Controller: `@Controller('auth')`.
- Phần còn lại là route của handler: `@Post('login')`. Nếu không còn gì, dùng `@Post()`.
- Nếu Controller hiện có dùng prefix khác với segment đầu của Path, ưu tiên prefix hiện có và tính lại route còn lại cho phù hợp. Thông báo cho người dùng nếu không thể làm route khớp.
- Path Variable trong wiki có thể được viết là `{id}` hoặc `<id>`; chuyển thành `:id`.
- Global prefix (khóa `1.5.1`, khai báo một nơi tại entry point): nếu Path trong wiki không bắt đầu bằng prefix đó thì không thêm prefix vào Controller; nếu Path có prefix thì bỏ segment đó khỏi decorator. Hỏi người dùng nếu không rõ wiki dùng định dạng nào.
- Dạng path và tên path param theo khóa `1.5.2`, `1.5.3`; Path trong wiki lệch quy ước này thì hỏi người dùng, không tự đổi.

Ánh xạ Method:

| Method | Decorator   |
| ------ | ----------- |
| GET    | `@Get()`    |
| POST   | `@Post()`   |
| PUT    | `@Put()`    |
| PATCH  | `@Patch()`  |
| DELETE | `@Delete()` |

Thứ tự khai báo: đặt route tĩnh (ví dụ `@Get('me')`) trước route có tham số (ví dụ `@Get(':id')`) trong cùng một Controller để tránh route bị che khuất.

## Tham số của handler

| Request section | Tham số                                    | Kiểu             |
| --------------- | ------------------------------------------ | ---------------- |
| Body (Raw)      | `@Body() body: <Name>Dto`                  | DTO từ step 1    |
| Body (Form data) | `@Body() body: <Name>FormDto`             | DTO từ step 1    |
| Query Params    | `@Query() query: <Name>QueryDto`           | DTO từ step 1    |
| Path Variables  | `@Param() params: <Name>ParamsDto`         | DTO từ step 1    |
| Header cần đọc  | `@Headers('<header-name>') <name>: string` | `string`         |

Quy tắc cho Header:

- Chỉ khai báo `@Headers()` khi handler thực sự cần giá trị header (ví dụ `x-device-id`).
- Bỏ qua `Content-Type` và `Authorization`. Guard xử lý xác thực; không đọc chúng trong handler.
- Nếu một header là bắt buộc (`Required = Y`) và không thuộc nhóm bị bỏ qua, thêm nó vào handler và báo cho người dùng rằng việc kiểm tra thiếu header nên làm trong Guard hoặc Pipe.

Nếu một section Request được đánh dấu `no`, không thêm tham số tương ứng. Sắp xếp tham số theo thứ tự: Param, Query, Body, Headers.

## Phân quyền (cột `Roles`)

Chỉ dùng các cơ chế phân quyền đã có trong dự án. Không tạo Guard hay decorator mới. Ánh xạ cột `Roles` theo khóa `4.2.5` (kèm `4.1.3`, `4.1.4`, `4.2.2`):

| Giá trị `Roles`                       | Hành động                                                                                                                         |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Public / không cần xác thực           | Dùng decorator công khai của khóa `4.1.4`; nếu khóa này `N/A` hoặc decorator chưa tồn tại thì hỏi người dùng                      |
| Authenticated (không giới hạn role)   | Theo khóa `4.2.5`. Guard xác thực toàn cục (khóa `4.1.3`) thì không thêm gì; ngược lại thêm guard theo khóa `4.1.2`               |
| Danh sách role cụ thể                 | Dùng decorator của khóa `4.2.2` với các role trong enum của khóa `4.2.3`; role không có trong enum (khóa `4.2.4`) thì dừng và hỏi |

Nếu wiki yêu cầu phân quyền nhưng dự án không có cơ chế tương ứng, không tạo decorator. Nêu rõ điều này trong báo cáo cuối để người dùng quyết định.

## HTTP Status

- Lấy status từ `Response > Success`.
- Mặc định của NestJS: POST trả về 201; các method khác trả về 200.
- Nếu status trong wiki khác mặc định, thêm `@HttpCode(<status>)`. Ví dụ, nếu POST `/auth/login` trả về 200, thêm `@HttpCode(200)`.
- Nếu wiki quy định 204, dùng `@HttpCode(204)` và để handler không trả về dữ liệu.

## Thân handler

Handler chỉ ủy quyền cho Service; không chứa business logic:

- Inject Service qua constructor: `constructor(private readonly <module>Service: <Module>Service) {}`. Nếu Controller đã có constructor, thêm dependency vào đó; không tạo constructor thứ hai.
- Suy ra tên Service từ Module theo khóa `1.3.1`.
- Gọi `return this.<module>Service.<handler>(<parameters>)` với đúng tên handler đã suy ra.
- Nếu khóa `3.3.4` quy định Controller chuyển sang RO: bọc kết quả của Service bằng `plainToInstance(<RO>, result, { excludeExtraneousValues: true })` (RO từ step 4; chưa có RO thì nêu trong báo cáo).
- Không dùng `try/catch`. Service ném lỗi (step 3) và NestJS chuyển chúng thành HTTP response.
- Không validate thủ công. Việc validate thuộc về DTO và `ValidationPipe`.
- Không tạo file Service. Nếu Service hoặc method chưa tồn tại, nêu trong báo cáo rằng cần tạo ở step 3.
- Để TypeScript tự suy luận kiểu trả về. Nếu đã có RO cho API này, dùng nó làm kiểu trả về.

## Comment và Swagger

- Thêm một JSDoc ngắn cho mỗi handler, gồm Purpose (dịch sang ngôn ngữ chú thích của khóa `1.1.8`) và một dòng `@route <METHOD> <Path>`.
- Swagger theo khóa `5.1.1`–`5.1.4`: `N/A` thì không thêm; có quy định thì thêm decorator trên Controller (`5.1.2`), handler (`5.1.3`: summary lấy từ `Purpose`) và response (`5.1.4`: mỗi mã trong bảng `Success` và `Error`).

## Kiểm tra trước khi hoàn tất

- [ ] Method và route khớp với wiki sau khi kết hợp global prefix, prefix của Controller và route của handler.
- [ ] Tên class và tên handler khớp với wiki.
- [ ] Mọi DTO được import đều tồn tại.
- [ ] Controller đã được đăng ký trong mảng `controllers` của Module.
- [ ] Không thiếu hoặc thừa import, và không làm mất handler hiện có.
- [ ] Nếu có thể, chạy lệnh kiểm tra biên dịch (xem `profile-contract.md`) và xác nhận không có lỗi mới từ file đã tạo. Việc thiếu method của Service là điều dự kiến ở bước này và phải được nêu trong báo cáo.

## Báo cáo cuối

Liệt kê ngắn gọn các file đã tạo hoặc sửa, route đầy đủ, các giả định đã dùng và công việc còn lại cho người dùng hoặc bước sau (method Service cần tạo, cơ chế phân quyền còn thiếu, hoặc header cần Guard validate).

## Ngoài phạm vi của Step 2

- Không tạo Service, Schema hay Entity.
- Không đưa business logic, truy vấn database hay xử lý lỗi vào Controller.
- Không tạo Guard hay decorator phân quyền mới.
- Không sửa file wiki.
- Không xóa hoặc ghi đè các handler hiện có.
