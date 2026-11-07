# Template Step 3: Service

Quy tắc chuẩn: [`references/service.conventions.md`](../references/service.conventions.md). Chỉ dùng cú pháp MySQL/TypeORM trong [`references/orm-typeorm.conventions.md`](../references/orm-typeorm.conventions.md) và [`orm-typeorm.templates.md`](./orm-typeorm.templates.md); Service không gọi TypeORM trực tiếp.

Các ví dụ dưới đây là mẫu theo từng phần/action của conventions, không phải một API mẫu cần chép nguyên. Những đoạn được ghi là lời gọi/handler body cần đặt trong method; các chữ trong `{...}` là placeholder. Thay tên lớp, kiểu, Repository, field, exception và member lỗi theo wiki, profile và source thực tế. Không thêm bước, điều kiện, transaction hay field mà wiki không yêu cầu.

## Bản đồ bao phủ conventions

| Phần trong `service.conventions.md` | Template ở đây |
| --- | --- |
| Đầu vào, Entity/Schema, xác nhận ORM | Chuẩn bị trước khi code |
| Đọc `Detail`, `Target`, `Details`, `Output`, `Next`, `On failure` | Đọc và ánh xạ Step |
| Find, Check, Create, Update, Delete | Mẫu theo Action |
| Compute, Create helper, Call | Mẫu theo Action |
| Pagination, relation/join, lựa chọn `save`/`insert` | Mẫu Repository trong [`orm-typeorm.templates.md`](./orm-typeorm.templates.md) |
| Transaction | Transaction |
| Chữ ký method, helper, inject, Module | Khung Service và đăng ký Module |
| Xử lý lỗi, `Response > Error` | Lỗi theo `On failure` |
| Dịch vụ và thư viện bên ngoài | Compute và Call |
| Giá trị trả về, RO | Return |
| Kiểm tra trước khi hoàn tất, báo cáo, ngoài phạm vi | Checklist và báo cáo |

## Chuẩn bị trước khi code

1. Đọc profile và xác nhận các khóa liên quan theo [`profile-contract.md`](../../docs-to-code/rules/profile-contract.md). Profile ưu tiên hơn các ví dụ trong file này.
2. Xác nhận TypeORM và đọc các Entity từ `Processing Flow > Entity/Schema`. Nếu thiếu Entity, dừng và báo; không tự tạo.
3. Đọc DTO và Controller hiện có để chữ ký Service khớp tên, thứ tự tham số và kiểu mà Controller truyền.
4. Đọc đúng các trường trong `Request`, `Detail`, `Response > Error` và `Response > Success`.
5. Tìm Repository, helper, service phụ thuộc, enum lỗi và module hiện có trước khi thêm code. Tái sử dụng thành phần sẵn có.
6. Nếu wiki yêu cầu transaction mà cơ chế profile chưa xác nhận, dừng và hỏi; không tự chọn cơ chế.

## Đọc và ánh xạ Step

Mỗi khối `<details>` của wiki là một Step. Đánh dấu từng hành động runtime bằng `// Step N: ...` và giữ nguyên số, thứ tự, nhánh từ wiki. `Create helper` là thay đổi mã nguồn, không phải runtime Step của Service.

| Wiki | Ánh xạ |
| --- | --- |
| `Target` | Entity/Repository, biến hoặc dependency bị tác động |
| `Details` | Điều kiện, field và thao tác đã được wiki nêu |
| `Output` | Biến có đúng tên này nhận kết quả Step |
| `Next` | Thứ tự gọi, nhánh `if/else` hoặc return sớm |
| `On failure` | Exception tại Step, khớp status/message trong `Response > Error` |

Không phân loại được `Action`, thiếu kiểu/field/điều kiện, hoặc `On failure` mâu thuẫn với `Response > Error`: dừng và hỏi, không suy đoán.

## Khung Service

Chữ ký dưới đây minh họa kiểu có tham số body. Chỉ đưa vào tham số mà Controller thực sự truyền; giữ nguyên thứ tự của Controller. Mọi method đều `async`, kiểu tham số/return rõ ràng. Mỗi hàm tối đa khoảng 30 dòng.

```ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class {Service} {
  constructor(
    private readonly {repository}: {Repository},
    private readonly {existingDependency}: {Dependency},
  ) {}

  public async {handler}(
    body: {RequestDto},
  ): Promise<{ReturnType}> {
    // Step 1: {mô tả ngắn theo wiki}
    const {output} = await this.{stepFunction}(body);

    // Step 2: {mô tả ngắn theo wiki}
    await this.{nextStepFunction}({output});

    // Step N: Return
    return {giá trị đúng Response > Success};
  }

  private async {stepFunction}(
    body: {RequestDto},
  ): Promise<{OutputType}> {
    return this.{repository}.{repositoryMethod}(body.{field});
  }
}
```

- Chỉ inject Repository/Entity được dùng trong flow.
- Nếu Service đã tồn tại, đọc toàn bộ file, thêm method vào class và dependency vào constructor hiện hữu; không thay constructor hoặc method khác. Nếu trùng handler, dừng và hỏi.
- Dùng `// Step N` trên lời gọi trong method điều phối hoặc trong code Step tương ứng, không đánh số lại theo ý mình.

### Tham số người dùng hiện tại

Chỉ thêm tham số nếu `Details` cần danh tính người dùng nhưng Controller chưa truyền. Giữ thứ tự tham số khớp với Controller và báo rằng Controller cần truyền user id qua cơ chế profile `4.1.5`:

```ts
public async update(
  body: UpdateUserDTO,
  userId: number,
): Promise<void> {
  // Step 1: Update only the user identified by the wiki
  await this.userRepository.updateUser(userId, body);
}
```

Không đọc token/request trực tiếp trong Service và không tự tạo decorator.

### Đăng ký Module

Chỉ cập nhật module nếu Service/Entity/Repository cần dùng chưa được đăng ký. Giữ nguyên các import và provider hiện có; dùng kiểu đăng ký phù hợp với cấu trúc thực tế của dự án.

```ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([{Entity}])],
  providers: [{Service}, {Repository}],
  exports: [{Service}],
})
export class {Module} {}
```

Với custom repository hoặc module đã có wiring khác, làm theo module có sẵn; không thêm `forFeature` hay provider trùng lặp.

## Mẫu theo Action

### Find: đọc một hoặc nhiều bản ghi

Service gọi Repository; tên biến phải khớp với `Output`. Các truy vấn `find*`, QueryBuilder, relation và phân trang được định nghĩa trong Repository theo [`orm-typeorm.templates.md`](./orm-typeorm.templates.md).

```ts
private async findPermissionById(
  permissionId: number,
): Promise<PermissionEntity | null> {
  return this.permissionRepository.findById(permissionId);
}
```

```ts
// Step 1: Find the permission by id
const permission = await this.findPermissionById(permissionId);
```

Khai báo Repository có kiểu rõ ràng, ví dụ (cú pháp cụ thể theo ORM template):

```ts
public findById(id: number): Promise<PermissionEntity | null> {
  return this.findOneBy({ id });
}
```

Kết quả không tồn tại được xử lý ở Step Check kế tiếp nếu wiki tách riêng Check. Nếu wiki mô tả Find-or-fail trong cùng Step, có thể gộp việc đọc và kiểm tra trong một hàm con; không tự đổi flow.

### Pagination và relation

Service chuyển tham số đã được wiki/DTO nêu đến Repository. Cài truy vấn phân trang hoặc join trong Repository theo [`orm-typeorm.templates.md`](./orm-typeorm.templates.md); không đặt QueryBuilder hay cú pháp TypeORM trong Service:

```ts
private async findUserPage(
  page: number,
  limit: number,
): Promise<[UserEntity[], number]> {
  return this.userRepository.findPageWithRoles(page, limit);
}
```

```ts
// Step 1: Find the requested user page with its documented relation
const [users, total] = await this.findUserPage(page, limit);
```

