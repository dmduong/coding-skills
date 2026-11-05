---
schemaVersion: 1
preset: nestjs-typeorm
framework: NestJS
orm: TypeORM
database: MySQL
description: Bộ giá trị mặc định cho dự án NestJS + TypeORM + MySQL còn trống, dùng khi không có code để quét.
---

# Preset: NestJS + TypeORM + MySQL

> **Quy tắc dùng preset (dành cho skill)**
> - Preset có cùng khóa với `profile-template.md`. Khi dự án chưa có code để quét, chép giá trị
>   từ preset sang profile, giữ trạng thái `preset`.
> - Mục `unset`: preset **không đoán**, phải hỏi người dùng.
> - Đường dẫn trong mục 3.2 và mục 4 là nơi **sẽ tạo mới** nếu dự án chưa có file đó.
> - Nếu quét thấy dự án đã làm khác preset thì **theo dự án**, preset chỉ là điểm xuất phát.
> - Mục có đánh dấu `(cần duyệt)` là quyết định mang tính quy ước của nhóm, người dùng nên xác nhận.

---

## 1. Phong cách lập trình và quy ước đặt tên

### 1.1. Phong cách lập trình

| Khóa  | Mục                       | Giá trị                                              | Trạng thái |
| ----- | ------------------------- | ---------------------------------------------------- | ---------- |
| 1.1.1 | Ngôn ngữ / chế độ kiểu    | TypeScript, `strict: true`                           | preset     |
| 1.1.2 | Công cụ định dạng         | Prettier, cấu hình tại `.prettierrc`                 | preset     |
| 1.1.3 | Công cụ kiểm tra lỗi      | ESLint, cấu hình tại `eslint.config.mjs` hoặc `.eslintrc` | preset |
| 1.1.4 | Dấu nháy / dấu chấm phẩy  | Nháy đơn, có dấu chấm phẩy                           | preset     |
| 1.1.5 | Cách khai báo bất đồng bộ | `async/await`, không dùng `.then()`                  | preset     |
| 1.1.6 | Kiểu `any`                | Cấm; dùng kiểu cụ thể hoặc `unknown`                 | preset     |
| 1.1.7 | Cách import               | Đường dẫn tương đối trong cùng module, alias `src/` cho phần dùng chung | preset |
| 1.1.8 | Chú thích mã              | Ngôn ngữ chú thích: unset; chỉ giải thích "vì sao", không lặp lại điều code đã nói | unset |

### 1.2. Đặt tên tập tin và thư mục

Quy tắc chung: `kebab-case`, số ít.

| Khóa   | Loại                                | Mẫu tên tập tin                                   | Ví dụ                         | Trạng thái |
| ------ | ----------------------------------- | ------------------------------------------------- | ----------------------------- | ---------- |
| 1.2.1  | Module                              | `x-y.module.ts`                                   | `chat-room.module.ts`         | preset     |
| 1.2.2  | Controller                          | `x-y.controller.ts`                               | `chat-room.controller.ts`     | preset     |
| 1.2.3  | Service                             | `x-y.service.ts`                                  | `chat-room.service.ts`        | preset     |
| 1.2.4  | Repository                          | `x-y.repository.ts`                               | `chat-room.repository.ts`     | preset     |
| 1.2.5  | DTO                                 | `<hành-động>-x-y.dto.ts`                          | `create-chat-room.dto.ts`     | preset     |
| 1.2.6  | RO (response object)                | `x-y.ro.ts`                                       | `chat-room.ro.ts`             | preset     |
| 1.2.7  | Entity                              | `x-y.entity.ts`                                   | `chat-room.entity.ts`         | preset     |
| 1.2.8  | Guard / Pipe / Interceptor / Filter | `x-y.guard.ts`, `x-y.pipe.ts`, `x-y.interceptor.ts`, `x-y.filter.ts` | `jwt-auth.guard.ts`, `http-exception.filter.ts` | preset |
| 1.2.9  | Decorator                           | `x-y.decorator.ts`                                | `current-user.decorator.ts`   | preset     |
| 1.2.10 | Enum / Interface                    | `x-y.enum.ts`, `x-y.interface.ts`                 | `role.enum.ts`, `jwt-payload.interface.ts` | preset |
| 1.2.11 | Test                                | `x-y.<loại>.spec.ts`                              | `chat-room.service.spec.ts`   | preset     |

