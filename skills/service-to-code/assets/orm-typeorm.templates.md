# Template: MySQL / TypeORM

Quy tắc chọn API: [`references/orm-typeorm.conventions.md`](../references/orm-typeorm.conventions.md). Quy tắc Service, phân tích wiki và ánh xạ Step: [`references/service.conventions.md`](../references/service.conventions.md).

Các ví dụ được chia theo từng trường hợp trong conventions. Tên entity/property bên dưới chỉ để minh họa; phải thay bằng tên đã đọc từ Entity thực tế. Những method Repository được ghi rõ là code bên trong custom repository hiện có (hoặc lớp Repository dự án); Service chỉ gọi các method đó, không gọi TypeORM trực tiếp.

## Bản đồ bao phủ conventions

| Quy tắc trong `orm-typeorm.conventions.md` | Ví dụ |
| --- | --- |
| Xác nhận ORM | Chuẩn bị và kiểm tra |
| Entity/property, soft delete | Ánh xạ Entity |
| Inject Repository, đăng ký `forFeature`/custom Repository | Inject và đăng ký Entity |
| Find, Find by ID, existence, pagination | Find theo trường hợp |
| `find*` hay QueryBuilder, relation, select, parameterization | Find nâng cao |
| Create, chọn `save` hay `insert`, ID trả về | Create |
| Update, kiểm tra `affected`, đọc lại | Update |
| Delete/soft delete, kiểm tra `affected` | Delete |
| Transaction context và `QueryRunner` | Transaction |
| Duplicate key (`ER_DUP_ENTRY`) | Lỗi trùng khóa |

## Chuẩn bị và xác nhận ORM

Trước khi dùng mẫu:

1. Đối chiếu profile `2.1.4`, `1.2.4`, `3.3.1`, `2.2.5`, `3.3.5`, `4.4.8` với `package.json` và source.
2. Xác nhận dự án thực sự dùng MySQL/TypeORM. Nếu profile hoặc source cho thấy ORM khác, `N/A`, hoặc không thống nhất, dừng và dùng convention tương ứng; không chuyển đổi theo suy đoán.
3. Nếu có tầng Repository, đặt các truy vấn trong Repository; không inject `Repository<Entity>` trực tiếp vào Service nếu profile yêu cầu custom Repository.
4. Trước khi thêm method, tìm method tương đương và làm theo cách đặt tên, kế thừa base repository, đăng ký module và xử lý lỗi đang có.

Các API dưới đây thuộc TypeORM 0.3.x. Kiểm tra phiên bản và kiểu thực tế trong dự án trước khi áp dụng.

## Ánh xạ Entity và property

Property phải lấy từ entity source, không suy ra từ tên cột hoặc wiki. Ví dụ minh họa Entity có `id`, `name`, `deletedAt`:

```ts
import {
  Column,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('permission')
export class PermissionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'permission_name', type: 'varchar', length: 255 })
  name: string;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date | null;
}
```

Khi entity có `@DeleteDateColumn`, các truy vấn thường tự bỏ qua bản ghi soft-deleted. Nếu có cột `isActive` hoặc quy tắc lọc riêng, áp dụng đúng behavior hiện có; hỏi người dùng nếu wiki không làm rõ. Điều kiện và payload chỉ được chứa property thực sự có trong Entity.

## Inject và đăng ký Entity

Nếu dự án dùng trực tiếp `@nestjs/typeorm`, Inject Repository và đăng ký Entity trong module như sau:

```ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(PermissionEntity)
    private readonly permissionRepository: Repository<PermissionEntity>,
  ) {}
}
```

```ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([PermissionEntity])],
  providers: [PermissionService],
  exports: [PermissionService],
})
export class PermissionModule {}
```

Nếu profile quy định custom Repository, Service inject custom class đó thay vì `Repository<Entity>`. Trong dự án `umee-api`, custom Repository kế thừa `BaseRepository` và module đăng ký class Repository qua `providers`; giữ nguyên cơ chế này, không chuyển sang `@InjectRepository`:

