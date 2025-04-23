# Active Context

## Current Focus

- Implementing and refining the personal finance management system "Thu Chi"
- Enhancing transaction and category management functionality
- Improving user experience with modern UI components
- Implementing secure authentication with refresh token mechanism
- Adding event tracking for financial events/occasions
- Planning and developing a comprehensive notification system

## Recent Changes

- Added refresh token functionality with token rotation for enhanced security
- Added automatic token refresh on 401 errors in the web application
- Configured different expiry times for access tokens (15m) and refresh tokens (7d)
- Added event tracking feature for financial occasions (trips, events, etc.)
- Improved UI components and fixed interaction issues in forms and dialogs
- Implemented settings module for user preferences
- Added reports module for financial analysis
- Started planning notification system architecture

## Active Decisions

1. Architecture

   - Monorepo structure for better code sharing between web and api
   - Separation of concerns with clear module boundaries
   - Type-safe development with TypeScript throughout
   - Prisma ORM for database interactions

2. UI/UX

   - Modern neumorphism design system
   - Dark mode support with theme customization
   - Component-based architecture with shadcn components
   - Consistent spacing and padding across pages
   - Responsive design for all device sizes

3. Authentication

   - JWT for both access and refresh tokens
   - Access tokens with short lifespan (15m) for security
   - Refresh tokens with longer lifespan (7d) for user experience
   - Automatic token refresh when API requests return 401 Unauthorized
   - Token rotation strategy for enhanced security

4. Data Model

   - Clear entity relationships between users, transactions, categories, events
   - Well-defined transaction types (income/expense)
   - User settings for customization preferences
   - Event tracking for financial occasions
   - Notification system entities (planned)

5. Development Workflow
   - Yarn for package management and workspace organization
   - ESLint and TypeScript for code quality
   - Prisma for database schema management
   - Next.js for frontend with app router structure
   - NestJS for backend API with module-based organization

## Next Steps

1. Frontend

   - Further improve form validation feedback
   - Enhance mobile responsiveness
   - Add advanced transaction filtering capabilities
   - Implement additional financial analytics and visualizations
   - Add multi-currency support
   - Implement notification center UI component

2. Backend

   - Implement token revocation for logout functionality
   - Add support for multiple devices with unique refresh tokens
   - Consider secure storage options (like HttpOnly cookies) for tokens
   - Add rate limiting for authentication endpoints
   - Implement batch operations for transactions
   - Add recurring transaction support
   - Develop notification module for alerts and reminders

3. Notification System

   - Create notification module with core functionality
   - Implement in-app notification storage and display
   - Develop notification preferences management
   - Set up budget and spending alert logic
   - Add WebSocket support for real-time notifications
   - Implement email notification delivery
   - Design smart notification scheduling system

4. Development Environment
   - Optimize build and deployment processes
   - Add automated testing for critical functionality
   - Continue refining component reusability
   - Address any remaining UI/UX issues

## Current Considerations

1. Technical

   - Strong typing across frontend and backend
   - Performance optimization for transaction listings and reports
   - Security enhancements for authentication system
   - Data model refinements for additional features
   - API performance optimization for large datasets
   - Real-time communication for notifications

2. UI/UX

   - Consistent component design throughout the application
   - Dialog and modal interaction patterns
   - Form component behavior standardization
   - Mobile-friendly interface optimizations
   - Clear visual feedback for user actions
   - Non-intrusive notification display

3. Development
   - Standardized patterns for form state management
   - Consistent error handling across the application
   - Code reuse strategies for similar components
   - Type sharing between frontend and backend
   - Documentation improvements
   - Notification system architecture and implementation
