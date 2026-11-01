# Hợp đồng với profile dự án và quy tắc riêng của skill (đọc trước mọi bước)

Skill này **không tự đặt quy ước cho dự án**. Quy ước (tên file/class, thư viện, thư mục dùng chung, phân quyền, lỗi, Swagger...) nằm trong `<gốc dự án>/.project-profile/profile.md`, do skill `project-profile` tạo và xác nhận. File này chỉ quy định:

1. cách đọc profile (mục 1) và các khóa mỗi bước cần (mục 2);
2. các quy tắc **thuộc về skill**, không phụ thuộc dự án (mục 3, 4).

Ví dụ trong `references/` và `assets/` chỉ minh họa; tên class, đường dẫn, decorator trong đó **không** phải quy ước. Luôn lấy giá trị thật từ profile.

## 1. Đọc profile (bước 0)

1. Tìm `<gốc dự án>/.project-profile/profile.md` (gốc dự án là thư mục có `package.json` gần nhất). Chưa có hoặc không đọc được: **dừng**, yêu cầu người dùng chạy skill `project-profile`. Không sinh code theo đoán.
2. Với mỗi khóa cần dùng (mục 2), theo trạng thái:
   - `confirmed`, `preset`: dùng.
   - `detected`, `unset`: hỏi người dùng xác nhận hoặc cung cấp giá trị (chế độ "Bổ sung khóa" của `project-profile`); không tự chọn.
   - `N/A`: dự án không dùng, bỏ qua phần code liên quan.
3. Tra theo **số khóa**, không theo thứ tự dòng hay tiêu đề. Skill này không ghi vào profile.
4. **Quy ước chung của dự án thì profile luôn thắng** (kể cả khóa `preset`, vì người dùng đã chấp nhận profile): vị trí chuyển sang RO, tầng Repository, cơ chế transaction, phân quyền, đặt tên, lỗi... Skill chỉ tự quyết các quy tắc riêng của nó (mục 3, 4: cách đọc wiki, `// Step N`, hàm con ~30 dòng, `plainToInstance` + `excludeExtraneousValues`, enum lỗi). Profile ưu tiên hơn mọi ví dụ và mặc định trong skill. Nếu profile mâu thuẫn với wiki (ví dụ wiki yêu cầu role không có trong enum), dừng và hỏi.
5. Đường dẫn trong profile ghi "tạo mới nếu chưa có": kiểm tra file có tồn tại không; chưa có thì hỏi người dùng trước khi tạo.
6. Khi liệt kê khảo sát (xem `SKILL.md`), nêu các khóa đã dùng và trạng thái của chúng.

## 2. Khóa profile mỗi bước cần

| Bước | Khóa bắt buộc | Dùng để |
| ---- | ------------- | ------- |
| Chung | `1.1.2`, `1.1.8`, `3.1.2`, `3.1.4`, `3.2.x` | Định dạng, ngôn ngữ chú thích, thư mục module và thư mục dùng chung |
| Suy ra tên | `1.5.1`–`1.5.6`, `1.3.1` | Prefix API, dạng path, tên handler theo Method, module từ path |
| 1 DTO | `1.2.5`, `1.3.2`, `1.4.5`, `2.2.1`, `4.3.3`, `5.1.5` | Tên file/class DTO, kiểu JSON, thư viện validate, pipe validate, Swagger |
| 2 Controller | `1.2.2`, `1.3.1`, `2.2.3`, `3.3.2`, `4.1.3`, `4.1.4`, `4.2.2`, `4.2.5`, `5.1.2`–`5.1.4` | Tên file/class, phân quyền, ánh xạ cột `Roles`, Swagger |
| 3 Service | `1.2.3`, `1.2.4`, `2.1.4`, `2.2.4`, `2.2.5`, `3.3.1`, `3.3.5`, `3.3.6`, `4.1.5`, `4.4.1`, `4.4.2`, `4.4.5` (cú pháp ORM: `orm-typeorm.conventions.md` theo `2.1.4`) | Tên file/class, ORM, tầng Repository, transaction, phân trang, người dùng hiện tại, lỗi |
| 4 RO + Exception | `1.2.6`, `1.3.3`, `2.2.2`, `3.3.4`, `4.3.2`, `4.4.1`, `4.4.3`, `4.4.5`, `4.4.7`, `4.4.8`, `5.1.5` | Tên file/class RO, field không được trả, nơi chuyển Entity sang RO (Service hay Controller), định dạng lỗi, thông báo lỗi, lỗi trùng khóa |

Khóa mục `3.2.x` gồm các thư mục guard, filter, pipe, decorator, enum, hằng số, helper.

## 3. Quy tắc riêng của skill (không phụ thuộc dự án)

