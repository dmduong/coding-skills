# Template Step 4: RO (Response Object)

Quy tắc chi tiết: [`references/ro-exception.conventions.md`](../references/ro-exception.conventions.md).

## Bảng placeholder

| Placeholder | Nguồn | Ý nghĩa |
| --- | --- | --- |
| `{RoClass}` | Quy ước dự án | Tên response class |
| `{roFile}`, `{roDir}` | Cấu trúc dự án | Tên file và thư mục response |
| `{property}`, `{Type}` | Wiki `Response > Success`, bảng Property | Tên và kiểu property |
| `{NestedRO}` | Wiki (property object hoặc mảng object) | Class lồng nhau |

## Khung

Ví dụ này chỉ áp dụng nếu dự án dùng `class-transformer`; nếu không, theo serializer hiện có hoặc map object tường minh.

```ts
import { Expose, Type } from 'class-transformer';

export class {RoClass} {
  /** {Description} */
  @Expose()
  {property}: {Type};
}
```

## Chuyển Entity sang RO

Áp dụng quy tắc và chọn nơi chuyển theo [`ro-exception.conventions.md`](../references/ro-exception.conventions.md#step-42-kết-nối-ro-với-service). Ví dụ theo tầng: [`controller.templates.md`](../../controller-to-code/assets/controller.templates.md) và [`service.templates.md`](../../service-to-code/assets/service.templates.md).

## Ví dụ đã điền (chỉ minh họa)

```ts
import { Expose, Type } from 'class-transformer';

export class PermissionItemRO {
  @Expose()
  id: number;

  @Expose()
  name: string;
}

export class GetListPermissionRO {
  @Expose()
  @Type(() => PermissionItemRO)
  items: PermissionItemRO[];

  @Expose()
  totalItems: number;
}
```
