---
name: project-profile
description: Tạo, kiểm tra và cập nhật profile quy ước của một dự án NestJS (phong cách code và đặt tên, thư viện ưu tiên, kiến trúc và thư mục dùng chung, bảo mật và xử lý lỗi, chuẩn tài liệu) bằng cách quét source rồi cho người dùng xác nhận. Dùng khi người dùng muốn thiết lập hoặc xem quy ước dự án, khi quy ước dự án đổi, hoặc khi một skill sinh code khác (doc-to-code, dto, pagination, s3-service, db-to-orm) báo thiếu hoặc lỗi thời profile.
---

# project-profile

Tạo và duy trì **một file profile duy nhất** mô tả quy ước của dự án đang dùng skill. Các skill sinh code khác chỉ **đọc** file này, không tự quét, không tự giữ quy ước riêng.

```
Skill này  →  <dự-án>/.project-profile/profile.md  ←  doc-to-code, dto, pagination, s3-service, ...
(tạo, cập nhật)         (nguồn sự thật duy nhất)            (chỉ đọc)
```

Skill không chứa tên thư mục, decorator hay thư viện cụ thể của dự án nào. Giá trị đó lấy từ việc quét dự án, từ preset và từ câu trả lời của người dùng.

## Cấu trúc thư mục skill

```
project-profile/
├── SKILL.md
├── references/
│   ├── profile-template.md          # Khuôn profile cố định (khóa 1.1.1 ... 5.4.3)
│   └── presets/
│       └── nestjs-typeorm.md        # Giá trị mặc định cho NestJS + TypeORM + MySQL
└── scripts/
    └── scan-project.js              # Quét dự án, xuất scan-report.json theo khóa của khuôn
```

## File sinh ra trong dự án

| File                                      | Vai trò                                       | Git                                                      |
| ----------------------------------------- | --------------------------------------------- | -------------------------------------------------------- |
| `<gốc>/.project-profile/profile.md`       | Profile đã điền và đã xác nhận                | **Commit** (cả nhóm dùng chung, review qua pull request) |
| `<gốc>/.project-profile/scan-report.json` | Kết quả quét thô, tạo lại được bất cứ lúc nào | Bỏ qua (`.gitignore`)                                    |

## Các chế độ

| Chế độ           | Khi nào dùng                                                                               | Mục |
| ---------------- | ------------------------------------------------------------------------------------------ | --- |
| **Tạo mới**      | Chưa có `profile.md`                                                                       | A   |
| **Kiểm tra**     | Người dùng hỏi profile còn đúng không, hoặc skill khác cần biết profile có dùng được không | B   |
| **Bổ sung khóa** | Skill khác cần một số khóa còn `unset` hoặc `detected`                                     | C   |
| **Cập nhật**     | Dự án đã đổi (refactor, đổi thư viện) hoặc người dùng muốn sửa quy ước                     | D   |
| **Xem**          | Người dùng muốn xem profile hiện tại                                                       | E   |
| **Xuất**         | Người dùng muốn sinh file hướng dẫn cho công cụ khác (Copilot...) từ profile               | F   |

Nếu yêu cầu chưa rõ chế độ nào: có `profile.md` thì mặc định **Kiểm tra** rồi hỏi cần làm gì tiếp, chưa có thì **Tạo mới**.

## Quy tắc xuyên suốt

1. **Giữ nguyên khuôn**: mọi khóa trong `profile-template.md` đều phải có mặt trong profile. Không thêm, không xóa, không đổi tên, không đổi nghĩa khóa.
2. **Dự án thắng preset**: nếu quét thấy dự án làm khác preset thì ghi giá trị của dự án. Preset chỉ là điểm xuất phát.
3. **Không bao giờ tự đoán**: không quét thấy và preset không có thì để `unset` rồi hỏi.
4. **Chỉ người dùng mới chốt**: script luôn trả `detected`. Trạng thái `confirmed` chỉ ghi sau khi người dùng đã thấy và đồng ý giá trị đó.
5. **Không ghi đè quyết định đã xác nhận** (`confirmed`) khi chưa hỏi.
6. **Chỉ skill này được ghi vào `profile.md`**. Skill khác muốn đổi giá trị thì yêu cầu người dùng chạy chế độ Cập nhật hoặc Bổ sung khóa.
7. Không thêm thư viện, không sửa mã nguồn của dự án. Skill này chỉ đọc source và ghi trong `.project-profile/`.

