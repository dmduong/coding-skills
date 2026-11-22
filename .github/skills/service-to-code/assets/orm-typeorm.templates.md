# Template: MySQL / TypeORM

Quy tắc chọn API: [`references/orm-typeorm.conventions.md`](../references/orm-typeorm.conventions.md). Quy tắc Service, phân tích wiki và ánh xạ Step: [`references/service.conventions.md`](../references/service.conventions.md).

Các ví dụ được chia theo từng trường hợp trong conventions. Domain terrarium và tên entity/property bên dưới là hư cấu, không đại diện cho schema dự án; phải thay bằng tên đã đọc từ Entity thực tế. Nếu dự án có tầng Repository, đặt method dữ liệu trong Repository; nếu không, theo cấu trúc dữ liệu hợp lệ của dự án.

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

1. Đối chiếu ORM/driver, repository, transaction và xử lý lỗi với `package.json` và source.
2. Chỉ dùng ví dụ MySQL/TypeORM khi dự án thực sự dùng chúng. ORM khác thì theo API và ví dụ dự án, không chuyển đổi theo suy đoán.
3. Nếu có tầng Repository, đặt các truy vấn trong Repository; không inject `Repository<Entity>` trực tiếp vào Service khi dự án dùng custom Repository.
4. Trước khi thêm method, tìm method tương đương và làm theo cách đặt tên, kế thừa base repository, đăng ký module và xử lý lỗi đang có.

Các API dưới đây thuộc TypeORM 0.3.x. Kiểm tra phiên bản và kiểu thực tế trong dự án trước khi áp dụng.

## Ánh xạ Entity và property

Property phải lấy từ entity source, không suy ra từ tên cột hoặc wiki. Ví dụ minh họa Entity terrarium có `id`, `code`, `label`, `deletedAt`:

```ts
import {
  Column,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('terrarium')
export class TerrariumEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'terrarium_code', type: 'varchar', length: 24 })
  code: string;

  @Column({ name: 'display_label', type: 'varchar', length: 80 })
  label: string;

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
export class TerrariumService {
  constructor(
    @InjectRepository(TerrariumEntity)
    private readonly terrariumRepository: Repository<TerrariumEntity>,
  ) {}
}
```

```ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([TerrariumEntity])],
  providers: [TerrariumService],
  exports: [TerrariumService],
})
export class TerrariumModule {}
```

Nếu dự án dùng custom Repository, Service inject custom class đó thay vì `Repository<Entity>`. Ví dụ minh họa custom Repository kế thừa `BaseRepository`:

```ts
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseRepository } from '<verified-base-repository-module>';
import { ClimateReadingEntity } from './climate-reading.entity';

@Injectable()
export class ClimateReadingRepository extends BaseRepository<ClimateReadingEntity> {
  constructor(dataSource: DataSource) {
    super(
      ClimateReadingEntity,
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
public findByCode(code: string): Promise<TerrariumEntity | null> {
  return this.findOne({ where: { code } });
}
```

### Find theo ID

```ts
public findById(id: number): Promise<TerrariumEntity | null> {
  return this.findOneBy({ id });
}
```

Không chuyển `null` thành lỗi nếu wiki tách Find và Check thành hai Step. Nếu wiki yêu cầu Find-or-fail trong cùng Step, việc đọc và ném lỗi thuộc Service; xem [`service.templates.md`](./service.templates.md).

### Kiểm tra tồn tại

Dùng count khi cần boolean; không lấy toàn bộ Entity chỉ để kiểm tra:

```ts
public async existsByCode(code: string): Promise<boolean> {
  return (await this.countBy({ code })) > 0;
}
```

### Find nhiều bản ghi

```ts
public findAllByCode(code: string): Promise<TerrariumEntity[]> {
  return this.findBy({ code });
}
```

Chỉ thêm `where`, `order`, quan hệ hoặc cột mà wiki yêu cầu. Chọn kiểu trả về và thứ tự từ API TypeORM đang dùng trong dự án.

## Find nâng cao: relation, QueryBuilder, cột giới hạn

### Chỉ nạp relation, không lọc theo relation

Khi điều kiện chỉ nằm trên bảng chính và chỉ cần nạp relation, dùng `findOne` options:

```ts
public findByIdWithReadings(id: number): Promise<TerrariumEntity | null> {
  return this.findOne({
    where: { id },
    relations: ['climateReadings'],
  });
}
```

`climateReadings` phải là tên relation property của Entity, không phải tên bảng.

### Lọc theo relation hoặc cần `innerJoin`

Dùng QueryBuilder khi cần predicate trên bảng quan hệ hoặc cần loại bản ghi không có relation khớp:

Các relation `climateReadings` và `sensors` trong ví dụ là giả định thuộc schema terrarium hư cấu; chỉ dùng relation thực sự có trong Entity.

