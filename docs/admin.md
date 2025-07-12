# Admin Routes

## Authentication

### POST `/admins/login`
Login for administrators.

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
    admin: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      role: {
        id: string;
        name: string;
        permissions: object;
      };
      createdAt: string;
      updatedAt: string;
    };
    token: string;
  };
}
```

**Example Request:**
```json
{
  "email": "admin@example.com",
  "password": "123456"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "admin": {
      "id": "507f1f77bcf86cd799439011",
      "firstName": "Admin",
      "lastName": "User",
      "email": "admin@example.com",
      "role": {
        "id": "507f1f77bcf86cd799439012",
        "name": "admin",
        "permissions": {}
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
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

### GET `/admins/me`
Get authenticated admin profile.

**Validations:**
- Valid JWT token required
- Admin must exist in database

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
    admin: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      role: {
        id: string;
        name: string;
        permissions: object;
      };
      createdAt: string;
      updatedAt: string;
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
    "admin": {
      "id": "507f1f77bcf86cd799439011",
      "firstName": "Admin",
      "lastName": "User",
      "email": "admin@example.com",
      "role": {
        "id": "507f1f77bcf86cd799439012",
        "name": "admin",
        "permissions": {}
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
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

## Admin Management

### GET `/admins`
Get all administrators (admin only).

**Validations:**
- Valid JWT token required
- Admin permissions required

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
    firstName: string;
    lastName: string;
    email: string;
    role: {
      id: string;
      name: string;
      permissions: object;
    };
    createdAt: string;
    updatedAt: string;
  }>;
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Admins obtenidos exitosamente",
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "firstName": "Admin",
      "lastName": "User",
      "email": "admin@example.com",
      "role": {
        "id": "507f1f77bcf86cd799439012",
        "name": "admin",
        "permissions": {}
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
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

### POST `/admins`
Create a new administrator (admin only).

**Validations:**
- Valid JWT token required
- Admin permissions required
- All fields are required
- Password must be at least 6 characters
- Email must be unique
- Role must exist and not be system role

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```typescript
{
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  roleId: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  data: {
    admin: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      role: {
        id: string;
        name: string;
        permissions: object;
      };
      createdAt: string;
      updatedAt: string;
    };
  };
}
```

**Example Request:**
```json
{
  "firstName": "New",
  "lastName": "Admin",
  "email": "new@example.com",
  "password": "123456",
  "roleId": "507f1f77bcf86cd799439012"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Admin creado exitosamente",
  "data": {
    "admin": {
      "id": "507f1f77bcf86cd799439013",
      "firstName": "New",
      "lastName": "Admin",
      "email": "new@example.com",
      "role": {
        "id": "507f1f77bcf86cd799439012",
        "name": "admin",
        "permissions": {}
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
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

### GET `/admins/:id`
Get a specific administrator (admin only).

**Validations:**
- Valid JWT token required
- Admin permissions required
- Admin ID must exist

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
    admin: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      role: {
        id: string;
        name: string;
        permissions: object;
      };
      createdAt: string;
      updatedAt: string;
    };
  };
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Admin obtenido exitosamente",
  "data": {
    "admin": {
      "id": "507f1f77bcf86cd799439011",
      "firstName": "Admin",
      "lastName": "User",
      "email": "admin@example.com",
      "role": {
        "id": "507f1f77bcf86cd799439012",
        "name": "admin",
        "permissions": {}
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Admin no encontrado",
  "data": null
}
```

### PUT `/admins/:id`
Update an administrator (admin only).

**Validations:**
- Valid JWT token required
- Admin permissions required
- Admin ID must exist
- Role must exist and not be system role

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```typescript
{
  firstName?: string;
  lastName?: string;
  email?: string;
  roleId?: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  data: {
    admin: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      role: {
        id: string;
        name: string;
        permissions: object;
      };
      createdAt: string;
      updatedAt: string;
    };
  };
}
```

**Example Request:**
```json
{
  "firstName": "Admin",
  "lastName": "Updated",
  "email": "admin@example.com",
  "roleId": "507f1f77bcf86cd799439012"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Admin actualizado exitosamente",
  "data": {
    "admin": {
      "id": "507f1f77bcf86cd799439011",
      "firstName": "Admin",
      "lastName": "Updated",
      "email": "admin@example.com",
      "role": {
        "id": "507f1f77bcf86cd799439012",
        "name": "admin",
        "permissions": {}
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Admin no encontrado",
  "data": null
}
```

### DELETE `/admins/:id`
Delete an administrator (admin only).

**Validations:**
- Valid JWT token required
- Admin permissions required
- Admin ID must exist

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
  "message": "Admin eliminado exitosamente",
  "data": null
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Admin no encontrado",
  "data": null
}
```

## Role Management

### GET `/roles`
Get all roles (admin only).

**Validations:**
- Valid JWT token required
- Admin permissions required

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
    permissions: object;
    isSystem: boolean;
    createdAt: string;
    updatedAt: string;
  }>;
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Roles obtenidos exitosamente",
  "data": [
    {
      "id": "507f1f77bcf86cd799439012",
      "name": "admin",
      "permissions": {
        "users": ["read", "update", "delete"],
        "pets": ["read", "create", "update", "delete"]
      },
      "isSystem": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
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

### POST `/roles`
Create a new role (admin only).

**Validations:**
- Valid JWT token required
- Admin permissions required
- Name is required
- Permissions object is required

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```typescript
{
  name: string;
  permissions: object;
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
    permissions: object;
    isSystem: boolean;
    createdAt: string;
    updatedAt: string;
  };
}
```

**Example Request:**
```json
{
  "name": "moderator",
  "permissions": {
    "users": ["read", "update"],
    "pets": ["read", "create", "update", "delete"]
  }
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Rol creado exitosamente",
  "data": {
    "id": "507f1f77bcf86cd799439013",
    "name": "moderator",
    "permissions": {
      "users": ["read", "update"],
      "pets": ["read", "create", "update", "delete"]
    },
    "isSystem": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "El nombre del rol es requerido",
  "data": null
}
```

### PUT `/roles/:id`
Update a role (admin only).

**Validations:**
- Valid JWT token required
- Admin permissions required
- Role ID must exist

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```typescript
{
  name?: string;
  permissions?: object;
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
    permissions: object;
    isSystem: boolean;
    createdAt: string;
    updatedAt: string;
  };
}
```

**Example Request:**
```json
{
  "name": "moderator_updated",
  "permissions": {
    "users": ["read", "update", "delete"],
    "pets": ["read", "create", "update", "delete"]
  }
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Rol actualizado exitosamente",
  "data": {
    "id": "507f1f77bcf86cd799439013",
    "name": "moderator_updated",
    "permissions": {
      "users": ["read", "update", "delete"],
      "pets": ["read", "create", "update", "delete"]
    },
    "isSystem": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Rol no encontrado",
  "data": null
}
```

### DELETE `/roles/:id`
Delete a role (admin only).

**Validations:**
- Valid JWT token required
- Admin permissions required
- Role ID must exist
- Cannot delete system roles

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
  "message": "Rol eliminado exitosamente",
  "data": null
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "No se puede eliminar un rol del sistema",
  "data": null
}
```

## Audit Logs

### GET `/logs/:entityType/:entityId`
Get audit logs for a specific entity (admin only).

**Validations:**
- Valid JWT token required
- Admin permissions required
- Entity type and ID must be valid

**Headers:**
```
Authorization: Bearer <token>
```

**Parameters:**
- `entityType`: Type of entity (e.g., "User", "Pet", "Reservation")
- `entityId`: ID of the specific entity

**Response:**
```typescript
{
  success: boolean;
  message: string;
  data: {
    logs: Array<{
      id: string;
      action: string;
      entity: string;
      entityId: string;
      userId: string;
      userEmail: string;
      changes: {
        before: object | null;
        after: object | null;
      };
      timestamp: string;
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
  "message": "Logs obtenidos exitosamente",
  "data": {
    "logs": [
      {
        "id": "507f1f77bcf86cd799439014",
        "action": "CREATE",
        "entity": "Pet",
        "entityId": "507f1f77bcf86cd799439015",
        "userId": "507f1f77bcf86cd799439016",
        "userEmail": "john@example.com",
        "changes": {
          "before": null,
          "after": {
            "name": "Luna",
            "petType": "507f1f77bcf86cd799439017"
          }
        },
        "timestamp": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10
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