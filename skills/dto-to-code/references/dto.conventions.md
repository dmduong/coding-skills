# Step 1: Tạo DTO

Đọc trước [`workflow.md`](../../docs-to-code/rules/workflow.md). Các ví dụ dưới đây dùng `class-validator`/`class-transformer` khi dự án đã dùng; ưu tiên cơ chế hợp lệ đang có.

Ví dụ: [`assets/dto.templates.md`](../assets/dto.templates.md).

## Đầu vào

- Đường dẫn hoặc nội dung của một file wiki theo template chuẩn. Nếu người dùng chưa cung cấp wiki, hãy yêu cầu. Không tự bịa nội dung.

## Các section của wiki được sử dụng

Các section chính để tạo DTO:

| Wiki section                               | Mục đích                                     |
| ------------------------------------------ | -------------------------------------------- |
| `Endpoint` (Method, Path) | Cùng Module và Handler suy ra từ `SKILL.md`: xác định thư mục đầu ra và tên DTO |
| `Request > Body (Raw)`                     | Tạo Body DTO (JSON)                          |
| `Request > Body (Form data)`               | Tạo Form DTO (multipart/form-data)           |
| `Request > Query Params`                   | Tạo Query DTO                                |
| `Request > Path Variables`                 | Tạo Params DTO                               |

Đối chiếu thêm `Response > Error` khi wiki quy định lỗi validation. Nếu một section `Request` được đánh dấu `no` (hoặc `<no>`, `N/A`, hoặc để trống), không tạo DTO cho section đó.

`Endpoint` của wiki không có `Module`/`Handler`: suy ra theo quy trình chung trong [`workflow.md`](../../docs-to-code/rules/workflow.md). Tên DTO: `action` là handler (kebab-case); nếu handler chỉ là một động từ (ví dụ `create`, `update`, `findAll`) thì `resource` là Module.

### Body (Raw) và Body (Form data)

- `Body (Raw)`: dữ liệu JSON. Wiki không có `Example`; không bịa ví dụ, chỉ dựa vào bảng.
- `Body (Form data)`: mặc định tạo class riêng hậu tố `FormDto` và lấy bằng `@Body()`. Giá trị form là chuỗi: chuyển số và boolean theo quy tắc đã xác nhận trước validator; không dùng `Boolean('false')` vì kết quả là `true`.
- Field có type `file` (hoặc tương đương): không tạo validator trong DTO. Ghi rõ trong báo cáo để Controller (step 2) nhận bằng `@UploadedFile()`/`@UploadedFiles()` kèm interceptor upload theo cơ chế dự án đang dùng; nếu dự án chưa có cơ chế này thì hỏi người dùng.
- Nếu wiki có cả `Body (Raw)` và `Body (Form data)` có dữ liệu, hỏi người dùng muốn hỗ trợ cả hai hay một; không tự gộp.

## Workflow

1. **Đọc wiki** và xác định Method, Path, rồi suy ra Module và Handler.
2. **Kiểm tra tính đầy đủ**: mỗi dòng của bảng phải có Field, Type, Required và Constraints. Nếu thiếu hoặc mơ hồ, liệt kê các mục đó và hỏi người dùng trước khi tạo DTO. Không đoán ràng buộc.
3. **Chọn tên** theo các quy ước bên dưới.
4. **Ánh xạ** từng field sang cơ chế validation đã xác nhận; các bảng decorator bên dưới là ví dụ cho `class-validator`.
5. **Ghi file** vào đúng thư mục.
6. **Đưa ra báo cáo ngắn gọn** liệt kê các file đã tạo, các giả định đã dùng và những điểm cần người dùng xác nhận.

## Đặt tên và vị trí file

- Thư mục và tên file/class: theo module và DTO tương tự trong dự án; nếu chưa có, dùng mặc định mục 2 của workflow. Ví dụ `create-permission.dto.ts`, `CreatePermissionDto`.
- Với Query và Path DTO, thêm hậu tố loại (`Query`, `Params`) trước hậu tố DTO, ví dụ `ListPermissionQuery` + hậu tố DTO của dự án. Với Form DTO, thêm `Form`.
- Nếu đã có file cùng tên trong thư mục DTO, không ghi đè. Hỏi người dùng muốn ghi đè hay dùng tên khác.

## Ánh xạ Type sang Decorator

Dùng thư viện validate/transform đã được xác nhận trong dự án. Bảng dưới dành cho `class-validator`/`class-transformer`; với thư viện khác dùng cơ chế tương đương. Nếu chưa xác định được cách validation hoặc thiếu dependency, dừng và hỏi.

