---
name: docs-to-code
description: Chuyển đổi tài liệu wiki API (Markdown theo mẫu docs/wiki_new.md gồm Purpose, Endpoint, Header, Request, Processing Flow và Response) thành mã nguồn NestJS. Dùng khi người dùng gọi "/docs-to-code", yêu cầu "docs to code", "convert a wiki to code", "generate code from a wiki", "create a DTO from a wiki", "create a controller from a wiki", "create a service from a wiki", hoặc cung cấp file wiki API và yêu cầu mã nguồn tương ứng. Hỗ trợ bốn bước gồm tạo DTO, tạo Controller, tạo Service (MySQL/TypeORM), và tạo RO (Response Object) cùng Exception.
---

# Docs to Code

Skill này đọc một file wiki API và tạo mã nguồn NestJS tương ứng. Skill được chia thành các bước độc lập; mỗi bước chỉ làm đúng một việc.

| Step | Phạm vi                                                        | Quy tắc chi tiết                                                                     | Ví dụ                                                                                                                            |
| ---- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| 1    | Tạo DTO từ `Request`                                           | [`references/dto.conventions.md`](./references/dto.conventions.md)                   | [`assets/dto.templates.md`](./assets/dto.templates.md)                                                                           |
| 2    | Tạo Controller từ `Endpoint` + `Header` + `Response > Success` | [`references/controller.conventions.md`](./references/controller.conventions.md)     | [`assets/controller.templates.md`](./assets/controller.templates.md)                                                             |
| 3    | Tạo Service từ `Processing Flow` (MySQL/TypeORM)               | [`references/service.conventions.md`](./references/service.conventions.md), [`references/orm-typeorm.conventions.md`](./references/orm-typeorm.conventions.md) (cú pháp ORM, theo khóa `2.1.4`) | [`assets/service.templates.md`](./assets/service.templates.md), [`assets/orm-typeorm.templates.md`](./assets/orm-typeorm.templates.md) |
| 4    | Tạo RO (Response Object) và Exception từ `Response`            | [`references/ro-exception.conventions.md`](./references/ro-exception.conventions.md) | [`assets/ro.templates.md`](./assets/ro.templates.md), [`assets/duplicate-key.templates.md`](./assets/duplicate-key.templates.md) |

## Workflow

1. Xác định người dùng yêu cầu bước nào. Nếu họ chỉ yêu cầu một bước (ví dụ: "create a DTO"), chỉ thực hiện bước đó. Khi chạy toàn bộ workflow, thực hiện theo thứ tự bước 1 → 2 → 3 → 4.
2. Đọc file wiki do người dùng cung cấp. Nếu chưa có wiki, hãy yêu cầu người dùng cung cấp; không tự bịa nội dung.
3. **Đọc profile dự án** `.project-profile/profile.md` theo [`rules/profile-contract.md`](./rules/profile-contract.md) mục 1: chưa có thì dừng và yêu cầu chạy skill `project-profile`; khóa `detected`/`unset` thì hỏi. Sau đó đối chiếu profile với source (mục "Đối chiếu profile với source" bên dưới) và hiển thị kết quả cho người dùng trước khi tạo hoặc sửa code. Không giả định dự án có `common/`, `helper/` hay vị trí chuẩn nào ngoài những gì profile ghi.
4. **Đọc [`rules/profile-contract.md`](./rules/profile-contract.md)** (khóa profile mỗi bước cần, quy tắc riêng của skill, chính sách lỗi), rồi **chỉ đọc file trong `references/` của bước được yêu cầu** (không nạp các bước khác). Quy ước dự án lấy từ profile; ví dụ trong `references/` và `assets/` chỉ minh họa. Nếu mâu thuẫn, profile được ưu tiên.
5. Đọc file ví dụ tương ứng trong `assets/` để hiểu định dạng đầu ra mong đợi.
6. Tạo hoặc cập nhật các file code. Khi đã hoàn thành toàn bộ phần chuyển wiki sang mã nguồn, trước khi tạo/sửa file test hoặc chạy checklist kiểm tra, hỏi người dùng có muốn tạo/cập nhật test hay không.
   - Nếu người dùng đồng ý, tạo/cập nhật test Jest liên quan, chạy test mục tiêu và checklist kiểm tra phù hợp.
   - Nếu người dùng không muốn, không tạo/sửa file test, không chạy test hoặc checklist kiểm tra; kết thúc workflow ngay mà không tiếp tục bước công việc nào khác.
7. Đưa ra báo cáo cuối theo mục "Báo cáo cuối" của bước đó, ghi rõ lựa chọn test của người dùng và các kiểm tra đã/chưa chạy.

### Đối chiếu profile với source

Thực hiện một lần ở đầu mỗi yêu cầu docs-to-code, kể cả khi người dùng chỉ yêu cầu một bước. Profile đã cho biết thư mục và file dùng chung (khóa `3.1.x`, `3.2.x`, `4.x`); bước này chỉ **xác nhận chúng còn tồn tại** bằng Glob và đọc nhanh file entry point cần thiết (ví dụ nơi đăng ký pipe/guard/filter toàn cục), không khảo sát lại từ đầu. Không liệt kê `node_modules`, output build hay file sinh tự động.

Báo cáo ngắn cho người dùng: các khóa profile bước này dùng (kèm trạng thái), đường dẫn tương ứng và kết quả (`Có`, hoặc `Không tìm thấy`). Không tự suy ra một đường dẫn tồn tại khi không thấy.