## Ý nghĩa trạng thái

| Trạng thái    | Nghĩa                                            | Skill sinh code được dùng ngay?   |
| ------------- | ------------------------------------------------ | --------------------------------- |
| `confirmed`   | Người dùng đã xác nhận                           | Có                                |
| `preset`      | Lấy từ preset, người dùng chưa xem riêng mục này | Có                                |
| `detected`    | Quét thấy, chưa xác nhận                         | Không, phải hỏi người dùng trước  |
| `unset`       | Chưa có giá trị                                  | Không, phải hỏi                   |
| giá trị `N/A` | Dự án không dùng                                 | Bỏ qua, không sinh code liên quan |

---

## A. Tạo mới

Mục tiêu: có `profile.md` mà người dùng đã xác nhận.

### A1. Xác định gốc dự án

Gốc dự án là thư mục chứa `package.json` gần nhất, tính từ thư mục làm việc đi lên. Với monorepo, đó là thư mục của đúng ứng dụng NestJS (thường có `nest-cli.json`). Có nhiều ứng viên hoặc không rõ thì hỏi.

Nếu không có `package.json` hoặc không phải dự án NestJS (không có `@nestjs/core`): dừng, báo người dùng, không tạo profile.

### A2. Quét

```bash
node <đường-dẫn-skill>/scripts/scan-project.js <gốc-dự-án>
```

Script ghi `<gốc>/.project-profile/scan-report.json`. Đọc ba phần:

- `meta`: `hasFeatureCode` cho biết dự án đã có module nghiệp vụ chưa; `recommendation` gợi ý cách dùng.
- `items`: mỗi khóa có `value`, `confidence` (`high`/`medium`/`low`), `evidence` (đường dẫn hoặc `file:dòng`), có thể có `candidates`. Khóa `_dependencies` là dữ liệu phụ (thư viện khai báo nhưng không dùng, dùng nhưng không khai báo).
- `unresolved`: khóa không tìm thấy, hoặc có nhiều kiểu cần người dùng chọn.

Nếu script lỗi (không có Node, thoát mã khác 0): tự quét thủ công bằng cách đọc `package.json`, cây thư mục `src/`, `main.ts`, `app.module.ts`, `tsconfig.json`, các file cấu hình (`.prettierrc`, ESLint) và 2–3 file mẫu mỗi loại (controller, service, dto, entity). Báo người dùng là đã quét thủ công.

Với dự án lớn, **không đọc toàn bộ source**. Chỉ đọc thêm file mẫu khi cần làm rõ một mục.

### A3. Điền profile

Lấy cấu trúc từ `references/profile-template.md`. Với mỗi khóa:

| Tình huống                                                   | Giá trị ghi       | Trạng thái                                      |
| ------------------------------------------------------------ | ----------------- | ----------------------------------------------- |
| Có trong `items`, `confidence` = `high`                      | Giá trị quét được | `detected`                                      |
| Có trong `items`, `confidence` = `medium`                    | Giá trị quét được | `detected`, đưa vào danh sách cần xác nhận      |
| Có trong `items`, `confidence` = `low`, hoặc có `candidates` | Chưa chọn         | `unset`, đưa vào danh sách cần hỏi kèm ứng viên |
| Không có trong `items`, preset có giá trị                    | Giá trị preset    | `preset`                                        |
| Không có trong `items`, preset ghi `unset`                   | Để trống          | `unset`                                         |
| Dự án không dùng (ví dụ không có Swagger)                    | `N/A`             | `detected`                                      |

Quy tắc điền:

- `meta.hasFeatureCode = false` (dự án trống): chỉ dùng kết quả quét cho mục 2.1 và cấu hình đã có (1.1.1–1.1.3, 5.4.x); mọi khóa còn lại lấy từ preset.
- Giá trị quét được ở dạng cấu trúc (object, mảng): viết lại thành câu hoặc bảng ngắn đúng định dạng ô trong khuôn.
- Mục 2.2.x script chỉ liệt kê tên thư viện được import: ghép với cột "Quy tắc sử dụng" từ preset.
- Mục chính sách của nhóm mà code không thể hiện (3.4, 3.5, 2.3, 2.4, 4.2.5, 4.2.6, 4.3.7, 4.4.5, 4.4.6): lấy từ preset, trạng thái `preset`.
- Khi kết quả đáng ngờ (ví dụ 1.1.6 báo nhiều `any`, 1.5.6 mâu thuẫn): đọc 2–3 file mẫu để làm rõ trước khi ghi.
- Đường dẫn ghi "tạo mới nếu chưa có" trong preset (guard, decorator, enum ở mục 4): chỉ ghi vào profile **khi dự án chưa có**. Skill này không tạo các file đó, skill sinh code sẽ hỏi rồi tạo.
- Cảnh báo `_dependencies.declaredButUnused` hoặc `usedButUndeclared` nếu có: nêu ở bước xác nhận, không đưa vào profile.

### A4. Người dùng xác nhận (bắt buộc)

1. **Trình bày bản tóm tắt** ngắn theo 5 phần của khuôn (mỗi dòng: khóa, giá trị, trạng thái):

   ```
   Cấu trúc:   chia theo tính năng, src/modules/<tên-số-ít>/
   Công nghệ:  NestJS 10, TypeORM + MySQL, Swagger, class-validator
   Dùng chung: src/common (decorators, guards, filters, enums, interfaces, utils)
   Đặt tên:    kebab-case số ít, interface tiền tố I, JSON camelCase
   Auth:       guard global JwtAuthGuard, @Public(), @Roles(), RoleEnum
   Lỗi:        HttpException, filter HttpExceptionFilter
   ```

2. **Hỏi các mục chưa chắc** bằng AskUserQuestion (tối đa 4 câu mỗi lần, gộp theo chủ đề). Mỗi câu liệt kê `candidates` làm lựa chọn, thêm lựa chọn "Dùng giá trị preset" nếu có. Ưu tiên hỏi:
   - Khóa có `candidates` (ví dụ JSON camelCase hay snake_case).
   - Khóa `medium` mà người dùng nên duyệt.
   - Khóa preset đánh dấu `(cần duyệt)`: 1.4.6, 1.5.2, 4.3.1.
   - Khóa `unset` quan trọng (ví dụ 4.2.4 danh sách role, 1.5.1 tiền tố API).
3. **Khóa `unset` còn lại chưa cần ngay**: không hỏi hết một lượt. Giữ `unset`; chế độ **Bổ sung khóa** (mục C) sẽ hỏi khi skill khác cần đến.
4. Người dùng không có mặt để trả lời: không đoán. Lưu profile với các khóa chưa chắc là `unset` hoặc `detected`, nói rõ còn thiếu gì.

### A5. Lưu

1. Với mọi khóa người dùng đã thấy và đồng ý, đổi trạng thái thành `confirmed`. Khóa chưa hỏi giữ `preset`, `detected` hoặc `unset`.
2. Điền front-matter: `schemaVersion` (lấy từ khuôn), `project` (tên trong `package.json`), `framework`, `orm`, `database`, `createdAt`, `confirmedBy` (người xác nhận nếu biết), `confirmedAt`.
3. Mục 6 "Mục chưa xác định" của khuôn: liệt kê các khóa còn `unset` hoặc `detected`.
4. Ghi vào `<gốc>/.project-profile/profile.md`.
5. Nếu `.gitignore` chưa có, đề nghị thêm `.project-profile/scan-report.json`; nhắc **commit** `profile.md`.
6. Báo ngắn: đã lưu ở đâu, còn bao nhiêu khóa chưa xác định, và skill sinh code nào dùng được ngay.

---

## B. Kiểm tra

Chạy theo thứ tự, báo kết quả từng bước:

1. **Tồn tại**: có `profile.md` không.
2. **Phiên bản**: so `schemaVersion` trong profile với khuôn.
   - Profile cũ hơn: thiếu các khóa mới, đề nghị bổ sung (chế độ C cho các khóa đó).
   - Profile mới hơn khuôn (khuôn trong skill cũ): báo người dùng cập nhật skill, không tự sửa profile.