```ts
public findByIdAndSensorCode(
  id: number,
  sensorCode: string,
): Promise<TerrariumEntity | null> {
  return this.createQueryBuilder('terrarium')
    .innerJoin('terrarium.sensors', 'sensor')
    .where('terrarium.id = :id', { id })
    .andWhere('sensor.code = :sensorCode', { sensorCode })
    .getOne();
}
```

Tên alias/property phải khớp Entity. Luôn truyền giá trị qua named parameters; không nối dữ liệu người dùng vào SQL.

### Chọn một số cột và join

Chỉ chọn field cần dùng để tránh tải hoặc làm lộ field nhạy cảm. Khi gọi `.select([...])`, dùng `innerJoin`/`leftJoin`, không dùng `...AndSelect`, vì `.select` sẽ ghi đè selection:

```ts
public findTerrariumReadingSummary(id: number): Promise<TerrariumEntity | null> {
  return this.createQueryBuilder('terrarium')
    .innerJoin('terrarium.climateReadings', 'reading')
    .select(['terrarium.id', 'terrarium.code', 'reading.id', 'reading.recordedAt'])
    .where('terrarium.id = :id', { id })
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
): Promise<[TerrariumEntity[], number]> {
  return this.findAndCount({
    order: { id: 'DESC' },
    skip: (page - 1) * limit,
    take: limit,
  });
}
```

Kèm relation khi wiki yêu cầu:

```ts
public findPageWithReadings(
  page: number,
  limit: number,
): Promise<[TerrariumEntity[], number]> {
  return this.findAndCount({
    relations: ['climateReadings'],
    order: { id: 'DESC' },
    skip: (page - 1) * limit,
    take: limit,
  });
}
```

Nếu có filter từ wiki, thêm vào `where`; chỉ dùng `page >= 1` và giới hạn `limit` nếu wiki hoặc DTO đã quy định và validate.

### Quy tắc chọn `find*` hay QueryBuilder

