# Template Step 4: RO (Response Object)

Quy tắc chi tiết: [`references/ro-exception.conventions.md`](../references/ro-exception.conventions.md).

## Bảng placeholder

| Placeholder | Nguồn | Ý nghĩa |
| --- | --- | --- |
| `{RoClass}` | `1.3.3` | Tên class RO (hậu tố `RO` hoặc `Ro`) |
| `{roFile}`, `{roDir}` | `1.2.6`, `3.1.4` | Tên file và thư mục RO |
| `{property}`, `{Type}` | Wiki `Response > Success`, bảng Property | Tên và kiểu property |
| `{NestedRO}` | Wiki (property object hoặc mảng object) | Class lồng nhau |

## Khung

```ts
import { Expose, Type } from 'class-transformer';

export class {RoClass} {
  /** {Description} */
  @Expose()
  {property}: {Type};
}
```

Quy tắc riêng của skill:

- Chỉ khai báo property có trong bảng Property của wiki; mỗi property có `@Expose()`.
- Property là object hoặc mảng object: thêm `@Type(() => {NestedRO})` và khai báo class lồng nhau trong cùng file.
- Kiểu `id` theo Entity và wiki (`number` hoặc `string` cho UUID).

## Chuyển Entity sang RO

Dùng `plainToInstance({RoClass}, data, { excludeExtraneousValues: true })` (quy tắc riêng của skill). **Nơi gọi** theo khóa `3.3.4`:

| `3.3.4` | Nơi gọi |
| --- | --- |
| Controller chuyển sang RO | Controller, bọc kết quả Service (xem [`controller.templates.md`](./controller.templates.md)) |
| Service trả RO | Service, ở bước `Return` (xem [`service.templates.md`](./service.templates.md)) |

Nếu dự án bọc phản hồi bằng cơ chế riêng (khóa `3.3.x`, ví dụ helper của `BaseService`), đặt kết quả `plainToInstance` vào bên trong cơ chế đó.

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
