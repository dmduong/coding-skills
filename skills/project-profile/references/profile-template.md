---
schemaVersion: 1
project: <tên_dự_án>
framework: NestJS
orm: TypeORM
database: MySQL
createdAt: <yyyy-mm-dd>
confirmedBy: <người_xác_nhận>
confirmedAt: <yyyy-mm-dd>
---

# Profile dự án: <tên_dự_án>

> **Quy tắc đọc profile (dành cho skill)**
> - Khóa mục (ví dụ `1.2`) là cố định, không đổi tên, không xóa, không thêm mục mới ngoài khuôn.
> - Cột **Trạng thái** nhận một trong bốn giá trị:
>   `confirmed` (người dùng đã xác nhận), `detected` (quét thấy, chưa xác nhận),
>   `preset` (lấy từ bộ mặc định), `unset` (chưa quy định).
> - Mục `unset` hoặc `detected`: **hỏi người dùng**, không tự đoán.
> - Mục có giá trị `N/A`: dự án không dùng, bỏ qua, không sinh code liên quan.
> - Tên file, class, thư viện trong profile được ưu tiên hơn mọi mặc định của skill.

---

## 1. Phong cách lập trình và quy ước đặt tên

### 1.1. Phong cách lập trình

| Khóa | Mục                       | Giá trị                                   | Trạng thái |
| ---- | ------------------------- | ----------------------------------------- | ---------- |
| 1.1.1 | Ngôn ngữ / chế độ kiểu    | <ví dụ: TypeScript, `strict: true`>       | <status>   |
| 1.1.2 | Công cụ định dạng         | <ví dụ: Prettier, cấu hình tại `.prettierrc`> | <status> |
| 1.1.3 | Công cụ kiểm tra lỗi      | <ví dụ: ESLint, cấu hình tại `.eslintrc`> | <status>   |
| 1.1.4 | Dấu nháy / dấu chấm phẩy  | <ví dụ: nháy đơn, có `;`>                 | <status>   |
| 1.1.5 | Cách khai báo bất đồng bộ | <ví dụ: `async/await`, không dùng `.then`> | <status>  |
| 1.1.6 | Kiểu `any`                | <ví dụ: cấm, dùng `unknown`>              | <status>   |
| 1.1.7 | Cách import               | <ví dụ: đường dẫn tuyệt đối theo alias `@/`> | <status> |
| 1.1.8 | Chú thích mã              | <ví dụ: tiếng Việt, chỉ giải thích "vì sao"> | <status> |

### 1.2. Đặt tên tập tin và thư mục

Quy tắc chung: <ví dụ: `kebab-case`, số ít>

| Khóa | Loại                          | Mẫu tên tập tin               | Ví dụ                       | Trạng thái |
| ---- | ----------------------------- | ----------------------------- | --------------------------- | ---------- |
| 1.2.1 | Module                        | `x-y.module.ts`               | <ví_dụ>                     | <status>   |
| 1.2.2 | Controller                    | `x-y.controller.ts`           | <ví_dụ>                     | <status>   |
| 1.2.3 | Service                       | `x-y.service.ts`              | <ví_dụ>                     | <status>   |
| 1.2.4 | Repository                    | `x-y.repository.ts`           | <ví_dụ>                     | <status>   |
| 1.2.5 | DTO                           | `x-y.dto.ts`                  | <ví_dụ>                     | <status>   |
| 1.2.6 | RO (response object)          | `x-y.ro.ts`                   | <ví_dụ>                     | <status>   |
| 1.2.7 | Entity                        | `x-y.entity.ts`               | <ví_dụ>                     | <status>   |
| 1.2.8 | Guard / Pipe / Interceptor / Filter | `x-y.guard.ts`, ...     | <ví_dụ>                     | <status>   |
| 1.2.9 | Decorator                     | `x-y.decorator.ts`            | <ví_dụ>                     | <status>   |
| 1.2.10 | Enum / Interface             | `x-y.enum.ts`, `x-y.interface.ts` | <ví_dụ>                 | <status>   |
| 1.2.11 | Test                         | `x-y.<loại>.spec.ts`          | <ví_dụ>                     | <status>   |

