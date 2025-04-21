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
   - Axios for API calls with automatic token refresh

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
   - JWT authentication with refresh token support

## Authentication System

1. Backend (NestJS)

   - JWT Authentication: Using `@nestjs/jwt` for token generation and validation
   - Access Tokens: Short-lived tokens (15 minutes) used for API authorization
   - Refresh Tokens: Long-lived tokens (7 days) for obtaining new access tokens
   - Passport.js Integration: Using the JWT strategy to validate tokens

   Key files:

   - `auth.service.ts`: Handles token generation, validation, and refresh
   - `auth.controller.ts`: Exposes authentication endpoints
   - `jwt.strategy.ts`: Implements the JWT strategy for Passport
   - `jwt-auth.guard.ts`: Guard for protecting routes

2. Frontend (Next.js)

   - Token Storage: Tokens are stored in localStorage
   - Automatic Token Refresh: Using Axios interceptors to refresh tokens on 401 errors
   - Request Queue: Mechanism to queue requests during token refresh
   - Auth Hook: `useAuth` hook for login, register, and token management

   Key files:

   - `axios-client.ts`: Configures Axios with token refresh interceptors
   - `use-auth.ts`: Custom hook for authentication actions
   - `auth.ts`: Types for authentication data
   - `app.constant.ts`: Constants for API endpoints and storage keys

3. Authentication Flow

   - User logs in and receives access token and refresh token
   - Access token is included in API request headers
   - When access token expires (401 response), the application automatically:
     - Attempts to refresh the access token using the refresh token
     - Retries the original request with the new access token
     - If refresh fails, redirects to the login page
   - Each refresh generates new access and refresh tokens (token rotation)

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
   - Secure authentication with token refresh
   - Token rotation for enhanced security
   - Input validation
   - XSS protection

## Dependencies

Key dependencies and their versions are managed in:

- Root package.json
- Web workspace package.json
- API workspace package.json
