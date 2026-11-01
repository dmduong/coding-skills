# Template Step 3: Service (MySQL / TypeORM)

Quy tắc chi tiết: [`references/service.conventions.md`](../references/service.conventions.md).

Template này là **khung**. Phần trong `{...}` điền từ profile (số khóa bên cạnh) hoặc wiki.

## Bảng placeholder

| Placeholder | Nguồn | Ý nghĩa |
| --- | --- | --- |
| `{Service}` | `1.3.1`, `1.2.3` | Tên class Service |
| `{Repo}` | `1.2.4`, `3.3.1`, `2.2.5` | Repository của dự án; chưa có method cần dùng thì thêm vào repository |
| `{handler}` | `1.5.4` | Tên method chính |
| `{stepFn}` | Wiki `Step N` | Hàm con `private`, tên là động từ + đối tượng |
| `{ErrorEnum.MEMBER}` | `4.4.7`, `4.4.1` | Thông báo lỗi lấy từ enum của dự án |
| `{Exception}` | Wiki `Status` + `4.4.5` | Exception ứng với mã HTTP |
| `{txMechanism}` | `3.3.5` | Cơ chế transaction của dự án |

## Khung (không transaction)

```ts
@Injectable()
export class {Service} {
  constructor(private readonly {repo}: {Repo}) {}

  // Method chính chỉ gọi tuần tự; mỗi Step là một hàm con private.
  async {handler}(body: {DtoClass}): Promise<{ReturnType}> {
    // Step 1: {Details của Step 1}
    const {output1} = await this.{stepFn1}(...);

    // Step 2: {Details của Step 2}
    this.{stepFn2}({output1});

    // Step N: Return
    return {resultTheoKhóa3.3.4};
  }

  private {stepFn2}({output1}): void {
    if ({điều kiện On failure}) {
      throw new {Exception}({ErrorEnum.MEMBER});
    }
  }
}
```

Quy tắc riêng của skill:

- Một Step của wiki là một hàm con; giữ comment `// Step N` đúng số bước. Mỗi hàm không quá ~30 dòng.
- Step có `On failure` khác `-` thì ném lỗi đúng mã HTTP, đúng thông báo của wiki; thông báo lấy từ enum, không viết literal trong `throw`.
- Không thêm bước, field hay điều kiện ngoài wiki.
- Step `Return` dựng object chỉ gồm các property trong bảng Property của wiki.

`{resultTheoKhóa3.3.4}` chọn theo khóa `3.3.4`:

| `3.3.4` | Giá trị trả về của Service |
| --- | --- |
| Controller chuyển sang RO | Entity hoặc object chứa đúng các property của wiki; **không** gọi `plainToInstance` |
| Service trả RO | `plainToInstance({RoClass}, data, { excludeExtraneousValues: true })` |

## Khung có transaction

Chỉ dùng khi wiki hoặc người dùng yêu cầu. Cơ chế (`QueryRunner`, `DataSource.transaction`, hay helper của dự án) theo khóa `3.3.5`.

```ts
async {handler}(...): Promise<...> {
  // Step 1-k: Find / Check chạy ngoài transaction
  await this.{findAndCheckFn}(...);

  // Step k+1-N: các bước ghi chạy trong transaction
  await {txMechanism}((tx) => this.{writeFn}(tx, ...));
}
```

Quy tắc riêng của skill khi có transaction:

- Chỉ các bước ghi nằm trong transaction; mọi thao tác ghi đi qua cùng một đối tượng transaction.
- Lỗi thì rollback rồi ném lại (không nuốt lỗi); luôn giải phóng tài nguyên trong `finally`.
- Tách vòng đời transaction thành một hàm riêng để hàm nghiệp vụ ngắn gọn.

## Ví dụ đã điền (chỉ minh họa, theo profile `umee-api`)

Wiki: `POST /permission`, 4 step (Find → Check → Create → Return), lỗi `409 | Permission name already exists | Step 2`. `3.3.4` = Controller chuyển RO.

