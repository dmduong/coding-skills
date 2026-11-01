# Step 1: Tạo DTO

Đọc trước [`profile-contract.md`](../rules/profile-contract.md). Khóa profile của bước này: `1.2.5`, `1.3.2`, `1.4.5`, `2.2.1`, `3.1.4`, `4.3.3`, `5.1.5`.

Ví dụ: [`assets/dto.templates.md`](../assets/dto.templates.md).

## Đầu vào

- Đường dẫn hoặc nội dung của một file wiki theo template chuẩn. Nếu người dùng chưa cung cấp wiki, hãy yêu cầu. Không tự bịa nội dung.

## Các section của wiki được sử dụng

Chỉ đọc các section sau và bỏ qua phần còn lại:

| Wiki section                               | Mục đích                                     |
| ------------------------------------------ | -------------------------------------------- |
| `Endpoint` (Method, Path) | Cùng Module và Handler suy ra từ `SKILL.md`: xác định thư mục đầu ra và tên DTO |
| `Request > Body (Raw)`                     | Tạo Body DTO (JSON)                          |
| `Request > Body (Form data)`               | Tạo Form DTO (multipart/form-data)           |
| `Request > Query Params`                   | Tạo Query DTO                                |
| `Request > Path Variables`                 | Tạo Params DTO                               |

Nếu một section `Request` được đánh dấu `no` (hoặc `<no>`, `N/A`, hoặc để trống), không tạo DTO cho section đó.

`Endpoint` của wiki không có `Module`/`Handler`: dùng giá trị suy ra theo mục "Suy ra Module, Controller, Handler" trong [`SKILL.md`](../SKILL.md). Tên DTO: `action` là handler (kebab-case); nếu handler chỉ là một động từ (ví dụ `create`, `update`, `findAll`) thì `resource` là Module.

### Body (Raw) và Body (Form data)

- `Body (Raw)`: dữ liệu JSON. Wiki không có `Example`; không bịa ví dụ, chỉ dựa vào bảng.
- `Body (Form data)`: tạo class riêng, hậu tố `FormDto` (ví dụ `CreatePermissionFormDto`) và lấy bằng `@Body()`. Giá trị form luôn đến dưới dạng chuỗi, nên field `number`/`boolean` thêm `@Type(() => Number)` hoặc chuyển đổi tương ứng trước validator.
- Field có type `file` (hoặc tương đương): không tạo validator trong DTO. Ghi rõ trong báo cáo để Controller (step 2) nhận bằng `@UploadedFile()`/`@UploadedFiles()` kèm interceptor upload theo cơ chế dự án đang dùng; nếu dự án chưa có cơ chế này thì hỏi người dùng.
- Nếu wiki có cả `Body (Raw)` và `Body (Form data)` có dữ liệu, hỏi người dùng muốn hỗ trợ cả hai hay một; không tự gộp.

## Workflow

1. **Đọc wiki** và xác định Method, Path, rồi suy ra Module và Handler.
2. **Kiểm tra tính đầy đủ**: mỗi dòng của bảng phải có Field, Type, Required và Constraints. Nếu thiếu hoặc mơ hồ, liệt kê các mục đó và hỏi người dùng trước khi tạo DTO. Không đoán ràng buộc.
3. **Chọn tên** theo các quy ước bên dưới.
4. **Ánh xạ** từng field sang decorator bằng các bảng ánh xạ bên dưới.
5. **Ghi file** vào đúng thư mục.
6. **Đưa ra báo cáo ngắn gọn** liệt kê các file đã tạo, các giả định đã dùng và những điểm cần người dùng xác nhận.

## Đặt tên và vị trí file

