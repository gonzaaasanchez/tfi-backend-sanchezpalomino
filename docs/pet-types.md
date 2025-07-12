# Pet Types Routes

## Pet Type Management

### POST `/pet-types`
Create a new pet type (requires admin permissions).

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
  "name": "Perro"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Tipo de mascota creado exitosamente",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Perro",
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

### GET `/pet-types`
Get all pet types with pagination and search (requires authentication).

**Validations:**
- Valid JWT token required
- User must have permissions to read pet types

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
    petTypes: Array<{
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
  "message": "Tipos de mascota obtenidos exitosamente",
  "data": {
    "petTypes": [
      {
        "id": "507f1f77bcf86cd799439011",
        "name": "Perro",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      },
      {
        "id": "507f1f77bcf86cd799439012",
        "name": "Gato",
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

**Error Response:**
```json
{
  "success": false,
  "message": "No autorizado",
  "data": null
}
```

### GET `/pet-types/all`
Get all pet types without pagination (requires authentication). Useful for dropdowns and forms.

**Validations:**
- Valid JWT token required
- User must have permissions to read pet types

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  data: Array<{
    id: string;
    name: string;
  }>;
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Tipos de mascota obtenidos exitosamente",
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "Gato"
    },
    {
      "id": "507f1f77bcf86cd799439012",
      "name": "Perro"
    },
    {
      "id": "507f1f77bcf86cd799439013",
      "name": "Pájaro"
    }
  ]
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

### GET `/pet-types/:id`
Get a specific pet type (requires authentication).

**Validations:**
- Valid JWT token required
- User must have permissions to read pet types
- Pet type ID must exist

**Headers:**
```
Authorization: Bearer <token>
```

**Parameters:**
- `id`: MongoDB ObjectId of the pet type

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
  "message": "Tipo de mascota obtenido exitosamente",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Perro",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Tipo de mascota no encontrado",
  "data": null
}
```

### PUT `/pet-types/:id`
Update a pet type (requires admin permissions).

**Validations:**
- Valid JWT token required
- Admin permissions required
- Pet type ID must exist
- Name is required
- Name must be unique

**Headers:**
```
Authorization: Bearer <token>
```

**Parameters:**
- `id`: MongoDB ObjectId of the pet type

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
  "name": "Perro Doméstico"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Tipo de mascota actualizado exitosamente",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Perro Doméstico",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Ya existe un tipo de mascota con ese nombre",
  "data": null
}
```

### DELETE `/pet-types/:id`
Delete a pet type (requires admin permissions).

**Validations:**
- Valid JWT token required
- Admin permissions required
- Pet type ID must exist
- Cannot delete system pet types

**Headers:**
```
Authorization: Bearer <token>
```

**Parameters:**
- `id`: MongoDB ObjectId of the pet type

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
  "message": "Tipo de mascota eliminado exitosamente",
  "data": null
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "No se puede eliminar un tipo de mascota del sistema",
  "data": null
}
```