```ts
@Injectable()
export class PermissionService {
  constructor(private readonly permissionRepository: PermissionRepository) {}

  async create(body: CreatePermissionDTO): Promise<PermissionEntity> {
    // Step 1: Find a permission by name
    const existingPermission = await this.permissionRepository.findByName(body.name);

    // Step 2: Fail if the permission already exists
    this.assertPermissionNotExists(existingPermission);

    // Step 3: Create a new record
    // Step 4: Return the created permission
    return this.permissionRepository.createPermission(body.name);
  }

  private assertPermissionNotExists(existingPermission: PermissionEntity | null): void {
    if (existingPermission) {
      throw new ConflictException(ErrorMessage.PERMISSION_NAME_ALREADY_EXISTS);
    }
  }
}
```

Enum lỗi: thêm member vào enum đã có của dự án (nơi lưu theo `4.4.7`), ví dụ:

```ts
PERMISSION_NAME_ALREADY_EXISTS = 'Permission name already exists',
```

Module: đăng ký Entity, Controller, Service, Repository theo cách dự án đang dùng (khóa `1.2.x`, `2.2.5`).

## Ví dụ thao tác dữ liệu (Repository, `save`/`insert`, `QueryRunner`)

Cú pháp TypeORM nằm ở [`orm-typeorm.templates.md`](./orm-typeorm.templates.md) (khóa `2.1.4`): thao tác Repository, `save` và `insert`, ví dụ transaction đầy đủ. Service chỉ gọi method của Repository.

## Ví dụ Create helper

Khi wiki có step `Create helper` (ví dụ Target `utils.helper.ts`, hàm `createDocumentPath`): kiểm tra helper đã có chưa, chưa có thì thêm vào đúng file `Target`, **trước** bước dùng nó. Đây là bước tạo code, không phải một bước runtime của Service.

```ts
// utils.helper.ts
export const createDocumentPath = (
  documentId: number,
  documentHistoryId: number,
): string => `${documentId}/origin/${documentHistoryId}/${Date.now()}.pdf`;

// Service: bước dùng helper (action Compute)
// Step 4: Compute the storage path
const documentPath = createDocumentPath(document.id, documentHistory.id);
```

## Ví dụ Check nhiều điều kiện và Return có điều kiện

Wiki: Step 2 Find role theo `body.roles`; Step 3 Check user tồn tại (lỗi `400 | ERR_USER_NOT_EXISTS`); Step 4 Check số role tìm được bằng số role yêu cầu (lỗi `400 | ERR_ROLE_NOT_EXISTS`). Mỗi Check là một hàm `assert...`, ném lỗi tại hàm đó:

```ts
// Step 3: Fail if the user does not exist
private assertUserExists(user: UserEntity | null): void {
  if (!user) {
    throw new HttpException(
      CodeMessage.ERR_USER_NOT_EXISTS,
      HttpStatus.BAD_REQUEST,
    );
  }
}

// Step 4: Fail if some roles do not exist
private assertAllRolesExist(roles: RoleEntity[], requested: number[]): void {
  if (roles.length !== requested.length) {
    throw new HttpException(
      CodeMessage.ERR_ROLE_NOT_EXISTS,
      HttpStatus.BAD_REQUEST,
    );
  }
}
```

Khi wiki Step `Return` ghi "không trả về kết quả" (ví dụ `204`), method chính trả `Promise<void>` và Controller trả đúng mã trạng thái của bảng Success.

## Ví dụ khi `3.3.4` là "Service trả RO"

Chỉ dùng khi profile quy định Service chuyển sang RO (xem [`ro.templates.md`](./ro.templates.md)). Khi đó bước `Return` dựng đúng các property của bảng Property rồi chuyển:

```ts
// Step 4: Return the result
private toCreatePermissionRO(permission: PermissionEntity): CreatePermissionRO {
  return plainToInstance(
    CreatePermissionRO,
    { id: permission.id, name: permission.name, createdAt: permission.createdAt },
    { excludeExtraneousValues: true },
  );
}
```

Đường dẫn import trong các ví dụ trên chỉ mang tính minh họa. Luôn dùng đường dẫn thực tế của dự án.