Nếu một thành phần cần thiết không tồn tại (kể cả đường dẫn profile ghi "tạo mới nếu chưa có"), nêu rõ khoảng trống và hỏi người dùng trước khi tạo hoặc mở rộng cấu trúc. Ngoại lệ: tạo ở vị trí do người dùng hoặc wiki chỉ định rõ.

## Suy ra Module, Controller, Handler

Template wiki (xem [`docs/wiki_new.md`](../../../docs/wiki_new.md)) chỉ có `Method`, `Path`, `Roles` trong `Endpoint`. Module, Controller và Handler **luôn được suy ra** theo quy tắc sau và dùng cho mọi bước:

Tên, vị trí và đuôi file/class lấy từ profile (khóa `1.2.x`, `1.3.x`, `3.1.x`).

1. **Module**: theo khóa `1.5.6` (mặc định: segment đầu của `Path`, sau global prefix `1.5.1`). Thư mục theo `3.1.2`; tên class theo `1.3.1`. Nếu dự án đã có module cho segment đó, dùng lại.
2. **Controller**: tên class theo `1.3.1`. Nếu đã có Controller dùng prefix của segment đó, dùng đúng tên class hiện có.
3. **Handler** (camelCase), theo thứ tự ưu tiên:
   - Path dạng hành động: theo khóa `1.5.5` (mặc định: segment cuối làm tên handler, ví dụ `/auth/refresh-token` → `refreshToken`).
   - Ngược lại, theo `Method` và bảng của khóa `1.5.4`. Khóa này `unset`/`detected` thì hỏi người dùng; không tự đặt.
4. Trước khi tạo file, **nêu giá trị đã suy ra** (Module, Controller, Handler) trong phần đối chiếu để người dùng thấy. Hỏi lại nếu có nhiều cách hiểu hợp lý hoặc trùng handler đã tồn tại; không tự đổi tên handler hiện có.
5. Các bước sau dùng đúng bộ giá trị đã suy ra ở trên để tên file DTO, Controller, Service method và RO nhất quán.

## Phụ thuộc giữa các bước

Mỗi bước phụ thuộc vào kết quả của các bước trước. Nếu thiếu điều kiện tiên quyết, hãy thực hiện bước tiên quyết đó hoặc thông báo cho người dùng; không tự giả định.

- Bước 2 cần DTO từ bước 1.
- Bước 3 cần DTO (bước 1), Controller (bước 2) và các TypeORM entity cho những bảng trong `Entity/Schema`. Skill này không tạo entity.
- Bước 4 cần Service từ bước 3.

Đối chiếu profile với source là bước chuẩn bị bắt buộc, không phải một bước trong flow runtime của API.

## DTO và RO

- **DTO** (Data Transfer Object, bước 1): dữ liệu **đầu vào** (Request). Dùng validator. Tên file/class theo khóa `1.2.5`, `1.3.2`; thư mục theo `3.1.4`.
- **RO** (Response Object, bước 4): dữ liệu **đầu ra** (Response). Không có validator; dùng `@Expose()` để chỉ phơi bày các field mà wiki quy định. Tên file/class theo khóa `1.2.6`, `1.3.3`; thư mục theo `3.1.4`. **Nơi chuyển sang RO theo khóa `3.3.4`** (Service hay Controller; profile ưu tiên hơn mặc định của skill). Cách chuyển là quy tắc của skill: `plainToInstance(<RO>, data, { excludeExtraneousValues: true })`.
- Không dùng thuật ngữ `ResponseDto` cho dữ liệu response; response luôn là RO.
- Ví dụ trong `references/` và `assets/` viết `Dto`/`RO` chỉ để minh họa; dùng đúng đuôi và hoa/thường của profile.

## Nguyên tắc chung

- Quy ước dự án (đặt tên, thư viện, thư mục, phân quyền, lỗi, Swagger) lấy từ profile; quy tắc riêng của skill và chính sách thông báo lỗi xem [`profile-contract.md`](./rules/profile-contract.md). Giữ nguyên chính xác các thông báo lỗi như wiki quy định.
- Không suy đoán ràng buộc, thông báo hoặc cấu hình mà wiki không nêu; hãy hỏi người dùng.
- Ưu tiên các cơ chế sẵn có của dự án (guard, decorator, module) theo đường dẫn trong profile.
- Không sửa file wiki. Không ghi đè file hoặc handler đã tồn tại khi chưa hỏi.
- Đường dẫn import trong ví dụ chỉ mang tính minh họa; luôn xác định đường dẫn thực tế từ dự án.

## Cấu trúc thư mục

```text
docs-to-code/
├── README.md                             # Tổng quan và hướng dẫn sử dụng docs-to-code
├── SKILL.md                              # Tổng quan và workflow (file này)
├── rules/                                # Hợp đồng với profile và quy tắc riêng của skill
│   └── profile-contract.md
├── references/                           # Quy tắc chi tiết cho từng bước
│   ├── dto.conventions.md
│   ├── controller.conventions.md
│   ├── service.conventions.md
│   ├── orm-typeorm.conventions.md        # Cú pháp ORM (MySQL/TypeORM), dùng cùng bước 3
│   └── ro-exception.conventions.md
└── assets/                               # Ví dụ đầu vào/đầu ra
    ├── dto.templates.md
    ├── controller.templates.md
    ├── service.templates.md
    ├── orm-typeorm.templates.md
    ├── ro.templates.md
    └── duplicate-key.templates.md
```
