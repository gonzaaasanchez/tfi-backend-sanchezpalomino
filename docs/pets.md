# Pets Routes

## Pet Management

### POST `/pets`
Create a new pet (requires authentication).

**Validations:**
- Valid JWT token required
- Name is required
- petTypeId is required and must exist
- Characteristics must have valid characteristicId and value

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body (multipart/form-data):**
```typescript
{
  name: string;
  comment?: string;
  petTypeId: string;
  characteristics?: Array<{
    characteristicId: string;
    value: string;
  }>;
  avatarFile?: File;
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
    comment?: string;
    avatar?: string;
    petType: {
      id: string;
      name: string;
    };
    characteristics: Array<{
      id: string;
      name: string;
      value: string;
    }>;
    owner: {
      id: string;
      firstName: string;
      lastName: string;
    };
    createdAt: string;
    updatedAt: string;
  };
}
```

**Example Request:**
```json
{
  "name": "Luna",
  "comment": "Mi perrita favorita",
  "petTypeId": "507f1f77bcf86cd799439011",
  "characteristics": [
  {
      "characteristicId": "507f1f77bcf86cd799439012",
    "value": "grande"
  },
  {
      "characteristicId": "507f1f77bcf86cd799439013",
    "value": "5 años"
  }
  ]
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Mascota creada exitosamente",
  "data": {
    "id": "507f1f77bcf86cd799439014",
    "name": "Luna",
    "comment": "Mi perrita favorita",
    "avatar": "/api/pets/507f1f77bcf86cd799439014/avatar",
    "petType": {
      "id": "507f1f77bcf86cd799439011",
      "name": "Perro"
    },
    "characteristics": [
      {
        "id": "507f1f77bcf86cd799439012",
        "name": "Tamaño",
        "value": "grande"
      },
      {
        "id": "507f1f77bcf86cd799439013",
        "name": "Edad",
        "value": "5 años"
      }
    ],
    "owner": {
      "id": "507f1f77bcf86cd799439015",
      "firstName": "John",
      "lastName": "Doe"
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "El nombre de la mascota es requerido",
  "data": null
}
```

### GET `/pets/admin/all`
Get all pets with pagination and filters (admin only).

**Validations:**
- Valid JWT token required
- Admin permissions required

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `search`: Search by pet name
- `petType`: Filter by pet type ID
- `owner`: Filter by owner ID

