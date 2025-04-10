# Technical Context

## Development Environment

- OS Support: Cross-platform (primary development on macOS)
- Node.js Version: Latest LTS
- Package Manager: Yarn
- IDE: VS Code with recommended extensions

## Frontend Technologies

1. Core Framework

   - Next.js (Latest version)
   - React 18+
   - TypeScript 5.3+
   - Yarn

2. UI Framework

   - Tailwind CSS
   - shadcn components
   - Custom neumorphism design system

3. State Management & Data Fetching
   - React Hooks
   - TanStack Query
   - Axios for API calls

## Backend Technologies

1. Core Framework

   - NestJS (Latest version)
   - TypeScript 5.3+

2. Database

   - TypeORM for ORM
   - Migrations support

3. API
   - RESTful endpoints
   - OpenAPI/Swagger documentation
   - JWT authentication

## Development Tools

1. Code Quality

   - ESLint
   - Prettier
   - TypeScript strict mode

2. Testing

   - Jest for unit tests
   - React Testing Library
   - E2E testing support

3. Build & Deploy
   - Docker support
   - CI/CD with GitHub Actions

## Technical Constraints

1. Browser Support

   - Modern browsers (Chrome, Firefox, Safari, Edge)
   - Mobile responsive design

2. Performance

   - First contentful paint < 1.5s
   - Time to interactive < 3s
   - Optimized bundle size

3. Security
   - HTTPS only
   - Secure authentication
   - Input validation
   - XSS protection

## Dependencies

Key dependencies and their versions are managed in:

- Root package.json
- Web workspace package.json
- API workspace package.json
