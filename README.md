# Finance Data Processing & Access Control Backend

A backend system for managing financial records with role-based access control, built using **Node.js**, **Express**, and **MongoDB**.

---

## Features

- **User Authentication** – Register, login, JWT-based auth
- **Role-Based Access Control** – Three roles: Viewer, Analyst, Admin
- **Financial Records CRUD** – Create, read, update, soft-delete transactions
- **Filtering & Pagination** – Filter by type, category, date range with paginated results
- **Search** – Search across category and description fields
- **Dashboard Analytics** – Income/expense summaries, category breakdowns, monthly trends
- **Input Validation** – Request validation using express-validator
- **Error Handling** – Consistent error responses with proper HTTP status codes

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Auth**: JSON Web Tokens (JWT)
- **Security**: bcryptjs for password hashing
- **Validation**: express-validator

## Project Structure

```
├── server.js                       # Entry point, middleware setup, error handling
├── src/
│   ├── config/
│   │   └── db.js                   # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js       # Register, login, get profile
│   │   ├── userController.js       # User management (admin)
│   │   ├── recordController.js     # Financial records CRUD + filters
│   │   └── dashboardController.js  # Aggregations & analytics
│   ├── middleware/
│   │   ├── auth.js                 # JWT verification
│   │   ├── roleCheck.js            # Role-based access control
│   │   └── validate.js             # Validation error handler
│   ├── models/
│   │   ├── User.js                 # User schema + password hashing
│   │   └── Record.js               # Financial record schema
│   ├── routes/
│   │   ├── authRoutes.js           # Auth endpoints
│   │   ├── userRoutes.js           # User management endpoints
│   │   ├── recordRoutes.js         # Record CRUD endpoints
│   │   └── dashboardRoutes.js      # Dashboard analytics endpoints
│   └── utils/
│       ├── ApiError.js             # Custom error class with status codes
│       └── seed.js                 # Database seeder script
├── .gitignore
├── package.json
└── README.md
```

## Setup & Installation

### Prerequisites

- Node.js (v16 or above)
- MongoDB (running locally or a MongoDB Atlas URI)

### Steps

1. **Clone the repository**

```bash
git clone https://github.com/Abhishekyadav1807/Zorvynassignment.git
cd Zorvynassignment
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**

Create a `.env` file in the root directory with the following variables:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/finance_db
JWT_SECRET=your_jwt_secret_here
```

Replace `MONGO_URI` with your MongoDB connection string and set a strong `JWT_SECRET`.

4. **Seed the database** (optional – creates test users and sample records)

```bash
node src/utils/seed.js
```

This creates 3 test users (one per role) and 30 sample financial records.

5. **Start the server**

```bash
# development (auto-restart on changes)
npm run dev

# production
npm start
```

Server runs at `http://localhost:5000`

---

## API Endpoints

### Authentication

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register a new user | Public |
| POST | `/api/auth/login` | Login and receive JWT | Public |
| GET | `/api/auth/me` | Get logged-in user profile | Authenticated |

### User Management (Admin only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List all users |
| GET | `/api/users/:id` | Get a specific user |
| PUT | `/api/users/:id/role` | Change user role |
| PUT | `/api/users/:id/status` | Activate or deactivate user |

### Financial Records

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/records` | List records (with filters) | Analyst, Admin |
| GET | `/api/records/:id` | Get a single record | Analyst, Admin |
| POST | `/api/records` | Create a new record | Admin |
| PUT | `/api/records/:id` | Update a record | Admin |
| DELETE | `/api/records/:id` | Soft delete a record | Admin |

**Query parameters for `GET /api/records`:**

| Parameter | Description | Example |
|-----------|-------------|---------|
| `type` | Filter by income or expense | `?type=income` |
| `category` | Filter by category (case-insensitive) | `?category=salary` |
| `search` | Search across category and description | `?search=freelance` |
| `startDate` | Filter from this date | `?startDate=2024-01-01` |
| `endDate` | Filter up to this date | `?endDate=2024-12-31` |
| `page` | Page number (default: 1) | `?page=2` |
| `limit` | Records per page (default: 20, max: 100) | `?limit=10` |

### Dashboard Analytics

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/dashboard/summary` | Total income, expense, net balance | All roles |
| GET | `/api/dashboard/category-summary` | Category-wise breakdown | All roles |
| GET | `/api/dashboard/monthly-trends` | Monthly income/expense trends | All roles |
| GET | `/api/dashboard/recent` | Recent transactions | All roles |

**Dashboard query parameters:**

- `GET /api/dashboard/monthly-trends?months=6` – number of months to look back (default: 12)
- `GET /api/dashboard/recent?limit=5` – number of recent records (default: 10, max: 50)

---

## Role Permissions

| Action | Viewer | Analyst | Admin |
|--------|--------|---------|-------|
| View dashboard summaries | ✅ | ✅ | ✅ |
| View financial records | ❌ | ✅ | ✅ |
| Create / update / delete records | ❌ | ❌ | ✅ |
| Manage users & roles | ❌ | ❌ | ✅ |

---

## Sample API Usage

### Register a new user

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "John", "email": "john@test.com", "password": "pass123"}'
```

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "password123"}'
```

### Create a financial record (Admin)

```bash
curl -X POST http://localhost:5000/api/records \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"amount": 5000, "type": "income", "category": "Freelance", "description": "Website project"}'
```

### Get records with filters

```bash
curl "http://localhost:5000/api/records?type=expense&category=food&page=1&limit=10" \
  -H "Authorization: Bearer <token>"
```

### Get dashboard summary

```bash
curl http://localhost:5000/api/dashboard/summary \
  -H "Authorization: Bearer <token>"
```

---

## Assumptions & Design Decisions

1. **Soft Delete** – Records are soft-deleted (`isDeleted: true`) rather than permanently removed. This keeps data for audit purposes and ensures dashboard analytics stay consistent.

2. **Default Role** – New users get the `viewer` role by default. Only an admin can promote users to `analyst` or `admin`.

3. **Password Handling** – Passwords are hashed with bcryptjs (10 salt rounds) before storage. The password field is excluded from all query results by default using Mongoose `select: false`.

4. **Token Expiry** – JWT tokens are valid for 7 days. After that, users need to log in again.

5. **Inactive Users** – Deactivated users cannot log in or access any API endpoint, but their data is preserved in the database.

6. **Dashboard Access** – All authenticated users including viewers can access dashboard summary endpoints since these return aggregate read-only data, not individual records.

7. **Self-Protection** – Admins cannot change their own role or deactivate their own account to prevent accidental lockout.

8. **Data Indexes** – The Record model has indexes on `type`, `category`, `date`, and `isDeleted` to optimize common filter queries.

## Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "message": "Error description here"
}
```

Validation errors include field-level details:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Please provide a valid email" },
    { "field": "password", "message": "Password must be at least 6 characters" }
  ]
}
```

The global error handler also catches:
- **Invalid ObjectId** – Returns 400 with "Invalid ID format"
- **Duplicate key** – Returns 400 with field-specific message
- **Mongoose validation** – Returns 400 with all validation errors
- **Unknown routes** – Returns 404

## Test Credentials (after running seed script)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | password123 |
| Analyst | analyst@example.com | password123 |
| Viewer | viewer@example.com | password123 |
