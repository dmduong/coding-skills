# Thao tác dữ liệu với MySQL / TypeORM

Đọc trước [`workflow.md`](../../docs-to-code/rules/workflow.md); chỉ áp dụng tài liệu này khi dự án thực sự dùng TypeORM.

Ví dụ: [`assets/orm-typeorm.templates.md`](../assets/orm-typeorm.templates.md).

File này chỉ chứa **cú pháp và cách chọn API của TypeORM**. Cấu trúc Service, đọc Detail, lỗi và giá trị trả về nằm ở [`service.conventions.md`](./service.conventions.md). Nếu dự án có tầng Repository, Service gọi method của Repository; thao tác chưa có thì thêm theo mẫu dự án. Các ví dụ `repo.xxx` nằm trong Repository hoặc Service khi dự án không có tầng Repository.

## 1. Xác nhận dự án dùng TypeORM

Không đoán. Đối chiếu `package.json` và source (`*.entity.ts`, module, repository). Nếu dự án dùng ORM khác, theo mẫu và API thực tế của ORM đó; không dùng ví dụ TypeORM. Nếu không xác minh được, dừng và hỏi.

## 2. Tìm Entity và tên property

- Tên bảng trong wiki (ví dụ `USER_ROLE`) tương ứng với class `UserRole`. Tìm file bằng Glob (`**/*.entity.ts`) và đọc nó.
- Lấy tên property (camelCase hoặc snake_case) **từ code của Entity**, không lấy từ wiki hay đoán. Chỉ dùng cột `Documentation` của wiki (liên kết đến tài liệu cấu trúc bảng) để kiểm tra kiểu dữ liệu, ràng buộc và quan hệ nếu file được liên kết có sẵn.
- Nếu Entity có field soft-delete (`deletedAt`) hoặc `isActive`, theo cách lọc dữ liệu đã xóa sẵn có của dự án. Hỏi nếu wiki không làm rõ.
- Điều kiện và payload chỉ được chứa các field có trong Entity đã đọc.

## 3. Ánh xạ thao tác dữ liệu

`repo` là `Repository<Entity>` của TypeORM (trong Repository của dự án thì là `this`).

| Thao tác                             | MySQL (TypeORM)                                                                               |
| ------------------------------------ | --------------------------------------------------------------------------------------------- |
| Inject                               | `@InjectRepository(Permission) private readonly permissionRepository: Repository<Permission>` |
| Đăng ký trong Module                 | `TypeOrmModule.forFeature([Permission])`                                                      |
| Tìm một bản ghi theo điều kiện       | `repo.findOne({ where: { name } })`                                                           |
| Tìm theo ID                          | `repo.findOneBy({ id })`                                                                      |
| Tìm nhiều bản ghi kèm phân trang     | `repo.findAndCount({ where, order, skip, take })`                                             |
| Kiểm tra bản ghi có tồn tại          | `(await repo.countBy({ name })) > 0`                                                          |
| Create một bản ghi, Step sau cần dùng lại (`id`, giá trị mặc định) | `repo.save(repo.create({ name }))`, xem mục 4                |
| Create nhiều bản ghi, hoặc không cần dùng lại kết quả | `repo.insert(entities)` (một hoặc nhiều dòng), xem mục 4                    |
| Update                               | `repo.update({ id }, data)` và đọc lại nếu cần; hoặc load entity, gán giá trị rồi gọi `repo.save(entity)` |
| Delete                               | `repo.delete({ id })` hoặc `repo.softDelete({ id })` nếu có `deletedAt`                       |
| Relation / join                      | `relations: ['role']` hoặc QueryBuilder `leftJoinAndSelect`                                   |
| Tìm một bản ghi kèm điều kiện trên bảng quan hệ, `innerJoin`, hoặc chọn cột cụ thể | QueryBuilder: `createQueryBuilder('user').innerJoin(...).select([...]).where(...).getOne()`, xem mục 3.1 |
| Transaction                          | `QueryRunner` (`dataSource.createQueryRunner()`), xem mục 5                                   |
| Phát hiện không có bản ghi khi update/delete | `result.affected === 0`                                                               |
| ID được trả về                       | `entity.id`                                                                                   |

Lưu ý: chỉ dùng các API có trong phiên bản thư viện đã cài của dự án (kiểm tra `package.json`). Nếu không chắc, chọn phương án đơn giản hơn (ví dụ `countBy` thay vì `exists`).

### 3.1 Chọn `find*` hay QueryBuilder

Cả hai đều là Action `Find` (một bản ghi hoặc nhiều bản ghi); chỉ khác cách viết.