### 1.3. Đặt tên lớp

| Khóa  | Loại                                       | Mẫu                                                    | Ví dụ                                  | Trạng thái |
| ----- | ------------------------------------------ | ------------------------------------------------------ | -------------------------------------- | ---------- |
| 1.3.1 | Module / Controller / Service / Repository | `XxYyModule`, `XxYyController`, `XxYyService`, `XxYyRepository` | `ChatRoomService`             | preset     |
| 1.3.2 | DTO                                        | `<Hành động>XxYyDto`                                   | `CreateChatRoomDto`                    | preset     |
| 1.3.3 | RO                                         | `XxYyRo`                                               | `ChatRoomRo`                           | preset     |
| 1.3.4 | Guard / Pipe / Interceptor / Filter        | `XxYyGuard`, `XxYyPipe`, `XxYyInterceptor`, `XxYyFilter` | `JwtAuthGuard`, `HttpExceptionFilter` | preset     |
| 1.3.5 | Entity                                     | `XxYy` (không thêm hậu tố)                             | `ChatRoom`                             | preset     |
| 1.3.6 | Interface                                  | `IXxYy` (không thêm hậu tố `Interface`)               | `IJwtPayload`                          | preset     |
| 1.3.7 | Enum                                       | `XxYyEnum`                                             | `ChatRoomTypeEnum`                     | preset     |

### 1.4. Đặt tên hàm, biến, thuộc tính, dữ liệu

| Khóa  | Mục                                | Quy tắc                                                       | Trạng thái        |
| ----- | ---------------------------------- | ------------------------------------------------------------- | ----------------- |
| 1.4.1 | Hàm và biến                        | `camelCase`                                                   | preset            |
| 1.4.2 | Hằng số                            | `UPPER_SNAKE_CASE`                                            | preset            |
| 1.4.3 | Thành viên enum                    | `UPPER_SNAKE_CASE`, giá trị là chuỗi cùng tên (`GROUP = 'GROUP'`) | preset        |
| 1.4.4 | Biến boolean                       | Tiền tố `is`, `has`, `can`                                    | preset            |
| 1.4.5 | Thuộc tính JSON (request/response) | `camelCase`                                                   | preset            |
| 1.4.6 | Tên bảng                           | `snake_case`, số ít (cần duyệt)                               | preset            |
| 1.4.7 | Tên cột                            | `snake_case`                                                  | preset            |
| 1.4.8 | Ánh xạ cột ↔ thuộc tính            | `@Column({ name: 'created_at' }) createdAt` (thuộc tính `camelCase`, cột `snake_case`) | preset |

### 1.5. Đặt tên API

| Khóa  | Mục                           | Quy tắc                                                                 | Trạng thái |
| ----- | ----------------------------- | ----------------------------------------------------------------------- | ---------- |
| 1.5.1 | Tiền tố và phiên bản          | Tiền tố và phiên bản: unset (khai báo một nơi, thường tại `main.ts`)    | unset      |
| 1.5.2 | Dạng path                     | `kebab-case`, danh từ số nhiều (`/chat-rooms`) (cần duyệt)              | preset     |
| 1.5.3 | Tên path param                | `camelCase` (`:roomId`)                                                 | preset     |
| 1.5.4 | Tên handler theo Method       | GET danh sách → `findAll`; GET theo id → `findOne`; POST → `create`; PATCH/PUT → `update`; DELETE → `remove` | preset |
| 1.5.5 | Path dạng hành động           | Lấy segment cuối làm tên handler, chuyển `camelCase` (`/auth/refresh-token` → `refreshToken`) | preset |
| 1.5.6 | Suy ra Module từ path         | Segment đầu sau tiền tố, chuyển `kebab-case`, bỏ `s` cuối (`/chat-rooms` → module `chat-room`) | preset |

