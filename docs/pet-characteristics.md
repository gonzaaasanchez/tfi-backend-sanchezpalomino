# Pet Characteristics Routes

## POST `/pet-characteristics` (Admin)
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
    "id": "...",
    "name": "Tamaño",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## GET `/pet-characteristics`
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
        "id": "...",
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

## GET `/pet-characteristics/:id`
Get a specific pet characteristic (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

## PUT `/pet-characteristics/:id` (Admin)
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

## DELETE `/pet-characteristics/:id` (Admin)
Delete a pet characteristic (requires admin permissions).

**Headers:**
```
Authorization: Bearer <token>
``` 