| Wiki type                                                    | Kiểu TypeScript    | Decorator cơ bản                                                    |
| ------------------------------------------------------------ | ------------------ | ------------------------------------------------------------------- |
| string                                                       | `string`           | `@IsString()`                                                       |
| number / integer                                             | `number`           | `@IsNumber()` hoặc `@IsInt()`                                       |
| boolean                                                      | `boolean`          | `@IsBoolean()`                                                      |
| email                                                        | `string`           | `@IsEmail()`                                                        |
| date / datetime (ISO 8601)                                   | `string`           | `@IsDateString()`                                                   |
| array of X                                                   | `X[]`              | `@IsArray()` cùng `@IsString({ each: true })` (hoặc validator kiểu tương ứng) |
| nested object                                                | Class DTO riêng    | `@ValidateNested()` cùng `@Type(() => NestedDto)`                   |
| enum                                                         | TypeScript enum    | `@IsEnum(EnumName)`                                                 |
| Integer ID (MySQL auto-increment, nếu wiki nêu rõ)           | `number`           | `@IsInt()`                                                          |
| UUID ID (nếu wiki nêu rõ)                                    | `string`           | `@IsUUID()`                                                         |

## Ánh xạ Required

- `Y`: khai báo field bắt buộc và kiểm tra sự hiện diện; chỉ dùng `@IsNotEmpty()` nếu wiki cũng cấm chuỗi rỗng. Với `class-validator`, có thể dùng `@IsDefined()` nếu wiki không cho phép `null`.
- `N`: khai báo field tùy chọn, ví dụ `note?: string;`. Với `class-validator`, `@IsOptional()` bỏ qua cả `undefined` và `null`; chỉ dùng nếu phù hợp hợp đồng. Nếu chỉ cho phép vắng mặt mà không cho phép `null`, chọn validator/điều kiện phù hợp và kiểm tra hành vi thực tế.
- Nếu wiki chưa rõ `null` hoặc chuỗi rỗng có hợp lệ hay không, hỏi trước khi áp dụng ràng buộc tương ứng.

## Ánh xạ Constraint

Đọc cột Constraints và chuyển từng ràng buộc sang decorator tương ứng:

| Ràng buộc trong wiki                     | Decorator                                                                                             |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `max 255`, `<= 255 characters` (`tối đa 255`, `<= 255 ký tự`) | `@MaxLength(255)`                                                    |
| `min 3`, `at least 3 characters` (`tối thiểu 3 ký tự`) | `@MinLength(3)`                                                                |
| `length 3-50` (`độ dài 3-50`)            | `@Length(3, 50)`                                                                                      |
| number `>= 0`                            | `@Min(0)`                                                                                             |
| number `<= 100`                          | `@Max(100)`                                                                                           |
| matches regex (`khớp regex`)             | `@Matches(/regex/)`                                                                                   |
| no leading or trailing whitespace (`không có khoảng trắng đầu/cuối`) | Validator từ chối giá trị có khoảng trắng đầu/cuối; chỉ trim nếu wiki yêu cầu chuẩn hóa thay vì từ chối |
| value must be in a list (`giá trị thuộc danh sách`) | `@IsIn([...])` hoặc `@IsEnum`                                                      |
| array with `min/max` number of elements (`mảng tối thiểu/tối đa n phần tử`) | `@ArrayMinSize(n)`, `@ArrayMaxSize(n)`  |

Với các ràng buộc không có trong bảng trên (ví dụ "must be unique in the database"), không tạo decorator. Đây là business logic của Service ở step 3. Ghi chú trong báo cáo cuối rằng ràng buộc này phải được xử lý trong Service.

Mỗi validator nên có `message` rõ ràng nếu `Response > Error` trong wiki quy định thông báo lỗi tương ứng cho field đó. Dùng đúng thông báo trong wiki; không viết lại.

## Quy tắc tạo code

- Theo cấu trúc DTO và validation của dự án; nếu chưa có quy ước và dùng `class-validator`, mặc định một `export class` DTO chính mỗi file. DTO lồng nhau có thể nằm cùng file hoặc file riêng; ưu tiên file riêng nếu được tái sử dụng ở nơi khác.
- Thứ tự decorator theo dự án; mặc định đặt điều kiện optional, transform/type, validator theo kiểu, rồi validator theo ràng buộc.
- Comment/JSDoc theo dự án, dùng cột Description của wiki khi cần.
- Chỉ import các decorator thực sự được dùng.
- Không thêm field không có trong wiki.
- Swagger theo cách dự án đang dùng và wiki; không thêm dependency hoặc ví dụ tự đoán.
- Giữ tên thuộc tính trong wiki; nếu khác quy ước JSON của dự án, hỏi người dùng.
- Không đưa business logic hay truy vấn database vào DTO.

## Kiểm tra trước khi hoàn tất

- [ ] Số field của DTO khớp với số dòng trong bảng của wiki.
- [ ] Type, giá trị Required và mọi ràng buộc đều được thể hiện bằng decorator hoặc được ghi chú là logic của Service.
- [ ] Không thiếu hoặc thừa import.
- [ ] Tên file, tên class và thư mục khớp quy ước dự án hoặc mặc định của skill.
- [ ] Validation thực sự được áp dụng cho endpoint; nếu chưa có cơ chế phù hợp, dừng và hỏi trước khi sửa cấu hình chung.

## Ngoài phạm vi

- Không tạo Controller, Service, Schema hay Entity ở bước này.
- Không suy đoán ràng buộc mà wiki không nêu.
- Không sửa file wiki.
- Không ghi đè file đã tồn tại khi chưa hỏi.