### 1.3. Đặt tên lớp

| Khóa | Loại                          | Mẫu                           | Ví dụ     | Trạng thái |
| ---- | ----------------------------- | ----------------------------- | --------- | ---------- |
| 1.3.1 | Module / Controller / Service / Repository | `XxYyModule`, `XxYyController`, ... | <ví_dụ> | <status> |
| 1.3.2 | DTO                           | `XxYyDto`                     | <ví_dụ>   | <status>   |
| 1.3.3 | RO                            | `XxYyRo`                      | <ví_dụ>   | <status>   |
| 1.3.4 | Guard / Pipe / Interceptor / Filter | `XxYyGuard`, ...        | <ví_dụ>   | <status>   |
| 1.3.5 | Entity                        | `XxYy`                        | <ví_dụ>   | <status>   |
| 1.3.6 | Interface                     | `IXxYy`                       | <ví_dụ>   | <status>   |
| 1.3.7 | Enum                          | `XxYyEnum`                    | <ví_dụ>   | <status>   |

### 1.4. Đặt tên hàm, biến, thuộc tính, dữ liệu

| Khóa | Mục                              | Quy tắc                                 | Trạng thái |
| ---- | -------------------------------- | --------------------------------------- | ---------- |
| 1.4.1 | Hàm và biến                      | <ví dụ: `camelCase`>                    | <status>   |
| 1.4.2 | Hằng số                          | <ví dụ: `UPPER_SNAKE_CASE`>             | <status>   |
| 1.4.3 | Thành viên enum                  | <ví dụ: `UPPER_SNAKE_CASE`>             | <status>   |
| 1.4.4 | Biến boolean                     | <ví dụ: tiền tố `is`, `has`, `can`>     | <status>   |
| 1.4.5 | Thuộc tính JSON (request/response) | <ví dụ: `camelCase`>                  | <status>   |
| 1.4.6 | Tên bảng                         | <ví dụ: `snake_case`, số ít / số nhiều> | <status>   |
| 1.4.7 | Tên cột                          | <ví dụ: `snake_case`>                   | <status>   |
| 1.4.8 | Ánh xạ cột ↔ thuộc tính          | <ví dụ: `@Column({ name: 'created_at' }) createdAt`> | <status> |

### 1.5. Đặt tên API

| Khóa | Mục                       | Quy tắc                                              | Trạng thái |
| ---- | ------------------------- | ---------------------------------------------------- | ---------- |
| 1.5.1 | Tiền tố và phiên bản      | <ví dụ: `/api/v1`, khai báo một nơi>                 | <status>   |
| 1.5.2 | Dạng path                 | <ví dụ: `kebab-case`, danh từ số nhiều>              | <status>   |
| 1.5.3 | Tên path param            | <ví dụ: `camelCase`>                                 | <status>   |
| 1.5.4 | Tên handler theo Method   | <ví dụ: GET list→`findAll`, GET id→`findOne`, POST→`create`, PATCH→`update`, DELETE→`remove`> | <status> |
| 1.5.5 | Path dạng hành động       | <ví dụ: lấy segment cuối làm tên handler (`login`)>  | <status>   |
| 1.5.6 | Quy tắc suy ra Module từ path | <ví dụ: segment đầu sau tiền tố, bỏ `s` cuối>   | <status>   |

---

## 2. Ngăn xếp công nghệ và thư viện ưu tiên

### 2.1. Công nghệ chung

