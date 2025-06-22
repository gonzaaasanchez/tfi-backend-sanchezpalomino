# Users Routes

## GET `/users/me`
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

## PUT `/users/me`
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

## GET `/users/:id` (Admin)
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

## PUT `/users/:id` (Admin)
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

## GET `/users/:id/avatar`
Get a user's profile avatar (public endpoint).

**Response:** Binary image data with appropriate Content-Type header.

## PUT `/users/me/carer-config`
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

## POST `/users/me/addresses`
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

## PUT `/users/me/addresses/:index`
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

## DELETE `/users/me/addresses/:index`
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

## GET `/users` (Admin)
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