---

## 2. Ngăn xếp công nghệ và thư viện ưu tiên

### 2.1. Công nghệ chung

| Khóa  | Hạng mục      | Công nghệ / phiên bản                       | Ghi chú                              | Trạng thái |
| ----- | ------------- | ------------------------------------------- | ------------------------------------ | ---------- |
| 2.1.1 | Runtime       | Node.js, phiên bản: unset                   | hỏi phiên bản LTS đang dùng          | unset      |
| 2.1.2 | Framework     | NestJS, phiên bản chính: unset              |                                      | unset      |
| 2.1.3 | Cơ sở dữ liệu | MySQL, phiên bản: unset                     |                                      | unset      |
| 2.1.4 | ORM / driver  | TypeORM, `mysql2`                           |                                      | preset     |
| 2.1.5 | Cấu hình      | `@nestjs/config`                            | không đọc `process.env` trực tiếp    | preset     |
| 2.1.6 | Tài liệu API  | `@nestjs/swagger`                           |                                      | preset     |
| 2.1.7 | Xác thực      | `@nestjs/jwt`, `@nestjs/passport`, `passport-jwt` |                                | preset     |
| 2.1.8 | Ghi log       | `Logger` của NestJS                         |                                      | preset     |
| 2.1.9 | Ngày giờ      | `dayjs`                                     |                                      | preset     |

### 2.2. Thư viện ưu tiên theo tầng

| Khóa  | Tầng       | Thư viện ưu tiên                                           | Quy tắc sử dụng                                                                 | Trạng thái |
| ----- | ---------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------- | ---------- |
| 2.2.1 | DTO        | `class-validator`, `class-transformer`, `@nestjs/swagger`  | Validate bằng decorator (`@IsString`, `@IsNotEmpty`...), mô tả bằng `@ApiProperty`. Không viết validate tay. DTO luôn là class. | preset |
| 2.2.2 | RO         | `class-transformer`, `@nestjs/swagger`                     | Dùng `@Expose` / `@Exclude` để lọc field. Không trả field nhạy cảm. RO luôn là class. | preset |
| 2.2.3 | Controller | `@nestjs/common`, `@nestjs/swagger`                        | Chỉ nhận request, gọi service, trả RO. Không chứa logic nghiệp vụ.              | preset     |
| 2.2.4 | Service    | `@nestjs/common`                                           | Chứa logic nghiệp vụ. Ném lỗi bằng các lớp con của `HttpException`.             | preset     |
| 2.2.5 | Repository | `@nestjs/typeorm`, `typeorm`                               | Chỉ chứa truy vấn (`Repository<Entity>`, `QueryBuilder`). Service không gọi `EntityManager` trực tiếp, trừ khi mở transaction. | preset |

### 2.3. Thư viện không dùng

| Khóa  | Không dùng | Thay bằng                  | Lý do                      | Trạng thái |
| ----- | ---------- | -------------------------- | -------------------------- | ---------- |
| 2.3.1 | `moment`   | `dayjs`                    | nhẹ hơn, đang được bảo trì | preset     |
| 2.3.2 | `any`      | kiểu cụ thể hoặc `unknown` | giữ an toàn kiểu           | preset     |

### 2.4. Quy tắc thêm thư viện mới

| Khóa  | Quy tắc                                                                          | Trạng thái |
| ----- | -------------------------------------------------------------------------------- | ---------- |
| 2.4.1 | Không thêm thư viện ngoài danh sách khi sinh code; cần thêm thì dừng và hỏi.     | preset     |

---

## 3. Mẫu kiến trúc nên tuân theo hoặc tránh

### 3.1. Tổ chức mã nguồn

