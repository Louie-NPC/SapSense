# SapSense Backend Server

A simple local server using PostgreSQL database for the SapSense application.

---

## What You Need

Before starting, make sure you have:
- **Node.js** (version 18 or higher)
- **PostgreSQL** (version 14 or higher)
- **npm** (comes with Node.js)

---

## Step 1: Install PostgreSQL

### For Ubuntu/Debian Linux:

```bash
# Update your system
sudo apt update

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql

# Make it start automatically on boot
sudo systemctl enable postgresql
```

### For Windows:

1. Go to https://www.postgresql.org/download/windows/
2. Download the installer
3. Run the installer and follow the steps
4. Remember the password you set for the "postgres" user
5. Keep the default port (5432)

### For Mac:

```bash
# Using Homebrew
brew install postgresql

# Start PostgreSQL
brew services start postgresql
```

---

## Step 2: Create the Database

### Open PostgreSQL command line:

**Linux:**
```bash
sudo -u postgres psql
```

**Windows:**
- Open "SQL Shell (psql)" from Start Menu
- Press Enter for default values
- Enter your password

**Mac:**
```bash
psql postgres
```

### Create database and user:

Copy and paste these commands one by one:

```sql
-- Create a new database
CREATE DATABASE sapsense_db;

-- Create a new user with password
CREATE USER sapsense_user WITH PASSWORD 'sapsense123';

-- Give the user full access to the database
GRANT ALL PRIVILEGES ON DATABASE sapsense_db TO sapsense_user;

-- Connect to the database
\c sapsense_db

-- Give user access to create tables
GRANT ALL ON SCHEMA public TO sapsense_user;

-- Exit
\q
```

---

## Step 3: Set Up the Server

### Go to the server folder:

```bash
```bash
cd server
```

### Install packages:

```bash
npm install
```

### Create environment file:

Create a file called `.env` in the server folder:

```bash
# Database settings
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sapsense_db
DB_USER=sapsense_user
DB_PASSWORD=sapsense123

# Server settings
PORT=3001
NODE_ENV=development

# JWT Secret (for login tokens)
JWT_SECRET=your-super-secret-key-change-this
```

---

## Step 4: Create Database Tables

Run this command to create all tables:

```bash
npm run db:setup
```

This will create:
- users table
- employees table
- payroll table
- pay_periods table
- bonus_deductions table
- notifications table
- disputes table
- tree_containers table
- harvest table
- settings table

---

## Step 5: Add Sample Data (Optional)

To add demo data for testing:

```bash
npm run db:seed
```

This adds:
- 1 admin account
- 4 farmer accounts
- Sample payroll records
- Sample notifications

---

## Step 6: Start the Server

### For development (auto-restart on changes):

```bash
npm run dev
```

### For production:

```bash
npm start
```

The server will run at: **http://localhost:3001**

---

## Available Commands

| Command | What it does |
|---------|--------------|
| `npm run dev` | Start server (development mode) |
| `npm start` | Start server (production mode) |
| `npm run db:setup` | Create database tables |
| `npm run db:seed` | Add sample data |
| `npm run db:reset` | Delete all data and start fresh |

---

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register new user
- `POST /api/auth/logout` - Logout

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get one user
- `PUT /api/users/:id` - Update user

### Employees
- `GET /api/employees` - Get all employees
- `GET /api/employees/:id` - Get one employee
- `POST /api/employees` - Add employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

### Payroll
- `GET /api/payroll` - Get all payroll records
- `GET /api/payroll/:id` - Get one payroll record
- `POST /api/payroll` - Create payroll record
- `PUT /api/payroll/:id` - Update payroll record
- `PUT /api/payroll/:id/status` - Update payment status

### Pay Periods
- `GET /api/pay-periods` - Get all pay periods
- `POST /api/pay-periods` - Create pay period
- `PUT /api/pay-periods/:id` - Update pay period

### Bonus/Deductions
- `GET /api/bonus-deductions` - Get all
- `POST /api/bonus-deductions` - Add new
- `PUT /api/bonus-deductions/:id/status` - Approve/reject

### Notifications
- `GET /api/notifications` - Get all notifications
- `POST /api/notifications` - Create notification
- `PUT /api/notifications/:id/status` - Update status

### Tree Containers
- `GET /api/trees` - Get all trees
- `GET /api/trees/:id` - Get one tree
- `PUT /api/trees/:id` - Update tree data

---

## Troubleshooting

### "Connection refused" error

PostgreSQL is not running. Start it:

**Linux:**
```bash
sudo systemctl start postgresql
```

**Mac:**
```bash
brew services start postgresql
```

### "Password authentication failed"

Check your `.env` file has the correct password.

### "Database does not exist"

Run Step 2 again to create the database.

### "Permission denied"

Make sure you gave permissions to the user (Step 2).

---

## Demo Accounts

After running `npm run db:seed`:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@sapsense.com | admin123 |
| Farmer | juan@sapsense.com | farmer123 |
| Farmer | maria@sapsense.com | farmer123 |
| Farmer | pedro@sapsense.com | farmer123 |

---

## Need Help?

1. Make sure PostgreSQL is running
2. Check your `.env` file settings
3. Try `npm run db:reset` to start fresh
