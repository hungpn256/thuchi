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

## Contributing

Mọi đóng góp đều được hoan nghênh! Vui lòng tạo issue hoặc pull request để đóng góp.

## License

MIT