| Khóa  | Mục                       | Giá trị                                                                 | Trạng thái |
| ----- | ------------------------- | ----------------------------------------------------------------------- | ---------- |
| 3.1.1 | Cách chia                 | Theo tính năng (`by-feature`)                                           | preset     |
| 3.1.2 | Thư mục gốc chứa module   | `src/modules`                                                           | preset     |
| 3.1.3 | Các file trong một module | module, controller, service, repository, dto, ro, entity                | preset     |
| 3.1.4 | Thư mục con trong module  | `dto/`, `ro/`, `entities/`; controller, service, repository, module nằm ở gốc thư mục module | preset |

Bố cục một module:

```
src/modules/chat-room/
├── chat-room.module.ts
├── chat-room.controller.ts
├── chat-room.service.ts
├── chat-room.repository.ts
├── dto/
│   └── create-chat-room.dto.ts
├── ro/
│   └── chat-room.ro.ts
└── entities/
    └── chat-room.entity.ts
```

### 3.2. Thư mục dùng chung (common)

| Khóa   | Loại           | Thư mục                    | Quy tắc đặt vào đây                                  | Trạng thái |
| ------ | -------------- | -------------------------- | ---------------------------------------------------- | ---------- |
| 3.2.1  | Decorator      | `src/common/decorators`    | Decorator dùng từ hai module trở lên                 | preset     |
| 3.2.2  | Guard          | `src/common/guards`        | Guard dùng từ hai module trở lên                     | preset     |
| 3.2.3  | Interceptor    | `src/common/interceptors`  | Interceptor dùng từ hai module trở lên               | preset     |
| 3.2.4  | Filter         | `src/common/filters`       | Filter dùng từ hai module trở lên                    | preset     |
| 3.2.5  | Middleware     | `src/common/middlewares`   | Middleware dùng từ hai module trở lên                | preset     |
| 3.2.6  | Pipe           | `src/common/pipes`         | Pipe dùng từ hai module trở lên                      | preset     |
| 3.2.7  | Interface      | `src/common/interfaces`    | Interface dùng từ hai module trở lên                 | preset     |
| 3.2.8  | Enum           | `src/common/enums`         | Enum dùng từ hai module trở lên                      | preset     |
| 3.2.9  | Hằng số        | `src/common/constants`     | Hằng số dùng từ hai module trở lên                   | preset     |
| 3.2.10 | Utils / helper | `src/common/utils`         | Hàm thuần, không phụ thuộc NestJS, dùng từ hai module trở lên | preset |

Quy tắc chọn nơi đặt: dùng từ hai module trở lên thì đặt ở `src/common`; chỉ dùng trong một module thì đặt trong thư mục module đó.

### 3.3. Phân tầng và phụ thuộc

| Khóa  | Mục                        | Quy tắc                                                                          | Trạng thái |
| ----- | -------------------------- | -------------------------------------------------------------------------------- | ---------- |
| 3.3.1 | Luồng gọi                  | Controller → Service → Repository                                                | preset     |
| 3.3.2 | Controller                 | Không chứa logic nghiệp vụ, không gọi Repository                                 | preset     |
| 3.3.3 | Service gọi Service khác   | Được phép qua `imports` của module; cấm phụ thuộc vòng tròn                      | preset     |
| 3.3.4 | Kiểu dữ liệu giữa các tầng | Controller nhận DTO; Service trả Entity hoặc kiểu nội bộ; Controller chuyển sang RO trước khi trả | preset |
| 3.3.5 | Giao dịch (transaction)    | Mở ở Service (`DataSource.transaction` hoặc `QueryRunner`), truyền `EntityManager` xuống Repository | preset |
| 3.3.6 | Phân trang                 | Phân trang: unset (hỏi chọn offset hay cursor/keyset, dùng module phân trang chung nếu đã có) | unset |

### 3.4. Mẫu nên tuân theo

| Khóa  | Mẫu                                   | Phạm vi áp dụng        | Trạng thái |
| ----- | ------------------------------------- | ---------------------- | ---------- |
| 3.4.1 | Repository pattern                    | Mọi truy cập dữ liệu   | preset     |
| 3.4.2 | DTO riêng cho từng use case           | Mọi API nhận dữ liệu   | preset     |
| 3.4.3 | RO riêng cho dữ liệu trả về           | Mọi API trả dữ liệu    | preset     |
| 3.4.4 | Một module cho một nhóm tính năng     | Toàn dự án             | preset     |

