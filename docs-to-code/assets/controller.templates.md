# Template Step 2: Controller

Quy tắc chi tiết: [`references/controller.conventions.md`](../references/controller.conventions.md).

Template này là **khung**. Phần trong `{...}` điền từ profile (số khóa bên cạnh) hoặc wiki.

## Bảng placeholder

| Placeholder | Nguồn | Ý nghĩa |
| --- | --- | --- |
| `{Entity}`, `{entity}` | Wiki Path (đoạn đầu), `1.5.x` | Tên tài nguyên (Pascal / kebab) |
| `{Controller}` | `1.3.1` | Tên class, ví dụ `{Entity}Controller` |
| `{prefix}` | `1.5.1` | Global prefix; không lặp trong `@Controller()` |
| `{HttpMethod}` | Wiki Method | `Get`, `Post`, `Patch`, ... |
| `{route}` | Wiki Path phần còn lại | Đường dẫn con, kể cả `:param` |
| `{handler}` | `1.5.4` | Tên handler theo Method + Path |
| `{authDecorator}` | `4.2.2` | Decorator phân quyền; `N/A` thì bỏ |
| `{RoleEnum.ROLE}` | `4.2.3`, `4.2.5` | Ánh xạ cột `Roles` của wiki |
| `{DtoClass}` | `1.3.2` | DTO của Step 1 |
| `{Service}` | `1.3.1`, `1.2.3` | Service tương ứng |
| `{swagger}` | `5.1.x` | Decorator Swagger; `N/A` thì bỏ |

## Khung

```ts
@Controller('{entity}')
export class {Controller} {
  constructor(private readonly {service}: {Service}) {}

  /**
   * {Purpose}
   * @route {METHOD} {path}
   */
  @{HttpMethod}('{route}')
  {authDecorator}({RoleEnum.ROLE})
  {swagger}
  {handler}(@Body() body: {DtoClass}) {
    {handlerBody}
  }
}
```

`{handlerBody}` chọn theo khóa `3.3.4`:

| `3.3.4` | Thân handler |
| --- | --- |
| Controller chuyển sang RO | `const result = await this.{service}.{handler}(body); return plainToInstance({RoClass}, result, { excludeExtraneousValues: true });` |
| Service trả RO | `return this.{service}.{handler}(body);` |

Quy tắc riêng của skill: Controller không có `try/catch`, không chứa logic nghiệp vụ, mỗi handler có comment `@route`.

## Ví dụ đã điền (chỉ minh họa, theo profile `umee-api`: `3.3.4` = Controller chuyển RO)

```ts
@Controller('permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  /**
   * Create a new permission.
   * @route POST /permission
   */
  @Post()
  @RoleJwtGuards(Role.Admin)
  async create(@Body() body: CreatePermissionDTO) {
    const result = await this.permissionService.create(body);
    return plainToInstance(CreatePermissionRO, result, {
      excludeExtraneousValues: true,
    });
  }
}
```

Import dùng đường dẫn thực tế của dự án; ví dụ trên không liệt kê import.
