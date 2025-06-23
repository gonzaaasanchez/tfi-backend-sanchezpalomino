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
    },
    "petTypes": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
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
      },
      "petTypes": [
        {
          "_id": "507f1f77bcf86cd799439011",
          "name": "Perro"
        },
        {
          "_id": "507f1f77bcf86cd799439012",
          "name": "Gato"
        }
      ]
    }
  }
}
```

## GET `/users/me/addresses`
Get all addresses of the authenticated user (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Direcciones obtenidas exitosamente",
  "data": [
    {
      "_id": "6858625883100127c2b2e8dc",
      "name": "Casa Principal",
      "fullAddress": "Av. Corrientes 1234, Buenos Aires, Argentina",
      "floor": "3",
      "apartment": "A",
      "coords": {
        "lat": -34.6037,
        "lon": -58.3816
      }
    },
    {
      "_id": "6858625883100127c2b2e8dd",
      "name": "Oficina",
      "fullAddress": "Av. Santa Fe 5678, Buenos Aires, Argentina",
      "floor": "2",
      "coords": {
        "lat": -34.6037,
        "lon": -58.3816
      }
    }
  ]
}
```

## GET `/users/me/addresses/:id`
Get a specific address of the authenticated user by ID (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Parameters:**
- `id`: MongoDB ObjectId of the address

**Response:**
```json
{
  "success": true,
  "message": "Dirección obtenida exitosamente",
  "data": {
    "_id": "6858625883100127c2b2e8dc",
    "name": "Casa Principal",
    "fullAddress": "Av. Corrientes 1234, Buenos Aires, Argentina",
    "floor": "3",
    "apartment": "A",
    "coords": {
      "lat": -34.6037,
      "lon": -58.3816
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
  "name": "Casa Principal",
  "fullAddress": "Av. Corrientes 1234, Buenos Aires, Argentina",
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
    "_id": "6858625883100127c2b2e8dc",
    "name": "Casa Principal",
    "fullAddress": "Av. Corrientes 1234, Buenos Aires, Argentina",
    "floor": "3",
    "apartment": "A",
    "coords": {
      "lat": -34.6037,
      "lon": -58.3816
    }
  }
}
```

## PUT `/users/me/addresses/:id`
Update a specific address of the authenticated user (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Parameters:**
- `id`: MongoDB ObjectId of the address

**Body:**
```json
{
  "name": "Oficina",
  "fullAddress": "Av. Corrientes 1234, Buenos Aires, Argentina",
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
    "_id": "6858625883100127c2b2e8dc",
    "name": "Oficina",
    "fullAddress": "Av. Corrientes 1234, Buenos Aires, Argentina",
    "floor": "4",
    "coords": {
      "lat": -34.6037,
      "lon": -58.3816
    }
  }
}
```

## DELETE `/users/me/addresses/:id`
Delete a specific address of the authenticated user (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Parameters:**
- `id`: MongoDB ObjectId of the address

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