### 3.5. Mẫu cần tránh

| Khóa  | Mẫu cần tránh                                   | Thay bằng                          | Lý do                                           | Trạng thái |
| ----- | ----------------------------------------------- | ---------------------------------- | ----------------------------------------------- | ---------- |
| 3.5.1 | Logic nghiệp vụ trong Controller                | Đưa vào Service                    | Khó kiểm thử, khó tái sử dụng                   | preset     |
| 3.5.2 | Trả Entity trực tiếp ra API                     | Chuyển sang RO                     | Lộ cấu trúc bảng, dễ lộ field nhạy cảm          | preset     |
| 3.5.3 | Dùng interface làm DTO/RO                       | Dùng class                         | Cần metadata lúc chạy cho validate và Swagger   | preset     |
| 3.5.4 | Phụ thuộc vòng tròn giữa module                 | Tách phần chung ra module riêng    | Gây lỗi khởi tạo khó dò                         | preset     |
| 3.5.5 | `synchronize: true` ở môi trường production     | Dùng migration                     | Có thể làm mất hoặc đổi cấu trúc dữ liệu        | preset     |

---

## 4. Yêu cầu bảo mật và phương pháp xử lý lỗi

### 4.1. Xác thực (Authentication)

| Khóa  | Mục                     | Giá trị                                                                   | Trạng thái |
| ----- | ----------------------- | ------------------------------------------------------------------------- | ---------- |
| 4.1.1 | Cơ chế                  | JWT Bearer, header `Authorization: Bearer <token>`                        | preset     |
| 4.1.2 | Guard xác thực          | `JwtAuthGuard` tại `src/common/guards/jwt-auth.guard.ts` (tạo mới nếu chưa có) | preset |
| 4.1.3 | Phạm vi áp dụng         | `global`, đăng ký qua `APP_GUARD`                                         | preset     |
| 4.1.4 | Đánh dấu API công khai  | `@Public()` tại `src/common/decorators/public.decorator.ts` (tạo mới nếu chưa có) | preset |
| 4.1.5 | Lấy người dùng hiện tại | `@CurrentUser()` tại `src/common/decorators/current-user.decorator.ts` (tạo mới nếu chưa có) | preset |

### 4.2. Phân quyền (Authorization)

| Khóa  | Mục                         | Giá trị                                                                                 | Trạng thái |
| ----- | --------------------------- | --------------------------------------------------------------------------------------- | ---------- |
| 4.2.1 | Guard phân quyền            | `RolesGuard` tại `src/common/guards/roles.guard.ts` (tạo mới nếu chưa có)               | preset     |
| 4.2.2 | Decorator                   | `@Roles(...)` tại `src/common/decorators/roles.decorator.ts` (tạo mới nếu chưa có)      | preset     |
| 4.2.3 | Enum role                   | `RoleEnum` tại `src/common/enums/role.enum.ts` (tạo mới nếu chưa có)                    | preset     |
| 4.2.4 | Giá trị role hợp lệ         | Giá trị role hợp lệ: unset (hỏi danh sách role của dự án)                               | unset      |
| 4.2.5 | Ánh xạ cột `Roles` của wiki | `Public` → `@Public()`; `Authenticated` → không thêm decorator (guard global đã bảo vệ); danh sách role → `@Roles(RoleEnum.X, ...)`; giá trị không có trong enum → dừng và hỏi | preset |
| 4.2.6 | Kiểm tra quyền sở hữu       | Viết trong Service như một bước nghiệp vụ; không đúng chủ thì ném `ForbiddenException`  | preset     |

### 4.3. Yêu cầu bảo mật dữ liệu

