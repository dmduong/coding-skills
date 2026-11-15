# Quy trình sinh NestJS REST API (đọc trước mọi bước)

Quy trình này không yêu cầu hoặc đọc profile tự tạo. Khảo sát dự án theo nhu cầu của API, dùng quy ước đã xác minh và các mặc định NestJS bên dưới. Ví dụ trong `references/` và `assets/` chỉ minh họa, không chứng minh dự án có một thư viện hay thành phần cụ thể.

## 1. Khảo sát và lựa chọn quy tắc

1. Xác định ứng dụng NestJS chứa endpoint; với monorepo, chọn đúng ứng dụng theo wiki và cấu trúc source, hỏi nếu không rõ. Đọc các hướng dẫn dự án áp dụng, `package.json`, cấu hình TypeScript, bootstrap, module đích và 2–3 endpoint tương tự khi có.
2. Tìm theo nhu cầu wiki: DTO và validation pipe; Controller, global prefix và route; guard toàn cục (`APP_GUARD`, `useGlobalGuards`), guard/decorator trên class và handler, metadata và role; Service, repository, Entity/ORM, transaction; exception filter, hằng số lỗi, response serializer/wrapper và Swagger. Lần theo import, provider và cách đăng ký để xác nhận thành phần thực sự được sử dụng và có hiệu lực; không suy ra từ tên file, dependency hay một ví dụ đơn lẻ.
3. Ghi bằng chứng đường dẫn/symbol và quyết định tạm thời cho đúng các tầng cần chạy. Khi skill tổng điều phối, truyền kết quả và các thay đổi đã xác nhận cho skill con; skill con gọi trực tiếp tự khảo sát phần liên quan. Không ghi profile hoặc cấu hình mới.
4. Ưu tiên quy ước dự án được xác minh nếu tương thích với wiki và đúng về NestJS, HTTP, kiểu dữ liệu, bảo mật, tính đúng đắn. Phong cách, tên và kiến trúc khác mặc định không tự động là sai. Nếu có lỗi khách quan kiểm chứng được, nêu bằng chứng và áp dụng cách đúng trong phạm vi thay đổi; nếu ảnh hưởng hợp đồng API/client hoặc cần sửa cấu hình chung, hỏi trước. Không sửa lỗi cũ không liên quan.
5. Wiki mâu thuẫn với dự án, nhiều cách cùng hợp lý, thiếu hành vi hoặc không xác định được bảo mật: nêu các lựa chọn và hỏi; không đoán. Đặc biệt, không tạo endpoint thiếu xác thực/phân quyền theo wiki hoặc giả định endpoint public. Khi không có quy ước và lựa chọn không ảnh hưởng hợp đồng/bảo mật, dùng mặc định mục 2.

### Quy trình chung cho mỗi skill con

1. Đọc wiki được cung cấp; nếu chưa có, yêu cầu người dùng cung cấp. Mẫu wiki đi kèm skill: [`assets/docs-template.md`](../assets/docs-template.md).
2. Khảo sát theo mục 1 và kiểm tra phụ thuộc của tầng.
3. Đọc conventions và ví dụ của tầng; suy ra Module, Controller và Handler từ Method + Path theo source và mặc định mục 2. Không đoán khi chưa rõ.
4. Tạo hoặc cập nhật đúng phạm vi của tầng, tuân theo chế độ cập nhật ở mục 5.4 nếu skill tổng truyền danh sách thay đổi đã xác nhận.
5. Báo cáo phần đã tạo/sửa, phần cần xác nhận và kiểm tra đã/chưa chạy.

## 2. Mặc định NestJS REST khi dự án chưa có quy ước

- Tổ chức theo module tính năng; mặc định dùng file kebab-case như `resource.controller.ts`, `resource.service.ts`, `dto/create-resource.dto.ts`, class PascalCase và method camelCase. Giữ nguyên path, tên field và status wiki; không đổi hợp đồng chỉ để hợp style REST.
- Controller dùng route decorator NestJS, nhận dữ liệu qua DTO/pipe và ủy quyền Service; Service thực hiện nghiệp vụ, tái sử dụng repository/helper của dự án. Đăng ký provider/controller trong module thích hợp.
- Ưu tiên `class-validator`/`class-transformer` và `ValidationPipe` nếu đã cài và cấu hình; dùng cơ chế tương đương nếu dự án có. Thiếu dependency hoặc validation cần thiết thì dừng, báo và hỏi; không tự cài hay sửa cấu hình toàn cục.
- Response chỉ chứa trường wiki cho phép, không lộ field nhạy cảm; dùng response DTO/serializer đã có hoặc dựng object tường minh. Nếu dự án dùng `class-transformer`, có thể dùng `@Expose()` và `plainToInstance(..., { excludeExtraneousValues: true })`; không bắt buộc thư viện này.
- Dùng `HttpException` hoặc exception NestJS phù hợp nếu dự án không có cơ chế lỗi riêng; status và thông báo theo wiki. Dùng enum/constant hiện có khi phù hợp. Không tự tạo cấu trúc lỗi, wrapper hay thư viện mới.
- Không mặc định ORM, driver, auth, guard, transaction hay đường dẫn common. TypeORM chỉ dùng khi source/dependency xác nhận; ORM khác theo cách đang dùng trong dự án, nếu không đủ bằng chứng thì hỏi.