```ts
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseRepository } from '../common/base-repository/base-repository';
import { DocumentEntity } from './document.entity';

@Injectable()
export class DocumentRepository extends BaseRepository<DocumentEntity> {
  constructor(dataSource: DataSource) {
    super(
      DocumentEntity,
      dataSource.createEntityManager(),
      dataSource.createQueryRunner(),
    );
  }
}
```

Tìm Entity và module hiện có trước khi sửa; không đăng ký provider/Entity trùng lặp.

## Repository: Find theo từng trường hợp

Tất cả ví dụ trong phần này là method nằm trong Repository. Service gọi Repository và giữ tên `Output` theo wiki.

### Find một bản ghi theo điều kiện

Dùng `findOne` khi cần nhiều điều kiện hoặc options:

```ts
public findByName(name: string): Promise<PermissionEntity | null> {
  return this.findOne({ where: { name } });
}
```

### Find theo ID

```ts
public findById(id: number): Promise<PermissionEntity | null> {
  return this.findOneBy({ id });
}
```

Không chuyển `null` thành lỗi nếu wiki tách Find và Check thành hai Step. Nếu wiki yêu cầu Find-or-fail trong cùng Step, việc đọc và ném lỗi thuộc Service; xem [`service.templates.md`](./service.templates.md).

### Kiểm tra tồn tại

Dùng count khi cần boolean; không lấy toàn bộ Entity chỉ để kiểm tra:

```ts
public async existsByName(name: string): Promise<boolean> {
  return (await this.countBy({ name })) > 0;
}
```

### Find nhiều bản ghi

```ts
public findAllByName(name: string): Promise<PermissionEntity[]> {
  return this.findBy({ name });
}
```

Chỉ thêm `where`, `order`, quan hệ hoặc cột mà wiki yêu cầu. Chọn kiểu trả về và thứ tự từ API TypeORM đang dùng trong dự án.

## Find nâng cao: relation, QueryBuilder, cột giới hạn

### Chỉ nạp relation, không lọc theo relation

Khi điều kiện chỉ nằm trên bảng chính và chỉ cần nạp relation, dùng `findOne` options:

```ts
public findByIdWithRoles(id: number): Promise<UserEntity | null> {
  return this.findOne({
    where: { id },
    relations: ['roles'],
  });
}
```

`roles` phải là tên relation property của Entity, không phải tên bảng.

### Lọc theo relation hoặc cần `innerJoin`

Dùng QueryBuilder khi cần predicate trên bảng quan hệ hoặc cần loại bản ghi không có relation khớp:

```ts
public findByIdAndRefreshToken(
  id: number,
  refreshToken: string,
): Promise<UserEntity | null> {
  return this.createQueryBuilder('user')
    .innerJoin('user.tokens', 'token')
    .where('user.id = :id', { id })
    .andWhere('token.refreshToken = :refreshToken', { refreshToken })
    .getOne();
}
```

Tên alias/property phải khớp Entity. Luôn truyền giá trị qua named parameters; không nối dữ liệu người dùng vào SQL.

### Chọn một số cột và join

Chỉ chọn field cần dùng để tránh tải hoặc làm lộ field nhạy cảm. Khi gọi `.select([...])`, dùng `innerJoin`/`leftJoin`, không dùng `...AndSelect`, vì `.select` sẽ ghi đè selection:

```ts
public findUserSummary(id: number): Promise<UserEntity | null> {
  return this.createQueryBuilder('user')
    .innerJoin('user.roles', 'role')
    .select(['user.id', 'user.email', 'role.id', 'role.name'])
    .where('user.id = :id', { id })
    .getOne();
}
```

Không chọn password, token hoặc field nội bộ nếu Step không yêu cầu. Shape trả về đầy đủ theo TypeORM có thể cần type riêng; đừng giả định partial select là một Entity đầy đủ.

### Phân trang offset

`findAndCount` trả `[rows, total]`; `skip` là offset tính từ 0, còn `take` là page size:

