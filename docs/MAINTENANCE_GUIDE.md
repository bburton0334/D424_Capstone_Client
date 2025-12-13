# Maintenance & Setup Guide
## SkyTrack - Air Freight Tracking Platform

**Version:** 1.0  
**Date:** December 2025  
**Audience:** Users setting up and running the application

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Project Structure](#project-structure)
3. [Development Setup](#development-setup)
4. [Database Setup](#database-setup)
5. [Environment Configuration](#environment-configuration)
6. [Running the Application](#running-the-application)
7. [Building for Production](#building-for-production)
8. [Troubleshooting](#troubleshooting)

---

## 1. Prerequisites

### Required Software

| Software | Version | Purpose |
|----------|---------|---------|
| Node.js | 18.x or higher | JavaScript runtime |
| npm | 9.x or higher | Package manager |
| Git | 2.x or higher | Version control |

### Required Accounts & API Keys

| Service | Purpose | Signup URL |
|---------|---------|------------|
| Supabase | Database & Auth | https://supabase.com |
| OpenWeatherMap | Weather data | https://openweathermap.org/api |
| OpenSky Network | Flight data | https://opensky-network.org (Optional - no key needed for basic access) |

---

## 2. Project Structure

```
d424-software-engineering-capstone/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/            # Page components
│   │   ├── services/         # API service functions
│   │   ├── types/            # TypeScript type definitions
│   │   ├── utils/            # Utility functions
│   │   ├── App.tsx           # Main app component
│   │   ├── main.tsx          # Entry point
│   │   └── index.css         # Global styles
│   ├── package.json
│   └── vite.config.ts
├── server/                    # Express backend
│   ├── src/
│   │   ├── classes/          # OOP class implementations
│   │   ├── config/           # Configuration files
│   │   ├── middleware/       # Express middleware
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic services
│   │   ├── types/            # TypeScript type definitions
│   │   └── index.ts          # Server entry point
│   └── package.json
├── database/
│   └── schema.sql            # Database schema
├── docs/                      # Documentation
└── README.md
```

---

## 3. Development Setup

### Step 1: Clone the Repository

```bash
git clone https://gitlab.com/wgu-gitlab-environment/student-repos/bburto121/d424-software-engineering-capstone.git
cd d424-software-engineering-capstone
```

### Step 2: Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Step 3: Verify Installation

```bash
# Check Node version
node --version  # Should be 18.x or higher

# Check npm version
npm --version   # Should be 9.x or higher
```

---

## 4. Database Setup

### Step 1: Create Supabase Project

1. Go to https://supabase.com and sign in
2. Click "New Project"
3. Enter project details:
   - Name: `skytrack`
   - Database Password: (save this securely)
   - Region: (choose closest to your users)
4. Wait for project to initialize (~2 minutes)

### Step 2: Run Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Open a new query
3. Copy contents of `database/schema.sql`
4. Click **Run** to execute

### Step 3: Get API Keys

In Supabase dashboard, go to **Settings > API**:
- Copy `Project URL` → `SUPABASE_URL`
- Copy `anon public` key → `SUPABASE_ANON_KEY`
- Copy `service_role` key → `SUPABASE_SERVICE_KEY`

### Step 4: Configure Authentication

1. Go to **Authentication > Providers**
2. Ensure **Email** provider is enabled
3. (Optional) Configure email templates under **Email Templates**

---

## 5. Environment Configuration

### Server Environment (.env)

Create `server/.env`:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_KEY=your-service-role-key-here

# External APIs
OPENWEATHER_API_KEY=your-openweather-api-key

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

### Client Environment (.env)

Create `client/.env`:

```env
VITE_API_URL=http://localhost:3000/api
```

### Getting OpenWeatherMap API Key

1. Sign up at https://openweathermap.org/api
2. Go to **API Keys** in your account
3. Generate a new API key
4. Wait 10-15 minutes for activation

---

## 6. Running the Application

### Development Mode

**Terminal 1 - Start Backend:**
```bash
cd server
npm run dev
```
Server will start at `http://localhost:3000`

**Terminal 2 - Start Frontend:**
```bash
cd client
npm run dev
```
Client will start at `http://localhost:5173`

### Verify Everything Works

1. Open `http://localhost:5173` in browser
2. Register a new account
3. Check Supabase dashboard for new user in **Authentication > Users**
4. Create a test shipment
5. Check **Table Editor > shipments** for new record

---

## 7. Building for Production

### Build Server

```bash
cd server
npm run build
```

Output: `server/dist/`

### Build Client

```bash
cd client
npm run build
```

Output: `client/dist/`

### Run Production Build

```bash
# Server
cd server
npm start

# Client (serve static files)
cd client
npm run preview
```

---

## 8. Troubleshooting

### Common Issues

#### "CORS Error" in Browser Console

**Cause:** Backend URL not matching CORS configuration

**Solution:**
```env
# In server/.env, ensure CORS_ORIGIN matches your frontend URL
CORS_ORIGIN=http://localhost:5173
```

#### "Invalid API Key" from Supabase

**Cause:** Wrong or missing environment variables

**Solution:**
1. Verify `.env` file exists in `server/` directory
2. Check keys match exactly from Supabase dashboard
3. Restart server after changing `.env`

#### "OpenWeatherMap API Error"

**Cause:** API key not activated or invalid

**Solution:**
1. Wait 15-30 minutes after creating new API key
2. Verify key at https://api.openweathermap.org/data/2.5/weather?q=London&appid=YOUR_KEY

#### Database Tables Not Found

**Cause:** Schema not executed

**Solution:**
1. Go to Supabase SQL Editor
2. Re-run `database/schema.sql`
3. Check **Table Editor** for tables

#### TypeScript Compilation Errors

**Solution:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install

# Clear TypeScript cache
rm -rf dist
npm run build
```

### Log Locations

- **Server Logs:** Terminal running `npm run dev`
- **Client Logs:** Browser Developer Console (F12)
- **Database Logs:** Supabase Dashboard > Logs

### Health Checks

```bash
# Check server is running
curl http://localhost:3000/api/health

# Check database connection
curl http://localhost:3000/api/auth/user

# Check external APIs
curl "http://localhost:3000/api/weather/city/London"
```

---

## Maintenance Tasks

### Update Dependencies

```bash
# Check for outdated packages
npm outdated

# Update packages
npm update

# Update to latest major versions (use caution)
npx npm-check-updates -u
npm install
```

### Database Backup

In Supabase dashboard:
1. Go to **Settings > Database**
2. Click **Database Backups**
3. Download or schedule backups

### Clear Cached Data

```sql
-- Clear old weather data (run in Supabase SQL Editor)
DELETE FROM weather_data WHERE fetched_at < NOW() - INTERVAL '24 hours';

-- Clear old weather impacts
DELETE FROM weather_impacts WHERE recorded_at < NOW() - INTERVAL '30 days';
```