**Response:**
```typescript
{
  success: boolean;
  message: string;
  data: {
    items: Array<{
      id: string;
      name: string;
      comment?: string;
      avatar?: string;
      petType: {
        id: string;
        name: string;
      };
      characteristics: Array<{
        id: string;
        name: string;
        value: string;
      }>;
      owner: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
      };
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
  "message": "Mascotas obtenidas exitosamente",
  "data": {
    "items": [
      {
        "id": "507f1f77bcf86cd799439014",
        "name": "Luna",
        "comment": "Mi perrita favorita",
        "avatar": "/api/pets/507f1f77bcf86cd799439014/avatar",
        "petType": {
          "id": "507f1f77bcf86cd799439011",
          "name": "Perro"
        },
        "characteristics": [
          {
            "id": "507f1f77bcf86cd799439012",
            "name": "Tamaño",
            "value": "grande"
          }
        ],
        "owner": {
          "id": "507f1f77bcf86cd799439015",
          "firstName": "John",
          "lastName": "Doe",
          "email": "john@example.com"
        },
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

### GET `/pets/admin/:id`
Get a specific pet (admin only).

**Validations:**
- Valid JWT token required
- Admin permissions required
- Pet ID must exist

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
    id: string;
    name: string;
    comment?: string;
    avatar?: string;
    petType: {
      id: string;
      name: string;
    };
    characteristics: Array<{
      id: string;
      name: string;
      value: string;
    }>;
    owner: {
      id: string;
      firstName: string;
      lastName: string;
    };
    createdAt: string;
    updatedAt: string;
  };
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Mascota obtenida exitosamente",
  "data": {
    "id": "507f1f77bcf86cd799439014",
    "name": "Luna",
    "comment": "Mi perrita favorita",
    "avatar": "/api/pets/507f1f77bcf86cd799439014/avatar",
    "petType": {
      "id": "507f1f77bcf86cd799439011",
      "name": "Perro"
    },
    "characteristics": [
      {
        "id": "507f1f77bcf86cd799439012",
        "name": "Tamaño",
        "value": "grande"
      }
    ],
    "owner": {
      "id": "507f1f77bcf86cd799439015",
      "firstName": "John",
      "lastName": "Doe"
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### GET `/pets/:id/avatar`
Get pet avatar (public endpoint).

**Validations:**
- Pet ID must exist
- Pet must have an avatar

**Response:**
- Image file with appropriate content type

**Error Response:**
```json
{
  "success": false,
  "message": "Avatar no encontrado",
  "data": null
}
```

### GET `/pets/my`
Get the authenticated user's pets with pagination and filters. **Paginated**

**Validations:**
- Valid JWT token required

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `search`: Search by pet name
- `petType`: Filter by pet type ID

**Response:**
```typescript
{
  success: boolean;
  message: string;
  data: {
    items: Array<{
      id: string;
      name: string;
      comment?: string;
      avatar?: string;
      petType: {
        id: string;
        name: string;
      };
      characteristics: Array<{
        id: string;
        name: string;
        value: string;
      }>;
      owner: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
      };
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
  "message": "Pets obtained successfully",
  "data": {
    "items": [
      {
        "id": "507f1f77bcf86cd799439014",
        "name": "Luna",
        "comment": "Mi perrita favorita",
        "avatar": "/api/pets/507f1f77bcf86cd799439014/avatar",
        "petType": {
          "id": "507f1f77bcf86cd799439011",
          "name": "Perro"
        },
        "characteristics": [
          {
            "characteristic": {
              "id": "507f1f77bcf86cd799439012",
              "name": "Tamaño"
            },
            "value": "grande"
          }
        ],
        "owner": {
          "id": "507f1f77bcf86cd799439015",
          "firstName": "John",
          "lastName": "Doe",
          "email": "john@example.com"
        },
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 3,
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

### GET `/pets/:id`
Get a specific pet (only if owner).

**Validations:**
- Valid JWT token required
- Pet ID must exist
- User must be the owner of the pet

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
    id: string;
    name: string;
    comment?: string;
    avatar?: string;
    petType: {
      id: string;
      name: string;
    };
    characteristics: Array<{
      characteristic: {
        id: string;
        name: string;
      };
      value: string;
    }>;
    owner: {
      id: string;
      firstName: string;
      lastName: string;
    };
    createdAt: string;
    updatedAt: string;
  };
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Mascota obtenida exitosamente",
  "data": {
    "id": "507f1f77bcf86cd799439014",
    "name": "Luna",
    "comment": "Mi perrita favorita",
    "avatar": "/api/pets/507f1f77bcf86cd799439014/avatar",
    "petType": {
      "id": "507f1f77bcf86cd799439011",
      "name": "Perro"
    },
    "characteristics": [
      {
        "characteristic": {
          "id": "507f1f77bcf86cd799439012",
          "name": "Tamaño"
        },
        "value": "grande"
      }
    ],
    "owner": {
      "id": "507f1f77bcf86cd799439015",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com"
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Mascota no encontrada",
  "data": null
}
```

### PUT `/pets/:id`
Update a pet (only if owner).

**Validations:**
- Valid JWT token required
- Pet ID must exist
- User must be the owner of the pet
- petTypeId must exist if provided
- Characteristics must have valid characteristicId and value

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body (multipart/form-data):**
```typescript
{
  name?: string;
  comment?: string;
  petTypeId?: string;
  characteristics?: Array<{
    characteristicId: string;
    value: string;
  }>;
  avatarFile?: File;
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
    comment?: string;
    avatar?: string;
    petType: {
      id: string;
      name: string;
    };
    characteristics: Array<{
      characteristic: {
        id: string;
        name: string;
      };
      value: string;
    }>;
    owner: {
      id: string;
      firstName: string;
      lastName: string;
    };
    createdAt: string;
    updatedAt: string;
  };
}
```

**Example Request:**
```json
{
  "name": "Luna Bella",
  "comment": "Mi perrita favorita actualizada",
  "petTypeId": "507f1f77bcf86cd799439011",
  "characteristics": [
    {
      "characteristicId": "507f1f77bcf86cd799439012",
      "value": "mediano"
    }
  ]
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Mascota actualizada exitosamente",
  "data": {
    "id": "507f1f77bcf86cd799439014",
    "name": "Luna Bella",
    "comment": "Mi perrita favorita actualizada",
    "avatar": "/api/pets/507f1f77bcf86cd799439014/avatar",
    "petType": {
      "id": "507f1f77bcf86cd799439011",
      "name": "Perro"
    },
    "characteristics": [
      {
        "characteristic": {
          "id": "507f1f77bcf86cd799439012",
          "name": "Tamaño"
        },
        "value": "mediano"
      }
    ],
    "owner": {
      "id": "507f1f77bcf86cd799439015",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com"
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Mascota no encontrada",
  "data": null
}
```

### DELETE `/pets/:id`
Delete a pet (only if owner).

**Validations:**
- Valid JWT token required
- Pet ID must exist
- User must be the owner of the pet

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
  "message": "Mascota eliminada exitosamente",
  "data": null
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Mascota no encontrada",
  "data": null
}
```

### GET `/pets/:id/avatar`
Get a pet's avatar (public endpoint).

**Validations:**
- Pet ID must exist
- Pet must have avatar

**Response:** Binary image data with appropriate Content-Type header.

**Success Response:**
```
Content-Type: image/jpeg
[Binary image data]
```

**Error Response:**
```json
{
  "success": false,
  "message": "Avatar no encontrado",
  "data": null
}
```

## Admin Pet Management

### GET `/pets/admin/all`
Get all pets with advanced filters (admin only). **Paginated**

**Validations:**
- Valid JWT token required
- Admin permissions required

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `search`: Search by pet name
- `petType`: Filter by pet type ID
- `owner`: Filter by owner ID

**Response:**
```typescript
{
  success: boolean;
  message: string;
  data: {
    pets: Array<{
      id: string;
      name: string;
      comment?: string;
      avatar?: string;
      petType: {
        id: string;
        name: string;
      };
      characteristics: Array<{
        characteristic: {
          id: string;
          name: string;
        };
        value: string;
      }>;
      owner: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
      };
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
  "message": "Mascotas obtenidas exitosamente",
  "data": {
    "pets": [
      {
        "id": "507f1f77bcf86cd799439014",
        "name": "Luna",
        "comment": "Mi perrita favorita",
        "avatar": "/api/pets/507f1f77bcf86cd799439014/avatar",
        "petType": {
          "id": "507f1f77bcf86cd799439011",
          "name": "Perro"
        },
        "characteristics": [
          {
            "characteristic": {
              "id": "507f1f77bcf86cd799439012",
              "name": "Tamaño"
            },
            "value": "grande"
          }
        ],
        "owner": {
          "id": "507f1f77bcf86cd799439015",
          "firstName": "John",
          "lastName": "Doe",
          "email": "john@example.com"
        },
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
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