| Khóa | Hạng mục            | Công nghệ / phiên bản                 | Ghi chú | Trạng thái |
| ---- | ------------------- | ------------------------------------- | ------- | ---------- |
| 2.1.1 | Runtime             | <ví dụ: Node.js 20 LTS>               |         | <status>   |
| 2.1.2 | Framework           | <ví dụ: NestJS 10.x>                  |         | <status>   |
| 2.1.3 | Cơ sở dữ liệu       | <ví dụ: MySQL 8>                      |         | <status>   |
| 2.1.4 | ORM / driver        | <ví dụ: TypeORM, `mysql2`>            |         | <status>   |
| 2.1.5 | Cấu hình            | <ví dụ: `@nestjs/config`>             |         | <status>   |
| 2.1.6 | Tài liệu API        | <ví dụ: `@nestjs/swagger` hoặc N/A>   |         | <status>   |
| 2.1.7 | Xác thực            | <ví dụ: `@nestjs/jwt`, `passport-jwt`> |        | <status>   |
| 2.1.8 | Ghi log             | <ví dụ: Logger của NestJS / pino>     |         | <status>   |
| 2.1.9 | Ngày giờ            | <ví dụ: `dayjs`>                      |         | <status>   |

### 2.2. Thư viện ưu tiên theo tầng

| Khóa | Tầng       | Thư viện ưu tiên | Quy tắc sử dụng | Trạng thái |
| ---- | ---------- | ---------------- | --------------- | ---------- |
| 2.2.1 | DTO        | <ví dụ: `class-validator`, `class-transformer`, `@nestjs/swagger`> | <ví dụ: validate bằng decorator, không viết validate tay> | <status> |
| 2.2.2 | RO         | <ví dụ: `class-transformer`>          | <ví dụ: `@Expose`/`@Exclude`, không trả field nhạy cảm> | <status> |
| 2.2.3 | Controller | <ví dụ: `@nestjs/common`, `@nestjs/swagger`> | <ví dụ: chỉ nhận request và gọi service> | <status> |
| 2.2.4 | Service    | <ví dụ: `@nestjs/common`>             | <ví dụ: chứa logic nghiệp vụ, ném lỗi bằng `HttpException`> | <status> |
| 2.2.5 | Repository | <ví dụ: `@nestjs/typeorm`, `typeorm`> | <ví dụ: chỉ truy vấn, service không gọi `EntityManager` trực tiếp> | <status> |

### 2.3. Thư viện không dùng

| Khóa | Không dùng | Thay bằng | Lý do | Trạng thái |
| ---- | ---------- | --------- | ----- | ---------- |
| 2.3.1 | <thư_viện> | <thay_thế> | <lý_do> | <status> |

### 2.4. Quy tắc thêm thư viện mới

| Khóa | Quy tắc | Trạng thái |
| ---- | ------- | ---------- |
| 2.4.1 | <ví dụ: không thêm thư viện ngoài danh sách khi sinh code, cần thêm thì dừng và hỏi> | <status> |

---

## 3. Mẫu kiến trúc nên tuân theo hoặc tránh

### 3.1. Tổ chức mã nguồn

| Khóa | Mục                          | Giá trị                                         | Trạng thái |
| ---- | ---------------------------- | ----------------------------------------------- | ---------- |
| 3.1.1 | Cách chia                    | <ví dụ: theo tính năng (`by-feature`)>          | <status>   |
| 3.1.2 | Thư mục gốc chứa module      | <ví dụ: `src/modules`>                          | <status>   |
| 3.1.3 | Các file trong một module    | <ví dụ: module, controller, service, repository, dto, ro, entity> | <status> |
| 3.1.4 | Thư mục con trong module     | <ví dụ: `dto/`, `ro/`, `entities/`>             | <status>   |

### 3.2. Thư mục dùng chung (common)