## 3. Quy tắc riêng của skill (không phụ thuộc dự án)

- Một wiki = một API = một handler. Không tự thêm field, bước, điều kiện, transaction hay Swagger decorator mà wiki hoặc dự án không yêu cầu.
- Không suy đoán ràng buộc, thông báo hoặc cấu hình mà wiki không nêu; hỏi người dùng. Giữ nguyên thông báo lỗi của wiki, từng ký tự.
- Trong `Processing Flow > Detail`, nhận diện từng bước bằng mỗi khối `<details>`; theo template hiện tại, lấy số bước và `Action` từ `<summary>` theo mẫu `Step [step_no]: [action_step]`, và lấy `Target`, `Details`, `Output`, `Next`, `On failure` từ phần nội dung của khối. Để tương thích, vẫn đọc wiki cũ có `Step: [step_no] | Action: [action_step] | Next: [next_step]` trong `<summary>` hoặc tiêu đề `#### Step <N>: <Action>`.
- Mặc định một class chính mỗi file, kiểu tham số và trả về tường minh, hàm ngắn dễ đọc; áp dụng style dự án khi phù hợp. Chỉ import những gì được dùng.
- Mặc định dùng `// Step N: <mô tả ngắn>` để đối chiếu bước runtime và tách hàm con khi giúp rõ ràng; theo cách dự án nếu khác. `Create helper` là thay đổi mã nguồn, không phải bước runtime.
- Ngôn ngữ chú thích theo dự án; báo cáo bằng ngôn ngữ người dùng.
- Không hard-code secret, thời hạn token hay URL; dùng cấu hình dự án.
- Không log hoặc trả về mật khẩu, token, field nội bộ. Dùng thư viện băm mật khẩu và luồng xác thực đã có; không tự viết cơ chế mã hóa/xác thực.
- Không nuốt lỗi, không trả về thành công giả.
- Không thêm dependency khi chưa được đồng ý. Thiếu thư viện thì ghi vào báo cáo và hỏi.
- Không tạo Entity, migration, guard hay decorator phân quyền mới; thiếu thì nêu trong báo cáo cuối.
- Không sửa file wiki. Không ghi đè file hoặc handler đã có khi chưa hỏi (ngoại lệ: phạm vi thay đổi người dùng đã xác nhận ở chế độ ĐỒNG BỘ, mục 5).
- Sau khi chuyển xong wiki sang mã, **hỏi người dùng** trước khi tạo/sửa test hoặc chạy checklist kiểm tra. Đồng ý thì thêm/cập nhật test cho hành vi mới và các trường hợp lỗi liên quan rồi chạy; không đồng ý thì kết thúc workflow ngay, báo rõ code chưa được kiểm thử.
- Kiểm tra biên dịch bằng lệnh sẵn có của dự án hoặc TypeScript đã cài; không tự tải hay cài công cụ.
- Cập nhật tài liệu API khi hành vi bên ngoài thay đổi; ví dụ không chứa secret hay dữ liệu thật.

## 4. Thông báo và mã lỗi (chính sách của skill)

Trước `throw` đầu tiên, khảo sát exception/filter và 2–3 ví dụ tương tự. Dùng lại enum/constant và hình dạng lỗi của dự án khi có; nếu không có, dùng exception NestJS với thông báo chính xác từ wiki. Không tạo enum hoặc thư mục chung chỉ vì skill yêu cầu.

| Tình huống | Hành động |
| --- | --- |
| Có đúng một enum phù hợp | Thêm member mới vào cuối, theo định dạng key/value hiện có; không sửa hay sắp xếp lại member cũ |
| Có cặp enum mã + nội dung | Thêm vào **cả hai**, theo cặp mà các `throw` hiện có dùng |
| Có nhiều enum, không rõ | Hỏi người dùng chọn |
| Không có enum nào | Dùng thông báo wiki trực tiếp với exception NestJS; không tự tạo enum |

**Ánh xạ thông báo wiki sang member:**

- Thông báo dạng mã (`UPPER_SNAKE_CASE`, ví dụ `ERR_CREATE_DOCUMENT_FAILED`): key = value = chuỗi wiki, vào enum mã lỗi.
- Thông báo dạng câu (ví dụ `Permission name already exists`): vào enum nội dung; key `UPPER_SNAKE_CASE` rút từ ý nghĩa, value giữ nguyên câu wiki.
- Đã có member cùng value thì **tái sử dụng**. Các chỗ cùng thông báo dùng chung một member.
- Liệt kê trong báo cáo cuối: enum đã dùng/tạo và các member đã thêm.

## 5. Snapshot và chế độ chạy (tạo mới / đồng bộ)