```ts
public findPage(
  page: number,
  limit: number,
): Promise<[PermissionEntity[], number]> {
  return this.findAndCount({
    order: { id: 'DESC' },
    skip: (page - 1) * limit,
    take: limit,
  });
}
```

Kèm relation khi wiki yêu cầu:

```ts
public findPageWithRoles(
  page: number,
  limit: number,
): Promise<[UserEntity[], number]> {
  return this.findAndCount({
    relations: ['roles'],
    order: { id: 'DESC' },
    skip: (page - 1) * limit,
    take: limit,
  });
}
```

Nếu có filter từ wiki, thêm vào `where`; chỉ dùng `page >= 1` và giới hạn `limit` nếu DTO/profile đã quy định hoặc đã validate.

### Quy tắc chọn `find*` hay QueryBuilder

| Trường hợp | Chọn |
| --- | --- |
| Điều kiện chỉ trên Entity chính | `findOne`, `findOneBy`, `findBy` |
| Chỉ cần nạp relation, không lọc relation | `find*` với `relations` |
| Predicate trên cột relation | QueryBuilder |
| Cần `innerJoin` để loại bản ghi không khớp relation | QueryBuilder |
| Cần giới hạn cột được lấy | QueryBuilder với `.select([...])` |
| Pagination offset cùng tổng số dòng | `findAndCount` |

QueryBuilder nằm trong Repository; Service chỉ gọi method Repository tương ứng.

## Create: chọn `save` hoặc `insert`

`create(...)` chỉ tạo object trong bộ nhớ, không ghi database. Chọn cách ghi theo việc cần Entity, hook, cascade và số lượng row.

### `save`: một bản ghi, Step sau cần Entity/ID hoặc cần hook/cascade

```ts
public createPermission(name: string): Promise<PermissionEntity> {
  const permission = this.create({ name });
  return this.save(permission);
}
```

Service dùng `id` từ Entity đã lưu:

```ts
// Step 1: Create the permission
const permission = await this.permissionRepository.createPermission(body.name);

// Step 2: Create a child record using the generated id
await this.childRepository.createForPermission(permission.id);
```

### `insert`: bulk hoặc không cần Entity trả về

Khi không cần kết quả database, trả `Promise<void>`:

```ts
public async createMany(
  rows: Array<Pick<UserRoleEntity, 'userId' | 'roleId'>>,
): Promise<void> {
  await this.insert(rows);
}
```

Khi cần generated ID, đọc `identifiers`; kết quả vẫn là `InsertResult`, không phải Entity:

```ts
public createPermissionAndReturnId(
  name: string,
): Promise<InsertResult> {
  return this.insert({ name });
}
```

Step sử dụng ID đọc từ kết quả, không coi `InsertResult` là Entity:

```ts
const insertResult =
  await this.permissionRepository.createPermissionAndReturnId(body.name);
const permissionId = insertResult.identifiers[0]?.id;
```

Chỉ dùng mẫu này nếu DB/driver đã xác nhận generated identifier được trả. Nếu Step bắt buộc ID mà driver không đảm bảo trả về, hỏi hoặc dùng `save` thay vì giả định.

### Quyết định nhanh

| Nhu cầu trong wiki | API |
| --- | --- |
| Một row, cần ID/default/generated fields ở Step sau | `save(create(...))` |
| Cần `@BeforeInsert`, subscriber hoặc cascade | `save(create(...))` |
| Nhiều row hoặc không cần kết quả của insert | `insert(...)` |
| Wiki chỉ yêu cầu tạo mới, không cần Entity | Ưu tiên `insert(...)` |
| Cần generated ID từ `insert` | `result.identifiers`; không coi là Entity |

Chú ý: `save` trên object có primary key có thể thực hiện `UPDATE`; không dùng nó như lệnh insert-only nếu có khả năng object đã có ID.

Khi trong transaction, cả `save` và `insert` phải thực hiện qua `queryRunner.manager`.

## Update: cập nhật và phát hiện không có row

