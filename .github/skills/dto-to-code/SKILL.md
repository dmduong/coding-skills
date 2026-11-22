---
name: dto-to-code
description: Tạo DTO từ wiki API theo template `../docs-to-code/assets/docs-template.md`. Dùng khi người dùng gọi "/dto-to-code", yêu cầu "create a DTO from a wiki", "dto from docs", hoặc cung cấp wiki và chỉ muốn phần DTO.
argument-hint: Cung cấp file wiki (path/attachment/content) và phạm vi tạo DTO.
---

# DTO to Code

Skill này chỉ tạo DTO từ section `Request` của wiki API.

## Workflow

Thực hiện quy trình chung trong [`workflow.md`](../docs-to-code/rules/workflow.md), kể cả khi gọi skill trực tiếp. Đọc [`references/dto.conventions.md`](./references/dto.conventions.md) và [`assets/dto.templates.md`](./assets/dto.templates.md), rồi tạo/cập nhật DTO.

## Chế độ cập nhật

Áp dụng khi skill tổng chuyển sang ĐỒNG BỘ và truyền danh sách thay đổi đã xác nhận (xem mục 5 của [`../docs-to-code/rules/workflow.md`](../docs-to-code/rules/workflow.md)). Gọi trực tiếp, không có danh sách thay đổi: giữ quy tắc cũ (file DTO trùng tên thì hỏi).

- Chỉ xử lý các thay đổi thuộc `Request`: thêm/xóa/đổi field, kiểu, bắt buộc hay tùy chọn, ràng buộc, mô tả. Sửa tại chỗ validation, Swagger và comment đang dùng của đúng field đó.
- Giữ nguyên tên file, tên class, thứ tự field và các field không đổi.
- Field bị xóa khỏi wiki: chỉ xóa khỏi DTO khi nằm trong danh sách đã xác nhận; nhắc rằng Service/Controller đang dùng field đó cần được đồng bộ.
- Không có thay đổi thuộc `Request` thì không sửa file nào.

## Boundaries

- Chỉ xử lý DTO.
- Không tạo Controller/Service/RO/Exception ở skill này.
