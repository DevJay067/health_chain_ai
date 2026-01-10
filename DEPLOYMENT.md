# Deployment Guide - Blockchain Health Records

## Overview
This application consists of:
- **Frontend**: React + Vite (deployed on Netlify)
- **Backend**: FastAPI (needs to be deployed separately)
- **Database**: MongoDB

## Netlify Deployment (Frontend)

### Configuration
The `netlify.toml` file is already configured with:
- Build command: `yarn build`
- Publish directory: `dist`
- API proxy redirects to backend

### Environment Variables
In Netlify dashboard, set:
```
VITE_API_URL=
```
(Leave empty - it will use relative URLs which are proxied to backend)

### Deploy Steps
1. Connect your GitHub repository to Netlify
2. Netlify will automatically detect the build settings from `netlify.toml`
3. Deploy!

## Backend Deployment

### Option 1: Deploy to Emergent Platform (Recommended)
The backend is already configured to run on Emergent's platform at:
`https://back-to-bmax.preview.emergentagent.com`

### Option 2: Deploy to Other Platforms

#### Railway / Render / Fly.io
1. Create a new Python project
2. Set the start command: `uvicorn server:app --host 0.0.0.0 --port $PORT`
3. Set environment variables:
   ```
   MONGO_URL=<your-mongodb-connection-string>
   DB_NAME=health_records_db
   ```
4. Deploy the `/backend` directory

#### Heroku
1. Create `Procfile` in backend directory:
   ```
   web: uvicorn server:app --host 0.0.0.0 --port $PORT
   ```
2. Deploy and set environment variables

### MongoDB Setup
Use MongoDB Atlas (free tier available):
1. Create cluster at https://cloud.mongodb.com
2. Get connection string
3. Set `MONGO_URL` environment variable

## Important Notes

### API Proxy Configuration
The `netlify.toml` includes:
```toml
[[redirects]]
  from = "/api/*"
  to = "https://YOUR-BACKEND-URL/api/:splat"
  status = 200
  force = true
```

**Update the backend URL** in `netlify.toml` to match your deployed backend URL.

### Local Development
1. Start backend: `cd backend && uvicorn server:app --reload`
2. Start frontend: `cd /app && yarn dev`
3. Frontend will proxy `/api/*` requests to `http://localhost:8001`

## Features
- ✅ Blockchain-based health record storage
- ✅ File upload support (5MB limit)
- ✅ Cryptographic hashing (SHA-256)
- ✅ Proof-of-work mining
- ✅ Real-time record verification
- ✅ Responsive UI with modern design

## Tech Stack
- **Frontend**: React, Vite, TailwindCSS, Shadcn UI
- **Backend**: FastAPI, Motor (async MongoDB)
- **Database**: MongoDB
- **Blockchain**: Custom implementation with proof-of-work