- Thư mục: thư mục con DTO của module theo khóa `3.1.4`.
- Tên file: theo mẫu khóa `1.2.5`. Suy ra `action` và `resource` từ Handler đã suy ra; handler nhiều từ chuyển sang kebab-case. Ví dụ với mẫu `<hành-động>-x-y.dto.ts`: module `permission`, handler `create` → `create-permission.dto.ts`; handler `refreshToken` → `refresh-token.dto.ts`.
- Tên class: theo mẫu khóa `1.3.2` (đúng hoa/thường của hậu tố). Ví dụ minh họa trong tài liệu này viết `Dto`; dự án dùng `DTO` thì dùng `DTO`.
- Với Query và Path DTO, thêm hậu tố loại (`Query`, `Params`) trước hậu tố DTO, ví dụ `ListPermissionQuery` + hậu tố DTO của dự án. Với Form DTO, thêm `Form`.
- Nếu đã có file cùng tên trong thư mục DTO, không ghi đè. Hỏi người dùng muốn ghi đè hay dùng tên khác.

## Ánh xạ Type sang Decorator

Dùng thư viện validate/transform theo khóa `2.2.1` (các decorator trong bảng dưới là của `class-validator`/`class-transformer`; thư viện khác thì ánh xạ tương đương và hỏi người dùng).

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

- `Y`: thêm `@IsNotEmpty()` và khai báo field bắt buộc, ví dụ `name: string;`.
- `N`: thêm `@IsOptional()` và khai báo field tùy chọn, ví dụ `note?: string;`. Đặt `@IsOptional()` phía trên tất cả decorator khác của field đó.

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
| no leading or trailing whitespace (`không có khoảng trắng đầu/cuối`) | `@Transform(({ value }) => typeof value === 'string' ? value.trim() : value)` đặt trước các validator |
| value must be in a list (`giá trị thuộc danh sách`) | `@IsIn([...])` hoặc `@IsEnum`                                                      |
| array with `min/max` number of elements (`mảng tối thiểu/tối đa n phần tử`) | `@ArrayMinSize(n)`, `@ArrayMaxSize(n)`  |

Với các ràng buộc không có trong bảng trên (ví dụ "must be unique in the database"), không tạo decorator. Đây là business logic của Service ở step 3. Ghi chú trong báo cáo cuối rằng ràng buộc này phải được xử lý trong Service.

Mỗi validator nên có `message` rõ ràng nếu `Response > Error` trong wiki quy định thông báo lỗi tương ứng cho field đó. Dùng đúng thông báo trong wiki; không viết lại.

## Quy tắc tạo code

- Mỗi DTO phải là một `export class`, mỗi file một DTO chính. DTO lồng nhau có thể nằm cùng file hoặc file riêng; ưu tiên file riêng nếu được tái sử dụng ở nơi khác.
- Thứ tự decorator của mỗi field: `@IsOptional()` (nếu có), `@Transform` / `@Type`, validator theo kiểu, sau đó validator theo ràng buộc.
- Thêm một dòng JSDoc cho mỗi field, dùng cột Description của wiki.
- Chỉ import các decorator thực sự được dùng.
- Không thêm field không có trong wiki.
- Swagger theo khóa `5.1.5`: có quy định (ví dụ `@ApiProperty` kèm `description`/`example`) thì thêm cho mọi field; `N/A` thì không thêm.
- Tên thuộc tính của DTO theo khóa `1.4.5` (kiểu đặt tên JSON); tên trong wiki khác kiểu này thì hỏi người dùng.
- Không đưa business logic hay truy vấn database vào DTO.

## Kiểm tra trước khi hoàn tất

- [ ] Số field của DTO khớp với số dòng trong bảng của wiki.
- [ ] Type, giá trị Required và mọi ràng buộc đều được thể hiện bằng decorator hoặc được ghi chú là logic của Service.
- [ ] Không thiếu hoặc thừa import.
- [ ] Tên file, tên class và thư mục khớp profile (`1.2.5`, `1.3.2`, `3.1.4`).
- [ ] Pipe validate (khóa `4.3.3`) đã được bật toàn cục tại nơi đã đối chiếu (hoặc nhắc người dùng bật).

## Ngoài phạm vi

- Không tạo Controller, Service, Schema hay Entity ở bước này.
- Không suy đoán ràng buộc mà wiki không nêu.
- Không sửa file wiki.
- Không ghi đè file đã tồn tại khi chưa hỏi.
