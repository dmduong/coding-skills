---
name: ro-to-code
description: Tạo RO (Response Object) và chuẩn hóa exception từ wiki API theo template docs/wiki_new.md. Dùng khi người dùng gọi "/ro-to-code", yêu cầu "create an RO from a wiki", hoặc chỉ muốn phần response object/exception.
argument-hint: Cung cấp file wiki (path/attachment/content) và phạm vi tạo RO/Exception.
---

# RO to Code

Skill này chỉ tạo/cập nhật RO và exception mapping dựa trên `Response`.

## Workflow

1. Đọc file wiki do người dùng cung cấp. Nếu chưa có wiki, yêu cầu người dùng cung cấp.
2. Đọc profile dự án `.project-profile/profile.md` theo [`../docs-to-code/rules/profile-contract.md`](../docs-to-code/rules/profile-contract.md). Nếu thiếu profile, yêu cầu chạy skill `project-profile`.
3. Đối chiếu nhanh profile với source theo quy tắc trong [`../docs-to-code/rules/profile-contract.md`](../docs-to-code/rules/profile-contract.md).
4. Kiểm tra phụ thuộc: cần Service trước khi áp dụng RO/Exception.
5. Chỉ đọc quy tắc RO/Exception: [`references/ro-exception.conventions.md`](./references/ro-exception.conventions.md).
6. Đọc ví dụ RO/Exception:
   - [`assets/ro.templates.md`](./assets/ro.templates.md)
   - [`assets/duplicate-key.templates.md`](./assets/duplicate-key.templates.md)
7. Suy ra Module/Controller/Handler theo quy tắc của profile-contract, rồi tạo/cập nhật RO và exception handling tương ứng.
8. Báo cáo cuối: phần đã tạo/sửa, phần cần xác nhận, và các kiểm tra đã/chưa chạy.

## Chế độ cập nhật

Áp dụng khi skill tổng chuyển sang ĐỒNG BỘ và truyền danh sách thay đổi đã xác nhận (xem mục 5 của [`../docs-to-code/rules/profile-contract.md`](../docs-to-code/rules/profile-contract.md)). Gọi trực tiếp, không có danh sách thay đổi: giữ quy tắc cũ (RO trùng tên thì dừng và hỏi).

- Chỉ sửa class RO hiện có theo `Success > Property` đã đổi: thêm/xóa/đổi field, kiểu, `@Expose`, `@ApiProperty`. Giữ nguyên tên file, tên class và các field không đổi.
- Nơi chuyển Entity sang RO theo khóa `3.3.4`; nếu kiểu trả về của handler đổi thì chỉ chỉnh đúng chỗ chuyển đổi đó.
- Exception mapping: chỉ thêm/sửa theo `Error` đã đổi, theo mục 4 của profile-contract; không xóa member enum lỗi cũ.
- Không có thay đổi thuộc `Success > Property` hay `Error` thì không sửa file nào.

## Boundaries

- Chỉ xử lý RO và Exception.
- Không tạo DTO/Controller/Service ở skill này (ngoại trừ xử lý phụ thuộc bắt buộc).
