---
name: ro-to-code
description: Tạo RO (Response Object) và chuẩn hóa exception từ wiki API theo template `../docs-to-code/assets/docs-template.md`. Dùng khi người dùng gọi "/ro-to-code", yêu cầu "create an RO from a wiki", hoặc chỉ muốn phần response object/exception.
argument-hint: Cung cấp file wiki (path/attachment/content) và phạm vi tạo RO/Exception.
---

# RO to Code

Skill này chỉ tạo/cập nhật RO và exception mapping dựa trên `Response`.

## Workflow

Thực hiện quy trình chung trong [`workflow.md`](../docs-to-code/rules/workflow.md), kể cả khi gọi skill trực tiếp. Kiểm tra Service trước khi áp dụng RO/Exception; đọc [`references/ro-exception.conventions.md`](./references/ro-exception.conventions.md) và ví dụ:

- [`assets/ro.templates.md`](./assets/ro.templates.md)
- [`assets/duplicate-key.templates.md`](./assets/duplicate-key.templates.md)

Sau đó tạo/cập nhật RO và exception handling tương ứng.

## Chế độ cập nhật

Áp dụng khi skill tổng chuyển sang ĐỒNG BỘ và truyền danh sách thay đổi đã xác nhận (xem mục 5 của [`../docs-to-code/rules/workflow.md`](../docs-to-code/rules/workflow.md)). Gọi trực tiếp, không có danh sách thay đổi: giữ quy tắc cũ (RO trùng tên thì dừng và hỏi).

- Chỉ sửa response hiện có theo `Success > Property` đã đổi: thêm/xóa/đổi field, kiểu và serializer/Swagger đang dùng. Giữ nguyên tên file, tên class và các field không đổi.
- Nơi chuyển response theo cơ chế dự án; nếu kiểu trả về của handler đổi thì chỉ chỉnh đúng chỗ chuyển đổi đó.
- Exception mapping: chỉ thêm/sửa theo `Error` đã đổi, theo mục 4 của workflow; không xóa member enum lỗi cũ.
- Không có thay đổi thuộc `Success > Property` hay `Error` thì không sửa file nào.

## Boundaries

- Chỉ xử lý RO và Exception.
- Không tạo DTO/Controller/Service ở skill này (ngoại trừ xử lý phụ thuộc bắt buộc).