| Khóa  | Mục                        | Quy tắc                                                                       | Trạng thái |
| ----- | -------------------------- | ----------------------------------------------------------------------------- | ---------- |
| 4.3.1 | Băm mật khẩu               | `bcrypt`, số vòng băm 10 (cần duyệt)                                          | preset     |
| 4.3.2 | Field không được trả về    | `password`, `refreshToken`; loại bằng `@Exclude()` ở RO                       | preset     |
| 4.3.3 | Kiểm tra dữ liệu đầu vào   | `ValidationPipe` global với `whitelist: true`, `transform: true`              | preset     |
| 4.3.4 | Chống SQL injection        | Luôn dùng truy vấn tham số hóa của TypeORM; cấm nối chuỗi vào câu truy vấn    | preset     |
| 4.3.5 | Bí mật và khóa             | Đọc từ biến môi trường qua `@nestjs/config`; không ghi cứng trong mã          | preset     |
| 4.3.6 | Giới hạn tần suất / CORS   | Giới hạn tần suất / CORS: unset (hỏi có dùng `@nestjs/throttler` và cấu hình CORS thế nào) | unset |
| 4.3.7 | Dữ liệu nhạy cảm trong log | Không ghi mật khẩu, token, thông tin thẻ                                      | preset     |

### 4.4. Xử lý lỗi

| Khóa  | Mục                          | Quy tắc                                                                                  | Trạng thái |
| ----- | ---------------------------- | ---------------------------------------------------------------------------------------- | ---------- |
| 4.4.1 | Lớp lỗi sử dụng              | Các lớp con của `HttpException` của NestJS                                               | preset     |
| 4.4.2 | Nơi ném lỗi                  | Ở Service; Controller không bắt lỗi nghiệp vụ                                            | preset     |
| 4.4.3 | Định dạng lỗi trả về         | `{ message, error, statusCode }` (mặc định của NestJS)                                   | preset     |
| 4.4.4 | Bộ lọc lỗi toàn cục          | `HttpExceptionFilter` tại `src/common/filters/http-exception.filter.ts`, đăng ký global (tạo mới nếu chưa có) | preset |
| 4.4.5 | Bảng ánh xạ tình huống → lỗi | Không tìm thấy → `NotFoundException` (404); dữ liệu sai nghiệp vụ → `BadRequestException` (400); chưa đăng nhập hoặc token sai → `UnauthorizedException` (401); không đủ quyền → `ForbiddenException` (403); trùng dữ liệu → `ConflictException` (409) | preset |
| 4.4.6 | Lỗi không lường trước        | Ghi log đầy đủ; trả `500` với thông báo chung; không lộ chi tiết nội bộ                  | preset     |
| 4.4.7 | Ngôn ngữ thông báo lỗi       | Ngôn ngữ thông báo lỗi: unset (hỏi tiếng Việt, tiếng Anh hay mã lỗi)                     | unset      |
| 4.4.8 | Lỗi cơ sở dữ liệu            | Bắt lỗi trùng khóa (`ER_DUP_ENTRY`) và chuyển thành `ConflictException`                  | preset     |

---

## 5. Tiêu chuẩn tài liệu

### 5.1. Tài liệu API (Swagger)

| Khóa  | Mục                       | Quy tắc                                                                         | Trạng thái |
| ----- | ------------------------- | ------------------------------------------------------------------------------- | ---------- |
| 5.1.1 | Có sinh Swagger không     | Có                                                                              | preset     |
| 5.1.2 | Decorator trên Controller | `@ApiTags('<tên-module>')`; thêm `@ApiBearerAuth()` nếu có API không công khai   | preset     |
| 5.1.3 | Decorator trên handler    | `@ApiOperation({ summary })` lấy từ Purpose hoặc Summary của wiki; không có thì bỏ | preset   |
| 5.1.4 | Decorator trên response   | `@ApiResponse` cho từng mã trong bảng Success và Error của wiki                 | preset     |
| 5.1.5 | Decorator trên DTO / RO   | `@ApiProperty` cho mọi field, kèm `description` và `example` nếu wiki có         | preset     |

### 5.2. Chú thích trong mã

