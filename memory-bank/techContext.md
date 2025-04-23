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

   - Prisma ORM
   - PostgreSQL database
   - Database migrations with Prisma

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

## Notification System (Planned)

1. Backend Architecture

   - Dedicated Notification Module: `notification.module.ts`
   - Notification Service: `notification.service.ts` for creating and managing notifications
   - Notification Types: Budget alerts, security alerts, reminders, system updates
   - Delivery Channels: In-app, email, push notifications
   - Event-based Architecture: Using NestJS event emitters

2. Frontend Integration

   - Real-time Notifications: Using WebSockets (Socket.io) for immediate delivery
   - Notification Center: UI component for viewing and managing notifications
   - Toast Notifications: For immediate alerts and feedback
   - Notification Preferences: UI for customizing notification settings

3. Implementation Plan

   - Phase 1: In-app notification center with persistent storage
   - Phase 2: Email notification delivery
   - Phase 3: Push notifications for mobile devices
   - Phase 4: Smart notification scheduling and analytics

4. Data Model

   ```
   // Notification Entity
   notification {
     id          Int
     userId      Int
     type        NotificationType
     title       String
     content     String
     isRead      Boolean
     isActioned  Boolean
     metadata    Json
     createdAt   DateTime
     expiresAt   DateTime?
     priority    NotificationPriority
   }

   // User Notification Preferences
   notificationPreference {
     userId           Int
     channelType      NotificationChannelType
     isEnabled        Boolean
     notificationType NotificationType
   }
   ```

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
