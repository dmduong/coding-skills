---
name: controller-to-code
description: Tạo Controller handler từ wiki API theo template `../docs-to-code/assets/docs-template.md`. Dùng khi người dùng gọi "/controller-to-code", yêu cầu "create a controller from a wiki", hoặc chỉ muốn phần controller.
argument-hint: Cung cấp file wiki (path/attachment/content) và phạm vi tạo controller.
---

# Controller to Code

Skill này chỉ tạo/cập nhật Controller từ `Endpoint`, `Header`, `Request`, `Response > Success`.

## Workflow

Thực hiện quy trình chung trong [`workflow.md`](../docs-to-code/rules/workflow.md), kể cả khi gọi skill trực tiếp. Kiểm tra DTO tương ứng trước; đọc [`references/controller.conventions.md`](./references/controller.conventions.md) và [`assets/controller.templates.md`](./assets/controller.templates.md), rồi tạo/cập nhật handler.

## Chế độ cập nhật

Áp dụng khi skill tổng chuyển sang ĐỒNG BỘ và truyền danh sách thay đổi đã xác nhận (xem mục 5 của [`../docs-to-code/rules/workflow.md`](../docs-to-code/rules/workflow.md)). Gọi trực tiếp, không có danh sách thay đổi: giữ quy tắc cũ (trùng tên hoặc trùng Method + Path thì dừng và hỏi).

- Tìm handler hiện có theo Method + Path cũ; chỉ sửa handler đó, không thêm handler mới và không tạo Controller mới.
- Chỉ sửa phần thuộc thay đổi đã xác nhận: decorator route/Method, phân quyền (`Roles`), mã trạng thái, `@ApiResponse`/`@ApiOperation`, kiểu tham số hoặc kiểu trả về.
- Giữ nguyên tên handler và các handler khác trong Controller. Path đổi thì nêu rõ trong báo cáo vì ảnh hưởng client.
- Không có thay đổi thuộc `Endpoint`, `Header`, `Roles`, `Success` thì không sửa file nào.

## Boundaries

- Chỉ xử lý Controller.
- Không tạo DTO/Service/RO/Exception ở skill này (ngoại trừ xử lý phụ thuộc DTO khi cần).
