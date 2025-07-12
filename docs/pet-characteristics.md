# Pet Characteristics Routes

## Pet Characteristic Management

### POST `/pet-characteristics`
Create a new pet characteristic (requires admin permissions).

**Validations:**
- Valid JWT token required
- Admin permissions required
- Name is required
- Name must be unique

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```typescript
{
  name: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  data: {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
  };
}
```

**Example Request:**
```json
{
  "name": "Tamaño"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Característica de mascota creada exitosamente",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Tamaño",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "El nombre es requerido",
  "data": null
}
```

### GET `/pet-characteristics`
Get all pet characteristics with pagination and search (requires authentication).

**Validations:**
- Valid JWT token required
- User must have permissions to read pet characteristics

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `search`: Search by name

**Response:**
```typescript
{
  success: boolean;
  message: string;
  data: {
    items: Array<{
      id: string;
      name: string;
      createdAt: string;
      updatedAt: string;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Características de mascota obtenidas exitosamente",
  "data": {
    "items": [
      {
        "id": "507f1f77bcf86cd799439011",
        "name": "Tamaño",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      },
      {
        "id": "507f1f77bcf86cd799439012",
        "name": "Edad",
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

**Error Response:**
```json
{
  "success": false,
  "message": "No autorizado",
  "data": null
}
```

### GET `/pet-characteristics/:id`
Get a specific pet characteristic (requires authentication).

**Validations:**
- Valid JWT token required
- User must have permissions to read pet characteristics
- Characteristic ID must exist

**Headers:**
```
Authorization: Bearer <token>
```

**Parameters:**
- `id`: MongoDB ObjectId of the pet characteristic

**Response:**
```typescript
{
  success: boolean;
  message: string;
  data: {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
  };
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Característica de mascota obtenida exitosamente",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Tamaño",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Característica de mascota no encontrada",
  "data": null
}
```

### PUT `/pet-characteristics/:id`
Update a pet characteristic (requires admin permissions).

**Validations:**
- Valid JWT token required
- Admin permissions required
- Characteristic ID must exist
- Name is required
- Name must be unique

**Headers:**
```
Authorization: Bearer <token>
```

**Parameters:**
- `id`: MongoDB ObjectId of the pet characteristic

**Request Body:**
```typescript
{
  name: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  data: {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
  };
}
```

**Example Request:**
```json
{
  "name": "Tamaño del Animal"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Característica de mascota actualizada exitosamente",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Tamaño del Animal",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Ya existe una característica con ese nombre",
  "data": null
}
```

### DELETE `/pet-characteristics/:id`
Delete a pet characteristic (requires admin permissions).

**Validations:**
- Valid JWT token required
- Admin permissions required
- Characteristic ID must exist
- Cannot delete if characteristic is being used by pets

**Headers:**
```
Authorization: Bearer <token>
```

**Parameters:**
- `id`: MongoDB ObjectId of the pet characteristic

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
  "message": "Característica de mascota eliminada exitosamente",
  "data": null
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "No se puede eliminar una característica que está siendo utilizada",
  "data": null
}
``` 