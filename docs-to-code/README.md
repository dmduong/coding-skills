# docs-to-code

Skill này chuyển một file wiki API (Markdown theo template chuẩn) thành mã nguồn NestJS: DTO, Controller, Service (MySQL/TypeORM), RO và Exception.

- Tổng quan workflow: [SKILL.md](./SKILL.md)
- Template wiki trống để sao chép: [mục 4.1](#41-template-wiki-trống-để-sao-chép) · Ví dụ hoàn chỉnh: [mục 4.2](#42-ví-dụ-hoàn-chỉnh)
- Hợp đồng với profile dự án và quy tắc riêng của skill: [rules/profile-contract.md](./rules/profile-contract.md)
- Quy tắc chi tiết cho từng bước: [references/](./references) · Ví dụ đầu ra: [assets/](./assets)

Skill **không tự đặt quy ước dự án**: đặt tên, thư viện, thư mục dùng chung, phân quyền, xử lý lỗi, Swagger đều lấy từ `.project-profile/profile.md` do skill `project-profile` tạo trong dự án. Vì vậy có thể sao chép thư mục `docs-to-code/` sang dự án NestJS khác, chạy `project-profile` ở đó rồi dùng. Wiki có thể nằm ở bất kỳ đâu (file đính kèm, đường dẫn file hoặc dán trực tiếp vào chat), miễn là tuân theo template ở mục 4.

## 1. Skill làm gì

Mỗi wiki mô tả **đúng một API** (một handler). Skill chia công việc thành bốn bước độc lập:

| Step | Tạo ra                               | Đọc từ các section của wiki                                      | Kết quả (ví dụ: module `permission`)                              |
| ---- | ------------------------------------ | ---------------------------------------------------------------- | ----------------------------------------------------------------- |
| 1    | **DTO** (dữ liệu đầu vào)            | `Endpoint`, `Request`                                            | `src/permission/dto/<action>-<resource>.dto.ts`                   |
| 2    | **Controller**                       | `Purpose`, `Endpoint`, `Header`, `Request`, `Response > Success` | `src/permission/permission.controller.ts` (thêm một handler)      |
| 3    | **Service** (MySQL/TypeORM)          | `Endpoint`, `Request`, `Processing Flow`, `Response`     | `src/permission/permission.service.ts` (thêm một method)          |
| 4    | **RO** (dữ liệu đầu ra) và Exception | `Response > Success`, `Response > Error`                         | `src/permission/ro/<resource>.ro.ts`, cập nhật các `throw` của Service |

Quy tắc chi tiết của từng bước nằm trong [references/](./references); ví dụ đầu ra nằm trong [assets/](./assets).

### DTO và RO

|                | DTO                                   | RO                                                                                 |
| -------------- | ------------------------------------- | ---------------------------------------------------------------------------------- |
| Hướng dữ liệu  | Đầu vào (Request)                     | Đầu ra (Response)                                                                  |
| Thư mục        | Thư mục con DTO của module (khóa profile `3.1.4`), tên file theo `1.2.5` | Thư mục con RO của module (`3.1.4`), tên file theo `1.2.6`                |
| Decorator      | `class-validator` (`@IsString()`...)  | `@Expose()` cho từng field được phép có trong response                             |
| Cách dùng      | Được pipe validate (`4.3.3`) kiểm tra | Chuyển qua `plainToInstance(RO, data, { excludeExtraneousValues: true })` tại nơi khóa `3.3.4` quy định (Service hoặc Controller) |

## 2. Cách sử dụng

### Điều kiện tiên quyết

- Có một file wiki hoàn chỉnh theo template ở [mục 4.1](#41-template-wiki-trống-để-sao-chép). Wiki có thể được tạo ở nơi khác rồi cung cấp cho skill; không cần nằm trong thư mục cụ thể nào của dự án.
- Dự án đã có profile `.project-profile/profile.md` (chạy skill `project-profile` nếu chưa có). Các khóa mà skill cần ở `detected`/`unset` sẽ được hỏi lại.
- Dự án dùng NestJS + TypeORM + MySQL (nếu không, skill sẽ dừng lại và hỏi).
- **Các Entity cho những bảng trong wiki đã tồn tại**. Skill không tạo Entity; nếu thiếu, step 3 sẽ dừng và liệt kê các bảng còn thiếu.

### Prompt gợi ý

Đính kèm file wiki, cung cấp đường dẫn hoặc dán nội dung vào chat, sau đó nêu bước cần thực hiện:

| Mục tiêu                       | Ví dụ                                                 |
| ------------------------------ | ----------------------------------------------------- |
| Chạy cả bốn bước               | `Convert wiki <path-or-attachment> to code`           |
| Chỉ tạo DTO                    | `Create a DTO from this wiki`                         |
| Chỉ tạo Controller             | `Create a controller from this wiki`                  |
| Chỉ tạo Service                | `Create a service from this wiki`                     |
| Chỉ tạo RO và Exception        | `Create an RO and check exceptions against this wiki` |

Khi chỉ yêu cầu một bước, skill chỉ thực hiện bước đó. Các bước sau cần kết quả của bước trước (Controller cần DTO, Service cần Controller, và step 4 cần Service); nếu thiếu, skill sẽ thực hiện bước tiên quyết hoặc thông báo cho bạn.

### Skill thực hiện những gì

1. Đọc wiki. Nếu thiếu thông tin hoặc mơ hồ, **hỏi lại để làm rõ**; không đoán ràng buộc.
2. Đọc profile dự án, rồi đối chiếu nhanh các đường dẫn quan trọng trong profile với source. Báo cáo các khóa đã dùng, đường dẫn tìm thấy và ghi rõ phần nào không tìm thấy; không giả định tên hoặc vị trí ngoài những gì profile ghi.
3. Đọc `rules/profile-contract.md`, sau đó quy tắc của bước liên quan trong `references/` và ví dụ trong `assets/`; áp dụng quy ước từ profile.
4. Tạo hoặc cập nhật file. Nếu file đã tồn tại, thêm vào cuối thay vì ghi đè; dừng lại và hỏi nếu tên handler hoặc method bị trùng. Nếu cần một thành phần dùng chung nhưng dự án chưa có chỗ/cơ chế tương ứng, hỏi người dùng trước khi tạo cấu trúc mới, trừ khi wiki/người dùng đã chỉ rõ vị trí.
5. Sau khi hoàn thành toàn bộ phần chuyển wiki sang mã nguồn, trước khi tạo/sửa file test `.spec.ts` hoặc chạy checklist kiểm tra, hỏi người dùng có muốn tạo/cập nhật test hay không:
   - Nếu đồng ý, tạo/cập nhật Jest tests liên quan, chạy test mục tiêu và checklist kiểm tra phù hợp.
   - Nếu không, không tạo/sửa file test, không chạy test hoặc checklist kiểm tra; kết thúc workflow ngay, không tiếp tục bước nào khác.
6. Đưa ra báo cáo ngắn gọn: kết quả đối chiếu profile, các file đã tạo/sửa, lựa chọn test, kiểm tra đã/chưa chạy, giả định và những mục cần người dùng xác nhận.

#### Định dạng báo cáo đối chiếu

Hiển thị khóa profile đã dùng (kèm trạng thái) và đường dẫn tương ứng, dùng đường dẫn tương đối từ repository root. Ví dụ:

```text
Đối chiếu profile
- Phân quyền (4.2.2, 4.2.5, confirmed): src/common/decorator/role.decorator.ts — Có
- Thông báo lỗi (4.4.7, confirmed): src/common/helper/error.message.ts — Có
- Public decorator (4.1.4, preset): Không tìm thấy (cần hỏi người dùng)
- Pipe validate (4.3.3, detected): cần xác nhận
```

### Sau khi tạo code

- Sau khi hoàn thành code, hỏi người dùng có muốn tạo/cập nhật test Jest (`.spec.ts`) không trước khi tạo/sửa test hoặc chạy checklist kiểm tra.
- Nếu đồng ý, tạo/cập nhật test rồi chạy test mục tiêu; chạy build/type-check và lint phù hợp.
- Nếu không đồng ý, dừng workflow ngay: không tạo/sửa spec, không chạy test/checklist hoặc các bước tiếp theo, và báo rõ code đã được tạo nhưng chưa được kiểm thử.
- Xem mục "Báo cáo cuối" của skill để biết công việc còn lại (thiếu Entity, thiếu phân quyền, các bước ghi không có transaction, v.v.).

## 3. Cách viết wiki để skill hiểu được

Sao chép template ở [mục 4.1](#41-template-wiki-trống-để-sao-chép) và thay các giá trị `<placeholder>`. **Giữ nguyên tiêu đề section và tên cột**, vì skill tìm kiếm theo chúng. Wiki có thể viết bằng tiếng Việt hoặc tiếng Anh; giữ nguyên thông báo lỗi, từng ký tự một.

### Quy tắc chung

- Một wiki = một API = một handler.
- Đánh dấu các section không dùng là `<no>` (hoặc `no`, `N/A`); skill sẽ bỏ qua. Không để trống một cách mơ hồ.
- Mỗi dòng của bảng phải có đủ các cột. Dùng `-` hoặc `N` cho các cột không áp dụng.
- Không đưa secret hay dữ liệu người dùng thật vào ví dụ.

### Section `Endpoint`

| Component | Định dạng                                                                                                                                                             |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Method    | `GET`, `POST`, `PUT`, `PATCH` hoặc `DELETE`                                                                                                                           |
| Path      | Path đầy đủ, ví dụ `/permission/:permissionId`. Path variable có thể dùng `:id`, `{id}` hoặc `<id>`. **Không** kèm global prefix (`/v1/api`); nếu có, skill sẽ hỏi lại |
| Roles     | `Public`, `Authenticated` hoặc danh sách role cụ thể (`Admin`). Chỉ dùng các cơ chế phân quyền đã có trong dự án                                                      |

Wiki không khai báo Module, Controller hay Handler. Skill suy ra từ `Path` và `Method` (xem mục "Suy ra Module, Controller, Handler" trong [`SKILL.md`](./SKILL.md)), nêu giá trị đã suy ra để bạn kiểm tra, và hỏi lại nếu mơ hồ. Ví dụ `POST /permission` → module `permission`, `PermissionController`, handler `create`.

### Section `Request`

Có các section: `Path Variables`, `Query Params`, `Body (Raw)` và `Body (Form data)`. Mỗi section là một bảng (hoặc `<no>`):

| Field | Type | Required | Constraints | Description |
| ----- | ---- | -------- | ----------- | ----------- |

**Type** (dùng đúng các từ khóa này):

| Giá trị trong wiki                     | Skill tạo ra                              |
| -------------------------------------- | ----------------------------------------- |
| `string`                               | `@IsString()`                             |
| `number` / `integer`                   | `@IsNumber()` / `@IsInt()`                |
| `boolean`                              | `@IsBoolean()`                            |
| `email`                                | `@IsEmail()`                              |
| `date` / `datetime` (ISO 8601)         | `@IsDateString()`                         |
| `Array of X` (ví dụ `Array of number`) | `@IsArray()` + validate từng phần tử      |
| `object` (kèm bảng field lồng nhau)    | Class DTO lồng nhau + `@ValidateNested()` |
| `enum` (liệt kê các giá trị)           | `@IsEnum()`                               |
| Integer ID / UUID (nêu rõ)             | `@IsInt()` / `@IsUUID()`                  |

**Required**: `Y` (bắt buộc; thêm `@IsNotEmpty()`) hoặc `N` (tùy chọn; thêm `@IsOptional()`).

**Constraints**: dùng định dạng mà skill nhận diện được. Ràng buộc không có trong bảng dưới đây sẽ **không** trở thành decorator; nó sẽ được ghi chú là logic của Service.

| Giá trị trong wiki                          | Được tạo thành                                 |
| ------------------------------------------- | ---------------------------------------------- |
| `max 255`, `at most 255`, `<= 255 characters` (cũng nhận `tối đa 255`) | `@MaxLength(255)`                |
| `min 3`, `at least 3 characters` (cũng nhận `tối thiểu 3 ký tự`) | `@MinLength(3)`                        |
| `length 3-50` (cũng nhận `độ dài 3-50`)       | `@Length(3, 50)`                             |
| `>= 0` (number)                               | `@Min(0)`                                    |
| `<= 100` (number)                             | `@Max(100)`                                  |
| `matches regex ...` (cũng nhận `khớp regex`; kèm biểu thức) | `@Matches(/regex/)`            |
| `no leading/trailing whitespace` (cũng nhận `không có khoảng trắng đầu/cuối`) | `@Transform` để trim |
| `value is one of 1, 2` hoặc `in [a, b]` (cũng nhận `giá trị thuộc ...`) | `@IsIn([...])` / `@IsEnum`   |
| `array has at least 1 and at most 5 elements` (cũng nhận `mảng tối thiểu/tối đa n phần tử`) | `@ArrayMinSize(1)`, `@ArrayMaxSize(5)` |
| `N` hoặc `-`                                  | Không có ràng buộc bổ sung                   |
| `must be unique in DB`, `must exist`          | Không có decorator; xử lý trong Service (step 3) |

### Section `Header`

Liệt kê các header. `Content-Type` và `Authorization` chỉ để tham khảo (skill bỏ qua chúng; việc xác thực do Guard xử lý). Chỉ những header đặc biệt mà handler thực sự đọc (ví dụ `x-device-id`) mới trở thành `@Headers()`.

### Section `Processing Flow`

Skill tạo Service từ section này, nên hãy viết cẩn thận.

**Entity/Schema**: mỗi bảng một dòng.

| Table         | Role in API  | Documentation                                  |
| ------------- | ------------ | ---------------------------------------------- |
| `permissions` | Read + write | Liên kết đến file Entity hoặc tài liệu bảng    |

- Dùng đúng tiêu đề **`Entity/Schema`**, vì skill tìm kiếm theo tiêu đề này.
- Tên bảng phải ánh xạ được sang một Entity (`user_role` ánh xạ sang `UserRole`). Skill lấy tên property từ code của Entity, không lấy từ wiki.

**Detail**: mỗi bước một khối `#### Step <số>: <Action>`, đánh số liên tiếp; các thuộc tính viết dạng danh sách.

```md
#### Step 1: Find

- **Target:** permissions
- **Details:**
  - Find a permission by `params.permissionId`
- **Output:** permission
- **Next:** 2
- **On failure:** -
```

| Thành phần         | Cách điền                                                                                                          |
| ------------------ | ------------------------------------------------------------------------------------------------------------------ |
| Tiêu đề `Step N: Action` | `N` là số thứ tự bước (`1`, `2`, ...). `Action` dùng một trong các từ khóa bên dưới để skill phân loại được action |
| Target             | Bảng hoặc biến chịu tác động của bước                                                                              |
| Details            | Danh sách gạch đầu dòng: điều kiện tìm kiếm, phép gán field và điều kiện lỗi. Càng chi tiết thì càng ít phải hỏi lại |
| Output             | Tên biến kết quả (camelCase). Skill dùng đúng tên này. Dùng `-` nếu không có output                                |
| Next               | Bước kế tiếp. Nêu rõ các nhánh: `Step 4 if it exists, Step 6 otherwise`. Dùng `-` cho bước cuối                    |
| On failure         | Thông báo lỗi khi bước thất bại; phải **khớp chính xác** với cột `Message` trong `Response > Error`. Dùng `-` nếu không có lỗi |

Từ khóa **Action** (không phân biệt hoa thường, tiếng Việt hoặc tiếng Anh):

| Loại    | Từ khóa                                         |
| ------- | ----------------------------------------------- |
| Find    | Find, Query, Get, Select (cũng nhận `Tìm`, `Truy vấn`, `Lấy`) |
| Check   | Check, Validate, Verify (cũng nhận `Kiểm tra`, `Xác thực`) |
| Create  | Create, Add, Insert, Save (cũng nhận `Tạo`, `Thêm`, `Lưu mới`) |
| Update  | Update, Modify (cũng nhận `Cập nhật`, `Sửa`)      |
| Delete  | Delete, Remove (cũng nhận `Xóa`, `Gỡ`)            |
| Compute | Hash, Compare passwords, Generate token, Calculate (cũng nhận `Mã hóa`, `So sánh mật khẩu`, `Sinh token`, `Tính toán`) |
| Create helper | Create helper, Add helper, Define helper (cũng nhận `Tạo helper`, `Tạo hàm dùng chung`) |
| Call    | Call a service, Call an external API (cũng nhận `Gọi service`, `Gọi API ngoài`) |
| Return  | Return, Map result (cũng nhận `Trả về`, `Map kết quả`) |

`Create helper` đánh dấu bước tạo mã nguồn cho hàm dùng chung, không phải thao tác runtime của API. Dùng khi helper cần thiết chưa tồn tại; cần nêu rõ file, tên hàm, tham số, kết quả và quy tắc xử lý. Skill phải kiểm tra để tái sử dụng helper phù hợp nếu đã có, chỉ thêm helper còn thiếu và không tạo service/dependency mới. Chọn vị trí theo cấu trúc thực tế đã khảo sát; không mặc định `src/common/`. Đặt bước này trước bất kỳ action nào sử dụng helper; action đó chịu trách nhiệm tạo output runtime.

Khi viết Detail:

- **Transaction**: nếu từ hai bước ghi trở lên phải mang tính nguyên tử, hãy nêu rõ "run in a transaction". Nếu wiki không nhắc đến, skill sẽ không thêm và chỉ ghi chú trong báo cáo.
- **Soft delete / `isActive`**: nêu rõ trong Details nếu phải lọc bỏ các bản ghi đã xóa.
- **Người dùng đã xác thực**: nếu `userId` phải lấy từ token, hãy nêu rằng nó nên được "taken from the authenticated user" để skill nhắc bạn cập nhật Controller.
- Bước `Return` phải liệt kê chính xác các field của response.

### Section `Response`

**Success**: một bảng `Status` + `Description`, ngay sau đó là bảng `Property` (cho RO). Status 204 nghĩa là không có dữ liệu response.

| Property | Type | Description |
| -------- | ---- | ----------- |

- Dùng cùng bộ từ vựng Type như Request (`string`, `number`, `boolean`, `date`, `Array of X`, `object`).
- Ghi "nullable" hoặc "optional" trong Description khi áp dụng.
- Chỉ liệt kê các field được phép có trong response. **Các field không được liệt kê ở đây tuyệt đối không được phơi bày** (mật khẩu, token nội bộ, v.v.).
- Với API 204 hoặc API không có response body, ghi `<no>`; skill sẽ không tạo RO.

**Error**: mỗi lỗi một dòng.

| Status | Message | Raised at |
| ------ | ------- | --------- |

- Đặt `Raised at` là số bước trong `Detail` (ví dụ `Step 2`). Với lỗi DTO validation, ghi `before Step 1 (validation)`.
- `Message` phải **khớp chính xác** với `On failure` trong Detail. Nếu mâu thuẫn, skill sẽ dừng lại và hỏi.
- Chỉ dùng các status code phổ biến: 400, 401, 403, 404, 409, 422, 500. Các code khác dùng `HttpException`; skill sẽ hỏi tên lỗi nếu cần.

## 4. Template wiki

### 4.1. Template wiki trống để sao chép

Sao chép toàn bộ khối bên dưới (cũng có tại [`docs/wiki_new.md`](../../../docs/wiki_new.md)) và thay mọi `<placeholder>`. Thay các section không dùng bằng `<no>`. Giữ nguyên tiêu đề và tên cột.

````markdown
## Purpose

<purpose_of_documentation>

## Endpoint

| Component | Value         |
| --------- | ------------- |
| Method    | <method_name> |
| Path      | <path_name>   |
| Roles     | <role_name>   |

## Header

| Header        | Required | Value          |
| ------------- | -------- | -------------- |
| <header_name> | Y or N   | <header_value> |

## Request

### Path Variables

### Query Params

### Body (Raw)

### Body (Form data)

| Field        | Type         | Required | Constraints        | Description         |
| ------------ | ------------ | -------- | ------------------ | ------------------- |
| <field_name> | <field_type> | Y or N   | <constraints_name> | <description_field> |

## Processing Flow

### Entity/Schema

| Table        | Role in API | Documentation        |
| ------------ | ----------- | -------------------- |
| <table_name> | <role_name> | <link_documentation> |

### Detail

#### Step <step_no>: <action_step>

- **Target:** <action_target>
- **Details:**
  - <action_detail_1>
  - <action_detail_2>
- **Output:** <variable_name>
- **Next:** <next_step>
- **On failure:** <error_message>

## Response

### Success

| Status        | Description          |
| ------------- | -------------------- |
| <http_status> | <description_status> |

| Property        | Type            | Description            |
| --------------- | --------------- | ---------------------- |
| <property_name> | <property_type> | <property_description> |

### Error

| Status         | Message         | Raised at        |
| -------------- | --------------- | ---------------- |
| <error_status> | <error_message> | <raised_at_step> |
````

### 4.2. Ví dụ hoàn chỉnh

Một API cập nhật `permission`: có Path Variable và Body (Raw), trả về 204 và có một lỗi 404.

````markdown
## Purpose

Update a permission's name and description.

## Endpoint

| Component | Value                     |
| --------- | ------------------------- |
| Method    | PATCH                     |
| Path      | /permission/:permissionId |
| Roles     | Admin                     |

## Header

| Header        | Required | Value            |
| ------------- | -------- | ---------------- |
| Content-Type  | Y        | application/json |
| Authorization | Y        | ******           |

## Request

### Path Variables

| Field        | Type   | Required | Constraints | Description   |
| ------------ | ------ | -------- | ----------- | ------------- |
| permissionId | number | Y        | -           | Permission ID |

### Query Params

<no>

### Body (Raw)

| Field       | Type   | Required | Constraints                              | Description            |
| ----------- | ------ | -------- | ---------------------------------------- | ---------------------- |
| name        | string | Y        | max 255, no leading/trailing whitespace  | Permission name        |
| description | string | N        | max 500                                  | Permission description |

### Body (Form data)

<no>

## Processing Flow

### Entity/Schema

| Table         | Role in API  | Documentation |
| ------------- | ------------ | ------------- |
| `permissions` | Read + write | -             |

### Detail

#### Step 1: Check

- **Target:** params
- **Details:**
  - Validate `params.permissionId` and `body`
- **Output:** -
- **Next:** 2
- **On failure:** -

#### Step 2: Find

- **Target:** permissions
- **Details:**
  - Find a permission by `params.permissionId`
- **Output:** permission
- **Next:** 3
- **On failure:** Permission not found

#### Step 3: Update

- **Target:** permissions
- **Details:**
  - Set `name` and `description` from `body`
- **Output:** -
- **Next:** 4
- **On failure:** -

#### Step 4: Return

- **Target:** response
- **Details:**
  - Return 204 with no response body
- **Output:** -
- **Next:** -
- **On failure:** -

## Response

### Success

| Status | Description                            |
| ------ | -------------------------------------- |
| 204    | Updated successfully; no response body |

<no>

### Error

| Status | Message              | Raised at |
| ------ | -------------------- | --------- |
| 404    | Permission not found | Step 2    |
````

Với ví dụ này, skill suy ra Module `permission`, Controller `PermissionController` và Handler `update` (theo Method `PATCH`), rồi tạo ra:

| Step | Kết quả                                                                                                                                    |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 1    | `UpdatePermissionParamsDto` (`permissionId`) và `UpdatePermissionDto` (`name` được trim và có `@MaxLength(255)`, `description` là tùy chọn) |
| 2    | Handler `update` trong `PermissionController`: `@Patch(':permissionId')`, `@HttpCode(204)`, role `Admin` (nếu dự án hỗ trợ phân quyền)     |
| 3    | Method `update` trong `PermissionService` với các khối `// Step N` và `NotFoundException('Permission not found')` ở Step 2                  |
| 4    | Không tạo RO vì bảng `Property` là `<no>`; `throw` 404 được đối chiếu với bảng `Error`                                                     |

## 5. Checklist trước khi cung cấp wiki cho skill

- [ ] Mỗi wiki mô tả một API (một cặp `Method` + `Path`).
- [ ] `Method`, `Path` và `Roles` có giá trị thực tế, không còn `<placeholder>`; `Path` cho phép suy ra module và handler rõ ràng.
- [ ] Mỗi dòng của `Request` có đủ năm cột; `Constraints` tuân theo mục 3.
- [ ] Các section không dùng được đánh dấu `<no>`.
- [ ] `Entity/Schema` liệt kê đầy đủ các bảng, và các Entity của chúng tồn tại trong `src/`.
- [ ] `Detail` có `Step`, `Action` (một từ khóa được nhận diện), `Output` và `Next`; bước cuối là `Return`.
- [ ] Mỗi `On failure` có một dòng tương ứng trong `Response > Error` với thông báo và status khớp chính xác.
- [ ] Bảng `Property` của `Response > Success` chỉ chứa các field response được phép.
- [ ] Không có secret hay dữ liệu người dùng thật trong ví dụ.

## 6. Các vấn đề thường gặp

| Triệu chứng                                  | Nguyên nhân thường gặp                                          | Cách xử lý                                                            |
| ------------------------------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------- |
| Skill hỏi lại về một constraint             | Cột `Constraints` mơ hồ hoặc viết sai chính tả (`maxLenght`)    | Làm theo mục 3 và kiểm tra chính tả                                   |
| Một constraint không trở thành decorator    | Constraint nằm ngoài bảng ánh xạ (ví dụ "unique in DB")         | Đây là logic của Service; thêm vào `Detail` dưới dạng bước `Check`    |
| Handler hoặc tên file DTO không như mong đợi | Skill suy ra từ `Path` và `Method`, nên `Path` mơ hồ cho kết quả khác | Sửa `Path` (ví dụ thêm segment hành động `/permission/deactivate`) hoặc chỉnh tên khi skill hỏi lại |
| Skill dừng khi tạo Service vì thiếu Entity  | một bảng trong `Entity/Schema` không có `*.entity.ts`         | Tạo Entity rồi chạy lại                                               |
| Skill không phân loại được một `Action`     | Cột `Action` dùng từ khóa không có trong danh sách              | Dùng một từ khóa được nhận diện ở mục 3                               |
| Skill dừng vì các lỗi mâu thuẫn             | `On failure` và `Response > Error` khác status hoặc thông báo   | Làm cho chúng khớp chính xác                                          |
| Thông báo validation 400 khác với wiki      | `ValidationPipe` của dự án trả về định dạng tùy chỉnh           | Skill sẽ hỏi trước khi đổi cấu hình toàn cục; quyết định dựa trên báo cáo |
| Path Variable không được validate           | `ValidationPipe` tùy chỉnh của dự án chỉ validate Body          | Ghi chú trong báo cáo cuối; cần quyết định ở cấp dự án                |

## 7. Skill không làm gì

- Không tạo Entity, migration hay Schema.
- Không sửa file wiki.
- Không tự thêm field, bước, transaction, Swagger decorator hay Guard/decorator phân quyền mới.
- Không ghi đè file hoặc handler hiện có khi chưa hỏi.
- Không sửa `main.ts` hoặc cấu hình toàn cục khi chưa hỏi.