### Chỉ cập nhật, không cần đọc lại

`UpdateResult.affected` có thể là `undefined` tùy driver; dùng nullish guard. Chỉ chuyển kết quả thành not-found nếu flow/wiki yêu cầu:

```ts
public async updateName(id: number, name: string): Promise<boolean> {
  const result = await this.update({ id }, { name });
  return (result.affected ?? 0) > 0;
}
```

Service chỉ ánh xạ `false` thành lỗi khi có Step/On failure tương ứng:

```ts
// Step 2: Update the permission
const updated = await this.permissionRepository.updateName(id, body.name);

// Add a Check/exception here only if the wiki specifies it.
```

### Cần Entity sau khi cập nhật, hoặc cần entity lifecycle

Load bằng Repository, cập nhật đúng field trong wiki rồi save:

```ts
public async updateAndReturn(
  id: number,
  name: string,
): Promise<PermissionEntity | null> {
  const permission = await this.findOneBy({ id });
  if (!permission) {
    return null;
  }

  permission.name = name;
  return this.save(permission);
}
```

Nếu wiki tách Find/Check/Update thành các Step khác nhau, không gộp chúng vào method này; cung cấp method Repository phù hợp với từng Step. Không đưa property không có trong Entity hoặc không được wiki cho phép vào payload.

## Delete: hard delete, soft delete, affected

### Hard delete

```ts
public async deleteById(id: number): Promise<boolean> {
  const result = await this.delete({ id });
  return (result.affected ?? 0) > 0;
}
```

### Soft delete

Chỉ dùng khi Entity có `@DeleteDateColumn`/cơ chế tương ứng và wiki yêu cầu soft delete:

```ts
public async softDeleteById(id: number): Promise<boolean> {
  const result = await this.softDelete({ id });
  return (result.affected ?? 0) > 0;
}
```

`false` cho biết không có row phù hợp bị xóa. Chỉ ánh xạ tình huống đó thành HTTP exception khi wiki nêu lỗi tương ứng. Không gọi `restore`/hard delete để thay đổi behavior soft-delete của dự án.

## Transaction với `QueryRunner`