3. **Đầy đủ khóa**: mọi khóa của khuôn đều có mặt, không có khóa lạ. Thiếu hoặc thừa thì báo, đề nghị sửa theo khuôn.
4. **Trạng thái**: đếm số khóa theo `confirmed`, `preset`, `detected`, `unset`.
5. **Đường dẫn còn tồn tại**: kiểm tra các đường dẫn trong mục 3.2, 4.1, 4.2, 4.4.4. Đường dẫn ghi "tạo mới nếu chưa có" mà file chưa tồn tại thì không phải lỗi. Đường dẫn đã từng tồn tại mà nay mất thì báo.
6. **Khớp thực tế (tùy chọn)**: chạy lại script quét, so các khóa `high` với giá trị trong profile, báo khóa lệch. Không tự sửa.

Kết quả: danh sách vấn đề, kèm đề nghị (Bổ sung khóa hoặc Cập nhật). Khi được skill khác gọi, trả lời ngắn: profile dùng được hay không, thiếu khóa nào.

---

## C. Bổ sung khóa

Dùng khi skill khác (hoặc người dùng) cần một số khóa cụ thể, ví dụ `4.2.4`, `1.5.1`.

1. Nhận danh sách khóa cần.
2. Với mỗi khóa, đọc trạng thái trong profile:
   - `confirmed` hoặc `preset`: dùng được, bỏ qua.
   - `detected`: hỏi người dùng xác nhận hoặc sửa.
   - `unset`: nếu `scan-report.json` còn và có ứng viên thì dùng làm lựa chọn; chưa có thì quét lại script, rồi hỏi.
3. Hỏi gộp theo chủ đề, tối đa 4 câu mỗi lần.
4. Chỉ ghi lại các khóa vừa xác nhận (trạng thái `confirmed`), không đụng khóa khác. Cập nhật mục 6 của profile.
5. Trả lại cho skill gọi: các khóa đã sẵn sàng, các khóa người dùng chưa trả lời.

Không hỏi những khóa không nằm trong danh sách cần.

---

## D. Cập nhật

Dùng khi dự án đổi hoặc người dùng muốn sửa quy ước.

1. Hỏi phạm vi: toàn bộ, một phần của khuôn (ví dụ chỉ mục 2) hoặc một số khóa cụ thể.
2. Quét lại (script), rồi **so với profile hiện tại** theo từng khóa trong phạm vi.
3. Trình bày **bảng khác biệt**: khóa, giá trị trong profile, giá trị quét mới, độ chắc chắn. Khóa `confirmed` mà quét thấy khác: hỏi người dùng giữ hay đổi, mặc định **giữ**.
4. Chỉ ghi các khóa người dùng đồng ý đổi (`confirmed`). Giữ nguyên phần còn lại.
5. Nếu `schemaVersion` của khuôn đã tăng: bổ sung khóa mới (trạng thái `preset` hoặc `unset`) rồi hỏi xác nhận, nâng `schemaVersion` trong profile.
6. Báo các skill sinh code có thể bị ảnh hưởng (ví dụ đổi tên file DTO ảnh hưởng doc-to-code và dto). Không tự sửa mã đã sinh.

---

## E. Xem

Đọc `profile.md` và trình bày theo 5 phần của khuôn, mỗi phần một bảng ngắn: khóa, giá trị, trạng thái. Đánh dấu rõ khóa `detected` và `unset`. Không sửa gì.

---

## F. Xuất sang công cụ khác

Chỉ làm khi người dùng yêu cầu. Profile là bản gốc, file xuất là **bản phái sinh**, không sửa tay.

- **GitHub Copilot**: sinh `.github/instructions/<chủ-đề>.instructions.md` với front-matter `applyTo` (glob), ví dụ:
  - mục 1.2–1.4 → `naming.instructions.md`, `applyTo: "src/**/*.ts"`
  - mục 3.3 → `architecture.instructions.md`
  - mục 4.4 → `error-handling.instructions.md`
    Viết thành câu mệnh lệnh ngắn, không giữ cột trạng thái và khóa. Chỉ xuất khóa `confirmed` hoặc `preset`.
- Ghi đầu file xuất: `<!-- Tạo từ .project-profile/profile.md, không sửa tay. Chạy lại project-profile để cập nhật. -->`.
- Không ghi đè file instructions đã có khi chưa hỏi.

