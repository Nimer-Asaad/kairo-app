# Kira Task Manager - MERN Stack Application

A full-featured task management system with role-based authentication (Admin & User), built with MongoDB, Express, React (Vite), and Node.js.

## Features

### Authentication
- **Sign Up**: Register with fullName, email, password, avatar upload
- **Admin Registration**: Use 6-digit token (123456) to register as admin
- **Login**: Email and password authentication
- **JWT-based** role-based access control

### Admin Features
- **Dashboard**: View statistics (total, pending, in-progress, completed tasks), charts, and recent tasks
- **Manage Tasks**: Filter tasks by status (All/Pending/In Progress/Completed), view task cards, download reports
- **Create Task**: Create tasks with title, description, priority, due date, assign to multiple team members, add checklist (subtasks), and attachments
- **Team Members**: View all team members with their task statistics, download team report

### User Features
- **User Dashboard**: View assigned task statistics and recent tasks
- **My Tasks**: View and filter assigned tasks, update task status, mark checklist items as complete

## Tech Stack

### Backend
- Node.js & Express.js
- MongoDB with Mongoose
- JWT for authentication
- Bcrypt for password hashing
- Multer for file uploads
- CORS enabled

### Frontend
- React 19 with Vite
- React Router v6
- Axios for API calls
- Tailwind CSS for styling
- Context API for state management

## Project Structure

```
Kira-Backend/
├── config/
│   └── db.js              # MongoDB connection
├── controllers/
│   ├── authController.js  # Auth logic
│   ├── taskController.js  # Task CRUD
│   ├── userController.js  # User management
│   └── reportController.js # Report generation
├── middlewares/
│   ├── authMiddleware.js  # JWT verification
│   └── uploadMiddleware.js # File upload
├── models/
│   ├── User.js            # User schema
│   └── Task.js            # Task schema
├── routes/
│   ├── authRoutes.js
│   ├── taskRoutes.js
│   ├── userRoutes.js
│   └── reportRoutes.js
├── uploads/               # Avatar uploads
├── .env
├── server.js
└── package.json

Kira-Frontend/
├── src/
│   ├── components/
│   │   └── Sidebar.jsx    # Shared sidebar
│   ├── context/
│   │   └── AuthContext.jsx # Auth state
│   ├── pages/
│   │   ├── Auth/
│   │   │   ├── Login.jsx
│   │   │   └── SignUp.jsx
│   │   ├── Admin/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ManageTasks.jsx
│   │   │   ├── CreateTask.jsx
│   │   │   └── ManageUsers.jsx
│   │   └── User/
│   │       ├── UserDashboard.jsx
│   │       └── MyTasks.jsx
│   ├── routes/
│   │   └── PrivateRoute.jsx # Protected routes
│   ├── utils/
│   │   ├── apiPaths.js
│   │   ├── axiosInstance.js
│   │   ├── helper.js
│   │   ├── data.js
│   │   └── uploadImage.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── package.json
└── vite.config.js
```

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd Kira-Backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables in `.env`:
   ```env
   PORT=8000
   MONGO_URI=mongodb://localhost:27017/kira-task-manager
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   ADMIN_INVITE_TOKEN=123456
   CLIENT_URL=http://localhost:5173
   ```

4. Start MongoDB (if running locally):
   ```bash
   mongod
   ```

5. Run the backend server:
   ```bash
   npm run dev
   ```
   
   Backend will run on `http://localhost:8000`

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd Kira-Frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   
   Frontend will run on `http://localhost:5173`

## Usage

### First Time Setup

1. **Register as Admin**:
   - Go to `http://localhost:5173/signup`
   - Fill in your details
   - Upload an avatar (optional)
   - Enter admin invite token: `123456`
   - Click "Sign up"

2. **Register as User**:
   - Go to `http://localhost:5173/signup`
   - Fill in your details
   - Leave admin invite token empty
   - Click "Sign up"

3. **Login**:
   - Go to `http://localhost:5173/login`
   - Enter your email and password
   - You'll be redirected based on your role

### Admin Workflow

1. **Dashboard**: View overall statistics and charts
2. **Create Task**: 
   - Click "Create Task" in sidebar
   - Fill in task details
   - Assign to team members
   - Add checklist items
   - Add attachment links
3. **Manage Tasks**: View, filter, and download task reports
4. **Team Members**: View team statistics and download reports

### User Workflow

1. **Dashboard**: View your assigned tasks statistics
2. **My Tasks**:
   - View your assigned tasks
   - Filter by status
   - Click on a task to view details
   - Update task status
   - Check off completed subtasks

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Tasks
- `GET /api/tasks` - Get all tasks (filtered by role)
- `GET /api/tasks/:id` - Get task by ID
- `POST /api/tasks` - Create task (admin only)
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task (admin only)
- `GET /api/tasks/stats/overview` - Get task statistics (admin only)

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID (admin only)
- `GET /api/users/team/stats` - Get team statistics (admin only)
- `PUT /api/users/:id` - Update user (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)

### Reports
- `GET /api/reports/tasks` - Generate task report (admin only)
- `GET /api/reports/team` - Generate team report (admin only)

## Testing Checklist

- [ ] Backend server starts without errors
- [ ] Frontend server starts without errors
- [ ] MongoDB connection successful
- [ ] Can register as admin with invite token
- [ ] Can register as regular user
- [ ] Can login with valid credentials
- [ ] Admin sees admin dashboard
- [ ] Admin can create tasks
- [ ] Admin can assign tasks to users
- [ ] Admin can view all tasks
- [ ] Admin can download reports
- [ ] User sees only assigned tasks
- [ ] User can update task status
- [ ] User can check off checklist items
- [ ] Protected routes redirect properly
- [ ] Logout works correctly

## Troubleshooting

### Backend Issues
- **MongoDB connection error**: Make sure MongoDB is running
- **Port already in use**: Change PORT in `.env`
- **Module not found**: Run `npm install` again

### Frontend Issues
- **API calls failing**: Check if backend is running on port 8000
- **CORS errors**: Verify CLIENT_URL in backend `.env`
- **Build errors**: Delete `node_modules` and run `npm install` again

## Production Deployment

### Backend
1. Set proper environment variables
2. Use a production MongoDB instance (MongoDB Atlas)
3. Change JWT_SECRET to a secure random string
4. Enable HTTPS
5. Set up proper CORS origins

### Frontend
1. Update API base URL in `apiPaths.js` and `axiosInstance.js`
2. Build: `npm run build`
3. Deploy the `dist` folder to hosting service (Vercel, Netlify, etc.)

## License

MIT License - feel free to use this project for learning and development.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.
