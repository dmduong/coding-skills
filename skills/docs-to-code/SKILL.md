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

Rule dùng chung của workflow: [`rules/workflow.md`](./rules/workflow.md).
Mẫu wiki đi kèm skill: [`assets/docs-template.md`](./assets/docs-template.md).

Khảo sát các quy ước cần thiết theo mục 1 của workflow và truyền kết quả có bằng chứng cho skill con. Không yêu cầu profile tự tạo; quy ước dự án hợp lệ được ưu tiên, ngoại lệ có lỗi khách quan xử lý theo workflow.

## Bước 0: Xác định chế độ chạy (bắt buộc, trước khi định tuyến)

Xác định và nêu chế độ trong báo cáo đầu tiên theo mục 5 của [`rules/workflow.md`](./rules/workflow.md). Không tự sinh lại toàn bộ code ngoài chế độ TẠO MỚI hoặc GHI ĐÈ đã được xác nhận.

## Routing Rules

1. Nếu yêu cầu chỉ một phần, chỉ gọi đúng skill con tương ứng:
   - DTO → `dto-to-code`
   - Controller → `controller-to-code`
   - Service → `service-to-code`
   - RO/Exception → `ro-to-code`
2. Nếu yêu cầu tạo mã nguồn hoàn chỉnh (end-to-end) ở chế độ TẠO MỚI hoặc GHI ĐÈ, gọi tuần tự:
   - `dto-to-code` → `controller-to-code` → `service-to-code` → `ro-to-code`
3. Ở chế độ ĐỒNG BỘ, chỉ gọi các skill con thuộc tầng có khác biệt (theo bảng ánh xạ ở mục 5.3 của workflow), giữ thứ tự trên, và truyền danh sách thay đổi đã xác nhận.
4. Skill tổng không tự định nghĩa lại quy tắc codegen và không sinh code trực tiếp ngoài việc điều phối skill con. Việc ghi snapshot/manifest sau khi chạy xong là phần duy nhất skill tổng tự thực hiện.
