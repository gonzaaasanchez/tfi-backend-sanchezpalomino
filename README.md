# TFI Backend - Sánchez Palomino

Backend API developed with Node.js, TypeScript, Express and MongoDB.

## 🚀 Features

- **JWT Authentication**: Complete registration and login system
- **Password Recovery System**: Email-based password reset with Resend
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
- **Email System**: Professional email templates with HTML formatting
- **Reservation Email Notifications**: Automatic emails for all reservation status changes
- **Commission System**: Centralized commission calculation with dynamic configuration
- **Caregiver Search**: Advanced search functionality for pet caregivers
- **Reservation System**: Complete booking and reservation management
- **Session Audit System**: Complete session monitoring and security dashboard
- **Token Blacklist**: Secure logout with token invalidation

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn
- Resend account (for email functionality)

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

# Email Configuration (Resend)
RESEND_API_KEY=your-resend-api-key
FROM_EMAIL=onboarding@resend.dev

# Optional: Custom domain (must be verified in Resend)
# FROM_EMAIL=soporte@yourdomain.com
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
│   ├── Pet.ts           # Pet model
│   ├── Reservation.ts   # Reservation model
│   └── PasswordReset.ts # Password reset model
├── routes/              # Route controllers
│   ├── auth.ts          # Authentication routes (including password reset)
│   ├── users.ts         # User routes (including unified profile updates)
│   ├── roles.ts         # Role routes
│   ├── admins.ts        # Admin routes
│   ├── logs.ts          # Audit logs routes
│   ├── petTypes.ts      # Pet types routes
│   ├── petCharacteristics.ts # Pet characteristics routes
│   ├── pets.ts          # Pet routes (user and admin services)
│   ├── caregiverSearch.ts # Caregiver search routes
│   └── reservations.ts  # Reservation routes
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
    ├── response.ts      # Response helper
    ├── emailService.ts      # Generic email service with Resend
    ├── passwordResetEmail.ts # Password reset email templates
    ├── reservationEmails.ts  # Reservation email templates
    ├── passwordReset.ts # Password reset utilities
    └── userHelpers.ts   # User data helpers
```

## 📚 API Documentation

The complete API documentation is organized by service modules in the [`docs/`](./docs/) directory:

- **[📖 Documentation Index](./docs/README.md)** - Overview and general information
- **[📊 Data Models](./docs/models.md)** - Database schemas and relationships
- **[🔐 Authentication](./docs/authentication.md)** - User registration, login, and password reset
- **[👥 Users](./docs/users.md)** - User profile and management
- **[🐕 Pet Types](./docs/pet-types.md)** - Pet type management
- **[🏷️ Pet Characteristics](./docs/pet-characteristics.md)** - Pet characteristic management
- **[🐾 Pets](./docs/pets.md)** - Pet management and services
- **[🔍 Caregiver Search](./docs/caregiver-search.md)** - Advanced search functionality
- **[📅 Reservations](./docs/reservations.md)** - Booking and reservation system
- **[📧 Email System](./docs/emails.md)** - Email functionality, templates, and automatic notifications
- **[⚙️ Configuration](./docs/config.md)** - System configuration management
- **[👨‍💼 Admin Services](./docs/admin.md)** - Administrative functions
- **[🛡️ Audit System](./docs/audit.md)** - Session monitoring and security dashboard

## 🛡️ Security

- **Passwords**: Hashed with bcrypt (12 salt rounds)
- **JWT**: Tokens signed with configurable secret
- **Headers**: Helmet for security headers
- **CORS**: Configured to allow cross-origin requests
- **Validation**: Automatic validations with Mongoose
- **File upload**: Multer with file type and size validation
- **Password Reset**: Secure token-based recovery with expiration
- **Email Security**: Domain verification and rate limiting
- **Automatic Notifications**: Cron jobs for reservation status updates
- **Commission Management**: Dynamic commission rates via system configuration
- **Session Audit**: Complete logging of all authentication events
- **Token Blacklist**: Secure logout with automatic token invalidation

## 📝 Available Scripts

- `npm run dev`: Run server in development mode with hot reload
- `npm run build`: Build the project for production
- `npm run start`: Run the built project
- `npm run updateAllRoles`: Update all roles and permissions
- `npm run createUsers`: Create sample users
- `npm run createPets`: Create sample pets
- `npm run createPetCharacteristics`: Create pet characteristics
- `npm run fillCareAddress`: Fill care address data

## 📝 Next Steps

- [x] Implement password recovery system
- [x] Add email functionality with Resend
- [x] Implement automatic reservation email notifications
- [x] Add centralized commission system with dynamic configuration
- [x] Implement caregiver search
- [x] Add reservation system
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