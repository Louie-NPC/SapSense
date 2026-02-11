# 🥥 SapSense Web Application

A comprehensive coconut sap monitoring and farm management system with employee payroll, harvest tracking, and real-time analytics.

---

## 🚀 Quick Start Guide - Running the Server

### Prerequisites

Before running the application, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- **npm** (comes with Node.js)
- **PostgreSQL** (v14 or higher) - [Download PostgreSQL](https://www.postgresql.org/download/)

### Step 1: Clone the Repository

```bash
git clone <YOUR_GIT_URL>
cd Sapsense-Web-main
```

### Step 2: Set Up PostgreSQL Database

1. **Start PostgreSQL service:**
   ```bash
   # Linux
   sudo systemctl start postgresql
   
   # macOS (Homebrew)
   brew services start postgresql
   
   # Windows - Start from Services or pgAdmin
   ```

2. **Create the database and user:**
   ```bash
   # Access PostgreSQL
   sudo -u postgres psql
   
   # Run these SQL commands:
   CREATE USER sapsense_user WITH PASSWORD 'sapsense123';
   CREATE DATABASE sapsense_db OWNER sapsense_user;
   GRANT ALL PRIVILEGES ON DATABASE sapsense_db TO sapsense_user;
   \q
   ```

### Step 3: Configure Environment Variables

1. **Navigate to the server folder:**
   ```bash
   cd server
   ```

2. **Create `.env` file from example:**
   ```bash
   cp .env.example .env
   ```

3. **Edit `.env` if needed (default values work for local development):**
   ```env
   # Database Settings
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=sapsense_db
   DB_USER=sapsense_user
   DB_PASSWORD=sapsense123
   
   # Server Settings
   PORT=3001
   NODE_ENV=development
   
   # JWT Secret (change in production!)
   JWT_SECRET=your-super-secret-key-change-this-in-production
   ```

### Step 4: Install Dependencies & Initialize Database

```bash
# Install server dependencies
cd server
npm install

# Set up database schema
npm run db:setup

# Seed database with demo data
npm run db:seed

# Go back to root folder
cd ..

# Install frontend dependencies
npm install
```

### Step 5: Run the Application

**Option A: Run both servers in separate terminals**

```bash
# Terminal 1 - Backend Server (from server folder)
cd server
npm run dev
# Server runs on http://localhost:3001

# Terminal 2 - Frontend (from root folder)
npm run dev
# Frontend runs on http://localhost:5173 (or similar)
```

**Option B: Quick start commands**

```bash
# Start backend (in server folder)
cd server && npm run dev

# In another terminal, start frontend (in root folder)
npm run dev
```

### Step 6: Access the Application

Open your browser and navigate to: **http://localhost:5173**

### 📋 Demo Accounts

| Role    | Email                | Password   |
|---------|---------------------|------------|
| Admin   | admin@sapsense.com  | admin123   |
| Farmer  | juan@sapsense.com   | farmer123  |
| Farmer  | maria@sapsense.com  | farmer123  |
| Farmer  | pedro@sapsense.com  | farmer123  |

### 🔧 Useful Commands

| Command | Location | Description |
|---------|----------|-------------|
| `npm run dev` | `/server` | Start backend server with hot reload |
| `npm run start` | `/server` | Start backend server (production) |
| `npm run db:setup` | `/server` | Initialize database schema |
| `npm run db:seed` | `/server` | Seed database with demo data |
| `npm run db:reset` | `/server` | Reset database (drops and recreates) |
| `npm run dev` | `/` (root) | Start frontend development server |
| `npm run build` | `/` (root) | Build frontend for production |

### ⚠️ Troubleshooting

**PostgreSQL Connection Issues:**
- Ensure PostgreSQL service is running
- Verify database credentials in `.env` match your PostgreSQL setup
- Check if the database `sapsense_db` exists

**Port Already in Use:**
- Backend default: `3001` - Change `PORT` in `.env`
- Frontend default: `5173` - Vite will auto-increment if busy

**Database Schema Errors:**
```bash
# Reset and reinitialize the database
cd server
npm run db:reset
npm run db:seed
```

---

## Project Info

**URL**: https://lovable.dev/projects/d6fe8141-1782-49b0-92b4-7ec812749d0b

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/d6fe8141-1782-49b0-92b4-7ec812749d0b) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/d6fe8141-1782-49b0-92b4-7ec812749d0b) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