Không tải relation hoặc thêm pagination nếu wiki không yêu cầu. Chỉ đưa vào truy vấn các cột/quan hệ cần thiết.

### Check: xác nhận điều kiện và ném lỗi

Điều kiện chỉ lấy từ `Details`. Theo quy ước Service, Step helper là `async` và có kiểu trả về tường minh, kể cả khi chỉ kiểm tra dữ liệu đã có.

```ts
private async findPermissionOrFail(
  permissionId: number,
): Promise<PermissionEntity> {
  const permission = await this.permissionRepository.findById(permissionId);
  if (!permission) {
    throw new NotFoundException(ErrorMessages.PERMISSION_NOT_FOUND);
  }
  return permission;
}
```

Gọi helper trong method điều phối:

```ts
// Step 2: Find the permission or fail
const permission = await this.findPermissionOrFail(permissionId);
```

Kiểm tra quan hệ hoặc số lượng bản ghi theo điều kiện thực tế trong wiki:

```ts
private async assertAllRolesExist(
  roles: RoleEntity[],
  requestedRoleIds: number[],
): Promise<void> {
  if (roles.length !== requestedRoleIds.length) {
    throw new BadRequestException(ErrorMessages.ROLE_NOT_FOUND);
  }
}
```

Gọi Check helper trong method điều phối:

```ts
// Step 3: Fail when not all requested roles exist
await this.assertAllRolesExist(roles, requestedRoleIds);
```

`ErrorMessages.PERMISSION_NOT_FOUND` và `ErrorMessages.ROLE_NOT_FOUND` chỉ là tên minh họa. Dùng enum/constant và hình dạng lỗi thực tế của dự án; chỉ thêm member theo [`profile-contract.md`](../../docs-to-code/rules/profile-contract.md), không tự tạo enum trùng.

### Create: tạo bản ghi

Chọn `save` hoặc `insert` theo nhu cầu output/hook/cascade ở ORM template. Khi Step sau cần entity/id, Repository nên trả entity đã lưu:

```ts
private async createPermission(name: string): Promise<PermissionEntity> {
  return this.permissionRepository.createPermission(name);
}
```

```ts
// Step 3: Create the permission
const permission = await this.createPermission(body.name);
```

```ts
public createPermission(name: string): Promise<PermissionEntity> {
  return this.save(this.create({ name }));
}
```

Nếu wiki yêu cầu thêm nhiều bản ghi và không cần kết quả, Repository có thể trả `Promise<void>` sau `insert`. Không giả định `insert` trả entity.

### Update: cập nhật bản ghi

Đưa vào payload đúng các field mà wiki cho phép. Nếu cần biết bản ghi có được cập nhật hay không, Repository trả boolean; chỉ ném lỗi not-found nếu wiki quy định:

```ts
private async updatePermissionName(
  permissionId: number,
  name: string,
): Promise<void> {
  const updated = await this.permissionRepository.updateName(
    permissionId,
    name,
  );
  if (!updated) {
    throw new NotFoundException(ErrorMessages.PERMISSION_NOT_FOUND);
  }
}
```

```ts
// Step 4: Update the permission name
await this.updatePermissionName(permissionId, body.name);
```

```ts
public async updateName(id: number, name: string): Promise<boolean> {
  const result = await this.update({ id }, { name });
  return (result.affected ?? 0) > 0;
}
```

Nếu Step tiếp theo cần entity đã cập nhật, Repository có thể load entity, gán các field được wiki nêu rồi `save`; dùng transaction context nếu wiki yêu cầu transaction.

### Delete: xóa cứng hoặc mềm

Chọn `delete` hay `softDelete` theo Entity và wiki. Kiểm tra `affected` chỉ khi flow yêu cầu phân biệt không tìm thấy:

```ts
private async removePermission(permissionId: number): Promise<void> {
  const removed = await this.permissionRepository.removeById(permissionId);
  if (!removed) {
    throw new NotFoundException(ErrorMessages.PERMISSION_NOT_FOUND);
  }
}
```

```ts
// Step 5: Remove the permission
await this.removePermission(permissionId);
```

