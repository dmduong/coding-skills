---
name: dto-to-code
description: Tạo DTO từ wiki API theo template docs/wiki_new.md. Dùng khi người dùng gọi "/dto-to-code", yêu cầu "create a DTO from a wiki", "dto from docs", hoặc cung cấp wiki và chỉ muốn phần DTO.
argument-hint: Cung cấp file wiki (path/attachment/content) và phạm vi tạo DTO.
---

# DTO to Code

Skill này chỉ tạo DTO từ section `Request` của wiki API.

## Workflow

1. Đọc file wiki do người dùng cung cấp. Nếu chưa có wiki, yêu cầu người dùng cung cấp.
2. Đọc profile dự án `.project-profile/profile.md` theo [`../docs-to-code/rules/profile-contract.md`](../docs-to-code/rules/profile-contract.md). Nếu thiếu profile, yêu cầu chạy skill `project-profile`.
3. Đối chiếu nhanh profile với source theo quy tắc trong [`../docs-to-code/rules/profile-contract.md`](../docs-to-code/rules/profile-contract.md).
4. Chỉ đọc quy tắc DTO: [`references/dto.conventions.md`](./references/dto.conventions.md).
5. Đọc ví dụ DTO: [`assets/dto.templates.md`](./assets/dto.templates.md).
6. Suy ra Module/Controller/Handler theo quy tắc của profile-contract, rồi tạo/cập nhật DTO tương ứng.
7. Báo cáo cuối: phần đã tạo/sửa, phần cần xác nhận, và các kiểm tra đã/chưa chạy.

## Chế độ cập nhật

Áp dụng khi skill tổng chuyển sang ĐỒNG BỘ và truyền danh sách thay đổi đã xác nhận (xem mục 5 của [`../docs-to-code/rules/profile-contract.md`](../docs-to-code/rules/profile-contract.md)). Gọi trực tiếp, không có danh sách thay đổi: giữ quy tắc cũ (file DTO trùng tên thì hỏi).

- Chỉ xử lý các thay đổi thuộc `Request`: thêm/xóa/đổi field, kiểu, bắt buộc hay tùy chọn, ràng buộc, mô tả. Sửa tại chỗ decorator validate, `@ApiProperty` và JSDoc của đúng field đó.
- Giữ nguyên tên file, tên class, thứ tự field và các field không đổi.
- Field bị xóa khỏi wiki: chỉ xóa khỏi DTO khi nằm trong danh sách đã xác nhận; nhắc rằng Service/Controller đang dùng field đó cần được đồng bộ.
- Không có thay đổi thuộc `Request` thì không sửa file nào.

## Boundaries

- Chỉ xử lý DTO.
- Không tạo Controller/Service/RO/Exception ở skill này.
