---
name: controller-to-code
description: Tạo Controller handler từ wiki API theo template docs/wiki_new.md. Dùng khi người dùng gọi "/controller-to-code", yêu cầu "create a controller from a wiki", hoặc chỉ muốn phần controller.
argument-hint: Cung cấp file wiki (path/attachment/content) và phạm vi tạo controller.
---

# Controller to Code

Skill này chỉ tạo/cập nhật Controller từ `Endpoint`, `Header`, `Request`, `Response > Success`.

## Workflow

1. Đọc file wiki do người dùng cung cấp. Nếu chưa có wiki, yêu cầu người dùng cung cấp.
2. Đọc profile dự án `.project-profile/profile.md` theo [`../docs-to-code/rules/profile-contract.md`](../docs-to-code/rules/profile-contract.md). Nếu thiếu profile, yêu cầu chạy skill `project-profile`.
3. Đối chiếu nhanh profile với source theo quy tắc trong [`../docs-to-code/rules/profile-contract.md`](../docs-to-code/rules/profile-contract.md).
4. Kiểm tra phụ thuộc: cần DTO tương ứng trước khi tạo Controller.
5. Chỉ đọc quy tắc Controller: [`references/controller.conventions.md`](./references/controller.conventions.md).
6. Đọc ví dụ Controller: [`assets/controller.templates.md`](./assets/controller.templates.md).
7. Suy ra Module/Controller/Handler theo quy tắc của profile-contract, rồi tạo/cập nhật handler trong Controller.
8. Báo cáo cuối: phần đã tạo/sửa, phần cần xác nhận, và các kiểm tra đã/chưa chạy.

## Chế độ cập nhật

Áp dụng khi skill tổng chuyển sang ĐỒNG BỘ và truyền danh sách thay đổi đã xác nhận (xem mục 5 của [`../docs-to-code/rules/profile-contract.md`](../docs-to-code/rules/profile-contract.md)). Gọi trực tiếp, không có danh sách thay đổi: giữ quy tắc cũ (trùng tên hoặc trùng Method + Path thì dừng và hỏi).

- Tìm handler hiện có theo Method + Path cũ; chỉ sửa handler đó, không thêm handler mới và không tạo Controller mới.
- Chỉ sửa phần thuộc thay đổi đã xác nhận: decorator route/Method, phân quyền (`Roles`), mã trạng thái, `@ApiResponse`/`@ApiOperation`, kiểu tham số hoặc kiểu trả về.
- Giữ nguyên tên handler và các handler khác trong Controller. Path đổi thì nêu rõ trong báo cáo vì ảnh hưởng client.
- Không có thay đổi thuộc `Endpoint`, `Header`, `Roles`, `Success` thì không sửa file nào.

## Boundaries

- Chỉ xử lý Controller.
- Không tạo DTO/Service/RO/Exception ở skill này (ngoại trừ xử lý phụ thuộc DTO khi cần).
