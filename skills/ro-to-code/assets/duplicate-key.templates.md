# Ví dụ Step 4.4: Lỗi trùng khóa trong database

Điều kiện áp dụng và quy tắc: [`references/ro-exception.conventions.md`](../references/ro-exception.conventions.md).

Một helper để phát hiện lỗi trùng khóa của MySQL (`ER_DUP_ENTRY`), không import thêm thư viện nào. Thêm vào `src/common/utils/db-error.util.ts` nếu dự án chưa có helper tương đương:

```ts
export function isDuplicateKeyError(error: unknown): boolean {
  const e = error as { code?: string; driverError?: { code?: string } };
  return e?.code === 'ER_DUP_ENTRY' || e?.driverError?.code === 'ER_DUP_ENTRY';
}
```

Dùng trong Service xung quanh bước create (ví dụ: Step 3 của step 3):

```ts
try {
  permission = await this.permissionRepository.save(
    this.permissionRepository.create({ name: body.name }),
  );
} catch (error) {
  if (isDuplicateKeyError(error)) {
    throw new ConflictException(ErrorMessage.PERMISSION_NAME_ALREADY_EXISTS);
  }
  throw error;
}
```