Chỉ tạo transaction nếu wiki hoặc người dùng yêu cầu rõ. Quy tắc xác định bước nào nằm trong transaction và cách xử lý lỗi nằm trong [`service.conventions.md`](../references/service.conventions.md#transaction-chỉ-khi-được-yêu-cầu); cơ chế cụ thể phải khớp profile `3.3.5`.

### Repository method nhận transaction context

Khi dự án có Repository layer, nhận `queryRunner` làm tham số đầu tiên và lấy Repository từ manager của nó:

```ts
public createWithTransaction(
  queryRunner: QueryRunner,
  data: Partial<DocumentEntity>,
): Promise<DocumentEntity> {
  const repository = queryRunner.manager.getRepository(DocumentEntity);
  return repository.save(repository.create(data));
}
```

Bulk insert trong cùng transaction:

```ts
public async createManyWithTransaction(
  queryRunner: QueryRunner,
  rows: Array<Pick<UserRoleEntity, 'userId' | 'roleId'>>,
): Promise<void> {
  await queryRunner.manager.getRepository(UserRoleEntity).insert(rows);
}
```

Update/delete trong transaction:

```ts
public async updateWithTransaction(
  queryRunner: QueryRunner,
  id: number,
  data: Partial<DocumentEntity>,
): Promise<boolean> {
  const result = await queryRunner.manager
    .getRepository(DocumentEntity)
    .update({ id }, data);
  return (result.affected ?? 0) > 0;
}
```

Không gọi `this.save`, `this.insert`, repository thường hoặc service truy cập repository thường bên trong transaction callback; tất cả writes phải dùng cùng `queryRunner`.

### Service quản lý vòng đời

Ví dụ này chỉ transaction hóa các thao tác DB. Thay logger theo cơ chế hiện có; rollback failure được log nhưng lỗi gốc vẫn được ném lại.

```ts
@Injectable()
export class DocumentService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly documentRepository: DocumentRepository,
    private readonly historyRepository: DocumentHistoryRepository,
    private readonly logger: NestJsLoggerService,
  ) {}

  public async create(body: CreateDocumentDTO): Promise<DocumentEntity> {
    // Find/Check, when present in the wiki, runs before the transaction.
    return this.runInTransaction(async (queryRunner) => {
      // Step 1: Create the document
      const document = await this.documentRepository.createWithTransaction(
        queryRunner,
        { name: body.name },
      );

      // Step 2: Create its history
      await this.historyRepository.createWithTransaction(queryRunner, {
        documentId: document.id,
      });

      return document;
    });
  }

  private async runInTransaction<T>(
    work: (queryRunner: QueryRunner) => Promise<T>,
  ): Promise<T> {
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const result = await work(queryRunner);
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        try {
          await queryRunner.rollbackTransaction();
        } catch (rollbackError) {
          this.logger.errors(rollbackError);
        }
      }

      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
```

`DataSource`, `QueryRunner`, Entity, DTO, Repository, logger and output types must be imported from the actual project and aligned with its real signatures. If there is no suitable logger, use the project's established error-reporting mechanism; do not silently discard rollback errors.

### External service/API inside a DB transaction

A database rollback cannot undo an S3 upload, email, or external API call. Do not claim that such a side effect is atomic with the DB transaction. If the wiki explicitly puts an external call in the flow, follow its specified ordering and failure behavior; ask about compensation/retry semantics when needed rather than inventing them.

## Duplicate key (`ER_DUP_ENTRY`)

TypeORM wraps MySQL failures in `QueryFailedError`. Detect the driver code through a type guard rather than assuming every thrown value has a `code` property:

```ts
import { QueryFailedError } from 'typeorm';

export function isDuplicateEntryError(error: unknown): boolean {
  return (
    error instanceof QueryFailedError &&
    typeof error.driverError === 'object' &&
    error.driverError !== null &&
    'code' in error.driverError &&
    error.driverError.code === 'ER_DUP_ENTRY'
  );
}
```

Map the duplicate to the documented conflict exception/message in the Service, following profile `4.4.8` and the existing error enum/constant:

```ts
try {
  await this.permissionRepository.createPermission(body.name);
} catch (error) {
  if (isDuplicateEntryError(error)) {
    throw new ConflictException(ErrorMessages.PERMISSION_NAME_ALREADY_EXISTS);
  }

  throw error;
}
```

Only map this error when the wiki/profile requires that behavior. Preserve all unrelated database errors; do not convert every query failure into a conflict. For a database operation inside a transaction, apply the mapping at the agreed boundary while still rolling back and preserving the original cause according to the project's exception pattern.

## Checklist trước khi hoàn tất

- [ ] ORM/driver khớp profile và source; Entity đã được đọc.
- [ ] Property, relation, soft-delete và kiểu ID lấy từ Entity, không suy đoán.
- [ ] Mọi DB query nằm trong Repository; Service chỉ gọi method Repository.
- [ ] Đã chọn `find*` hay QueryBuilder theo đúng nhu cầu; parameters không bị nối vào SQL.
- [ ] Pagination/relations/cột select chỉ được thêm khi wiki yêu cầu.
- [ ] Create dùng `save` hay `insert` theo nhu cầu Entity/result/hook/cascade; không coi `InsertResult` là Entity.
- [ ] Update/Delete dùng `affected` an toàn và chỉ tạo lỗi khi wiki quy định.
- [ ] Trong transaction, mọi write dùng cùng `queryRunner.manager`; ngoài transaction không bị lẫn repository thường.
- [ ] Transaction chỉ được thêm khi wiki/người dùng yêu cầu; external side effects không bị mô tả sai là rollbackable.
- [ ] Duplicate key chỉ được map theo profile/wiki; lỗi database khác được ném lại.
- [ ] Repository/module method mới khớp conventions và wiring sẵn có.