```ts
public async removeById(id: number): Promise<boolean> {
  const result = await this.softDelete({ id });
  return (result.affected ?? 0) > 0;
}
```

Repository chỉ dùng `softDelete` khi Entity có cột soft-delete và đúng yêu cầu; xem ORM template để biết cú pháp.

### Compute: gọi thư viện hoặc helper đã có

Dùng dependency/helper hiện có, khai báo kiểu đầu vào/đầu ra và không hard-code secret, URL hay thời hạn:

```ts
private async generateAccessToken(
  payload: JwtPayload,
): Promise<string> {
  return this.jwtService.signAsync(payload);
}
```

```ts
// Step 6: Generate the access token
const accessToken = await this.generateAccessToken(payload);
```

Nếu Step là tính toán đồng bộ, gọi hàm đồng bộ và không thêm `await`:

```ts
const documentPath = createDocumentPath(
  document.id,
  documentHistory.id,
);
```

Thêm comment Step ở lời gọi runtime trong method điều phối:

```ts
// Step 6: Compute the document path
const documentPath = createDocumentPath(document.id, documentHistory.id);
```

Không thêm dependency hoặc tự tạo service thay thế khi dự án chưa có; nêu thiếu sót trong báo cáo.

### Create helper: thêm helper dùng chung

Đây là thay đổi mã nguồn ở `Target`, không phải một lời gọi runtime hay một hàm con Service. Trước tiên tìm helper tương đương; chỉ thêm nếu chưa có và wiki mô tả đủ tên, tham số, kết quả, quy tắc.

Ví dụ khi wiki chỉ rõ helper tạo đường dẫn:

```ts
export function createDocumentPath(
  documentId: number,
  documentHistoryId: number,
): string {
  return `${documentId}/origin/${documentHistoryId}/${Date.now()}.pdf`;
}
```

Sau đó Step runtime sử dụng helper mới ở đúng vị trí trong flow:

```ts
// Step 4: Compute the document path
const documentPath = createDocumentPath(document.id, documentHistory.id);
```

Đặt helper tại đúng file/phạm vi dùng chung theo profile. Không biến `Create helper` thành lỗi HTTP hoặc thêm comment `// Step N` runtime cho thao tác khai báo helper.

### Call: gọi service/dependency hiện có

Inject service đã tồn tại, dùng đúng phương thức và kiểu trả về. Không tạo service/dependency mới để làm ví dụ:

```ts
private async uploadDocumentFile(
  documentPath: string,
  fileBuffer: Buffer,
  contentType: string,
): Promise<void> {
  const uploadResult = await this.s3Service.uploadFile(
    documentPath,
    fileBuffer,
    contentType,
  );
  if (!uploadResult) {
    throw new InternalServerErrorException(
      ErrorMessages.ERR_CREATE_DOCUMENT_FAILED,
    );
  }
}
```

```ts
// Step 7: Upload the document
await this.uploadDocumentFile(documentPath, fileBuffer, contentType);
```

Nếu `Output` là `-`, chỉ `await` lời gọi. Xử lý lỗi đúng theo `On failure`; dùng dependency/service đã có trong source, không mặc định dự án có `S3Service`. Nếu lời gọi nằm trong transaction, chỉ coi nó là một phần transaction khi wiki yêu cầu và cơ chế đó thực sự bao gồm tác động ngoài database; không giả định rollback database có thể undo một API/S3 call.

### Return: dựng kết quả chính xác

Không trả toàn bộ Entity. Dựng đúng các property trong bảng `Response > Success`, với kiểu return tường minh.

Khi Service trả object nội bộ và Controller chuyển sang RO:

```ts
private async toPermissionResult(
  permission: PermissionEntity,
): Promise<{ id: number; name: string }> {
  return {
    id: permission.id,
    name: permission.name,
  };
}
```

```ts
// Step 8: Return the permission
return this.toPermissionResult(permission);
```

```ts
public async create(
  body: CreatePermissionDTO,
): Promise<{ id: number; name: string }> {
  // Các Step theo wiki...
}
```