| Khóa  | Mục                      | Quy tắc                                                                    | Trạng thái |
| ----- | ------------------------ | -------------------------------------------------------------------------- | ---------- |
| 5.2.1 | Ngôn ngữ chú thích       | Ngôn ngữ chú thích: unset (hỏi tiếng Việt hay tiếng Anh)                   | unset      |
| 5.2.2 | Chú thích bắt buộc       | Mọi hàm public của Service có JSDoc                                        | preset     |
| 5.2.3 | Nội dung JSDoc           | Mô tả ngắn, `@param`, `@returns`, `@throws`                                | preset     |
| 5.2.4 | Không chú thích          | Không chú thích điều code đã tự nói rõ                                     | preset     |
| 5.2.5 | Đánh dấu mã sinh tự động | Đầu file ghi `@generated-from: <đường-dẫn-wiki>` và `@wiki-version: <phiên-bản>` | preset |

### 5.3. Tài liệu wiki và liên kết với mã

| Khóa  | Mục                    | Quy tắc                                                       | Trạng thái |
| ----- | ---------------------- | ------------------------------------------------------------- | ---------- |
| 5.3.1 | Vị trí file wiki       | Vị trí file wiki: unset (hỏi thư mục chứa wiki)               | unset      |
| 5.3.2 | Cập nhật khi code đổi  | Sửa wiki trước, sinh lại code sau; không sửa tay phần mã sinh tự động mà không cập nhật wiki | preset |
| 5.3.3 | Ghi vết phiên bản wiki | Snapshot wiki và hash trong manifest, lưu sau khi sinh code xong, dùng để nhận biết phần nào đổi | preset |
| 5.3.4 | Thư mục snapshot       | `.project-profile/generated/`, được commit cùng repo          | preset     |
| 5.3.5 | Hành vi khi chạy lại cùng wiki | So wiki với snapshot, hiển thị khác biệt và hỏi xác nhận; xác nhận thì chỉ sửa phần thay đổi, hủy thì không sửa gì | preset |

### 5.4. Tài liệu dự án

| Khóa  | Mục                            | Quy tắc                                                        | Trạng thái |
| ----- | ------------------------------ | -------------------------------------------------------------- | ---------- |
| 5.4.1 | README                         | Có: cách chạy, biến môi trường, lệnh hay dùng                  | preset     |
| 5.4.2 | Quy ước commit                 | Quy ước commit: unset (hỏi, ví dụ Conventional Commits)        | unset      |
| 5.4.3 | Ghi lại thay đổi cấu trúc bảng | Mỗi thay đổi có một migration kèm mô tả                        | preset     |

---

## 6. Mục chưa xác định

Các khóa preset để `unset`, skill phải hỏi người dùng khi tạo profile:

| Khóa  | Câu hỏi cho người dùng                                      |
| ----- | ----------------------------------------------------------- |
| 1.1.8 | Chú thích mã viết bằng tiếng Việt hay tiếng Anh?            |
| 1.5.1 | Tiền tố và phiên bản API (ví dụ `/api/v1`)?                 |
| 2.1.1 | Phiên bản Node.js?                                          |
| 2.1.2 | Phiên bản chính của NestJS?                                 |
| 2.1.3 | Phiên bản MySQL?                                            |
| 3.3.6 | Phân trang theo offset hay cursor/keyset?                   |
| 4.2.4 | Danh sách role của dự án?                                   |
| 4.3.6 | Có dùng giới hạn tần suất không, và cấu hình CORS ra sao?   |
| 4.4.7 | Thông báo lỗi bằng ngôn ngữ nào, hay dùng mã lỗi?           |
| 5.2.1 | Ngôn ngữ chú thích (trùng với 1.1.8, hỏi một lần)           |
| 5.3.1 | Thư mục chứa wiki?                                          |
| 5.4.2 | Quy ước commit?                                             |

Các khóa đánh dấu `(cần duyệt)`: 1.4.6, 1.5.2, 4.3.1 là quyết định quy ước, nên hiển thị cho người dùng xác nhận dù trạng thái là `preset`.
