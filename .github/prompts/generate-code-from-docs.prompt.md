---
name: 'Generate-code-from-docs'
description: 'Nhận tài liệu API và điều phối tạo mã NestJS từ tài liệu đó.'
argument-hint: 'Cung cấp đường dẫn hoặc nội dung tài liệu; nêu phần cần tạo nếu không muốn tạo đầy đủ.'
agent: 'agent'
---

Nhận tài liệu API từ nội dung người dùng, tệp đính kèm hoặc đường dẫn được cung cấp. Nếu chỉ có đường dẫn, hãy đọc tài liệu đó trước khi thực hiện. Nếu không xác định được tài liệu hoặc phạm vi, hãy hỏi người dùng để làm rõ.

Dùng skill `docs-to-code` để điều phối việc tạo mã theo tài liệu. Mặc định tạo đầy đủ end-to-end, trừ khi người dùng chỉ định một phần. Tuân theo routing và quy tắc của skill; không tự tạo mã thay cho các skill con.

Sau khi hoàn tất, tóm tắt các phần đã tạo và kết quả kiểm tra.