---

## Hợp đồng với skill sinh code khác

Phần này dành cho skill đọc profile (doc-to-code, dto, pagination, s3-service, db-to-orm...). Mỗi skill đó nên đặt đoạn tương đương ở đầu quy trình.

**1. Tìm profile**: `<gốc dự án>/.project-profile/profile.md`. Gốc dự án là thư mục chứa `package.json` gần nhất.

**2. Chưa có hoặc không hợp lệ**: dừng, yêu cầu người dùng chạy skill `project-profile` (chế độ Tạo mới hoặc Kiểm tra). Không sinh code theo đoán.

**3. Khai báo khóa cần dùng**: mỗi skill có bảng "khóa bắt buộc" của riêng nó (ví dụ DTO cần `1.2.5`, `1.3.2`, `1.4.5`, `2.2.1`, `5.1.5`). Trước khi sinh code, kiểm tra các khóa đó:

- `confirmed` hoặc `preset`: dùng.
- `detected` hoặc `unset`: gọi chế độ Bổ sung khóa cho đúng các khóa đó.
- `N/A`: bỏ qua phần code liên quan.

**4. Tra theo khóa, không theo vị trí hay diễn đạt**: luôn tra theo số khóa (`1.2.5`), không dựa vào thứ tự dòng hay tiêu đề.

**5. Không ghi vào profile**: chỉ skill `project-profile` được ghi.

**6. Khóa ổn định**: skill này chỉ **thêm** khóa mới khi nâng `schemaVersion`, không đổi nghĩa hay xóa khóa cũ, nên các skill khác không hỏng khi nâng cấp.

---

## Xử lý tình huống đặc biệt

| Tình huống                                                   | Cách xử lý                                                                                                                                           |
| ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dự án không dùng TypeORM (Prisma, Sequelize, Mongoose...)    | Vẫn quét và ghi giá trị thật vào profile (2.1.4, 2.2.5). Báo người dùng preset hiện chỉ có `nestjs-typeorm`, các mục lấy từ preset có thể không khớp |
| Dự án nửa camelCase nửa snake_case                           | Không chọn hộ: đưa cả hai làm ứng viên cho người dùng                                                                                                |
| Dự án trống (chỉ có khung `nest new`)                        | Dùng preset, hỏi các mục `unset`, quét lại ở chế độ Cập nhật khi dự án đã có code                                                                    |
| Profile bị sửa tay (thiếu khóa, đổi tên khóa, trạng thái lạ) | Chế độ Kiểm tra báo lỗi cụ thể, đề nghị sửa theo khuôn; không tự sửa                                                                                 |
| Hai người cùng sửa profile (xung đột git)                    | Giải quyết xung đột như file văn bản; sau đó chạy chế độ Kiểm tra                                                                                    |
| Monorepo nhiều ứng dụng                                      | Mỗi ứng dụng một profile riêng trong thư mục gốc của ứng dụng đó                                                                                     |
| Quét chậm hoặc dự án rất lớn                                 | Chỉ quét thư mục nguồn chính; không đọc toàn bộ file; báo người dùng nếu bỏ qua phần nào                                                             |
| Script báo `declaredButUnused` hoặc `usedButUndeclared`      | Nêu trong bước xác nhận như một cảnh báo, không ghi vào profile                                                                                      |

## Giới hạn cần nói rõ với người dùng

- Script dùng regex, không phân tích cú pháp đầy đủ. Dự án đặt tên khác thường (ví dụ `@IsPublic()` thay cho `@Public()`) có thể bị sót, vì vậy bước xác nhận là bắt buộc.
- Quy ước do nhóm đặt (mẫu nên theo hoặc tránh, chính sách bảo mật) không suy ra được từ code; các mục này chỉ lấy từ preset và cần người dùng duyệt.
- Profile phản ánh thời điểm xác nhận. Khi dự án đổi lớn, chạy chế độ Cập nhật.

## Nguyên tắc

- Profile là **nguồn sự thật duy nhất** về quy ước dự án cho mọi skill sinh code.
- Quét để **đề xuất**, người dùng **chốt**.
- Khuôn cố định, giá trị thay đổi theo dự án.
- Khi không chắc: để `unset` và hỏi, không bịa.
