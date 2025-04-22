# THU CHI - Personal Finance Management Application

Thu Chi is a comprehensive personal finance management application designed to help users track their income and expenses effectively with a modern, intuitive interface.

![Thu Chi App](https://via.placeholder.com/800x400?text=Thu+Chi+App)

## 🌟 Features

- **Transaction Management**

  - Create, edit, and delete financial transactions
  - Categorize transactions as income or expense
  - Assign transactions to custom categories
  - Filter transactions by date range
  - Track transaction history

- **Category Management**

  - Create and manage custom categories
  - Organize finances with a personalized category system

- **User Experience**

  - Modern UI with neumorphism design
  - Dark mode support
  - Responsive design for all devices
  - Optimized forms with validation

- **Data Visualization**
  - Summary reports with income vs expenses overview
  - Category-wise breakdown analysis with interactive pie chart
  - Monthly trend analysis with time-series charts
  - Historical comparison with prior periods
  - Visual indicators for financial performance

## 🏗️ Project Structure

This is a monorepo containing two main workspaces:

- **Web (`/web`)**: Next.js frontend application
- **API (`/api`)**: NestJS backend API
- **Shared (`/shared`)**: Common types and utilities

## 🚀 Technology Stack

### Frontend (Web)

- [Next.js](https://nextjs.org/) - React framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [shadcn/ui](https://ui.shadcn.com/) - UI component system
- [TanStack Query](https://tanstack.com/query) - Data fetching
- [React Hook Form](https://react-hook-form.com/) - Form management
- [Yup](https://github.com/jquense/yup) - Schema validation

### Backend (API)

- [NestJS](https://nestjs.com/) - Node.js framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Prisma](https://www.prisma.io/) - ORM
- [PostgreSQL](https://www.postgresql.org/) - Database
- [JWT](https://jwt.io/) - Authentication

## 🛠️ Installation & Setup

### Prerequisites

- Node.js >= 18.x
- PostgreSQL
- Yarn (recommended) or npm

### Setup Steps

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/thuchi.git
cd thuchi
```

2. **Install dependencies**

```bash
# Install root dependencies
yarn install

# Install workspace dependencies
yarn workspaces run install
```

3. **Environment Configuration**

```bash
# Copy example env files
cp api/.env.example api/.env
cp web/.env.example web/.env

# Edit .env files with your configuration
```

4. **Start Development Servers**

```bash
# Start both web and API in development mode
yarn dev

# Start with colored output for better visibility
yarn dev:pretty

# Or start individually
yarn start:web   # Start only the web application
yarn start:api   # Start only the API server
```

## 📱 Usage Examples

### Transaction Management

The application provides a streamlined interface for managing financial transactions:

- **Transaction List**: View all transactions with filtering by date range
- **Create Transaction**: Add new income or expense transactions with detailed information
- **Edit Transaction**: Update existing transaction details
- **Delete Transaction**: Remove unwanted transactions with confirmation

### Form Experience

Forms are designed with excellent UX in mind:

- **Validation**: Real-time form validation with clear error messages
- **Category Selection**: Easy category selection with search functionality
- **Date Picker**: Intuitive calendar interface for selecting dates
- **Type Selection**: Visual distinction between income and expense transactions

### Reports System

The application offers powerful reporting capabilities for financial analysis:

- **Summary Report**:

  - Overview dashboard with total income, expenses, and balance
  - Interactive line chart showing monthly trends
  - Visual representation of financial health

- **Category Report**:

  - Detailed breakdown of spending or income by category
  - Interactive pie chart for visualizing proportion of each category
  - Tabular data with precise amounts and percentages
  - Toggle between income and expense analysis

- **Trend Report**:
  - Comparative analysis between time periods
  - Support for various comparison periods (previous week, month, year, or custom)
  - Change indicators showing growth or decline
  - Visual cues (colors and arrows) to highlight positive/negative changes

Each report includes:

- Flexible date range selection
- Transaction type filtering (income/expense)
- Responsive design for all devices
- Real-time data updates

## 🧪 Testing

```bash
# Run all tests
yarn test

# Run frontend tests
yarn workspace web test

# Run backend tests
yarn workspace api test
```

## 📖 Documentation

For more detailed documentation:

- **Web Application**: See [web/README.md](web/README.md)
- **API**: See [api/README.md](api/README.md)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
