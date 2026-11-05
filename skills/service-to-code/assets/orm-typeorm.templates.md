# Template: Thao tác dữ liệu MySQL / TypeORM

Quy tắc chi tiết: [`references/orm-typeorm.conventions.md`](../references/orm-typeorm.conventions.md). Khung Service, Check, Return, Create helper: [`service.templates.md`](./service.templates.md).

Các ví dụ dưới đây chỉ mang tính minh họa theo profile `umee-api`. Tên Repository, Entity, enum và đường dẫn import phải lấy theo dự án thực tế.

## Ví dụ thao tác dữ liệu trong Repository

Service chỉ gọi method của Repository (khóa `1.2.4`/`3.3.1`); thao tác chưa có thì thêm vào Repository (khóa `2.2.5`). Ví dụ cho `PermissionRepository` (kế thừa `BaseRepository`):

```ts
// Find một bản ghi theo điều kiện / theo id
findByName(name: string): Promise<PermissionEntity | null> {
  return this.findOne({ where: { name } });
}

findById(id: number): Promise<PermissionEntity | null> {
  return this.findOneBy({ id });
}

// Find một bản ghi kèm điều kiện trên bảng quan hệ và chỉ chọn cột cần thiết
findByIdAndRefreshToken(id: number, refreshToken: string): Promise<UserEntity | null> {
  return this.createQueryBuilder('user')
    .innerJoin('user.roles', 'role')
    .innerJoin('user.tokens', 'token')
    .select(['user.id', 'user.email', 'role.id', 'role.name', 'token.id'])
    .where('user.id = :id', { id })
    .andWhere('token.refreshToken = :refreshToken', { refreshToken })
    .getOne();
}

// Kiểm tra tồn tại
async existsByName(name: string): Promise<boolean> {
  return (await this.countBy({ name })) > 0;
}

// Tìm nhiều bản ghi kèm phân trang (offset)
findPage(page: number, limit: number): Promise<[PermissionEntity[], number]> {
  return this.findAndCount({
    order: { id: 'DESC' },
    skip: (page - 1) * limit,
    take: limit,
  });
}

// Update (không cần đọc lại: dùng affected để biết có bản ghi hay không)
async updateName(id: number, name: string): Promise<boolean> {
  const result = await this.update({ id }, { name });
  return result.affected > 0;
}

// Delete cứng hoặc mềm (softDelete khi Entity có deletedAt)
async removeById(id: number): Promise<boolean> {
  const result = await this.softDelete({ id });
  return result.affected > 0;
}
```

## Ví dụ Create: `save` hay `insert`

Chọn theo mục "Chọn `save` hay `insert`" trong [`orm-typeorm.conventions.md`](../references/orm-typeorm.conventions.md).

**1. `save`: tạo một bản ghi và Step sau cần dùng lại (ví dụ lấy `id`).**

```ts
// Repository
createPermission(name: string): Promise<PermissionEntity> {
  return this.save(this.create({ name })); // trả về entity đầy đủ, có id
}

// Service
// Step 3: Create a new record
const permission = await this.permissionRepository.createPermission(name);
// Step 4: dùng permission.id
```

**2. `insert`: tạo nhiều bản ghi, hoặc không cần dùng lại kết quả.**

```ts
// Repository
async createMany(userRoles: Partial<UserRoleEntity>[]): Promise<void> {
  await this.insert(userRoles); // một câu INSERT; không chạy hook, không cascade
}

// Cần id của bản ghi vừa chèn: lấy từ identifiers, không phải entity
async createOne(name: string): Promise<number> {
  const result = await this.insert({ name });
  return result.identifiers[0].id;
}
```

**3. Trong transaction: cả hai đều đi qua `queryRunner.manager`.**

```ts
async createWithTransaction(
  queryRunner: QueryRunner,
  data: Partial<DocumentEntity>,
): Promise<DocumentEntity> {
  const repository = queryRunner.manager.getRepository(DocumentEntity);
  return await repository.save(repository.create(data));
}

async createManyWithTransaction(
  queryRunner: QueryRunner,
  userRoles: Partial<UserRoleEntity>[],
): Promise<void> {
  await queryRunner.manager.getRepository(UserRoleEntity).insert(userRoles);
}
```

## Ví dụ có Transaction (`QueryRunner`)

Wiki: `POST /document`; Step 1 Create `document`, Step 2 Create `document_history`, Step 3 Call S3; mọi bước ghi chạy trong transaction; lỗi `500 | ERR_CREATE_DOCUMENT_FAILED | 1,2,3`.

```ts
@Injectable()
export class DocumentService {
  constructor(
    private readonly documentRepository: DocumentRepository,
    private readonly documentHistoryRepository: DocumentHistoryRepository,
    private readonly logger: NestJsLoggerService,
    private readonly dataSource: DataSource,
  ) {}

  async create(body: CreateDocumentFormDTO): Promise<{ result: boolean }> {
    // Find / Check (nếu có) chạy ngoài transaction, trước khi mở transaction
    await this.runInTransaction((queryRunner) =>
      this.createDocumentWrites(queryRunner, body),
    );

    // Step 4: Return the result
    return { result: true };
  }

  // Lifecycle only: connect, start, commit, rollback, release
  private async runInTransaction(
    work: (queryRunner: QueryRunner) => Promise<void>,
  ): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await work(queryRunner);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.errors(error);
      // Wiki gán cùng một lỗi cho nhiều bước: ném một lần từ catch bằng member enum
      throw new HttpException(
        CodeMessage.ERR_CREATE_DOCUMENT_FAILED,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      await queryRunner.release();
    }
  }

  // Các bước ghi, tất cả đi qua cùng một queryRunner
  private async createDocumentWrites(
    queryRunner: QueryRunner,
    body: CreateDocumentFormDTO,
  ): Promise<void> {
    // Step 1: Create the document
    const document = await this.documentRepository.createWithTransaction(
      queryRunner,
      { name: body.data.name, type: body.data.type },
    );

    // Step 2: Create the document history
    await this.documentHistoryRepository.createWithTransaction(queryRunner, {
      documentId: document.id,
      from: new Date(body.data.from),
    });

    // Step 3: Call S3 (lỗi ở đây làm rollback cả hai bước trên)
    await this.uploadFile(document.id, body.file);
  }
}
```

Điểm cần nhớ:

- Chỉ các bước ghi nằm trong transaction; Find/Check chạy trước, ngoài transaction.
- `catch` rollback rồi mới ném lỗi; `finally` luôn `release()`; không nuốt lỗi.
- Repository chưa có method `...WithTransaction` thì thêm vào Repository (xem `createWithTransaction` ở trên).
