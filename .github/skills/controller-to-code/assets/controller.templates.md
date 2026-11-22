# Template Step 2: Controller

Quy tắc chi tiết: [`references/controller.conventions.md`](../references/controller.conventions.md).

Template này là **khung**. Phần trong `{...}` điền từ quy ước dự án đã khảo sát hoặc wiki.

## Bảng placeholder

| Placeholder | Nguồn | Ý nghĩa |
| --- | --- | --- |
| `{Entity}`, `{entity}` | Wiki Path và dự án | Tên tài nguyên (Pascal / kebab) |
| `{Controller}` | Quy ước dự án | Tên class, ví dụ `{Entity}Controller` |
| `{prefix}` | Bootstrap dự án | Global prefix; không lặp trong `@Controller()` |
| `{HttpMethod}` | Wiki Method | `Get`, `Post`, `Patch`, ... |
| `{route}` | Wiki Path phần còn lại | Đường dẫn con, kể cả `:param` |
| `{handler}` | Wiki và quy ước dự án | Tên handler theo Method + Path |
| `{authDecorator}` | Guard/decorator dự án | Chỉ dùng khi đã xác minh |
| `{RoleEnum.ROLE}` | Wiki và role dự án | Ánh xạ cột `Roles` |
| `{DtoClass}` | DTO của Step 1 | Kiểu request |
| `{Service}` | Service dự án | Service tương ứng |
| `{swagger}` | Cấu hình dự án và wiki | Decorator Swagger nếu phù hợp |

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

`{handlerBody}` chọn theo cơ chế response của dự án; chỉ dùng `plainToInstance` nếu dự án dùng class-transformer:

| Cách dự án xử lý | Thân handler |
| --- | --- |
| Controller chuyển sang RO | `const result = await this.{service}.{handler}(body); return plainToInstance({RoClass}, result, { excludeExtraneousValues: true });` |
| Service trả RO | `return this.{service}.{handler}(body);` |

Controller không chứa logic nghiệp vụ; comment theo quy ước dự án.

## Ví dụ đã điền (chỉ minh họa, terrarium hư cấu)

```ts
@Controller('terrariums')
export class TerrariumController {
  constructor(
    private readonly climateReadingService: ClimateReadingService,
  ) {}

  /**
   * Record a climate reading.
   * @route POST /v1/terrariums/:terrariumCode/readings
   */
  // Add the verified authorization decorator for the fictional TerrariumOperator role.
  @Post(':terrariumCode/readings')
  async createClimateReading(
    @Param('terrariumCode') terrariumCode: string,
    @Body() body: CreateClimateReadingDTO,
  ) {
    const result = await this.climateReadingService.create(
      terrariumCode,
      body,
    );
    return plainToInstance(ClimateReadingRO, result, {
      excludeExtraneousValues: true,
    });
  }
}
```

Import dùng đường dẫn thực tế của dự án; ví dụ trên không liệt kê import. Tên role và DTO chỉ thuộc API hư cấu, không đại diện cho role hay class có sẵn.
