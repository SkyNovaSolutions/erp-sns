# ERP System

A full-stack ERP (Enterprise Resource Planning) system built with Next.js 16, PostgreSQL, Prisma 7, and Tailwind CSS.

## Features

### 1. Company Management
- Add and manage companies
- Track company balance
- View employees and transactions per company

### 2. Employee Management
- Add employees to companies
- Track employee details (name, email, phone, position)
- Assign tasks to employees

### 3. Money Management
- Track company transactions (credits/debits)
- Automatic balance updates
- Transaction history with filtering
- Real-time balance display

### 4. Order Management
- Create and manage orders
- Status tracking: Active, On Hold, In Meeting, Completed
- Filter orders by status
- Quick status updates

### 5. Todo/Task Management
- Create tasks with descriptions
- Assign tasks to employees
- Status tracking: Pending, In Progress, Completed
- Quick toggle to mark as complete

## Tech Stack

- **Framework**: Next.js 16+ (App Router)
- **Language**: JavaScript
- **Database**: PostgreSQL
- **ORM**: Prisma 6
- **Styling**: Tailwind CSS
- **Auth**: Session-based authentication

## Getting Started

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database running

### Installation

1. **Navigate to project**
   ```bash
   cd e:\SNS\erp-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   
   Edit `.env` file with your database credentials:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/erp_db"
   SESSION_SECRET="your-super-secret-session-key"
   ```

4. **Generate Prisma client**
   ```bash
   npx prisma generate
   ```

5. **Push database schema**
   ```bash
   npx prisma db push
   ```

6. **Run development server**
   ```bash
   npm run dev
   ```

7. **Open in browser**
   
   Visit [http://localhost:3000](http://localhost:3000)

### First Time Setup

1. Go to `/register` to create an admin account
2. Login with your credentials
3. Start by adding a Company
4. Add Employees to the company
5. Create Orders and Todos as needed
6. Use the Money module to track transactions

## Project Structure

```
erp-system/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Authentication
│   │   │   ├── companies/     # Company CRUD
│   │   │   ├── employees/     # Employee CRUD
│   │   │   ├── transactions/  # Money transactions
│   │   │   ├── orders/        # Order management
│   │   │   └── todos/         # Task management
│   │   ├── dashboard/         # Dashboard pages
│   │   │   ├── companies/
│   │   │   ├── employees/
│   │   │   ├── money/
│   │   │   ├── orders/
│   │   │   └── todos/
│   │   ├── login/
│   │   └── register/
│   ├── components/
│   │   ├── layout/            # Sidebar, Topbar
│   │   └── ui/                # Reusable components
│   └── lib/
│       ├── prisma.js          # Database client
│       ├── auth.js            # Authentication utilities
│       └── api-error.js       # Error handling
├── .env                       # Environment variables
└── package.json
```

## Database Models

- **User**: Admin authentication (not for employees)
- **Company**: Company with balance
- **Employee**: Employees linked to companies
- **MoneyTransaction**: Credit/debit transactions
- **Order**: Orders with status tracking
- **Todo**: Tasks assignable to employees

## API Endpoints

### Auth
- `POST /api/auth/register` - Register admin
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/session` - Get session

### Companies
- `GET /api/companies` - List companies
- `POST /api/companies` - Create company
- `GET /api/companies/[id]` - Get company
- `PUT /api/companies/[id]` - Update company
- `DELETE /api/companies/[id]` - Delete company

### Employees
- `GET /api/employees` - List employees
- `POST /api/employees` - Create employee
- `GET /api/employees/[id]` - Get employee
- `PUT /api/employees/[id]` - Update employee
- `DELETE /api/employees/[id]` - Delete employee

### Transactions
- `GET /api/transactions` - List transactions
- `POST /api/transactions` - Create transaction

### Orders
- `GET /api/orders` - List orders (filter by status)
- `POST /api/orders` - Create order
- `PUT /api/orders/[id]` - Update order status
- `DELETE /api/orders/[id]` - Delete order

### Todos
- `GET /api/todos` - List todos
- `POST /api/todos` - Create todo
- `PUT /api/todos/[id]` - Update todo
- `DELETE /api/todos/[id]` - Delete todo

## License

MIT
# ERP-SYSTEM
