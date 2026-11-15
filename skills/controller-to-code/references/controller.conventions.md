# Step 2: Tạo Controller

Đọc trước [`workflow.md`](../../docs-to-code/rules/workflow.md); áp dụng quy ước Controller và bảo mật đã khảo sát.

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

`Endpoint` của wiki chỉ có `Method`, `Path`, `Roles`: suy ra Module, Controller, Handler theo [`workflow.md`](../../docs-to-code/rules/workflow.md) và dùng đúng các giá trị đó (nêu trong báo cáo). `Request > Body (Raw)` dùng `@Body() body: <Name>Dto`; `Body (Form data)` dùng `@Body() body: <Name>FormDto`, và với field kiểu file thì thêm `@UseInterceptors(...)` cùng `@UploadedFile()` theo cơ chế upload của dự án (hỏi người dùng nếu dự án chưa có).

Không đọc `Processing Flow` ở bước này. Logic xử lý thuộc về step 3.

## Workflow

1. **Đọc wiki** và trích xuất Method, Path, Roles và Status thành công, rồi suy ra Module, Controller, Handler.
2. **Đối chiếu dự án**: tìm Controller và Module tương tự; xác nhận global prefix, guard, decorator và cách đăng ký thực tế. Không đoán.
3. **Xác định route** theo các quy tắc bên dưới.
4. **Tạo hoặc cập nhật Controller**.
5. **Đăng ký Controller** trong `controllers: []` của Module nếu chưa có.
6. **Chạy các kiểm tra** (xem mục Kiểm tra) và đưa ra báo cáo ngắn gọn.

## Vị trí và đặt tên

- File/class đặt theo module và Controller tương tự; mặc định `auth.controller.ts` và `AuthController`.
- Dùng đúng tên class Controller và tên handler đã suy ra (theo `SKILL.md`). Không tự đổi tên Controller/handler đã có trong dự án.
- Nếu file Controller đã tồn tại, đọc toàn bộ file và thêm handler mới tại vị trí không bị route khác che khuất, giữ nguyên các handler hiện có. Không tạo file Controller thứ hai cho cùng một class.
- Nếu đã có handler cùng tên trong Controller, hoặc đã có handler cùng Method + Path, hãy dừng lại và hỏi người dùng. Không ghi đè.

## Quy tắc xác định route

Wiki quy định Path đầy đủ. Xác định global prefix và loại trừ nếu có trước, rồi tách phần path còn lại thành prefix của Controller và route của handler. Ví dụ nếu không có global prefix, `/auth/login` được tách như sau:

- Segment đầu tiên của Path là prefix của Controller: `@Controller('auth')`.
- Phần còn lại là route của handler: `@Post('login')`. Nếu không còn gì, dùng `@Post()`.
- Nếu Controller hiện có dùng prefix khác với segment đầu của Path, ưu tiên prefix hiện có và tính lại route còn lại cho phù hợp. Thông báo cho người dùng nếu không thể làm route khớp.
- Path Variable trong wiki có thể được viết là `{id}` hoặc `<id>`; chuyển thành `:id`.
- Xác định global prefix và loại trừ nếu có từ bootstrap/module. Path wiki phải khớp route thực tế sau khi áp dụng prefix; nếu không rõ wiki đã bao gồm prefix hay chưa, hỏi người dùng.
- Path trong wiki lệch quy ước dự án thì hỏi, không tự đổi hợp đồng.

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
- Không đọc `Content-Type` hay `Authorization` trong handler nếu middleware/guard đã xử lý và nghiệp vụ không cần chúng; nếu wiki yêu cầu handler dùng giá trị header, theo cách an toàn đã xác minh của dự án.
- Nếu header bắt buộc (`Required = Y`), xác minh middleware, guard hoặc pipe đã kiểm tra; nếu chưa có cách phù hợp, hỏi trước khi triển khai, không chỉ khai báo tham số mà bỏ qua validation.

Nếu một section Request được đánh dấu `no`, không thêm tham số tương ứng. Sắp xếp tham số theo thứ tự: Param, Query, Body, Headers.

