# TFI Backend - Sánchez Palomino

Backend API developed with Node.js, TypeScript, Express and MongoDB.

## 🚀 Features

- **JWT Authentication**: Complete registration and login system
- **Centralized error handling**: Consistent error responses
- **Permission middleware**: Structure ready for access control
- **Data validation**: Automatic validations with Mongoose
- **Security**: Helmet, CORS, bcrypt for passwords
- **TypeScript**: Static typing for greater robustness
- **Avatar upload**: User profile avatars stored in MongoDB

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd tfi-backend-sanchezpalomino
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp env.example .env
```

Edit the `.env` file with your configurations:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/tfi-backend
JWT_SECRET=your-super-secure-secret-key
JWT_EXPIRES_IN=24h
NODE_ENV=development
```

4. **Run in development**
```bash
npm run dev
```

## 📚 API Endpoints

### Authentication

#### POST `/auth/register`
Register a new user.

**Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "...",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

#### POST `/auth/login`
User login.

**Body:**
```json
{
  "email": "john@example.com",
  "password": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "...",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Test (Example)

#### GET `/test`
Get all tests (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

#### POST `/test`
Create a new test (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "name": "Test 1",
  "value": 100
}
```

### Users

#### GET `/users/me`
Get the authenticated user's profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Perfil obtenido exitosamente",
  "data": {
    "_id": "...",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phoneNumber": "+1234567890",
    "avatar": "api/users/.../avatar",
    "role": {
      "_id": "...",
      "name": "user",
      "permissions": { ... }
    }
  }
}
```

#### PUT `/users/me`
Update the authenticated user's profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phoneNumber": "+1234567890",
  "avatar": "api/users/.../avatar"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Perfil actualizado exitosamente",
  "data": {
    "_id": "...",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phoneNumber": "+1234567890",
    "avatar": "api/users/.../avatar",
    "role": "..."
  }
}
```

#### PUT `/users/me/avatar`
Update the authenticated user's avatar.

**Headers:**
```
Authorization: Bearer <token>
```

**Body (multipart/form-data):**
```
avatar: [file] (required)
```

**Response:**
```json
{
  "success": true,
  "message": "Avatar actualizado exitosamente",
  "data": {
    "_id": "...",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "avatar": "api/users/.../avatar",
    "avatarContentType": "image/jpeg"
  }
}
```

#### GET `/users` (Admin)
Get all users with pagination and filters (requires admin permissions).

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Users per page (default: 10)
- `search`: Search by firstName, lastName, or email
- `role`: Filter by role ID

**Example:**
```
GET /users?page=1&limit=20&search=john&role=68560fca89402fc12be977e1
```

**Response:**
```json
{
  "success": true,
  "message": "Usuarios obtenidos exitosamente",
  "data": {
    "users": [
      {
        "_id": "...",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "phoneNumber": "+1234567890",
        "avatar": "api/users/.../avatar",
        "role": {
          "_id": "...",
          "name": "user",
          "permissions": { ... }
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "totalUsers": 50,
      "totalPages": 3,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

#### GET `/users/:id` (Admin)
Get a specific user by ID (requires admin permissions).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Usuario obtenido exitosamente",
  "data": {
    "_id": "...",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phoneNumber": "+1234567890",
    "avatar": "api/users/.../avatar",
    "role": {
      "_id": "...",
      "name": "user",
      "permissions": { ... }
    }
  }
}
```

