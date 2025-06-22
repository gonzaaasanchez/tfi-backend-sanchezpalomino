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
  "password": "123456",
  "phoneNumber": "+1234567890"
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
      "phoneNumber": "+1234567890",
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
Update the authenticated user's profile and avatar (optional).

**Headers:**
```
Authorization: Bearer <token>
```

**Body (multipart/form-data):**
```
firstName: "John" (optional)
lastName: "Doe" (optional)
email: "john@example.com" (optional)
phoneNumber: "+1234567890" (optional)
avatarFile: [file] (optional)
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
Update a specific user's profile and avatar (optional) (requires admin permissions).

**Headers:**
```
Authorization: Bearer <token>
```

**Body (multipart/form-data):**
```
firstName: "John" (optional)
lastName: "Doe" (optional)
email: "john@example.com" (optional)
phoneNumber: "+1234567890" (optional)
role: "..." (optional)
avatarFile: [file] (optional)
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
    "avatar": "api/users/.../avatar",
    "role": "..."
  }
}
```

#### GET `/users/:id/avatar`
Get a user's profile avatar (public endpoint).

**Response:** Binary image data with appropriate Content-Type header.

#### PUT `/users/me/carer-config`
Update the authenticated user's care configuration (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "carerConfig": {
    "homeCare": {
      "enabled": true,
      "dayPrice": 50
    },
    "petHomeCare": {
      "enabled": false,
      "visitPrice": null
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Configuración de cuidado actualizada exitosamente",
  "data": {
    "_id": "...",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "carerConfig": {
      "homeCare": {
        "enabled": true,
        "dayPrice": 50
      },
      "petHomeCare": {
        "enabled": false,
        "visitPrice": null
      }
    }
  }
}
```

