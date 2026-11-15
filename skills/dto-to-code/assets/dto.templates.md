# Template Step 1: DTO

Quy tắc chi tiết: [`references/dto.conventions.md`](../references/dto.conventions.md).

Template này là **khung** cho dự án dùng class-validator/class-transformer. Điền placeholder từ wiki và quy ước dự án đã khảo sát; không chép nguyên ví dụ.

## Bảng placeholder

| Placeholder | Nguồn | Ý nghĩa |
| --- | --- | --- |
| `{Handler}` | Wiki Method + Path và dự án | Tên hành động, ví dụ `Create` |
| `{Entity}` | Wiki Path | Tên tài nguyên, ví dụ `Permission` |
| `{DtoSuffix}` | Quy ước dự án | Hậu tố class (`Dto` hoặc `DTO`) |
| `{dtoFile}` | Quy ước dự án | Tên file, ví dụ `create-permission.dto.ts` |
| `{dtoDir}` | Cấu trúc dự án | Thư mục chứa DTO |
| `{field}`, `{Type}` | Wiki `Body (Raw)` / `Query Params` / `Path Variables` | Tên và kiểu field |
| `{validators}` | Cột Required, Constraints, Type | Decorator `class-validator` |
| `{swagger}` | Cấu hình dự án và wiki | Decorator Swagger nếu phù hợp |

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

Điền field và decorator theo [`dto.conventions.md`](../references/dto.conventions.md); chỉ trim khi wiki hoặc dự án yêu cầu và không làm sai hợp đồng.

## Ví dụ đã điền (chỉ minh họa)

Wiki: `POST /permission`, `Body (Raw)` có `name | string | Y | max 255, trim`.

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
