---
name: service-to-code
description: Tạo Service method NestJS từ wiki API theo template `../docs-to-code/assets/docs-template.md`. Dùng khi người dùng gọi "/service-to-code", yêu cầu "create a service from a wiki", hoặc chỉ muốn phần service.
argument-hint: Cung cấp file wiki (path/attachment/content) và phạm vi tạo service.
---

# Service to Code

Skill này chỉ tạo/cập nhật Service từ `Processing Flow` và schema liên quan.

## Workflow

Thực hiện quy trình chung trong [`workflow.md`](../docs-to-code/rules/workflow.md), kể cả khi gọi skill trực tiếp. Kiểm tra DTO, Controller và model/schema cần dùng trước; skill này không tạo Entity hay migration.

Đọc quy tắc Service/ORM:

- [`references/service.conventions.md`](./references/service.conventions.md)
- [`references/orm-typeorm.conventions.md`](./references/orm-typeorm.conventions.md) nếu dự án dùng TypeORM

Đọc ví dụ Service/ORM:

- [`assets/service.templates.md`](./assets/service.templates.md)
- [`assets/orm-typeorm.templates.md`](./assets/orm-typeorm.templates.md) nếu dùng TypeORM

Sau đó tạo/cập nhật method Service tương ứng.

## Chế độ cập nhật

Áp dụng khi skill tổng chuyển sang ĐỒNG BỘ và truyền danh sách thay đổi đã xác nhận (xem mục 5 của [`../docs-to-code/rules/workflow.md`](../docs-to-code/rules/workflow.md)). Gọi trực tiếp, không có danh sách thay đổi: giữ quy tắc cũ (method trùng tên thì dừng và hỏi).

- Chỉ sửa method Service ứng với handler đó và phần bị ảnh hưởng; theo cấu trúc hàm của dự án, giữ phần còn lại.
- Nếu code dùng `// Step N`, đánh số lại khi bước được thêm/xóa/đổi thứ tự.
- Thông báo lỗi mới theo mục 4 của workflow. Không xóa hay đổi member enum lỗi đã có.
- Thay đổi chạm Repository/model: chỉ thêm hoặc sửa thao tác cần thiết, không đổi hàm đang được nơi khác dùng; model thiếu thì dừng và báo, không tự tạo.
- Không có thay đổi thuộc `Processing Flow`, `Error` thì không sửa file nào.

## Boundaries

- Chỉ xử lý Service.
- Không tạo DTO/Controller/RO/Exception ở skill này (ngoại trừ xử lý phụ thuộc bắt buộc).