#### POST `/users/me/addresses`
Add a new address to the authenticated user (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "fullAddress": "Av. Corrientes 1234",
  "floor": "3",
  "apartment": "A",
  "coords": {
    "lat": -34.6037,
    "lon": -58.3816
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Dirección agregada exitosamente",
  "data": {
    "fullAddress": "Av. Corrientes 1234",
    "floor": "3",
    "apartment": "A",
    "coords": {
      "lat": -34.6037,
      "lon": -58.3816
    }
  }
}
```

#### PUT `/users/me/addresses/:index`
Update a specific address of the authenticated user (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "fullAddress": "Av. Corrientes 1234",
  "floor": "4",
  "coords": {
    "lat": -34.6037,
    "lon": -58.3816
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Dirección actualizada exitosamente",
  "data": {
    "fullAddress": "Av. Corrientes 1234",
    "floor": "4",
    "coords": {
      "lat": -34.6037,
      "lon": -58.3816
    }
  }
}
```

#### DELETE `/users/me/addresses/:index`
Delete a specific address of the authenticated user (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Dirección eliminada exitosamente",
  "data": null
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
- `search`: Search by firstName, lastName, email, or phoneNumber
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

### Pet Types

#### POST `/pet-types` (Admin)
Create a new pet type (requires admin permissions).

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "name": "Perro"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Tipo de mascota creado exitosamente",
  "data": {
    "_id": "...",
    "name": "Perro",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### GET `/pet-types`
Get all pet types with pagination and search (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `search`: Search by name

**Response:**
```json
{
  "success": true,
  "message": "Tipos de mascota obtenidos exitosamente",
  "data": {
    "petTypes": [
      {
        "_id": "...",
        "name": "Perro",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 5,
      "totalPages": 1
    }
  }
}
```

#### GET `/pet-types/:id`
Get a specific pet type (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

#### PUT `/pet-types/:id` (Admin)
Update a pet type (requires admin permissions).

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "name": "Perro Doméstico"
}
```

#### DELETE `/pet-types/:id` (Admin)
Delete a pet type (requires admin permissions).

**Headers:**
```
Authorization: Bearer <token>
```

### Pet Characteristics

#### POST `/pet-characteristics` (Admin)
Create a new pet characteristic (requires admin permissions).

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "name": "Tamaño"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Característica de mascota creada exitosamente",
  "data": {
    "_id": "...",
    "name": "Tamaño",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### GET `/pet-characteristics`
Get all pet characteristics with pagination and search (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `search`: Search by name

**Response:**
```json
{
  "success": true,
  "message": "Características de mascota obtenidas exitosamente",
  "data": {
    "characteristics": [
      {
        "_id": "...",
        "name": "Tamaño",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 10,
      "totalPages": 1
    }
  }
}
```

#### GET `/pet-characteristics/:id`
Get a specific pet characteristic (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

#### PUT `/pet-characteristics/:id` (Admin)
Update a pet characteristic (requires admin permissions).

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "name": "Tamaño del Animal"
}
```

#### DELETE `/pet-characteristics/:id` (Admin)
Delete a pet characteristic (requires admin permissions).

**Headers:**
```
Authorization: Bearer <token>
```

### Pets

#### POST `/pets`
Create a new pet (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Body (multipart/form-data):**
```
name: "Luna" (required)
comment: "Mi perrita favorita" (optional)
petTypeId: "..." (required)
characteristics: [
  {
    "characteristicId": "...",
    "value": "grande"
  },
  {
    "characteristicId": "...",
    "value": "5 años"
  }
] (optional)
avatarFile: [file] (optional)
```

**Response:**
```json
{
  "success": true,
  "message": "Mascota creada exitosamente",
  "data": {
    "_id": "...",
    "name": "Luna",
    "comment": "Mi perrita favorita",
    "avatar": "/api/pets/.../avatar",
    "petType": {
      "_id": "...",
      "name": "Perro"
    },
    "characteristics": [
      {
        "characteristic": {
          "_id": "...",
          "name": "Tamaño"
        },
        "value": "grande"
      },
      {
        "characteristic": {
          "_id": "...",
          "name": "Edad"
        },
        "value": "5 años"
      }
    ],
    "owner": {
      "_id": "...",
      "firstName": "John",
      "lastName": "Doe"
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### GET `/pets/my`
Get the authenticated user's pets with pagination and filters.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `search`: Search by pet name
- `petType`: Filter by pet type ID

**Response:**
```json
{
  "success": true,
  "message": "Mascotas obtenidas exitosamente",
  "data": {
    "pets": [
      {
        "_id": "...",
        "name": "Luna",
        "comment": "Mi perrita favorita",
        "avatar": "/api/pets/.../avatar",
        "petType": {
          "_id": "...",
          "name": "Perro"
        },
        "characteristics": [
          {
            "characteristic": {
              "_id": "...",
              "name": "Tamaño"
            },
            "value": "grande"
          }
        ],
        "owner": {
          "_id": "...",
          "firstName": "John",
          "lastName": "Doe"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 3,
      "totalPages": 1
    }
  }
}
```

#### GET `/pets/:id`
Get a specific pet (only if owner).

**Headers:**
```
Authorization: Bearer <token>
```

#### PUT `/pets/:id`
Update a pet (only if owner).

**Headers:**
```
Authorization: Bearer <token>
```

**Body (multipart/form-data):**
```
name: "Luna Bella" (optional)
comment: "Mi perrita favorita actualizada" (optional)
petTypeId: "..." (optional)
characteristics: [...] (optional)
avatarFile: [file] (optional)
```

#### DELETE `/pets/:id`
Delete a pet (only if owner).

**Headers:**
```
Authorization: Bearer <token>
```

### Admin Pet Services

#### GET `/pets/admin/all`
Get all pets with advanced filters (admin only).

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `search`: Search by pet name
- `petType`: Filter by pet type ID
- `owner`: Filter by owner ID

**Response:**
```json
{
  "success": true,
  "message": "Mascotas obtenidas exitosamente",
  "data": {
    "pets": [
      {
        "_id": "...",
        "name": "Luna",
        "comment": "Mi perrita favorita",
        "avatar": "/api/pets/.../avatar",
        "petType": {
          "_id": "...",
          "name": "Perro"
        },
        "characteristics": [
          {
            "characteristic": {
              "_id": "...",
              "name": "Tamaño"
            },
            "value": "grande"
          }
        ],
        "owner": {
          "_id": "...",
          "firstName": "John",
          "lastName": "Doe"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

#### GET `/pets/admin/:id`
Get any pet by ID (admin only).

**Headers:**
```
Authorization: Bearer <token>
```

### Public Pet Services

#### GET `/pets/:id/avatar`
Get a pet's avatar (public endpoint).

**Response:** Binary image data with appropriate Content-Type header.

## 🔐 Authentication

For protected endpoints, include the header:
```
Authorization: Bearer <token>
```

## �� Available Scripts

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