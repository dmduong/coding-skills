# Hợp đồng với profile dự án và quy tắc riêng của skill (đọc trước mọi bước)

Skill này **không tự đặt quy ước cho dự án**. Quy ước (tên file/class, thư viện, thư mục dùng chung, phân quyền, lỗi, Swagger...) nằm trong `<gốc dự án>/.project-profile/profile.md`, do skill `project-profile` tạo và xác nhận. File này chỉ quy định:

1. cách đọc profile (mục 1) và các khóa mỗi bước cần (mục 2);
2. các quy tắc **thuộc về skill**, không phụ thuộc dự án (mục 3, 4);
3. snapshot và chế độ chạy tạo mới / đồng bộ khi chạy lại cùng wiki (mục 5).

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
| Chung | `1.1.2`, `1.1.8`, `3.1.2`, `3.1.4`, `3.2.x`, `5.3.3`–`5.3.5` | Định dạng, ngôn ngữ chú thích, thư mục module và thư mục dùng chung, snapshot wiki và hành vi chạy lại |
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
- Không sửa file wiki. Không ghi đè file hoặc handler đã có khi chưa hỏi (ngoại lệ: phạm vi thay đổi người dùng đã xác nhận ở chế độ ĐỒNG BỘ, mục 5).
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

## 5. Snapshot và chế độ chạy (tạo mới / đồng bộ)

Quy tắc này áp dụng cho mọi lần chạy có wiki. Thư mục snapshot theo khóa `5.3.4` (mặc định `.project-profile/generated/`, được commit cùng repo); hành vi chạy lại theo khóa `5.3.5`; ghi vết theo khóa `5.3.3`. Khóa `unset`/`detected` thì hỏi như mục 1.

### 5.1. Định dạng snapshot (mỗi wiki hai file, tên theo tên file wiki không gồm đuôi)

- `<tên-wiki>.snapshot.md`: bản sao nguyên văn wiki tại thời điểm sinh code xong.
- `<tên-wiki>.manifest.json`:

```json
{
  "wiki": "docs/create-document.md",
  "wikiHash": "sha256 của nội dung wiki sau khi đổi CRLF thành LF và bỏ khoảng trắng cuối dòng",
  "generatedAt": "ISO 8601",
  "endpoint": { "method": "POST", "path": "/document" },
  "files": ["src/document/dto/create-document.dto.ts"]
}
```

- Snapshot không phải wiki: ghi snapshot không vi phạm quy tắc "không sửa file wiki". Chỉ skill tổng ghi snapshot, các skill con thì không.
- Chỉ ghi hoặc cập nhật snapshot khi toàn bộ bước đã chạy xong và người dùng không hủy. Hủy hoặc lỗi giữa chừng thì không đụng snapshot.

### 5.2. Xác định chế độ (trước khi sinh bất cứ code nào)

| Điều kiện | Chế độ |
| --- | --- |
| Không có manifest và Controller chưa có handler cùng Method + Path | TẠO MỚI |
| Có manifest, `wikiHash` trùng wiki hiện tại | KHÔNG ĐỔI: báo "không có thay đổi", dừng |
| Có manifest, `wikiHash` khác | ĐỒNG BỘ |
| Không có manifest nhưng handler đã tồn tại (code có trước khi có snapshot) | ĐỒNG BỘ KHÔNG BASELINE (mục 5.5) |
| Người dùng nói rõ "tạo lại", "ghi đè", "regenerate" | Hỏi xác nhận ghi đè riêng, không coi là ĐỒNG BỘ |

Người dùng không cần mô tả thêm kiểu "tài liệu đã chạy trước đó". Chế độ do skill tự xác định và nêu trong báo cáo đầu tiên.

### 5.3. Quy trình ĐỒNG BỘ

1. So wiki hiện tại với `snapshot.md` theo section, rồi ánh xạ khác biệt sang tầng:

   | Section đổi | Tầng bị ảnh hưởng |
   | --- | --- |
   | `Request` (field, kiểu, ràng buộc) | DTO |
   | `Endpoint`, `Header`, `Roles`, `Response > Success` (status) | Controller |
   | `Processing Flow`, `Response > Error` | Service (và Repository, enum lỗi nếu cần) |
   | `Response > Success` (property) | RO, và Controller nếu kiểu trả về đổi |

   Section nào đổi chỉ do định dạng, câu chữ không đổi nghĩa thì không tính là khác biệt.
2. Hiển thị **bảng khác biệt** gồm: section, giá trị cũ → mới, file sẽ sửa, hành động dự kiến. Dùng công cụ hỏi người dùng với hai lựa chọn: **Áp dụng** hoặc **Hủy**.
3. **Hủy**: dừng ngay, không sửa file nào, không cập nhật snapshot. Báo rõ không có gì thay đổi.
4. **Áp dụng**: chỉ gọi các skill con thuộc tầng bị ảnh hưởng, theo thứ tự DTO → Controller → Service → RO, ở **chế độ cập nhật** và truyền kèm danh sách thay đổi đã xác nhận.
5. **Phát hiện lệch** (drift): với phần wiki không đổi, nếu code hiện tại không khớp những gì wiki mô tả, báo riêng và hỏi (giữ code / sửa theo wiki). Không tự sửa, vì có thể là chỉnh sửa tay có chủ đích.
6. Xong thì cập nhật snapshot và manifest, rồi hỏi về test/kiểm tra theo mục 3.

### 5.4. Quy tắc chế độ cập nhật (dành cho skill con)

- Phạm vi sửa chỉ gồm các thay đổi đã được người dùng xác nhận. Việc xác nhận này thay cho câu hỏi "đã tồn tại, ghi đè không?" của skill con; ngoài phạm vi đó vẫn phải hỏi.
- Sửa kiểu patch tối thiểu: chỉ đụng các dòng liên quan. Không viết lại file, không đổi tên file, class, handler, method, không sắp xếp lại import hay đổi style phần không liên quan.
- Giữ nguyên chỉnh sửa tay không liên quan đến khác biệt. Đánh số lại `// Step N` khi bước được thêm/xóa/đổi thứ tự, các comment khác giữ nguyên.
- Phần bị xóa khỏi wiki (field, bước, mã lỗi): liệt kê rõ trong bảng khác biệt trước khi xóa khỏi code. Không xóa member enum lỗi đã có (có thể nơi khác đang dùng).
- Vẫn tuân thủ mục 3 và 4 cho mọi đoạn code thêm mới.
- Báo cáo cuối của skill con nêu: thay đổi đã áp dụng, thay đổi bỏ qua và lý do.

### 5.5. ĐỒNG BỘ KHÔNG BASELINE

Chưa có snapshot thì không biết wiki cũ. Khi đó:

1. So wiki hiện tại trực tiếp với code đang có (DTO, Controller, Service, RO) và lập bảng khác biệt như mục 5.3.
2. Không có khác biệt: đề nghị tạo snapshot làm mốc và dừng (hỏi trước khi ghi).
3. Có khác biệt: hiển thị bảng, hỏi Áp dụng/Hủy như mục 5.3. Khác biệt không chắc chắn (code có thể do chỉnh tay) thì ghi rõ "không chắc" trong bảng.
4. Sau khi áp dụng thành công, tạo snapshot và manifest.
