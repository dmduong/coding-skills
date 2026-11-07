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

## Template wiki

Mẫu dưới đây theo cấu trúc hiện tại của [`docs/wiki_new.md`](../../../docs/wiki_new.md). Trong `Processing Flow > Detail`, mỗi bước được thu gọn trong một khối `<details>`; số bước và hành động hiển thị trong `<summary>`, còn `Next` và các trường khác nằm trong nội dung có thể mở rộng.

```markdown
## Purpose

<purpose_of_documentation>

## Endpoint

| Component | Value         |
| --------- | ------------- |
| Method    | <method_name> |
| Path      | <path_name>   |
| Roles     | <role_name>   |

## Header

| Header        | Required | Value          |
| ------------- | -------- | -------------- |
| <header_name> | Y or N   | <header_value> |

## Request

### Path Variables

### Query Params

### Body (Raw)

### Body (Form data)

| Field        | Type         | Required | Constraints        | Description         |
| ------------ | ------------ | -------- | ------------------ | ------------------- |
| <field_name> | <field_type> | Y or N   | <constraints_name> | <description_field> |

## Processing Flow

### Entity/Schema

| Table        | Role in API | Documentation        |
| ------------ | ----------- | -------------------- |
| <table_name> | <role_name> | <link_documentation> |

### Detail

<details>
  <summary>Step [step_no]: [action_step]</summary>

- **Target:** <action_target>
- **Details:**
  - <action_detail_1>
  - <action_detail_2>
- **Output:** <variable_name>
- **Next:** <next_step>
- **On failure:** <error_message>

</details>

## Response

### Success

| Status        | Description          |
| ------------- | -------------------- |
| <http_status> | <description_status> |

| Property        | Type            | Description            |
| --------------- | --------------- | ---------------------- |
| <property_name> | <property_type> | <property_description> |

### Error

| Status         | Message         | Raised at        |
| -------------- | --------------- | ---------------- |
| <error_status> | <error_message> | <raised_at_step> |
```

## Cách hoàn thiện wiki

Hãy viết wiki như một đặc tả đủ rõ để một người chưa biết nghiệp vụ có thể triển khai API mà không phải tự đoán. Ưu tiên diễn đạt bằng ngôn ngữ tự nhiên, hướng tới nghiệp vụ; chỉ dùng tên field, bảng, mã enum, hàm và giá trị kỹ thuật khi cần xác định chính xác dữ liệu hoặc liên kết với code. Dùng dữ liệu giả hoặc placeholder trong ví dụ; không đưa token, mật khẩu, thông tin cá nhân hay secret thật vào tài liệu.

### Điền các section chung

| Section | Cách điền |
| --- | --- |
| `Purpose` | Mô tả ngắn gọn API làm gì. Nội dung này cũng được dùng làm Swagger summary. |
| `Endpoint` | Ghi HTTP method, path đầy đủ theo quy ước dự án, và role được phép gọi. Nêu rõ `Public` hoặc `Authenticated` nếu không phải danh sách role cụ thể. |
| `Header` | Liệt kê header bắt buộc/tùy chọn và giá trị/định dạng cần gửi. Không ghi giá trị bí mật thật. |
| `Request` | Liệt kê mọi path param, query param và body field; ghi đúng tên, kiểu, bắt buộc hay không, giới hạn/format/range/enum, và ý nghĩa. Với object/array lồng nhau, liệt kê từng field con và kiểu phần tử. |
| `Processing Flow > Entity/Schema` | Liệt kê từng bảng/entity API đọc hoặc ghi, vai trò `read`, `write`, hoặc `read + write`, và liên kết schema/entity thật nếu có. Tên bảng phải đủ để đối chiếu với field trong Detail. |
| `Response > Success` | Ghi status và mô tả thành công; bên dưới liệt kê chính xác shape trả về, kiểu và ý nghĩa từng property. Nếu không có body, nói rõ. |
| `Response > Error` | Mỗi lỗi có status, mã/thông báo chính xác và step gây lỗi trong `Raised at`. Mỗi mã xuất hiện ở `On failure` phải khớp dòng trong bảng này. |

Ràng buộc phải đo được, ví dụ “từ 1 đến 10 ký tự”, “ISO 8601”, “một trong `A`, `B`”, thay vì “hợp lệ” hoặc “đúng định dạng”. Nếu quy tắc nghiệp vụ, giá trị enum, cách xử lý bản ghi không tồn tại, hoặc trạng thái thành công chưa rõ, hãy xác nhận với người có thẩm quyền trước khi ghi; không để người triển khai tự suy diễn.

### Viết `Processing Flow > Detail`

Mỗi khối `<details>` là đúng một bước trong luồng. `Step [step_no]` phải duy nhất; có thể dùng nhãn như `x`, `x1` cho bước chuẩn bị. `Action` là một trong các loại ở bảng dưới. Các bước runtime nối theo `Next`; các bước chạy song song phải ghi rõ chúng bắt đầu cùng lúc và cùng hội tụ về bước kế tiếp. Nhánh phải ghi điều kiện và đích đến rõ ràng.