- Một wiki = một API = một handler. Không tự thêm field, bước, điều kiện, transaction hay Swagger decorator mà wiki hoặc profile không yêu cầu.
- Không suy đoán ràng buộc, thông báo hoặc cấu hình mà wiki không nêu; hỏi người dùng. Giữ nguyên thông báo lỗi của wiki, từng ký tự.
- Một file một class chính (DTO, RO, Service, Controller). Chỉ import những gì được dùng.
- Khai báo kiểu tường minh cho tham số và kiểu trả về. Mỗi hàm (kể cả hàm con) tối đa khoảng 30 dòng; mỗi bước xử lý tách thành hàm con `private async` riêng (động từ + đối tượng).
- Service đánh dấu mỗi bước bằng `// Step N: <mô tả ngắn>` để đối chiếu wiki. Các comment khác chỉ khi cần làm rõ.
- Ngôn ngữ chú thích theo khóa `1.1.8`; báo cáo cho người dùng bằng ngôn ngữ họ dùng.
- Không hard-code secret, thời hạn token hay URL; đọc từ cơ chế cấu hình của dự án (khóa `2.1.5`, `4.3.5`).
- Không log hoặc trả về mật khẩu, token, field nội bộ (khóa `4.3.2`, `4.3.7`). Dùng thư viện băm mật khẩu và luồng xác thực đã có (khóa `4.3.1`); không tự viết cơ chế mã hóa/xác thực.
- Không nuốt lỗi, không trả về thành công giả.
- Không thêm dependency. Thiếu thư viện thì ghi vào báo cáo và hỏi (khóa `2.4.1`).
- Không tạo Entity, migration, guard hay decorator phân quyền mới; thiếu thì nêu trong báo cáo cuối.
- Không sửa file wiki. Không ghi đè file hoặc handler đã có khi chưa hỏi.
- Sau khi chuyển xong wiki sang mã, **hỏi người dùng** trước khi tạo/sửa test hoặc chạy checklist kiểm tra. Đồng ý thì thêm/cập nhật test cho hành vi mới và các trường hợp lỗi liên quan rồi chạy; không đồng ý thì kết thúc workflow ngay, báo rõ code chưa được kiểm thử.
- Kiểm tra biên dịch bằng `npx tsc --noEmit` (hoặc lệnh tương đương của dự án).
- Cập nhật tài liệu API khi hành vi bên ngoài thay đổi, theo khóa `5.1.x`; ví dụ không chứa secret hay dữ liệu thật.

## 4. Thông báo và mã lỗi (chính sách của skill)

Không viết literal trong `throw` (ví dụ `new HttpException('ERR_X', 500)`). Thông báo/mã lỗi phải là member của enum hoặc constant tập trung rồi được tham chiếu.

**Xác định nơi lưu (trước khi viết `throw` đầu tiên):**

1. Lấy từ profile: khóa `4.4.7` (nơi tập trung thông báo lỗi), `3.2.9` (thư mục hằng số/message), `4.4.1` (lớp lỗi). Đọc 2-3 `throw` hiện có trong Service để xác định hình dạng dùng (một enum mã lỗi, hay cặp enum mã + nội dung).
2. Khóa `unset`/`detected` hoặc không khớp source: tìm bằng Grep `enum\s+\w*(Message|Error|Code)\w*` và Glob `**/*{message,error,code}*.ts`, rồi hỏi người dùng xác nhận.

| Tình huống | Hành động |
| --- | --- |
| Có đúng một enum phù hợp | Thêm member mới vào cuối, theo định dạng key/value hiện có; không sửa hay sắp xếp lại member cũ |
| Có cặp enum mã + nội dung | Thêm vào **cả hai**, theo cặp mà các `throw` hiện có dùng |
| Có nhiều enum, không rõ | Hỏi người dùng chọn |
| Không có enum nào | Hỏi: (1) tạo enum mới ở vị trí theo khóa `3.2.9`, hoặc (2) giữ literal. Không tự chọn thư mục |

**Ánh xạ thông báo wiki sang member:**

- Thông báo dạng mã (`UPPER_SNAKE_CASE`, ví dụ `ERR_CREATE_DOCUMENT_FAILED`): key = value = chuỗi wiki, vào enum mã lỗi.
- Thông báo dạng câu (ví dụ `Permission name already exists`): vào enum nội dung; key `UPPER_SNAKE_CASE` rút từ ý nghĩa, value giữ nguyên câu wiki.
- Đã có member cùng value thì **tái sử dụng**. Các chỗ cùng thông báo dùng chung một member.
- Liệt kê trong báo cáo cuối: enum đã dùng/tạo và các member đã thêm.