| Khóa | Loại         | Thư mục              | Quy tắc đặt vào đây | Trạng thái |
| ---- | ------------ | -------------------- | ------------------- | ---------- |
| 3.2.1 | Decorator    | <ví dụ: `src/common/decorators`>   | <quy_tắc> | <status> |
| 3.2.2 | Guard        | <ví dụ: `src/common/guards`>       | <quy_tắc> | <status> |
| 3.2.3 | Interceptor  | <ví dụ: `src/common/interceptors`> | <quy_tắc> | <status> |
| 3.2.4 | Filter       | <ví dụ: `src/common/filters`>      | <quy_tắc> | <status> |
| 3.2.5 | Middleware   | <ví dụ: `src/common/middlewares`>  | <quy_tắc> | <status> |
| 3.2.6 | Pipe         | <ví dụ: `src/common/pipes`>        | <quy_tắc> | <status> |
| 3.2.7 | Interface    | <ví dụ: `src/common/interfaces`>   | <quy_tắc> | <status> |
| 3.2.8 | Enum         | <ví dụ: `src/common/enums`>        | <quy_tắc> | <status> |
| 3.2.9 | Hằng số      | <ví dụ: `src/common/constants`>    | <quy_tắc> | <status> |
| 3.2.10 | Utils / helper | <ví dụ: `src/common/utils`>      | <quy_tắc> | <status> |

Quy tắc chọn nơi đặt: <ví dụ: dùng từ hai module trở lên thì đặt ở `common`, dùng trong một module thì đặt trong module đó>

### 3.3. Phân tầng và phụ thuộc

| Khóa | Mục                          | Quy tắc                                                  | Trạng thái |
| ---- | ---------------------------- | -------------------------------------------------------- | ---------- |
| 3.3.1 | Luồng gọi                    | <ví dụ: Controller → Service → Repository>               | <status>   |
| 3.3.2 | Controller                   | <ví dụ: không chứa logic nghiệp vụ, không gọi Repository> | <status>  |
| 3.3.3 | Service gọi Service khác     | <ví dụ: được phép qua `import` module, cấm vòng tròn>    | <status>   |
| 3.3.4 | Kiểu dữ liệu giữa các tầng   | <ví dụ: Controller nhận DTO, Service trả Entity hoặc kiểu nội bộ, Controller chuyển sang RO> | <status> |
| 3.3.5 | Giao dịch (transaction)      | <ví dụ: mở ở Service, truyền `EntityManager` xuống Repository> | <status> |
| 3.3.6 | Phân trang                   | <ví dụ: cursor/keyset, dùng module phân trang chung>     | <status>   |

### 3.4. Mẫu nên tuân theo

| Khóa | Mẫu        | Phạm vi áp dụng | Trạng thái |
| ---- | ---------- | --------------- | ---------- |
| 3.4.1 | <ví dụ: Repository pattern> | <phạm_vi> | <status> |
| 3.4.2 | <ví dụ: DTO riêng cho từng use case> | <phạm_vi> | <status> |

### 3.5. Mẫu cần tránh

| Khóa | Mẫu cần tránh | Thay bằng | Lý do | Trạng thái |
| ---- | ------------- | --------- | ----- | ---------- |
| 3.5.1 | <ví dụ: logic nghiệp vụ trong Controller> | <thay_thế> | <lý_do> | <status> |
| 3.5.2 | <ví dụ: dùng Entity làm kiểu trả về của API> | <ví dụ: dùng RO> | <lý_do> | <status> |

---

## 4. Yêu cầu bảo mật và phương pháp xử lý lỗi

### 4.1. Xác thực (Authentication)

| Khóa | Mục                          | Giá trị                                           | Trạng thái |
| ---- | ---------------------------- | ------------------------------------------------- | ---------- |
| 4.1.1 | Cơ chế                       | <ví dụ: JWT Bearer, header `Authorization`>       | <status>   |
| 4.1.2 | Guard xác thực               | <ví dụ: `JwtAuthGuard`, import từ `<đường_dẫn>`> | <status>   |
| 4.1.3 | Phạm vi áp dụng              | <ví dụ: `global` (qua `APP_GUARD`) / từng route>  | <status>   |
| 4.1.4 | Đánh dấu API công khai       | <ví dụ: `@Public()`, import từ `<đường_dẫn>`>     | <status>   |
| 4.1.5 | Lấy người dùng hiện tại      | <ví dụ: `@CurrentUser()`, import từ `<đường_dẫn>`> | <status>  |

