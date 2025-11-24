# 🏗️ Constructora Backend

Backend API for a construction projects management system. This RESTful API provides comprehensive functionality for managing construction projects, vehicles, users, and access control with role-based authentication.

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [API Endpoints](#-api-endpoints)
- [Authentication & Authorization](#-authentication--authorization)
- [Database Models](#-database-models)
- [Scripts](#-scripts)
- [Environment Variables](#-environment-variables)
- [Development](#-development)
- [Authors](#-authors)

## ✨ Features

- 🔐 **JWT-based Authentication** - Secure user authentication with JSON Web Tokens
- 👥 **Role-Based Access Control (RBAC)** - Three user roles: Admin, Analista, and Visitante
- 🏗️ **Project Management** - CRUD operations for construction projects
- 🚗 **Vehicle Management** - Track and manage construction vehicles
- 📊 **Access Reports** - Comprehensive access logging with filtering, pagination, and sorting
- 🔒 **Secure Password Hashing** - bcrypt password encryption
- 🗄️ **MongoDB Integration** - NoSQL database with Mongoose ODM
- 📝 **Data Seeding** - Pre-built scripts to populate the database with sample data

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js v5.1.0
- **Database**: MongoDB with Mongoose v8.19.4
- **Authentication**: JWT (jsonwebtoken v9.0.2)
- **Password Hashing**: bcryptjs v3.0.3
- **Environment Management**: dotenv v17.2.3
- **Development**: nodemon v3.1.11

## 📁 Project Structure

```
constructora-backend/
├── src/
│   ├── config/
│   │   └── db.js                 # MongoDB connection configuration
│   ├── middlewares/
│   │   ├── authMiddleware.js     # JWT authentication middleware
│   │   └── authorize.js          # Role-based authorization middleware
│   ├── models/
│   │   ├── User.js               # User schema and model
│   │   ├── Project.js            # Project schema and model
│   │   ├── Vehicle.js            # Vehicle schema and model
│   │   └── Access.js             # Access log schema and model
│   ├── routes/
│   │   ├── auth.js               # Authentication routes (login, register)
│   │   ├── projects.js           # Project management routes
│   │   ├── vehicles.js           # Vehicle management routes
│   │   └── reports.js            # Access reports routes
│   └── scripts/
│       ├── cargarDatos.js        # Main data seeding script
│       ├── cargarUsuarios.js     # User seeding script
│       └── README.md             # Scripts documentation
├── app.js                        # Express app configuration
├── index.js                      # Server entry point
├── package.json                  # Project dependencies
├── .env                          # Environment variables (not in repo)
└── .gitignore                    # Git ignore rules
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher recommended)
- MongoDB (running locally or remote instance)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd constructora-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/constructora
   JWT_SECRET=your_super_secret_jwt_key_here
   PORT=3000
   ```

4. **Start MongoDB**
   
   Make sure MongoDB is running on your system:
   ```bash
   # If using local MongoDB
   mongod
   ```

5. **Seed the database (optional)**
   
   Populate the database with sample data:
   ```bash
   npm run seed
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:3000` (or the port specified in your `.env` file).

## 🔌 API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register a new user | Public |
| POST | `/api/auth/login` | Login and get JWT token | Public |

### Project Routes (`/api/projects`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/projects` | Get all projects | Authenticated |
| GET | `/api/projects/:id` | Get project by ID | Authenticated |
| POST | `/api/projects` | Create new project | Admin, Analista |
| PUT | `/api/projects/:id` | Update project | Admin, Analista |
| DELETE | `/api/projects/:id` | Delete project | Admin |

### Vehicle Routes (`/api/vehicles`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/vehicles` | Get all vehicles | Authenticated |
| GET | `/api/vehicles/:id` | Get vehicle by ID | Authenticated |
| POST | `/api/vehicles` | Create new vehicle | Admin, Analista |
| PUT | `/api/vehicles/:id` | Update vehicle | Admin, Analista |
| DELETE | `/api/vehicles/:id` | Delete vehicle | Admin |

### Report Routes (`/api/reports`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/reports/access` | Get access logs with filters | Admin, Analista |

**Query Parameters for Access Reports:**
- `startDate` - Filter by start date (ISO format)
- `endDate` - Filter by end date (ISO format)
- `resource` - Filter by resource type
- `action` - Filter by action type
- `userId` - Filter by user ID
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `sortBy` - Sort field (default: timestamp)
- `sortOrder` - Sort order: 'asc' or 'desc' (default: desc)

## 🔐 Authentication & Authorization

### User Roles

The system implements three user roles with different permission levels:

1. **Admin** - Full access to all resources
   - Can create, read, update, and delete all resources
   - Access to all reports and analytics

2. **Analista** - Limited write access
   - Can create and update projects and vehicles
   - Cannot delete resources
   - Access to reports

3. **Visitante** - Read-only access
   - Can only view projects and vehicles
   - No write or delete permissions
   - Limited report access

### Authentication Flow

1. **Register**: Create a new user account
   ```bash
   POST /api/auth/register
   {
     "email": "user@example.com",
     "password": "securepassword",
     "name": "John Doe"
   }
   ```

2. **Login**: Authenticate and receive JWT token
   ```bash
   POST /api/auth/login
   {
     "email": "user@example.com",
     "password": "securepassword"
   }
   ```
   
   Response:
   ```json
   {
     "message": "Login succesfully",
     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   }
   ```

3. **Use Token**: Include the token in the Authorization header for protected routes
   ```bash
   Authorization: Bearer <your_jwt_token>
   ```

## 🗄️ Database Models

### User Model
```javascript
{
  email: String (unique, required),
  password: String (hashed, required),
  name: String (required),
  role: String (enum: ['admin', 'analista', 'visitante'], default: 'visitante')
}
```

### Project Model
Fields include project details, location, dates, budget, and status.

### Vehicle Model
Fields include vehicle information, type, status, and project assignment.

### Access Model
Logs user access to resources with timestamps, actions, and metadata.

## 📝 Scripts

The project includes helpful scripts for database management:

### Available Scripts

- **`npm run dev`** - Start development server with nodemon (auto-reload)
- **`npm run seed`** - Populate database with sample data
- **`npm test`** - Run tests (not yet implemented)

### Data Seeding

The seed script creates:
- 7 sample users with different roles
- 5 construction projects
- 8 vehicles (some assigned to projects)
- 120 access log records from the last 30 days

**Default User Credentials:**
- Admin: `admin@mail.com` / `123456`
- Analista: `analista@mail.com` / `123456`
- Visitante: `visit@mail.com` / `123456`

⚠️ **Warning**: The seed script will delete all existing data before inserting new data.

For more details, see [src/scripts/README.md](src/scripts/README.md)

## 🔧 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/constructora

# JWT Secret (use a strong, random string in production)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Server Port (optional, defaults to 3000)
PORT=3000
```

**Security Note**: Never commit your `.env` file to version control. It's already included in `.gitignore`.

## 💻 Development

### Code Style

- Use ES6+ features
- Follow Express.js best practices
- Implement proper error handling
- Use async/await for asynchronous operations

### Error Handling

The application includes a global error handler that catches all errors and returns a consistent JSON response:

```javascript
{
  error: true,
  message: "Error description"
}
```

### Adding New Routes

1. Create a new route file in `src/routes/`
2. Define your routes using Express Router
3. Import and use the route in `app.js`
4. Add authentication and authorization middleware as needed

### Adding New Models

1. Create a new model file in `src/models/`
2. Define the schema using Mongoose
3. Export the model
4. Use the model in your route handlers

## 👥 Authors

- **Armando Vallejo**
- **Tony Castillo**

## 📄 License

ISC

---

**Note**: This is a backend API project. For the frontend application, please refer to the separate frontend repository.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

## 📞 Support

For support, email the authors or create an issue in the repository.
