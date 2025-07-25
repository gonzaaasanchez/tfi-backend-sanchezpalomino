# Authentication Routes

## User Authentication

### POST `/auth/register`
Register a new user.

**Validations:**
- All fields are required
- Email must be unique
- Password must meet strength requirements
- Phone number must be valid format

**Request Body:**
```typescript
{
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      phoneNumber: string;
      role: {
        id: string;
        name: string;
      };
    };
  };
}
```

**Example Request:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "123456",
  "phoneNumber": "+1234567890"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phoneNumber": "+1234567890",
      "role": {
        "id": "507f1f77bcf86cd799439012",
        "name": "user"
      }
    }
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "El email ya está registrado",
  "data": null
}
```

### POST `/auth/login`
Login with email and password.

**Validations:**
- Email and password are required
- Email must exist in database
- Password must match stored hash

**Request Body:**
```typescript
{
  email: string;
  password: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      phoneNumber: string;
      role: {
        id: string;
        name: string;
      };
    };
    token: string;
  };
}
```

**Example Request:**
```json
{
  "email": "john@example.com",
  "password": "123456"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phoneNumber": "+1234567890",
      "role": {
        "id": "507f1f77bcf86cd799439012",
        "name": "user"
      }
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Credenciales inválidas",
  "data": null
}
```

### GET `/auth/me`
Get authenticated user profile.

**Validations:**
- Valid JWT token required
- User must exist in database

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      phoneNumber: string;
      role: {
        id: string;
        name: string;
      };
    };
  };
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Perfil obtenido exitosamente",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phoneNumber": "+1234567890",
      "role": {
        "id": "507f1f77bcf86cd799439012",
        "name": "user"
      }
    }
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "No autorizado",
  "data": null
}
```

### POST `/auth/logout`
Logout for authenticated users.

**Validations:**
- Valid JWT token required
- Token must be active (not blacklisted)

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  data: null;
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Logout exitoso",
  "data": null
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Token de acceso requerido",
  "data": null
}
```

**Notes:**
- The token is added to a blacklist and cannot be used again
- All subsequent requests with this token will be rejected
- Tokens are automatically cleaned up when they expire

### POST `/auth/forgot-password`
Request password reset code via email.

**Validations:**
- Email is required
- Email must be valid format

**Request Body:**
```typescript
{
  email: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  data: null;
}
```

**Example Request:**
```json
{
  "email": "john@example.com"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Si el email existe, recibirás un código de recuperación",
  "data": null
}
```

**Notes:**
- Always returns success message for security (doesn't reveal if email exists)
- Sends a 6-digit code to the user's email
- Code expires in 15 minutes
- Previous unused codes for the same user are invalidated

### POST `/auth/reset-password`
Reset password using the code received via email.

**Validations:**
- Email, code, and newPassword are required
- Code must be valid and not expired
- New password must meet strength requirements
- New password must be different from current password

**Request Body:**
```typescript
{
  email: string;
  code: string;
  newPassword: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  data: null;
}
```

**Example Request:**
```json
{
  "email": "john@example.com",
  "code": "123456",
  "newPassword": "newpassword123"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Contraseña actualizada exitosamente",
  "data": null
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Código inválido o expirado",
  "data": null
}
```

**Password Requirements:**
- Minimum 6 characters
- Must be different from current password

**Notes:**
- Code must be valid and not expired
- Code can only be used once
- New password must meet strength requirements



