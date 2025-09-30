# Agent Management System - MERN Stack Application

A full-stack application built with MERN (MongoDB/SQLite, Express, React, Node.js) for managing agents and distributing contact lists.

## Features

- **Admin Login**: Secure authentication using JWT tokens
- **Agent Management**: Add and manage agents with details (name, email, mobile, password)
- **File Upload & Distribution**: Upload CSV/Excel files and automatically distribute items equally among agents
- **View Distributions**: Display distributed lists for each agent

## Tech Stack

### Backend
- Node.js & Express.js
- SQLite Database ( MongoDB was unsuccessful due to database interaction issues)
- JWT Authentication
- Multer (File Upload)
- CSV Parser & XLSX (File Processing)
- bcryptjs (Password Hashing)

### Frontend
- React.js
- React Router DOM
- Axios
- Context API for State Management

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Installation & Setup

### 1. Start Backend Server

```bash
# In terminal 1
cd backend
npm install
npm start
```

The backend will start on `http://localhost:5000`

### 2. Start Frontend Development Server

```bash
# In terminal 2
cd frontend
npm install
npm start
```

The frontend will open automatically in your default browser at `http://localhost:3000`

### 3. Login Credentials

Use these credentials to log in:
- **Email:** `admin@example.com`
- **Password:** `admin@123`

## Detailed Setup

### Backend Configuration

Environment variables (already configured in `.env`):
```
PORT=5000
JWT_SECRET=your_jwt_secret_change_this_in_production
NODE_ENV=development
```

### Frontend Configuration

The frontend is configured to proxy API requests to `http://localhost:5000`

## Usage Guide

### 1. Login
- Open `http://localhost:3000` in your browser
- Use the default admin credentials to login
- You will be redirected to the dashboard

### 2. Add Agents
- Click on "Add Agents" in the dashboard
- Fill in the agent details:
  - Name
  - Email
  - Mobile Number (with country code)
  - Password (minimum 6 characters)
- Click "Add Agent"
- The agent will appear in the registered agents list

### 3. Upload & Distribute Files
- Click on "Upload & Distribute" in the dashboard
- Prepare a CSV or Excel file with the following columns:
  - `FirstName` (Required)
  - `Phone` (Required)
  - `Notes` (Optional)
- Click "Choose File" and select your CSV/XLSX/XLS file
- Click "Upload & Distribute"
- The system will automatically distribute items equally among all agents

### 4. View Distributions
- Click on "View Distributions" in the dashboard
- See all distributed items organized by agent
- View summary statistics

## File Format Requirements

Your CSV or Excel file must contain these columns:

| FirstName | Phone      | Notes           |
|-----------|------------|-----------------|
| John      | 1234567890 | VIP Customer    |
| Sarah     | 9876543210 | Follow up needed|
| Mike      | 5551234567 | New lead        |

### Accepted File Types
- `.csv` - Comma Separated Values
- `.xlsx` - Excel 2007+
- `.xls` - Excel 97-2003

## Distribution Logic

- Items are distributed **equally** among all registered agents
- If the total number of items is not divisible by the number of agents, remaining items are distributed sequentially starting from the first agent
- Example: 27 items with 5 agents = Each gets 5 items, then 2 agents get 1 extra item each

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login

### Agents
- `GET /api/agents` - Get all agents (Protected)
- `POST /api/agents` - Create new agent (Protected)

### Upload & Distribution
- `POST /api/upload` - Upload file and distribute (Protected)
- `GET /api/upload/distributions` - Get all distributions (Protected)

## Project Structure

```
Speed/
├── backend/
│   ├── config/
│   │   └── database.js          # SQLite database configuration
│   ├── middleware/
│   │   └── auth.js               # JWT authentication middleware
│   ├── routes/
│   │   ├── auth.js               # Authentication routes
│   │   ├── agents.js             # Agent management routes
│   │   └── upload.js             # File upload and distribution routes
│   ├── uploads/                  # Uploaded files (auto-created)
│   ├── .env                      # Environment variables
│   ├── server.js                 # Main server file
│   ├── database.sqlite           # SQLite database (auto-created)
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.js          # Login page
│   │   │   ├── Login.css
│   │   │   ├── Dashboard.js      # Main dashboard
│   │   │   ├── Dashboard.css
│   │   │   ├── AddAgent.js       # Add agent component
│   │   │   ├── AddAgent.css
│   │   │   ├── UploadFile.js     # File upload component
│   │   │   ├── UploadFile.css
│   │   │   ├── Distributions.js  # View distributions
│   │   │   └── Distributions.css
│   │   ├── context/
│   │   │   └── AuthContext.js    # Authentication context
│   │   ├── services/
│   │   │   └── api.js            # API service layer
│   │   ├── App.js                # Main app component
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
│
└── README.md
```

## Database Schema

### Users Table
- `id` - Primary Key
- `email` - Unique
- `password` - Hashed
- `created_at` - Timestamp

### Agents Table
- `id` - Primary Key
- `name` - Agent name
- `email` - Unique
- `mobile` - Mobile number with country code
- `password` - Hashed
- `created_at` - Timestamp

### Lists Table
- `id` - Primary Key
- `agent_id` - Foreign Key (references agents)
- `first_name` - Contact first name
- `phone` - Contact phone number
- `notes` - Additional notes
- `created_at` - Timestamp

## Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- Protected API routes
- Input validation using express-validator
- File type validation for uploads

## Troubleshooting

### Backend Issues

1. **Port already in use:**
   - Change the PORT in `.env` file
   - Or stop the process using port 5000

2. **Database errors:**
   - Delete `database.sqlite` file and restart the server
   - The database will be recreated automatically

3. **Module not found:**
   - Run `npm install` in the backend directory

### Frontend Issues

1. **Cannot connect to backend:**
   - Ensure backend is running on port 5000
   - Check the proxy setting in `frontend/package.json`

2. **Module not found:**
   - Run `npm install` in the frontend directory

3. **Page not loading:**
   - Clear browser cache
   - Try a different browser

## Development

### Backend Development
```bash
cd backend;
npm run dev  # Uses nodemon for auto-restart
```

### Frontend Development
```bash
cd frontend;
npm start  # Hot reload enabled
```

## Production Build

### Build Frontend
```bash
cd frontend;
npm run build
```

The build folder will contain optimized production-ready files.

## Future Enhancements

- Agent login portal
- Real-time notifications
- Export distributed lists
- Analytics dashboard
- Bulk agent import
- Role-based access control

## License

This project is created as a machine test for MERN Stack Developer position.

## Support

For any issues or questions, please refer to the troubleshooting section or contact the development team.