## Phân quyền (cột `Roles`)

Chỉ dùng cơ chế đã xác minh trong dự án, kể cả guard toàn cục và metadata/decorator được guard đọc. Không tạo Guard hay decorator mới:

| Giá trị `Roles`                       | Hành động                                                                                                                         |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Public / không cần xác thực           | Xác minh không có guard áp dụng, hoặc dùng decorator bỏ qua guard đã xác minh hoạt động |
| Authenticated (không giới hạn role)   | Dùng guard xác thực phù hợp, xác minh guard thực sự từ chối yêu cầu thiếu thông tin xác thực ở endpoint này, kể cả khi không có metadata role |
| Danh sách role cụ thể                 | Dùng guard/decorator và role được xác minh; role chưa có hoặc cách ánh xạ không rõ thì dừng và hỏi |

Không suy ra guard toàn cục luôn xác thực: kiểm tra điều kiện bỏ qua và metadata mà guard yêu cầu. Nếu cơ chế không tồn tại hoặc không xác minh được, dừng và hỏi; không tạo endpoint thiếu bảo vệ.

## HTTP Status

- Lấy status từ `Response > Success`.
- Mặc định của NestJS: POST trả về 201; các method khác trả về 200.
- Nếu status trong wiki khác mặc định, thêm `@HttpCode(<status>)`. Ví dụ, nếu POST `/auth/login` trả về 200, thêm `@HttpCode(200)`.
- Nếu wiki quy định 204, dùng `@HttpCode(204)` và để handler không trả về dữ liệu.

## Thân handler

Handler chỉ ủy quyền cho Service; không chứa business logic:

- Inject Service qua constructor: `constructor(private readonly <module>Service: <Module>Service) {}`. Nếu Controller đã có constructor, thêm dependency vào đó; không tạo constructor thứ hai.
- Suy ra tên Service theo quy ước dự án và Module.
- Gọi `return this.<module>Service.<handler>(<parameters>)` với đúng tên handler đã suy ra.
- Nếu dự án chuyển response tại Controller, dùng serializer đã xác minh; chỉ dùng `plainToInstance` nếu dự án dùng cơ chế đó.
- Không dùng `try/catch`. Service ném lỗi (step 3) và NestJS chuyển chúng thành HTTP response.
- Không validate thủ công. Việc validate thuộc về DTO và `ValidationPipe`.
- Không tạo file Service. Nếu Service hoặc method chưa tồn tại, nêu trong báo cáo rằng cần tạo ở step 3.
- Khai báo kiểu trả về tường minh; nếu đã có RO cho API này, dùng nó làm kiểu trả về.

## Comment và Swagger

- Comment và Swagger theo dự án; dùng `Purpose` và response wiki khi dự án yêu cầu Swagger. Không tự thêm dependency.

## Kiểm tra trước khi hoàn tất

- [ ] Method và route khớp với wiki sau khi kết hợp global prefix, prefix của Controller và route của handler.
- [ ] Tên class và tên handler khớp với wiki.
- [ ] Mọi DTO được import đều tồn tại.
- [ ] Controller đã được đăng ký trong mảng `controllers` của Module.
- [ ] Không thiếu hoặc thừa import, và không làm mất handler hiện có.
- [ ] Nếu có thể, chạy lệnh kiểm tra biên dịch (xem `workflow.md`) và xác nhận không có lỗi mới từ file đã tạo. Việc thiếu method của Service là điều dự kiến ở bước này và phải được nêu trong báo cáo.

## Báo cáo cuối

Liệt kê ngắn gọn các file đã tạo hoặc sửa, route đầy đủ, các giả định đã dùng và công việc còn lại cho người dùng hoặc bước sau (method Service cần tạo, cơ chế phân quyền còn thiếu, hoặc header cần Guard validate).

## Ngoài phạm vi của Step 2

- Không tạo Service, Schema hay Entity.
- Không đưa business logic, truy vấn database hay xử lý lỗi vào Controller.
- Không tạo Guard hay decorator phân quyền mới.
- Không sửa file wiki.
- Không xóa hoặc ghi đè các handler hiện có.

