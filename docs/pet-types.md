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

## GET `/pet-types/:id`
Get a specific pet type (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

## PUT `/pet-types/:id` (Admin)
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

## DELETE `/pet-types/:id` (Admin)
Delete a pet type (requires admin permissions).

**Headers:**
```
Authorization: Bearer <token>
``` 