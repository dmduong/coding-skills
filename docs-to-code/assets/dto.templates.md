# Template Step 1: DTO

Quy tắc chi tiết: [`references/dto.conventions.md`](../references/dto.conventions.md).

Template này là **khung**. Phần trong `{...}` là placeholder phải điền từ profile (số khóa ghi bên cạnh) hoặc từ wiki. Không chép nguyên ví dụ ở cuối.

## Bảng placeholder

| Placeholder | Nguồn | Ý nghĩa |
| --- | --- | --- |
| `{Handler}` | Wiki Method + Path, đặt tên theo `1.5.4` | Tên hành động, ví dụ `Create` |
| `{Entity}` | Wiki Path | Tên tài nguyên, ví dụ `Permission` |
| `{DtoSuffix}` | `1.3.2` | Hậu tố class (`Dto` hoặc `DTO`) |
| `{dtoFile}` | `1.2.5` | Tên file, ví dụ `create-permission.dto.ts` |
| `{dtoDir}` | `3.1.4` | Thư mục chứa DTO |
| `{field}`, `{Type}` | Wiki `Body (Raw)` / `Query Params` / `Path Variables` | Tên và kiểu field |
| `{validators}` | Cột Required, Constraints, Type | Decorator `class-validator` |
| `{swagger}` | `5.1.5` | Decorator Swagger; `N/A` thì bỏ |

## Khung

```ts
import { {transformImports} } from 'class-transformer';
import { {validatorImports} } from 'class-validator';
{swaggerImport}

export class {Handler}{Entity}{DtoSuffix} {
  /** {Description} */
  {swagger}
  {transformers}
  {validators}
  {field}: {Type};
}
```

Quy tắc điền (riêng của skill):

- Mỗi dòng trong bảng wiki là một field; không thêm field ngoài wiki.
- `Required = Y` thì `@IsNotEmpty()`, ngược lại `@IsOptional()`.
- Cột Constraints ánh xạ sang decorator tương ứng (`max 255` thành `@MaxLength(255)`).
- Chuỗi người dùng nhập thì thêm `@Transform` trim.

## Ví dụ đã điền (chỉ minh họa, theo profile `umee-api`)

Wiki: `POST /permission`, `Body (Raw)` có `name | string | Y | max 255`.

```ts
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreatePermissionDTO {
  /** Permission name */
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;
}
```
