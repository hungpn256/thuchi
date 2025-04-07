# API Development Checklist

## 1. Chuẩn bị

- [ ] Xác định rõ yêu cầu và mục đích của API
- [ ] Xác định các endpoint cần thiết
- [ ] Xác định cấu trúc request/response
- [ ] Xác định các validation rules
- [ ] Xác định các error cases

## 2. DTOs & Validation

### Request DTOs

- [ ] Tạo DTO cho request body (nếu có)
  - [ ] Thêm các decorator validation (@IsString, @IsNumber, etc.)
  - [ ] Thêm các decorator Swagger (@ApiProperty)
  - [ ] Thêm các giá trị example cho Swagger
  - [ ] Kiểm tra các trường bắt buộc/không bắt buộc

### Query Parameters

- [ ] Tạo DTO cho query parameters (nếu có)
  - [ ] Extend từ base DTO nếu cần (PaginationQueryDto, DateRangeQueryDto)
  - [ ] Thêm các decorator validation
  - [ ] Thêm các decorator Swagger
  - [ ] Xử lý type transformation (@Type)

### Path Parameters

- [ ] Validate path parameters
  - [ ] Sử dụng ParseIntPipe, ParseUUIDPipe nếu cần
  - [ ] Thêm các decorator Swagger (@ApiParam)

## 3. Response

- [ ] Xác định cấu trúc response
- [ ] Tạo response DTO/interface nếu cần
- [ ] Thêm các decorator Swagger (@ApiResponse)
  - [ ] Success response với example
  - [ ] Error responses với description

## 4. Error Handling

- [ ] Xác định và xử lý các trường hợp lỗi có thể xảy ra
  - [ ] ValidationException cho invalid input
  - [ ] NotFoundException cho resource không tồn tại
  - [ ] UnauthorizedException cho lỗi xác thực
  - [ ] ForbiddenException cho lỗi phân quyền
  - [ ] ConflictException cho conflict data
  - [ ] BadRequestException cho các lỗi business logic

## 5. Security

- [ ] Thêm các guard cần thiết (@UseGuards)
- [ ] Thêm các decorator role/permission nếu cần
- [ ] Kiểm tra quyền truy cập resource
- [ ] Validate user input để prevent injection

## 6. Documentation

- [ ] @ApiTags cho nhóm API
- [ ] @ApiOperation với summary và description
- [ ] @ApiResponse cho tất cả status codes có thể xảy ra
- [ ] Examples cho request/response
- [ ] Thêm các chú thích cần thiết trong code

## 7. Testing

- [ ] Unit tests cho service logic
- [ ] Integration tests cho API endpoints
- [ ] Test cases cho các validation
- [ ] Test cases cho error handling
- [ ] Test cases cho business logic

## 8. Performance & Optimization

- [ ] Thêm caching nếu cần
- [ ] Optimize database queries
- [ ] Implement pagination nếu trả về list
- [ ] Kiểm tra N+1 query problem

## 9. Code Quality

- [ ] Tuân thủ naming conventions
- [ ] Sử dụng các constants/enums thay vì magic strings
- [ ] Tách business logic vào service
- [ ] Sử dụng dependency injection
- [ ] Comment code khi cần thiết

## 10. Final Review

- [ ] Review lại tất cả validation rules
- [ ] Kiểm tra tất cả error cases
- [ ] Verify API documentation
- [ ] Test API với Swagger UI
- [ ] Kiểm tra performance với large dataset
- [ ] Code review với team members

## Example Usage

### Controller

```typescript
@ApiTags('Resource')
@Controller('resource')
export class ResourceController {
  @Post()
  @ApiOperation({
    summary: 'Create new resource',
    description: 'Detailed description...',
  })
  @ApiResponse({ status: 201, description: 'Created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async create(@Body() createDto: CreateResourceDto) {
    try {
      return await this.service.create(createDto);
    } catch (error) {
      if (error instanceof SomeError) {
        throw new BadRequestException('Error message');
      }
      throw error;
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get resources' })
  async findAll(@Query() queryDto: ResourceQueryDto) {
    return this.service.findAll(queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get resource by ID' })
  @ApiParam({ name: 'id', description: 'Resource ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const resource = await this.service.findOne(id);
    if (!resource) {
      throw new NotFoundException('Resource');
    }
    return resource;
  }
}
```

### DTO

```typescript
export class CreateResourceDto {
  @ApiProperty({
    description: 'Resource name',
    example: 'Example Resource',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Resource description',
  })
  @IsString()
  @IsOptional()
  description?: string;
}

export class ResourceQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by status',
    enum: ResourceStatus,
  })
  @IsEnum(ResourceStatus)
  @IsOptional()
  status?: ResourceStatus;
}
```
