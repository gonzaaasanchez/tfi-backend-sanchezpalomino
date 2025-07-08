# Authentication API Documentation

## Overview

This API has **two separate authentication systems**:

1. **User Authentication** (`/auth/*`) - For regular users (caregivers, pet owners)
2. **Admin Authentication** (`/admins/login`) - For administrators only

**Important:** Admins must use `/admins/login`, not `/auth/login`. See [Admin Routes](../docs/admin.md) for admin-specific endpoints.

## User Authentication Endpoints

### POST /auth/register
Register a new user.

**Request Body:**
```json
{
  "firstName": "string",
  "lastName": "string", 
  "email": "string",
  "password": "string",
  "phoneNumber": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "user": {
      "id": "string",
      "firstName": "string",
      "lastName": "string",
      "email": "string",
      "phoneNumber": "string",
      "role": {
        "id": "string",
        "name": "string"
      }
    }
  }
}
```

### POST /auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "user": {
      "id": "string",
      "firstName": "string",
      "lastName": "string",
      "email": "string",
      "phoneNumber": "string",
      "role": {
        "id": "string",
        "name": "string"
      }
    },
    "token": "string"
  }
}
```

### GET /auth/me
Get authenticated user profile.

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
    "user": {
      "id": "string",
      "firstName": "string",
      "lastName": "string",
      "email": "string",
      "phoneNumber": "string",
      "role": {
        "id": "string",
        "name": "string"
      }
    }
  }
}
```

### POST /auth/forgot-password
Request password reset code via email.

**Request Body:**
```json
{
  "email": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Si el email existe, recibirás un código de recuperación"
}
```

**Notes:**
- Always returns success message for security (doesn't reveal if email exists)
- Sends a 6-digit code to the user's email
- Code expires in 15 minutes
- Previous unused codes for the same user are invalidated

### POST /auth/reset-password
Reset password using the code received via email.

**Request Body:**
```json
{
  "email": "string",
  "code": "string",
  "newPassword": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Contraseña actualizada exitosamente"
}
```

**Password Requirements:**
- Minimum 6 characters
- Must be different from current password

**Notes:**
- Code must be valid and not expired
- Code can only be used once
- New password must meet strength requirements

