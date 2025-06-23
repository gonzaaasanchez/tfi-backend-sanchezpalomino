# Pet Types Routes

## POST `/pet-types` (Admin)
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

## GET `/pet-types`
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

## GET `/pet-types/all`
Get all pet types without pagination (requires authentication). Useful for dropdowns and forms.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Tipos de mascota obtenidos exitosamente",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Gato"
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Perro"
    },
    {
      "_id": "507f1f77bcf86cd799439013",
      "name": "Pájaro"
    }
  ]
}
```

## GET `/pet-types/:id`
Get a specific pet type (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Parameters:**
- `id`: MongoDB ObjectId of the pet type

**Response:**
```json
{
  "success": true,
  "message": "Tipo de mascota obtenido exitosamente",
  "data": {
    "_id": "...",
    "name": "Perro",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## PUT `/pet-types/:id` (Admin)
Update a pet type (requires admin permissions).

**Headers:**
```
Authorization: Bearer <token>
```

**Parameters:**
- `id`: MongoDB ObjectId of the pet type

**Body:**
```json
{
  "name": "Perro Doméstico"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Tipo de mascota actualizado exitosamente",
  "data": {
    "_id": "...",
    "name": "Perro Doméstico",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## DELETE `/pet-types/:id` (Admin)
Delete a pet type (requires admin permissions).

**Headers:**
```
Authorization: Bearer <token>
```

**Parameters:**
- `id`: MongoDB ObjectId of the pet type

**Response:**
```json
{
  "success": true,
  "message": "Tipo de mascota eliminado exitosamente"
}
```