Skill tổng lưu snapshot và manifest trong `<gốc dự án>/.docs-to-code/generated/`, commit cùng repo; không cần profile hay skill `project-profile`. Trước khi xác định chế độ, kiểm tra vị trí này, vị trí cũ `.project-profile/generated/` và các vị trí snapshot khác đã biết trong dự án hoặc do người dùng cung cấp. Nếu tìm thấy baseline cũ duy nhất cho đúng wiki, tiếp tục đọc và cập nhật tại vị trí cũ để tương thích; không tự di chuyển. Nếu nhiều baseline khớp hoặc manifest trỏ wiki khác cùng tên, dừng và hỏi; không chọn hay ghi đè. Không xóa baseline cũ.

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
- Chỉ ghi hoặc cập nhật baseline toàn API khi đã hoàn tất và đối chiếu mọi tầng liên quan với wiki. Nếu người dùng chỉ yêu cầu một phần, không tạo hoặc cập nhật snapshot/manifest toàn API; giữ nguyên baseline cũ và báo phần chưa đồng bộ. Hủy hoặc lỗi giữa chừng thì không đụng snapshot.

### 5.2. Xác định chế độ (trước khi sinh bất cứ code nào)

Ưu tiên yêu cầu ghi đè tường minh trước khi xét hash. Khi chạy một phần, manifest cũ có thể không bao phủ tầng được yêu cầu: kiểm tra danh sách file và phạm vi đã sinh, không kết luận KHÔNG ĐỔI chỉ vì hash trùng nếu tầng đó chưa được sinh hoặc không xác định được; hỏi khi phạm vi không rõ. Không ghi snapshot làm baseline toàn API nếu mới chạy một phần.

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
   | `Processing Flow` | Service (và Repository, enum lỗi nếu cần) |
   | `Response > Error` | Service và RO/Exception (chuẩn hóa exception; Repository, enum lỗi nếu cần) |
   | `Response > Success` (property) | RO, và Controller nếu kiểu trả về đổi |

   Section nào đổi chỉ do định dạng, câu chữ không đổi nghĩa thì không tính là khác biệt.
2. Hiển thị **bảng khác biệt** gồm: section, giá trị cũ → mới, file sẽ sửa, hành động dự kiến. Dùng công cụ hỏi người dùng với hai lựa chọn: **Áp dụng** hoặc **Hủy**.
3. **Hủy**: dừng ngay, không sửa file nào, không cập nhật snapshot. Báo rõ không có gì thay đổi.
4. **Áp dụng**: chỉ gọi các skill con thuộc tầng bị ảnh hưởng, theo thứ tự DTO → Controller → Service → RO, ở **chế độ cập nhật** và truyền kèm danh sách thay đổi đã xác nhận.
5. **Phát hiện lệch** (drift): với phần wiki không đổi, nếu code hiện tại không khớp những gì wiki mô tả, báo riêng và hỏi (giữ code / sửa theo wiki). Không tự sửa, vì có thể là chỉnh sửa tay có chủ đích.
6. Nếu đã hoàn tất và đối chiếu mọi tầng liên quan, cập nhật snapshot và manifest; nếu chỉ chạy một phần thì giữ nguyên baseline theo mục 5.1. Sau đó hỏi về test/kiểm tra theo mục 3.

### 5.4. Quy tắc chế độ cập nhật (dành cho skill con)

- Phạm vi sửa chỉ gồm các thay đổi đã được người dùng xác nhận. Việc xác nhận này thay cho câu hỏi "đã tồn tại, ghi đè không?" của skill con; ngoài phạm vi đó vẫn phải hỏi.
- Sửa kiểu patch tối thiểu: chỉ đụng các dòng liên quan. Không viết lại file, không đổi tên file, class, handler, method, không sắp xếp lại import hay đổi style phần không liên quan.
- Giữ nguyên chỉnh sửa tay không liên quan đến khác biệt. Nếu code dùng `// Step N`, đánh số lại khi bước được thêm/xóa/đổi thứ tự; các comment khác giữ nguyên.
- Phần bị xóa khỏi wiki (field, bước, mã lỗi): liệt kê rõ trong bảng khác biệt trước khi xóa khỏi code. Không xóa member enum lỗi đã có (có thể nơi khác đang dùng).
- Vẫn tuân thủ mục 3 và 4 cho mọi đoạn code thêm mới.
- Báo cáo cuối của skill con nêu: thay đổi đã áp dụng, thay đổi bỏ qua và lý do.

### 5.5. ĐỒNG BỘ KHÔNG BASELINE

Chưa có snapshot thì không biết wiki cũ. Khi đó:

1. So wiki hiện tại trực tiếp với code đang có (DTO, Controller, Service, RO) và lập bảng khác biệt như mục 5.3.
2. Không có khác biệt: nếu đã đối chiếu mọi tầng liên quan, đề nghị tạo snapshot làm mốc và dừng (hỏi trước khi ghi); nếu chỉ đối chiếu một phần thì không tạo baseline toàn API.
3. Có khác biệt: hiển thị bảng, hỏi Áp dụng/Hủy như mục 5.3. Khác biệt không chắc chắn (code có thể do chỉnh tay) thì ghi rõ "không chắc" trong bảng.
4. Sau khi áp dụng thành công, chỉ tạo snapshot và manifest nếu đã hoàn tất và đối chiếu mọi tầng liên quan; nếu chỉ chạy một phần thì không tạo baseline toàn API.