#### PUT `/users/:id` (Admin)
Update a specific user (requires admin permissions).

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phoneNumber": "+1234567890",
  "role": "..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Usuario actualizado exitosamente",
  "data": {
    "_id": "...",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phoneNumber": "+1234567890",
    "role": "..."
  }
}
```

#### PUT `/users/:id/avatar` (Admin)
Update a specific user's avatar (requires admin permissions).

**Headers:**
```
Authorization: Bearer <token>
```

**Body (multipart/form-data):**
```
avatar: [file] (required)
```

**Response:**
```json
{
  "success": true,
  "message": "Avatar del usuario actualizado exitosamente",
  "data": {
    "_id": "...",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "avatar": "api/users/.../avatar",
    "avatarContentType": "image/jpeg",
    "role": {
      "_id": "...",
      "name": "user",
      "permissions": { ... }
    }
  }
}
```

#### GET `/users/:id/avatar`
Get a user's profile avatar (public endpoint).

**Response:** Binary image data with appropriate Content-Type header.

### 📋 Users Endpoints Summary

| Endpoint | Method | Authentication | Permissions | Description |
|----------|--------|----------------|-------------|-------------|
| `/users/me` | GET | ✅ Bearer Token | ❌ None | Get authenticated user's profile |
| `/users/me` | PUT | ✅ Bearer Token | ❌ None | Update authenticated user's profile |
| `/users/me/avatar` | PUT | ✅ Bearer Token | ❌ None | Update authenticated user's avatar |
| `/users` | GET | ✅ Bearer Token | ✅ `users.getAll` | List all users (admin only) |
| `/users/:id` | GET | ✅ Bearer Token | ✅ `users.read` | Get specific user (admin only) |
| `/users/:id` | PUT | ✅ Bearer Token | ✅ `users.update` | Update specific user (admin only) |
| `/users/:id/avatar` | PUT | ✅ Bearer Token | ✅ `users.update` | Update specific user's avatar (admin only) |
| `/users/:id/avatar` | GET | ❌ None | ❌ None | Get user's avatar (public) |

## 🔐 Authentication

For protected endpoints, include the header:
```
Authorization: Bearer <token>
```

## 🏗️ Project Structure

```
src/
├── app.ts                 # Entry point
├── models/               # MongoDB models
│   ├── User.ts          # User model
│   ├── Role.ts          # Role model
│   └── Admin.ts         # Admin model
├── routes/              # Route controllers
│   ├── auth.ts          # Authentication routes
│   ├── users.ts         # User routes (including image upload)
│   ├── roles.ts         # Role routes
│   ├── admins.ts        # Admin routes
│   └── logs.ts          # Audit logs routes
├── middleware/          # Middlewares
│   ├── auth.ts          # JWT authentication
│   ├── permissions.ts   # Permission control
│   ├── errorHandler.ts  # Error handling
│   └── upload.ts        # Image upload middleware
└── utils/               # Utilities
    ├── auth.ts          # JWT and bcrypt functions
    ├── audit.ts         # Audit logging
    ├── auditLogger.ts   # Audit logger
    └── changeDetector.ts # Change detection
```

## 🔧 Available Scripts

- `npm run dev`: Run server in development mode with hot reload
- `npm test`: Run tests (pending implementation)

## 🛡️ Security

- **Passwords**: Hashed with bcrypt (12 salt rounds)
- **JWT**: Tokens signed with configurable secret
- **Headers**: Helmet for security headers
- **CORS**: Configured to allow cross-origin requests
- **Validation**: Automatic validations with Mongoose
- **File upload**: Multer with file type and size validation

## 📝 Next Steps

- [ ] Implement complete permission system
- [ ] Add unit tests
- [ ] Implement refresh tokens
- [ ] Add validation with Joi
- [ ] Implement rate limiting
- [ ] Add Swagger documentation
- [ ] Add image compression/resizing
- [ ] Implement image deletion

## 🤝 Contributing

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is under the ISC License.

## 🚀 Deployment en Render

### Despliegue Automático

1. **Conecta tu repositorio de GitHub a Render:**
   - Ve a [render.com](https://render.com) y crea una cuenta
   - Haz clic en "New +" y selecciona "Web Service"
   - Conecta tu repositorio de GitHub
   - Selecciona el repositorio `tfi-backend-sanchezpalomino`

2. **Configura el servicio:**
   - **Name:** `tfi-backend-sanchezpalomino`
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`