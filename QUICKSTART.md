# Kira Task Manager - Quick Start Guide

## Prerequisites Check

Before starting, ensure you have:
- ✅ Node.js installed (v18+)
- ✅ MongoDB installed and running
- ✅ Git (optional)

## MongoDB Setup

### Option 1: Local MongoDB
If you don't have MongoDB installed locally, download from: https://www.mongodb.com/try/download/community

After installation, start MongoDB:
```bash
mongod
```

### Option 2: MongoDB Atlas (Cloud - Recommended)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a new cluster
4. Get your connection string
5. Update `MONGO_URI` in `Kira-Backend/.env` with your Atlas connection string

Example Atlas connection string:
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/kira-task-manager?retryWrites=true&w=majority
```

## Quick Start

### Terminal 1: Start Backend

```bash
# Navigate to backend
cd Kira-Backend

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

Expected output:
```
[dotenv] injecting env from .env
MongoDB Connected: <your-mongo-host>
Server running on port 8000
```

### Terminal 2: Start Frontend

```bash
# Navigate to frontend
cd Kira-Frontend

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

Expected output:
```
VITE v7.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

## Access the Application

Open your browser and go to: **http://localhost:5173**

## First Steps

### 1. Create an Admin Account
- Click "Sign up"
- Fill in your details
- In "Admin Invite Token", enter: **123456**
- Click "Sign up"
- You'll be redirected to the Admin Dashboard

### 2. Create a User Account
- Open another browser (or incognito window)
- Go to http://localhost:5173
- Click "Sign up"
- Fill in your details
- Leave "Admin Invite Token" empty
- Click "Sign up"
- You'll be redirected to the User Dashboard

### 3. Create a Task (As Admin)
- Click "Create Task" in the sidebar
- Fill in:
  - Title: "Complete project documentation"
  - Description: "Write comprehensive README"
  - Priority: High
  - Due Date: (select a date)
- Click "Assign Members" to select team members
- Add checklist items (optional)
- Click "Create Task"

### 4. View Tasks (As User)
- Login as the user you created
- Go to "My Tasks"
- You'll see the tasks assigned to you
- Click on a task to view details
- Update status and mark checklist items

## Common Issues

### Issue: "Cannot connect to MongoDB"
**Solution**: 
- Make sure MongoDB is running
- Check your MONGO_URI in `.env`
- Try using MongoDB Atlas (cloud option)

### Issue: "Port 8000 already in use"
**Solution**: 
- Change PORT in `Kira-Backend/.env` to another port (e.g., 8001)
- Update API_BASE_URL in `Kira-Frontend/src/utils/apiPaths.js` and `axiosInstance.js`

### Issue: "CORS error"
**Solution**: 
- Make sure backend is running
- Check CLIENT_URL in `Kira-Backend/.env` matches your frontend URL

### Issue: "Module not found"
**Solution**: 
```bash
# In backend folder
cd Kira-Backend
rm -rf node_modules package-lock.json
npm install

# In frontend folder
cd Kira-Frontend
rm -rf node_modules package-lock.json
npm install
```

## Default Credentials for Testing

After creating accounts, you can use these for testing:

**Admin:**
- Email: admin@kira.com
- Password: admin123
- Token: 123456

**User:**
- Email: user@kira.com  
- Password: user123

## Features to Test

- [ ] Register admin with token
- [ ] Register regular user
- [ ] Login as admin
- [ ] View admin dashboard
- [ ] Create a new task
- [ ] Assign task to user
- [ ] Add checklist items
- [ ] View team members
- [ ] Download task report
- [ ] Login as user
- [ ] View assigned tasks
- [ ] Update task status
- [ ] Mark checklist items complete
- [ ] Logout

## API Testing (Optional)

You can test the API directly using tools like:
- Postman
- Thunder Client (VS Code extension)
- curl

Backend API runs on: **http://localhost:8000/api**

Health check: http://localhost:8000

## Need Help?

Check the main README.md for detailed documentation and API endpoints.

## Stop Servers

To stop the servers:
- Press `Ctrl + C` in both terminal windows