- Điều kiện chỉ nằm trên bảng chính, hoặc chỉ cần nạp quan hệ: dùng `findOne({ where, relations })`.
- Dùng QueryBuilder khi cần một trong các điều sau: điều kiện trên cột của bảng quan hệ, `innerJoin` để loại bản ghi không có quan hệ khớp, hoặc chọn cột cụ thể để không lộ field nhạy cảm (mật khẩu, token).
- Dùng `innerJoin`/`leftJoin` (không `...AndSelect`) khi đã có `.select([...])`, vì `select` sau sẽ ghi đè phần select của join.
- Nếu dự án có tầng Repository, QueryBuilder nằm trong Repository; nếu không, theo cấu trúc dữ liệu hợp lệ của dự án.
- Truyền giá trị qua named parameters; không nối dữ liệu người dùng vào SQL.


## 4. Chọn `save` hay `insert`

`repo.create(...)` chỉ dựng object, chưa ghi vào database; phải gọi `save` hoặc `insert` để ghi.

| | `save` | `insert` |
| --- | --- | --- |
| SQL | Có thể `SELECT` trước (khi object có `id`) rồi `INSERT` hoặc `UPDATE` | Một câu `INSERT` |
| Giá trị trả về | Entity đã lưu; field tự sinh có được nạp hay không tùy driver và cấu hình | `InsertResult` (`identifiers`, `generatedMaps`), không phải entity |
| Hook / subscriber | Có thể chạy listener và subscriber theo cấu hình | Có thể phát sự kiện insert; listener của entity còn phụ thuộc kiểu object và cấu hình |
| Cascade quan hệ | Có | Không |
| Hiệu năng | Chậm hơn | Nhanh hơn, phù hợp chèn hàng loạt |
| Khi trùng khóa | Object có sẵn `id` thì thành `UPDATE`, có thể ghi đè ngầm | Luôn là `INSERT`, trùng thì ném `ER_DUP_ENTRY` |

Cách chọn:

- Chỉ tạo **một** bản ghi và Step sau cần dùng nó (lấy `id` để tạo bản ghi con, dựng RO): dùng `save(create(...))`.
- Tạo **nhiều** bản ghi (ví dụ danh sách `user_role`), hoặc không cần dùng lại kết quả: dùng `insert`.
- Bảng cần cascade quan hệ: dùng `save`. Nếu phụ thuộc hook hoặc subscriber, xác minh hành vi với phiên bản TypeORM, kiểu object và cấu hình dự án; không giả định `insert` luôn bỏ qua chúng.
- Wiki chỉ nói "tạo mới" và không cần kết quả: ưu tiên `insert`, vì không thể biến thành `UPDATE` ngoài ý muốn.
- Cần `id` sau `insert`: lấy `result.identifiers[0].id`; không giả định kết quả là entity.
- Khi dự án đã có method Repository phù hợp, gọi method đó; chỉ thêm method mới khi chưa có.
- Trong transaction, `save` và `insert` đều phải đi qua `queryRunner.manager`; không gọi trực tiếp trên `repo`.
- Với MySQL, xử lý lỗi `ER_DUP_ENTRY` theo wiki và cơ chế dự án; không giả định mã này cho driver khác.

## 5. Transaction bằng `QueryRunner`

Nguyên tắc chung nằm ở mục "Transaction" của [`service.conventions.md`](./service.conventions.md). Phần này chỉ là cú pháp `QueryRunner`; với cơ chế khác (`dataSource.transaction`, helper dự án), dùng API tương ứng.

- Inject `DataSource` vào constructor của Service nếu chưa có.
- Vòng đời: `createQueryRunner()` → `connect()` → `startTransaction()` → `try { ghi...; commitTransaction() } catch { rollbackTransaction(); throw error } finally { release() }`.
- Mọi thao tác ghi đi qua cùng một `queryRunner`:
  - Nếu dự án có tầng Repository, ưu tiên method của repository nhận `queryRunner` làm tham số **đầu tiên** (theo cách đặt tên mà repository hiện có đang dùng; ví dụ hậu tố `WithTransaction`). Chưa có thì thêm vào repository, bên trong dùng `queryRunner.manager.getRepository(Entity)`.
  - Thao tác đơn giản có thể dùng trực tiếp `queryRunner.manager.update(<Entity>, id, data)`.
  - Không gọi repository thường (không qua `queryRunner`) bên trong khối transaction.
- Hàm con nhận `queryRunner: QueryRunner` làm tham số.