### 4.2. Phân quyền (Authorization)

| Khóa | Mục                          | Giá trị                                           | Trạng thái |
| ---- | ---------------------------- | ------------------------------------------------- | ---------- |
| 4.2.1 | Guard phân quyền             | <ví dụ: `RolesGuard`>                             | <status>   |
| 4.2.2 | Decorator                    | <ví dụ: `@Roles(...)`>                            | <status>   |
| 4.2.3 | Enum role                    | <ví dụ: `Role`, import từ `<đường_dẫn>`>          | <status>   |
| 4.2.4 | Giá trị role hợp lệ          | <ví dụ: `ADMIN`, `USER`>                          | <status>   |
| 4.2.5 | Ánh xạ cột `Roles` của wiki  | `Public` → <decorator>; `Authenticated` → <không thêm decorator>; danh sách role → <decorator + enum> | <status> |
| 4.2.6 | Kiểm tra quyền sở hữu        | <ví dụ: viết trong Service, ném 403 nếu không đúng chủ> | <status> |

### 4.3. Yêu cầu bảo mật dữ liệu

| Khóa | Mục                          | Quy tắc                                              | Trạng thái |
| ---- | ---------------------------- | ---------------------------------------------------- | ---------- |
| 4.3.1 | Băm mật khẩu                 | <ví dụ: `bcrypt`, số vòng băm `<n>`>                 | <status>   |
| 4.3.2 | Field không được trả về      | <ví dụ: `password`, `refreshToken`>                  | <status>   |
| 4.3.3 | Kiểm tra dữ liệu đầu vào     | <ví dụ: `ValidationPipe` global, `whitelist: true`>  | <status>   |
| 4.3.4 | Chống SQL injection          | <ví dụ: luôn dùng tham số hóa, cấm nối chuỗi vào câu truy vấn> | <status> |
| 4.3.5 | Bí mật và khóa               | <ví dụ: đọc từ biến môi trường qua `@nestjs/config`, không ghi cứng> | <status> |
| 4.3.6 | Giới hạn tần suất / CORS     | <ví dụ: `@nestjs/throttler`, cấu hình CORS tại `main.ts`> | <status> |
| 4.3.7 | Dữ liệu nhạy cảm trong log   | <ví dụ: không ghi mật khẩu, token>                   | <status>   |

### 4.4. Xử lý lỗi

| Khóa | Mục                          | Quy tắc                                              | Trạng thái |
| ---- | ---------------------------- | ---------------------------------------------------- | ---------- |
| 4.4.1 | Lớp lỗi sử dụng              | <ví dụ: các lớp con của `HttpException`>             | <status>   |
| 4.4.2 | Nơi ném lỗi                  | <ví dụ: chỉ ở Service, Controller không bắt lỗi>     | <status>   |
| 4.4.3 | Định dạng lỗi trả về         | <ví dụ: `{ message, error, statusCode }`>            | <status>   |
| 4.4.4 | Bộ lọc lỗi toàn cục          | <ví dụ: `HttpExceptionFilter` tại `<đường_dẫn>` hoặc N/A> | <status> |
| 4.4.5 | Bảng ánh xạ tình huống → lỗi | <ví dụ: không tìm thấy → `NotFoundException` (404); sai dữ liệu → `BadRequestException` (400); chưa đăng nhập → `UnauthorizedException` (401); không đủ quyền → `ForbiddenException` (403); trùng dữ liệu → `ConflictException` (409)> | <status> |
| 4.4.6 | Lỗi không lường trước        | <ví dụ: ghi log đầy đủ, trả `500` với thông báo chung, không lộ chi tiết nội bộ> | <status> |
| 4.4.7 | Ngôn ngữ thông báo lỗi       | <ví dụ: tiếng Việt / tiếng Anh / mã lỗi>             | <status>   |
| 4.4.8 | Lỗi cơ sở dữ liệu            | <ví dụ: bắt lỗi trùng khóa (`ER_DUP_ENTRY`) và chuyển thành `ConflictException`> | <status> |