Xem quy tắc chọn API và vị trí QueryBuilder trong [`orm-typeorm.conventions.md`](../references/orm-typeorm.conventions.md#31-chọn-find-hay-querybuilder).

## Create: chọn `save` hoặc `insert`

`create(...)` chỉ tạo object trong bộ nhớ, không ghi database. Chọn cách ghi theo việc cần Entity, hook, cascade và số lượng row.

### `save`: một bản ghi, Step sau cần Entity/ID hoặc cần hook/cascade

```ts
public createTerrarium(code: string): Promise<TerrariumEntity> {
  const terrarium = this.create({ code });
  return this.save(terrarium);
}
```

Service dùng `id` từ Entity đã lưu:

```ts
// Step 1: Create the terrarium
const terrarium = await this.terrariumRepository.createTerrarium(body.code);

// Step 2: Create an initial climate reading using the generated id
await this.climateReadingRepository.createForTerrarium(terrarium.id);
```

### `insert`: bulk hoặc không cần Entity trả về

Khi không cần kết quả database, trả `Promise<void>`:

```ts
public async createMany(
  rows: Array<Pick<TerrariumSensorEntity, 'terrariumId' | 'sensorId'>>,
): Promise<void> {
  await this.insert(rows);
}
```

Khi cần generated ID, đọc `identifiers`; kết quả vẫn là `InsertResult`, không phải Entity:

```ts
public createTerrariumAndReturnId(
  code: string,
): Promise<InsertResult> {
  return this.insert({ code });
}
```

Step sử dụng ID đọc từ kết quả, không coi `InsertResult` là Entity:

```ts
const insertResult =
  await this.terrariumRepository.createTerrariumAndReturnId(body.code);
const terrariumId = insertResult.identifiers[0]?.id;
```

Chỉ dùng mẫu này nếu DB/driver đã xác nhận generated identifier được trả. Nếu Step bắt buộc ID mà driver không đảm bảo trả về, hỏi hoặc dùng `save` thay vì giả định.

### Quyết định nhanh

Xem cách chọn `save` hay `insert` trong [`orm-typeorm.conventions.md`](../references/orm-typeorm.conventions.md#4-chọn-save-hay-insert).

## Update: cập nhật và phát hiện không có row

### Chỉ cập nhật, không cần đọc lại

`UpdateResult.affected` có thể là `undefined` tùy driver; dùng nullish guard. Chỉ chuyển kết quả thành not-found nếu flow/wiki yêu cầu:

```ts
public async updateLabel(id: number, label: string): Promise<boolean> {
  const result = await this.update({ id }, { label });
  return (result.affected ?? 0) > 0;
}
```

Service chỉ ánh xạ `false` thành lỗi khi có Step/On failure tương ứng:

```ts
// Step 2: Update the terrarium label
const updated = await this.terrariumRepository.updateLabel(id, body.label);

// Add a Check/exception here only if the wiki specifies it.
```

### Cần Entity sau khi cập nhật, hoặc cần entity lifecycle

Load bằng Repository, cập nhật đúng field trong wiki rồi save:

```ts
public async updateAndReturn(
  id: number,
  label: string,
): Promise<TerrariumEntity | null> {
  const terrarium = await this.findOneBy({ id });
  if (!terrarium) {
    return null;
  }

  terrarium.label = label;
  return this.save(terrarium);
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

Chỉ tạo transaction nếu wiki hoặc người dùng yêu cầu rõ. Quy tắc xác định bước nào nằm trong transaction và cách xử lý lỗi nằm trong [`service.conventions.md`](../references/service.conventions.md#transaction-chỉ-khi-được-yêu-cầu); cơ chế cụ thể phải khớp dự án.

### Repository method nhận transaction context

Khi dự án có Repository layer, nhận `queryRunner` làm tham số đầu tiên và lấy Repository từ manager của nó:

```ts
public createWithTransaction(
  queryRunner: QueryRunner,
  data: Partial<ClimateReadingEntity>,
): Promise<ClimateReadingEntity> {
  const repository = queryRunner.manager.getRepository(ClimateReadingEntity);
  return repository.save(repository.create(data));
}
```

Bulk insert trong cùng transaction:

```ts
public async createManyWithTransaction(
  queryRunner: QueryRunner,
  rows: Array<Pick<TerrariumSensorEntity, 'terrariumId' | 'sensorId'>>,
): Promise<void> {
  await queryRunner.manager.getRepository(TerrariumSensorEntity).insert(rows);
}
```

Update/delete trong transaction:

```ts
public async updateWithTransaction(
  queryRunner: QueryRunner,
  id: number,
  data: Partial<ClimateReadingEntity>,
): Promise<boolean> {
  const result = await queryRunner.manager
    .getRepository(ClimateReadingEntity)
    .update({ id }, data);
  return (result.affected ?? 0) > 0;
}
```

Không gọi `this.save`, `this.insert`, repository thường hoặc service truy cập repository thường bên trong transaction callback; tất cả writes phải dùng cùng `queryRunner`.

### Service quản lý vòng đời

Ví dụ này chỉ transaction hóa các thao tác DB. Thay logger theo cơ chế hiện có; rollback failure được log nhưng lỗi gốc vẫn được ném lại.

```ts
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ClimateReadingService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly climateReadingRepository: ClimateReadingRepository,
    private readonly auditRepository: ClimateReadingAuditRepository,
  ) {}

  public async create(body: CreateClimateReadingDTO): Promise<ClimateReadingEntity> {
    // Include consistency-sensitive reads and checks inside this transaction.
    return this.runInTransaction(async (queryRunner) => {
      // Step 1: Create the climate reading
      const climateReading = await this.climateReadingRepository.createWithTransaction(
        queryRunner,
        {
          recordedAt: new Date(body.recordedAt),
          temperatureC: body.temperatureC,
          humidityPercent: body.humidityPercent,
        },
      );

      // Step 2: Create its audit record
      await this.auditRepository.createWithTransaction(queryRunner, {
        climateReadingId: climateReading.id,
      });

      return climateReading;
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
          Logger.error(rollbackError);
        }
      }

      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
```

`DataSource`, `QueryRunner`, Entity, DTO, Repository, and output types must be imported from the actual project and aligned with its real signatures. The standard Nest logger above is illustrative; use the project's established error-reporting mechanism if required, and do not silently discard rollback errors.

### External service/API inside a DB transaction

A database rollback cannot undo an object-storage write, notification delivery, or external API call. Do not claim that such a side effect is atomic with the DB transaction. If the wiki explicitly puts an external call in the flow, follow its specified ordering and failure behavior; ask about compensation/retry semantics when needed rather than inventing them.

## Duplicate key (`ER_DUP_ENTRY`)

MySQL error codes may appear directly on the error or in TypeORM's `driverError`. Check both without assuming the shape of the thrown value:

```ts
export function isDuplicateEntryError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) return false;
  if ('code' in error && error.code === 'ER_DUP_ENTRY') return true;
  if (!('driverError' in error)) return false;
  const driverError = error.driverError;
  return typeof driverError === 'object' && driverError !== null &&
    'code' in driverError && driverError.code === 'ER_DUP_ENTRY';
}
```

Map the duplicate to the documented conflict exception/message in the Service, following the project's existing error mechanism:

```ts
try {
  await this.terrariumRepository.createTerrarium(body.code);
} catch (error) {
  if (isDuplicateEntryError(error)) {
    throw new ConflictException('TERRARIUM_CODE_ALREADY_EXISTS');
  }

  throw error;
}
```

Apply only under the conditions in [`ro-exception.conventions.md`](../../ro-to-code/references/ro-exception.conventions.md#step-44-lỗi-trùng-khóa-trong-database-tùy-chọn-có-điều-kiện). Reuse an existing helper; if none exists, ask before creating one in the project's shared location. Preserve unrelated database errors and, inside a transaction, roll back and preserve the original cause according to the project's exception pattern.
