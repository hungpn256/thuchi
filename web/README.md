# Thu Chi Web Application

Ứng dụng web quản lý thu chi cá nhân được xây dựng bằng Next.js và Typescript.

## Công nghệ sử dụng

- [Next.js](https://nextjs.org/) - React framework
- [TypeScript](https://www.typescriptlang.org/) - JavaScript with syntax for types
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Radix UI](https://www.radix-ui.com/) - Unstyled, accessible components
- [React Hook Form](https://react-hook-form.com/) - Form validation
- [Yup](https://github.com/jquense/yup) - Schema validation
- [React Query](https://tanstack.com/query/latest) - Data fetching and caching
- [Recharts](https://recharts.org/) - Charting library

## Cài đặt

1. Clone repository:

```bash
git clone <repository-url>
cd web
```

2. Cài đặt dependencies:

```bash
yarn install
# hoặc
npm install
```

3. Khởi động môi trường development:

```bash
yarn dev
# hoặc
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) trên trình duyệt để xem kết quả.

## Cấu trúc thư mục

```
src/
├── app/          # App router pages
├── components/   # React components
├── contexts/     # React contexts
├── hooks/        # Custom hooks
├── lib/          # Utility functions
├── providers/    # App providers
├── styles/       # Global styles
└── types/        # TypeScript types
```

## Scripts

- `yarn dev` - Khởi động development server
- `yarn build` - Build ứng dụng cho production
- `yarn start` - Khởi động production server
- `yarn lint` - Kiểm tra lỗi với ESLint

## Tính năng

- 📊 Dashboard tổng quan
- 💰 Quản lý thu chi
- 📅 Lịch sử giao dịch
- 📈 Biểu đồ thống kê
- 🏷️ Quản lý danh mục
- 📱 Responsive design

## Authentication

The application uses JWT for authentication with a refresh token mechanism:

### Access and Refresh Tokens

- **Access Token**: Short-lived token (15 minutes) used for API authentication
- **Refresh Token**: Long-lived token (7 days) used to obtain a new access token

### Auth Flow

1. User logs in and receives access token and refresh token
2. Tokens are stored in localStorage
3. Access token is included in API request headers
4. When an API request returns 401 Unauthorized, the application automatically:
   - Attempts to refresh the access token using the refresh token
   - Retries the original request with the new access token
   - If refresh fails, redirects to the login page

### Security Features

- Automatic token refresh handling
- Token rotation with each refresh
- Queue mechanism for handling multiple concurrent requests during token refresh

### Auth Hooks

The application provides several authentication hooks:

```typescript
const {
  login, // Login with email/password
  register, // Register a new user
  loginWithGoogle, // Login with Google
  refreshToken, // Manually refresh the token
  logout, // Logout the user
  isLoading, // Loading state
  error, // Error state
} = useAuth();
```

## Contributing

Mọi đóng góp đều được hoan nghênh! Vui lòng tạo issue hoặc pull request để đóng góp.

## License

MIT
