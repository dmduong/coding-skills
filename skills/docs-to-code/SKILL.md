---
name: docs-to-code
description: Điều phối chuyển wiki API thành mã nguồn NestJS bằng các skill con. Dùng khi người dùng gọi "/docs-to-code", yêu cầu "docs to code", "convert wiki to code", "generate code from a wiki", hoặc yêu cầu tạo mã nguồn hoàn chỉnh end-to-end.
argument-hint: Cung cấp file wiki (path/attachment/content) và phạm vi mong muốn (một phần hoặc full).
---

# Docs to Code (Orchestrator)

Skill tổng này chỉ điều phối workflow bằng 4 skill con:

1. [`../dto-to-code/SKILL.md`](../dto-to-code/SKILL.md)
2. [`../controller-to-code/SKILL.md`](../controller-to-code/SKILL.md)
3. [`../service-to-code/SKILL.md`](../service-to-code/SKILL.md)
4. [`../ro-to-code/SKILL.md`](../ro-to-code/SKILL.md)

Rule dùng chung của workflow: [`rules/profile-contract.md`](./rules/profile-contract.md).

## Bước 0: Xác định chế độ chạy (bắt buộc, trước khi định tuyến)

Chi tiết ở mục 5 của [`rules/profile-contract.md`](./rules/profile-contract.md). Người dùng không cần mô tả thêm "tài liệu đã chạy trước đó"; skill tự xác định và nêu chế độ trong báo cáo đầu tiên.

| Điều kiện | Chế độ | Hành động |
| --- | --- | --- |
| Chưa có manifest và chưa có handler cùng Method + Path | TẠO MỚI | Định tuyến như bên dưới, xong thì lưu snapshot + manifest vào thư mục theo khóa `5.3.4` |
| Có manifest, hash wiki trùng | KHÔNG ĐỔI | Báo "không có thay đổi", dừng |
| Có manifest, hash wiki khác | ĐỒNG BỘ | So wiki với snapshot, hiển thị bảng khác biệt, hỏi Áp dụng/Hủy; Áp dụng thì chỉ gọi skill con bị ảnh hưởng ở chế độ cập nhật; Hủy thì dừng, không sửa gì |
| Không có manifest nhưng handler đã tồn tại | ĐỒNG BỘ KHÔNG BASELINE | So wiki trực tiếp với code, hỏi xác nhận như trên, rồi tạo snapshot |
| Người dùng yêu cầu "tạo lại/ghi đè" | GHI ĐÈ | Hỏi xác nhận riêng trước khi ghi đè |

Không bao giờ tự sinh lại toàn bộ code khi chế độ không phải TẠO MỚI hoặc GHI ĐÈ đã được xác nhận.

## Routing Rules

1. Nếu yêu cầu chỉ một phần, chỉ gọi đúng skill con tương ứng:
   - DTO → `dto-to-code`
   - Controller → `controller-to-code`
   - Service → `service-to-code`
   - RO/Exception → `ro-to-code`
2. Nếu yêu cầu tạo mã nguồn hoàn chỉnh (end-to-end) ở chế độ TẠO MỚI hoặc GHI ĐÈ, gọi tuần tự:
   - `dto-to-code` → `controller-to-code` → `service-to-code` → `ro-to-code`
3. Ở chế độ ĐỒNG BỘ, chỉ gọi các skill con thuộc tầng có khác biệt (theo bảng ánh xạ ở mục 5.3 của profile-contract), giữ thứ tự trên, và truyền danh sách thay đổi đã xác nhận.
4. Skill tổng không tự định nghĩa lại quy tắc codegen và không sinh code trực tiếp ngoài việc điều phối skill con. Việc ghi snapshot/manifest sau khi chạy xong là phần duy nhất skill tổng tự thực hiện.

## Nhận diện `Processing Flow > Detail`

Theo template hiện tại, mỗi bước xử lý là một khối HTML `<details>` nằm trong mục `### Detail`. Đọc số bước và hành động từ `<summary>` theo mẫu `Step [step_no]: [action_step]`; đọc `Target`, `Details`, `Output`, `Next` và `On failure` từ nội dung bên trong khối. Vẫn chấp nhận các wiki đã tạo theo mẫu cũ có `Step: [step_no] | Action: [action_step] | Next: [next_step]` trong `<summary>` hoặc dùng tiêu đề Markdown `#### Step <N>: <Action>`.

## Cấu trúc thư mục

```text
docs-to-code/
├── README.md
├── SKILL.md
└── rules/
    └── profile-contract.md
```
