---
name: service-to-code
description: Tạo Service method (MySQL/TypeORM) từ wiki API theo template docs/wiki_new.md. Dùng khi người dùng gọi "/service-to-code", yêu cầu "create a service from a wiki", hoặc chỉ muốn phần service.
argument-hint: Cung cấp file wiki (path/attachment/content) và phạm vi tạo service.
---

# Service to Code

Skill này chỉ tạo/cập nhật Service từ `Processing Flow` và schema liên quan.

## Workflow

1. Đọc file wiki do người dùng cung cấp. Nếu chưa có wiki, yêu cầu người dùng cung cấp.
2. Đọc profile dự án `.project-profile/profile.md` theo [`../docs-to-code/rules/profile-contract.md`](../docs-to-code/rules/profile-contract.md). Nếu thiếu profile, yêu cầu chạy skill `project-profile`.
3. Đối chiếu nhanh profile với source theo quy tắc trong [`../docs-to-code/rules/profile-contract.md`](../docs-to-code/rules/profile-contract.md).
4. Kiểm tra phụ thuộc: cần DTO và Controller trước khi tạo Service; cần các Entity cho bảng trong wiki (skill này không tạo Entity).
5. Chỉ đọc quy tắc Service/ORM:
   - [`references/service.conventions.md`](./references/service.conventions.md)
   - [`references/orm-typeorm.conventions.md`](./references/orm-typeorm.conventions.md)
6. Đọc ví dụ Service/ORM:
   - [`assets/service.templates.md`](./assets/service.templates.md)
   - [`assets/orm-typeorm.templates.md`](./assets/orm-typeorm.templates.md)
7. Suy ra Module/Controller/Handler theo quy tắc của profile-contract, rồi tạo/cập nhật method Service tương ứng.
8. Báo cáo cuối: phần đã tạo/sửa, phần cần xác nhận, và các kiểm tra đã/chưa chạy.

## Chế độ cập nhật

Áp dụng khi skill tổng chuyển sang ĐỒNG BỘ và truyền danh sách thay đổi đã xác nhận (xem mục 5 của [`../docs-to-code/rules/profile-contract.md`](../docs-to-code/rules/profile-contract.md)). Gọi trực tiếp, không có danh sách thay đổi: giữ quy tắc cũ (method trùng tên thì dừng và hỏi).

- Chỉ sửa method Service ứng với handler đó và các hàm con `// Step N` bị ảnh hưởng. Bước mới thêm hàm con `private async` mới; bước bị xóa thì xóa hàm con tương ứng nếu nằm trong danh sách đã xác nhận.
- Đánh số lại `// Step N` khi bước được thêm/xóa/đổi thứ tự; giữ nguyên phần còn lại của method.
- Thông báo lỗi mới theo mục 4 của profile-contract. Không xóa hay đổi member enum lỗi đã có.
- Thay đổi chạm Repository/Entity: chỉ thêm hoặc sửa hàm Repository cần thiết, không đổi hàm đang được nơi khác dùng; Entity thiếu thì ghi vào báo cáo, không tự tạo.
- Không có thay đổi thuộc `Processing Flow`, `Error` thì không sửa file nào.

## Boundaries

- Chỉ xử lý Service.
- Không tạo DTO/Controller/RO/Exception ở skill này (ngoại trừ xử lý phụ thuộc bắt buộc).
