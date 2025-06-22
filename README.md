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
- **Unified profile updates**: Update profile data and avatar in a single request
- **Pet Management System**: Complete CRUD for pets with characteristics
- **Role-based Access Control**: Different permissions for users and admins
- **Audit Logging**: Track all changes in the system
- **Pagination & Filtering**: Advanced search and pagination for all entities
- **Image Management**: Pet avatars with proper content type handling

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

## 🏗️ Project Structure

```
src/
├── app.ts                 # Entry point
├── models/               # MongoDB models
│   ├── User.ts          # User model
│   ├── Role.ts          # Role model
│   ├── Admin.ts         # Admin model
│   ├── PetType.ts       # Pet type model
│   ├── PetCharacteristic.ts # Pet characteristic model
│   └── Pet.ts           # Pet model
├── routes/              # Route controllers
│   ├── auth.ts          # Authentication routes
│   ├── users.ts         # User routes (including unified profile updates)
│   ├── roles.ts         # Role routes
│   ├── admins.ts        # Admin routes
│   ├── logs.ts          # Audit logs routes
│   ├── petTypes.ts      # Pet types routes
│   ├── petCharacteristics.ts # Pet characteristics routes
│   └── pets.ts          # Pet routes (user and admin services)
├── middleware/          # Middlewares
│   ├── auth.ts          # JWT authentication
│   ├── permissions.ts   # Permission control
│   ├── errorHandler.ts  # Error handling
│   └── upload.ts        # Image upload middleware
└── utils/               # Utilities
    ├── auth.ts          # JWT and bcrypt functions
    ├── audit.ts         # Audit logging
    ├── auditLogger.ts   # Audit logger
    ├── changeDetector.ts # Change detection
    └── response.ts      # Response helper
```

## 📚 API Documentation

The complete API documentation is organized by service modules in the [`docs/`](./docs/) directory:

- **[📖 Documentation Index](./docs/README.md)** - Overview and general information
- **[📊 Data Models](./docs/models.md)** - Database schemas and relationships
- **[🔐 Authentication](./docs/authentication.md)** - User registration and login
- **[👥 Users](./docs/users.md)** - User profile and management
- **[🐕 Pet Types](./docs/pet-types.md)** - Pet type management
- **[🏷️ Pet Characteristics](./docs/pet-characteristics.md)** - Pet characteristic management
- **[🐾 Pets](./docs/pets.md)** - Pet management and services
- **[👨‍💼 Admin Services](./docs/admin.md)** - Administrative functions

## 🛡️ Security

- **Passwords**: Hashed with bcrypt (12 salt rounds)
- **JWT**: Tokens signed with configurable secret
- **Headers**: Helmet for security headers
- **CORS**: Configured to allow cross-origin requests
- **Validation**: Automatic validations with Mongoose
- **File upload**: Multer with file type and size validation

## 📝 Available Scripts

- `npm run dev`: Run server in development mode with hot reload
- `npm test`: Run tests (pending implementation)

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

## 🚀 Deployment

This backend is deployed and available at: [https://tfi-backend-sanchezpalomino.onrender.com](https://tfi-backend-sanchezpalomino.onrender.com)