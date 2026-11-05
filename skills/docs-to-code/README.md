# docs-to-code

Skill này là **orchestrator** cho workflow docs-to-code.

- Quy tắc điều phối: [SKILL.md](./SKILL.md)
- Rule dùng chung: [rules/profile-contract.md](./rules/profile-contract.md)
- Skill con:
  - [dto-to-code](../dto-to-code/SKILL.md)
  - [controller-to-code](../controller-to-code/SKILL.md)
  - [service-to-code](../service-to-code/SKILL.md)
  - [ro-to-code](../ro-to-code/SKILL.md)

Skill tổng không chứa `references/`, `assets` riêng và không sinh code trực tiếp; mọi xử lý được giao cho skill con tương ứng.

## Hướng dẫn cách sử dụng

1. Đính kèm wiki (file/path/nội dung) trong phiên chat.
2. Gửi yêu cầu bằng một trong các câu lệnh sau:

- Chạy toàn bộ flow:
  - `Convert this wiki to complete code`
  - `Generate full code from this wiki`
- Chỉ tạo DTO:
  - `Create a DTO from this wiki`
- Chỉ tạo Controller:
  - `Create a controller from this wiki`
- Chỉ tạo Service:
  - `Create a service from this wiki`
- Chỉ tạo RO/Exception:
  - `Create an RO and exception mapping from this wiki`

Lưu ý:
- Nếu prompt yêu cầu “complete/full/end-to-end”, `docs-to-code` sẽ điều phối lần lượt: DTO → Controller → Service → RO/Exception.
- Nếu prompt chỉ yêu cầu một phần, skill tổng chỉ gọi đúng skill con tương ứng.

## Chạy lần đầu và chạy lại (đồng bộ)

Không cần mô tả thêm kiểu "tài liệu này đã chạy trước đó". Skill tự xác định chế độ trước khi sinh code và nêu chế độ trong báo cáo đầu tiên (chi tiết ở mục 5 của [rules/profile-contract.md](./rules/profile-contract.md)).

| Tình huống | Chế độ | Kết quả |
| --- | --- | --- |
| Wiki mới, chưa có code cho Method + Path đó | TẠO MỚI | Sinh toàn bộ code, rồi lưu snapshot và manifest |
| Chạy lại, wiki không đổi so với snapshot | KHÔNG ĐỔI | Báo "không có thay đổi", không sửa gì |
| Chạy lại, wiki đã đổi | ĐỒNG BỘ | Hiển thị bảng khác biệt (section, cũ → mới, file sẽ sửa), hỏi **Áp dụng** hoặc **Hủy** |
| Chưa có snapshot nhưng code đã có | ĐỒNG BỘ KHÔNG BASELINE | So wiki trực tiếp với code, hỏi xác nhận, rồi tạo snapshot |
| Yêu cầu "tạo lại", "ghi đè", "regenerate" | GHI ĐÈ | Hỏi xác nhận riêng trước khi ghi đè |

Ở chế độ ĐỒNG BỘ:
- **Áp dụng**: chỉ các skill con thuộc tầng có khác biệt chạy (`Request` → DTO; `Endpoint`/`Roles`/`Success` status → Controller; `Processing Flow`/`Error` → Service; `Success` property → RO) và chỉ sửa đúng các dòng liên quan.
- **Hủy**: dừng ngay, không sửa file nào, không cập nhật snapshot.
- Code lệch so với wiki ở phần wiki không đổi (ví dụ do sửa tay): skill báo riêng và hỏi, không tự ghi đè.

### Snapshot và manifest

- Lưu ở `.project-profile/generated/` (khóa profile `5.3.4`), **commit cùng repo**.
- Mỗi wiki có hai file: `<tên-wiki>.snapshot.md` (bản sao wiki lúc sinh code xong) và `<tên-wiki>.manifest.json` (hash wiki, Method + Path, danh sách file đã sinh).
- Chỉ được ghi sau khi chạy xong và người dùng không hủy. Không sửa tay hai file này.
- Xóa snapshot sẽ đưa lần chạy sau về "đồng bộ không baseline"; xóa hoặc tạo lại `profile.md` thì không ảnh hưởng snapshot.
- Profile cần có các khóa `5.3.3`–`5.3.5`; profile tạo bởi `project-profile` mới đã có sẵn (trạng thái `preset`).
