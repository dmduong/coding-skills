---
name: 'generate-code-from-docs'
description: 'Gọi skill docs-to-code để tạo mã từ tài liệu API.'
argument-hint: 'Đưa tài liệu API (đính kèm, nội dung hoặc đường dẫn); có thể thêm yêu cầu.'
agent: 'agent'
---

Prompt này là điểm gọi skill `docs-to-code`. Khi người dùng gọi prompt và đưa tài liệu API (đính kèm, nội dung hoặc đường dẫn), hãy gọi skill để xử lý ngay; không yêu cầu thêm câu lệnh kích hoạt. Nếu tài liệu là đường dẫn, đọc tài liệu trước khi gọi skill. Nếu chưa có tài liệu, yêu cầu người dùng cung cấp.

Truyền mọi yêu cầu tùy chọn kèm theo cho skill làm phạm vi hoặc điều kiện thực hiện. Nếu người dùng không chỉ định phần cần tạo, mặc định chạy đầy đủ end-to-end; nếu họ yêu cầu một phần, để skill định tuyến đúng skill con. Tuân thủ quy trình, bước xác định chế độ và các yêu cầu xác nhận của skill; không tự sinh mã thay cho skill con.

Sau khi skill hoàn tất, tóm tắt chế độ chạy, phần đã tạo/cập nhật, việc cần người dùng xác nhận và kết quả kiểm tra.