---

## 5. Tiêu chuẩn tài liệu

### 5.1. Tài liệu API (Swagger)

| Khóa | Mục                          | Quy tắc                                              | Trạng thái |
| ---- | ---------------------------- | ---------------------------------------------------- | ---------- |
| 5.1.1 | Có sinh Swagger không        | <Có / Không / N/A>                                   | <status>   |
| 5.1.2 | Decorator trên Controller    | <ví dụ: `@ApiTags`, `@ApiBearerAuth` nếu không công khai> | <status> |
| 5.1.3 | Decorator trên handler       | <ví dụ: `@ApiOperation({ summary })` lấy từ mục Purpose/Summary của wiki> | <status> |
| 5.1.4 | Decorator trên response      | <ví dụ: `@ApiResponse` cho từng mã trong bảng Success và Error của wiki> | <status> |
| 5.1.5 | Decorator trên DTO / RO      | <ví dụ: `@ApiProperty` cho mọi field, kèm `description` và `example`> | <status> |

### 5.2. Chú thích trong mã

| Khóa | Mục                          | Quy tắc                                              | Trạng thái |
| ---- | ---------------------------- | ---------------------------------------------------- | ---------- |
| 5.2.1 | Ngôn ngữ chú thích           | <ví dụ: tiếng Việt>                                  | <status>   |
| 5.2.2 | Chú thích bắt buộc           | <ví dụ: mọi hàm public của Service có JSDoc>         | <status>   |
| 5.2.3 | Nội dung JSDoc               | <ví dụ: mô tả, `@param`, `@returns`, `@throws`>      | <status>   |
| 5.2.4 | Không chú thích              | <ví dụ: không chú thích điều code đã tự nói rõ>      | <status>   |
| 5.2.5 | Đánh dấu mã sinh tự động     | <ví dụ: đầu file ghi `@generated-from: <đường_dẫn_wiki>`> | <status> |

### 5.3. Tài liệu wiki và liên kết với mã

| Khóa | Mục                          | Quy tắc                                              | Trạng thái |
| ---- | ---------------------------- | ---------------------------------------------------- | ---------- |
| 5.3.1 | Vị trí file wiki             | <ví dụ: `docs/wiki/<module>/<api>.md`>               | <status>   |
| 5.3.2 | Cập nhật khi code đổi        | <ví dụ: sửa wiki trước, sinh lại code sau>           | <status>   |
| 5.3.3 | Ghi vết phiên bản wiki       | <ví dụ: snapshot wiki + hash trong manifest, lưu khi sinh code xong> | <status> |
| 5.3.4 | Thư mục snapshot             | <ví dụ: `.project-profile/generated/`, được commit cùng repo> | <status> |
| 5.3.5 | Hành vi khi chạy lại cùng wiki | <ví dụ: so với snapshot, hiển thị khác biệt, hỏi xác nhận rồi mới sửa; hủy thì không sửa gì> | <status> |

### 5.4. Tài liệu dự án

| Khóa | Mục                          | Quy tắc                                              | Trạng thái |
| ---- | ---------------------------- | ---------------------------------------------------- | ---------- |
| 5.4.1 | README                       | <ví dụ: cách chạy, biến môi trường, lệnh hay dùng>   | <status>   |
| 5.4.2 | Quy ước commit               | <ví dụ: Conventional Commits>                        | <status>   |
| 5.4.3 | Ghi lại thay đổi cấu trúc bảng | <ví dụ: mỗi thay đổi có migration kèm mô tả>       | <status>   |

---

## 6. Mục chưa xác định

Liệt kê các khóa còn `unset` hoặc `detected` để hỏi người dùng.

| Khóa  | Lý do chưa xác định | Các lựa chọn tìm thấy |
| ----- | ------------------- | --------------------- |
| <khóa> | <lý_do>            | <lựa_chọn_1>, <lựa_chọn_2> |
