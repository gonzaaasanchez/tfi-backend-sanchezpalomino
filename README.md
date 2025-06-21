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

#### PUT `/users/:id`
Update a specific user (requires admin permissions).

**Headers:**
```
Authorization: Bearer <token>
```

**Body (multipart/form-data):**
```
firstName: "John"
lastName: "Doe"
email: "john@example.com"
avatar: [file] (optional)
```

#### PUT `/users/profile/avatar`
Update the authenticated user's profile avatar.

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
    "avatarContentType": "image/jpeg",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### GET `/users/:id/avatar`
Get a user's profile avatar.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** Binary image data with appropriate Content-Type header.

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
   - **Plan:** `Free`

3. **Configura las variables de entorno:**
   - `NODE_ENV` = `production`
   - `PORT` = `10000` (Render asigna automáticamente)
   - `MONGODB_URI` = Tu URI de MongoDB Atlas
   - `JWT_SECRET` = Tu clave secreta segura (mínimo 32 caracteres)
   - `JWT_EXPIRES_IN` = `30d`

4. **Haz clic en "Create Web Service"**

### Configuración de MongoDB Atlas

1. Crea una cuenta en [MongoDB Atlas](https://mongodb.com/atlas)
2. Crea un nuevo cluster (gratuito)
3. Configura el acceso a la red (0.0.0.0/0 para permitir acceso desde cualquier lugar)
4. Crea un usuario de base de datos
5. Obtén la URI de conexión
6. Agrega la URI como variable de entorno `MONGODB_URI` en Render

### Verificación del Despliegue

Una vez desplegado, tu API estará disponible en:
```
https://tu-app-name.onrender.com
```

Puedes probar el endpoint de salud:
```
GET https://tu-app-name.onrender.com/
```

## 📝 Notas Importantes

- **Variables de entorno:** Nunca subas archivos `.env` al repositorio
- **JWT_SECRET:** Usa una clave segura de al menos 32 caracteres en producción
- **MongoDB Atlas:** Recomendado para producción en lugar de MongoDB local
- **Logs:** Puedes ver los logs de tu aplicación en el dashboard de Render
- **Auto-deploy:** Render se actualiza automáticamente cuando haces push a la rama principal

## 🛠️ Troubleshooting

### Error de Build
- Verifica que todas las dependencias estén `package.json`
- Asegúrate de que el script `build` funcione localmente

### Error de Conexión a MongoDB
- Verifica que la URI de MongoDB Atlas sea correcta
- Asegúrate de que la IP de Render esté permitida en MongoDB Atlas

### Error de Variables de Entorno
- Verifica que todas las variables requeridas estén configuradas en Render
- Asegúrate de que `JWT_SECRET` tenga al menos 32 caracteres