Khi wiki yêu cầu không có response body (`204`):

```ts
public async update(permissionId: number): Promise<void> {
  // Các Step theo wiki...
  return;
}
```

Nếu khóa profile `3.3.4` quy định Service trả RO, dựng đúng data rồi chuyển trong hàm con:

```ts
private async toPermissionRO(
  permission: PermissionEntity,
): Promise<PermissionRO> {
  return plainToInstance(
    PermissionRO,
    { id: permission.id, name: permission.name },
    { excludeExtraneousValues: true },
  );
}
```

Import `plainToInstance` và RO theo source thực tế; không gọi chuyển đổi này nếu Controller là nơi chuyển sang RO.

### Next: tuần tự, nhánh và return sớm

Thực hiện đúng đồ thị `Next`; các comment giữ số Step của wiki. Mẫu nhánh chỉ áp dụng khi wiki nêu điều kiện:

```ts
// Step 2: Select the next action
let permission: PermissionEntity;
if (shouldCreate) {
  // Step 3: Create the permission
  permission = await this.createPermission(body.name);
} else {
  // Step 4: Find the existing permission
  permission = await this.findPermissionById(permissionId);
}

// Step 5: Return the permission
return await this.toPermissionResult(permission);
```

Trong method thực tế, khai báo biến bằng kiểu trả về của cả hai nhánh, ví dụ `let permission: PermissionEntity;`. `shouldCreate` ở đây là placeholder cho điều kiện đã có trong wiki. Nếu nhánh kết thúc sớm, dùng `return` ở nhánh tương ứng; không tự tạo điều kiện hoặc nhánh.

## Lỗi theo `On failure`

Trước `throw` đầu tiên, xác định nơi lưu lỗi, enum/constant và exception theo [`profile-contract.md`](../../docs-to-code/rules/profile-contract.md) mục 4. Ví dụ dưới đây minh họa việc nối lỗi từ wiki với status; tên member phải có trong dự án:

```ts
import { NotFoundException } from '@nestjs/common';
```

```ts
private async ensurePermissionExists(
  permission: PermissionEntity | null,
): Promise<PermissionEntity> {
  if (!permission) {
    throw new NotFoundException(ErrorMessages.PERMISSION_NOT_FOUND);
  }
  return permission;
}
```

| Wiki status | Exception mặc định của NestJS |
| --- | --- |
| 400 | `BadRequestException` |
| 401 | `UnauthorizedException` |
| 403 | `ForbiddenException` |
| 404 | `NotFoundException` |
| 409 | `ConflictException` |
| 422 | `UnprocessableEntityException` |
| 500 | `InternalServerErrorException` |
| Mã khác | `new HttpException(response, status)` theo định dạng lỗi của dự án |

Ví dụ mã status khác chỉ dùng khi wiki yêu cầu mã đó và profile quy định định dạng tương thích:

```ts
import { HttpException } from '@nestjs/common';
```

```ts
private async throwCustomFailure(status: number): Promise<never> {
  throw new HttpException(
    {
      message: ErrorMessages.CUSTOM_FAILURE,
      error: ErrorCodes.CUSTOM_FAILURE,
      statusCode: status,
    },
    status,
  );
}
```

Status trong `Response > Error` là kết quả cuối. Giữ nguyên message wiki từng ký tự; không viết message literal trực tiếp trong `throw`. Nếu `On failure` khác `Response > Error`, dừng và hỏi.

Ví dụ đối chiếu: nếu Error table ghi `404 | ERR_PERMISSION_NOT_FOUND | 2`, chỉ Step 2 được ánh xạ sang `NotFoundException(ErrorMessages.ERR_PERMISSION_NOT_FOUND)`; không đưa lỗi này vào Step 1 hoặc Step 3.

Nếu nhiều thao tác nằm trong cùng transaction và wiki gán cùng một lỗi cho nhóm đó, dùng mẫu transaction trong [`orm-typeorm.templates.md`](./orm-typeorm.templates.md): rollback, ghi log theo chuẩn dự án khi cần, rồi ném lỗi đã ánh xạ bằng enum/constant và giữ nguyên cause. Không nuốt lỗi hoặc trả thành công giả.