| Action | Dùng để mô tả | `Output` thường dùng | Điều cần nêu trong `Details` |
| --- | --- | --- | --- |
| `Find` | Đọc một hay nhiều bản ghi; không tự xác nhận điều kiện nghiệp vụ ngoài điều kiện truy vấn. | Tên biến chứa Entity, danh sách Entity, hoặc kết quả truy vấn có shape được mô tả. Dùng đúng tên này ở các bước sau. | Bảng/Target, điều kiện lọc, join/quan hệ cần dùng, field cần lấy, thứ tự/phân trang nếu có, và cách biểu diễn kết quả không tìm thấy. |
| `Check` | Kiểm tra giá trị đã có từ request hoặc Output bước trước; không tạo/cập nhật/xóa dữ liệu. | Thường là `-` nếu chỉ kiểm tra; nếu bước tạo giá trị mới, ghi tên và kiểu/ý nghĩa giá trị đó. | Điều kiện chính xác, trường hợp đạt/không đạt và mã lỗi cho trường hợp không đạt. Không dùng `Check` để ngầm thêm quy tắc chưa nêu. |
| `Create` | Tạo bản ghi mới. | Tên biến chứa bản ghi đã tạo nếu bước sau cần ID/default/generated fields; nếu không cần kết quả, `-`. | Target và ánh xạ từng cột sang input/Output trước đó/hằng số đã xác nhận. Nêu rõ transaction nếu bắt buộc. |
| `Update` | Sửa bản ghi đã xác định. | Bản ghi đã cập nhật nếu bước sau dùng; nếu không, `-`. | Cách xác định bản ghi đích, các field được sửa và giá trị mới; nêu điều kiện không tìm thấy hoặc không cập nhật nếu có. |
| `Delete` | Xóa bản ghi đã xác định. | `-` nếu không dùng kết quả; nếu có, nêu rõ giá trị trả về. | Cách xác định bản ghi và loại xóa nếu nghiệp vụ yêu cầu (soft/hard); không để người triển khai tự chọn. |
| `Compute` | Tính/chuyển đổi dữ liệu bằng biểu thức, thư viện hoặc helper đã có; không tự ghi database. | Tên biến chứa kết quả và kiểu/format, hoặc `-` nếu không có kết quả cần dùng tiếp. | Công thức, input, quy tắc làm tròn/format/timezone nếu liên quan và cách xử lý lỗi. |
| `Call` | Gọi service nội bộ hoặc hệ thống bên ngoài. | Tên biến chứa kết quả trả về nếu bước sau dùng; nếu call chỉ gây side effect, `-`. | Service/operation, tham số, kết quả mong đợi, side effect và lỗi cần ánh xạ. Không ghi secret/URL nhạy cảm trực tiếp. |
| `Create helper` | Hướng dẫn tạo helper dùng chung khi chưa có helper phù hợp; đây là thay đổi mã nguồn, không phải thao tác lúc API chạy. | Tên helper cần tạo. | File/Target, chữ ký, kiểu input/output và thuật toán. Đặt trước bước runtime đầu tiên sử dụng helper; không mô tả lại việc chạy helper ở bước này. |
| `Return` | Hoàn tất và trả response API. | Thường là `-`; shape response được khai báo ở `Response > Success`. | Giá trị/field trả về và cách map từ các Output trước đó; phải khớp bảng Success. |

`Target` cần chỉ rõ bảng, biến, helper hoặc service bị tác động. Trong `Details`, ưu tiên mô tả bằng câu văn tự nhiên; không cần viết biểu thức gán hoặc tên property có dấu chấm nếu có thể nói rõ ý nghĩa như “tên tài liệu trong yêu cầu”. Giữ nguyên tên kỹ thuật khi chúng giúp định danh chính xác field, helper, bảng hoặc mã nghiệp vụ; tránh biến cả phần mô tả thành giả mã. Mô tả phải đủ cụ thể để phân biệt điều kiện đọc với điều kiện kiểm tra nghiệp vụ, và nêu ánh xạ dữ liệu khi có ghi. `Output` là tên kết quả dùng trong bước sau, không phải tên hành động; không tạo Output mới nếu thao tác không trả dữ liệu cần dùng. Dùng `-` khi không có output runtime.

`Next` là số/nhãn step tiếp theo, `-` nếu kết thúc. Với nhánh, ghi điều kiện và step đích cho từng trường hợp. Với các bước song song, ghi rõ bước nào chạy song song và bước nào chờ tất cả hoàn tất; không dùng thứ tự liệt kê để ngầm thể hiện song song.

`On failure` là mã lỗi phát sinh nếu thao tác của step thất bại; ghi `-` chỉ khi step không có lỗi cần ánh xạ. Bổ sung cùng mã và HTTP status vào `Response > Error`; `Raised at` phải liệt kê step tương ứng. Không dùng mã lỗi để mô tả kết quả nghiệp vụ bình thường như “không có dữ liệu” trừ khi wiki quy định rõ đó là lỗi.

#### Ví dụ: Find rồi Check

```html
<details>
  <summary>Step 1: Find</summary>

- **Target:** user
- **Details:**
  - Tìm user có `user.id` bằng `path.id`.
- **Output:** user
- **Next:** 2
- **On failure:** ERR_USER_LOOKUP_FAILED

</details>

<details>
  <summary>Step 2: Check</summary>

- **Target:** user
- **Details:**
  - Xác nhận `user` tồn tại và `user.status` bằng trạng thái đã được định nghĩa là ACTIVE.
  - Nếu không đạt, trả lỗi `ERR_USER_NOT_ACTIVE`.
- **Output:** -
- **Next:** 3
- **On failure:** ERR_USER_NOT_ACTIVE

</details>
```

Trong ví dụ, Find chịu trách nhiệm truy vấn và đặt kết quả vào `user`; Check dùng đúng Output đó để kiểm tra nghiệp vụ. Các mã lỗi chỉ là ví dụ định dạng: trước khi dùng trong wiki thật, phải xác nhận mã, status và ý nghĩa; liệt kê chúng trong `Response > Error`.

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
