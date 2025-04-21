# Thu Chi API

API quản lý thu chi cá nhân được xây dựng bằng NestJS và Prisma.

## Công nghệ sử dụng

- [NestJS](https://nestjs.com/) - Node.js framework
- [Prisma](https://www.prisma.io/) - Next-generation ORM
- [PostgreSQL](https://www.postgresql.org/) - Relational database
- [TypeScript](https://www.typescriptlang.org/) - JavaScript with syntax for types
- [Docker](https://www.docker.com/) - Containerization platform

## Cài đặt

### Yêu cầu

- Node.js (>= 18.x)
- PostgreSQL
- Docker (tùy chọn)

### Cài đặt thông thường

1. Clone repository:

```bash
git clone <repository-url>
cd api
```

2. Cài đặt dependencies:

```bash
yarn install
# hoặc
npm install
```

3. Cấu hình môi trường:

- Tạo file `.env` từ `.env.example`
- Cập nhật các biến môi trường

4. Khởi tạo database:

```bash
npx prisma migrate dev
```

5. Khởi động server:

```bash
yarn start:dev
# hoặc
npm run start:dev
```

### Cài đặt với Docker

```bash
docker-compose up -d
```

## Cấu trúc thư mục

```
src/
├── configs/      # Cấu hình ứng dụng
├── constants/    # Các hằng số
├── modules/      # Các module của ứng dụng
├── shared/       # Shared resources
└── main.ts       # Entry point
```

## API Endpoints

### Auth

- `POST /auth/login` - Đăng nhập
- `POST /auth/register` - Đăng ký

### Transactions

- `GET /transactions` - Lấy danh sách giao dịch
- `POST /transactions` - Tạo giao dịch mới
- `PUT /transactions/:id` - Cập nhật giao dịch
- `DELETE /transactions/:id` - Xóa giao dịch

### Categories

- `GET /categories` - Lấy danh sách danh mục
- `POST /categories` - Tạo danh mục mới
- `PUT /categories/:id` - Cập nhật danh mục
- `DELETE /categories/:id` - Xóa danh mục

## Authentication

The API uses JWT for authentication with a refresh token mechanism:

### Access and Refresh Tokens

- **Access Token**: Short-lived token (15 minutes) used for API authentication
- **Refresh Token**: Long-lived token (7 days) used to obtain a new access token

### Authentication Endpoints

- **Login**: `POST /auth/login` - Returns both access and refresh tokens
- **Register**: `POST /auth/register` - Returns both access and refresh tokens
- **Refresh Token**: `POST /auth/refresh-token` - Get a new access token using a refresh token
- **Profile**: `GET /auth/profile` - Get the authenticated user's profile

### Authentication Flow

1. User logs in and receives access token and refresh token
2. Access token is used for API requests
3. When access token expires, the client uses the refresh token to get a new access token
4. If refresh token is invalid or expired, user must log in again

### Security Considerations

- Access tokens have a short lifespan to minimize the impact of token theft
- Refresh tokens have a longer lifespan but are only used to obtain new access tokens
- All authentication endpoints are protected against brute force attacks
- HTTPS should be used in production to protect token transmission

## Scripts

- `yarn start:dev` - Khởi động development server
- `yarn build` - Build ứng dụng
- `yarn start:prod` - Khởi động production server
- `yarn test` - Chạy unit tests
- `yarn test:e2e` - Chạy end-to-end tests

## Contributing

Mọi đóng góp đều được hoan nghênh! Vui lòng tạo issue hoặc pull request để đóng góp.

## License

MIT