## Transaction

Chỉ dùng transaction khi wiki/người dùng yêu cầu rõ. Đọc cơ chế theo profile `3.3.5`; quy tắc phân định bước và xử lý lỗi nằm trong [`service.conventions.md`](../references/service.conventions.md#transaction-chỉ-khi-được-yêu-cầu). Cú pháp hoàn chỉnh `QueryRunner` nằm trong [`orm-typeorm.templates.md`](./orm-typeorm.templates.md#ví-dụ-có-transaction-queryrunner).

Hình dạng điều phối Service:

```ts
public async create(
  body: CreatePermissionDTO,
): Promise<PermissionEntity> {
  // Step 1: Find the related record (outside the transaction)
  const relatedRecord = await this.findRelatedRecord(body.relatedId);

  // Step 2: Check the related record (outside the transaction)
  await this.assertRelatedRecordExists(relatedRecord);

  // Steps 3-4: Perform wiki-required writes in one transaction
  const permission = await this.runInTransaction((queryRunner) =>
    this.createPermissionWrites(queryRunner, body, relatedRecord),
  );

  // Step 5: Return after commit
  return permission;
}
```

Mọi thao tác ghi bên trong `createPermissionWrites` phải dùng cùng transaction context qua Repository; không gọi Repository thường. `runInTransaction` phải connect/start, commit khi thành công, rollback khi lỗi, rethrow lỗi, và release trong `finally`. Nếu có nhiều bước ghi nhưng wiki không nói transaction, không tự thêm; ghi rõ trong báo cáo để người dùng quyết định.

## Checklist trước khi hoàn tất

- [ ] ORM đã được xác nhận; Entity cho các bảng cần dùng tồn tại.
- [ ] Đã kiểm tra DTO, Controller, Service, Repository, helper và lỗi hiện có trước khi thêm.
- [ ] Mỗi Step runtime có `// Step N` khớp wiki, đúng thứ tự và nhánh `Next`.
- [ ] Các Action đã được chuyển thành đúng mẫu Find, Check, Create, Update, Delete, Compute, Call hoặc Return; `Create helper` chỉ tạo mã nguồn.
- [ ] Tên biến khớp `Output`; field chỉ lấy từ wiki và Entity.
- [ ] Mã/trạng thái nghiệp vụ đã xác nhận dùng member enum/constant dùng chung; không có magic number/string trong điều kiện Service.
- [ ] Mỗi `On failure` được ánh xạ đúng status/message; không có message literal trong `throw`.
- [ ] Mỗi hàm khoảng 30 dòng tối đa, kiểu tham số/return tường minh.
- [ ] Transaction chỉ có khi được yêu cầu; mọi ghi dùng cùng transaction context.
- [ ] Return chỉ chứa property được tài liệu hóa và RO được tạo ở tầng theo profile `3.3.4`.
- [ ] Chữ ký khớp Controller; Module đăng ký Service, Repository và Entity cần thiết.
- [ ] Chạy kiểm tra biên dịch khi phù hợp; làm theo yêu cầu xác nhận của workflow trước khi thêm/chạy test.

## Mẫu báo cáo cuối

```text
- ORM và Entity đã xác nhận:
- File/method Service đã tạo hoặc cập nhật:
- Repository/helper/module đã cập nhật:
- Enum/constant lỗi đã dùng hoặc bổ sung:
- Giả định hoặc điểm cần xác nhận:
- Thiếu Entity/dependency hoặc Controller cần cập nhật:
- Transaction: có/không; nếu wiki không yêu cầu thì ghi chú:
- Kiểm tra đã chạy/chưa chạy:
```

## Ngoài phạm vi

- Không tạo Entity, DTO hay Controller.
- Không thêm bước, điều kiện, field hay transaction ngoài wiki/yêu cầu đã xác nhận.
- Không trả Entity đầy đủ nếu wiki chỉ yêu cầu một phần response.
- Không sửa file wiki.
