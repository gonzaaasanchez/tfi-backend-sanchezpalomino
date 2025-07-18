# Roles Routes

## Role Management

### GET `/roles`
Get all roles with pagination.

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
    description: string;
    permissions: {
      users: {
        create: boolean;
        read: boolean;
        update: boolean;
        delete: boolean;
        getAll: boolean;
      };
      roles: {
        create: boolean;
        read: boolean;
        update: boolean;
        delete: boolean;
        getAll: boolean;
      };
      admins: {
        create: boolean;
        read: boolean;
        update: boolean;
        delete: boolean;
        getAll: boolean;
      };
      logs: {
        read: boolean;
        getAll: boolean;
      };
      petTypes: {
        create: boolean;
        read: boolean;
        update: boolean;
        delete: boolean;
        getAll: boolean;
      };
      petCharacteristics: {
        create: boolean;
        read: boolean;
        update: boolean;
        delete: boolean;
        getAll: boolean;
      };
      pets: {
        create: boolean;
        read: boolean;
        update: boolean;
        delete: boolean;
        getAll: boolean;
      };
      caregiverSearch: {
        read: boolean;
      };
      reservations: {
        create: boolean;
        read: boolean;
        update: boolean;
        admin: boolean;
      };
      reviews: {
        create: boolean;
        read: boolean;
      };
      posts: {
        create: boolean;
        read: boolean;
        delete: boolean;
        getAll: boolean;
      };
      comments: {
        create: boolean;
        getAll: boolean;
        delete: boolean;
      };
      likes: {
        create: boolean;
        delete: boolean;
      };
    };
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
      "id": "507f1f77bcf86cd799439011",
      "name": "superadmin",
      "description": "Administrador con acceso completo al sistema",
      "permissions": {
        "users": {
          "create": true,
          "read": true,
          "update": true,
          "delete": true,
          "getAll": true
        },
        "roles": {
          "create": true,
          "read": true,
          "update": true,
          "delete": true,
          "getAll": true
        },
        "admins": {
          "create": true,
          "read": true,
          "update": true,
          "delete": true,
          "getAll": true
        },
        "logs": {
          "read": true,
          "getAll": true
        },
        "petTypes": {
          "create": true,
          "read": true,
          "update": true,
          "delete": true,
          "getAll": true
        },
        "petCharacteristics": {
          "create": true,
          "read": true,
          "update": true,
          "delete": true,
          "getAll": true
        },
        "pets": {
          "create": true,
          "read": true,
          "update": true,
          "delete": true,
          "getAll": true
        },
        "caregiverSearch": {
          "read": true
        },
        "reservations": {
          "create": true,
          "read": true,
          "update": true,
          "admin": true
        },
        "reviews": {
          "create": true,
          "read": true
        },
        "posts": {
          "create": true,
          "read": true,
          "delete": true,
          "getAll": true
        },
        "comments": {
          "create": true,
          "getAll": true,
          "delete": true
        },
        "likes": {
          "create": true,
          "delete": true
        }
      },
      "isSystem": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### GET `/roles/permissions/template`
Get empty permissions template for creating new roles.

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
  data: {
    users: {
      create: boolean;
      read: boolean;
      update: boolean;
      delete: boolean;
      getAll: boolean;
    };
    roles: {
      create: boolean;
      read: boolean;
      update: boolean;
      delete: boolean;
      getAll: boolean;
    };
    admins: {
      create: boolean;
      read: boolean;
      update: boolean;
      delete: boolean;
      getAll: boolean;
    };
    logs: {
      read: boolean;
      getAll: boolean;
    };
    petTypes: {
      create: boolean;
      read: boolean;
      update: boolean;
      delete: boolean;
      getAll: boolean;
    };
    petCharacteristics: {
      create: boolean;
      read: boolean;
      update: boolean;
      delete: boolean;
      getAll: boolean;
    };
    pets: {
      create: boolean;
      read: boolean;
      update: boolean;
      delete: boolean;
      getAll: boolean;
    };
    caregiverSearch: {
      read: boolean;
    };
    reservations: {
      create: boolean;
      read: boolean;
      update: boolean;
      admin: boolean;
    };
    reviews: {
      create: boolean;
      read: boolean;
    };
    posts: {
      create: boolean;
      read: boolean;
      delete: boolean;
      getAll: boolean;
    };
    comments: {
      create: boolean;
      getAll: boolean;
      delete: boolean;
    };
    likes: {
      create: boolean;
      delete: boolean;
    };
  };
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Plantilla de permisos obtenida exitosamente",
  "data": {
    "users": {
      "create": false,
      "read": false,
      "update": false,
      "delete": false,
      "getAll": false
    },
    "roles": {
      "create": false,
      "read": false,
      "update": false,
      "delete": false,
      "getAll": false
    },
    "admins": {
      "create": false,
      "read": false,
      "update": false,
      "delete": false,
      "getAll": false
    },
    "logs": {
      "read": false,
      "getAll": false
    },
    "petTypes": {
      "create": false,
      "read": false,
      "update": false,
      "delete": false,
      "getAll": false
    },
    "petCharacteristics": {
      "create": false,
      "read": false,
      "update": false,
      "delete": false,
      "getAll": false
    },
    "pets": {
      "create": false,
      "read": false,
      "update": false,
      "delete": false,
      "getAll": false
    },
    "caregiverSearch": {
      "read": false
    },
    "reservations": {
      "create": false,
      "read": false,
      "update": false,
      "admin": false
    },
    "reviews": {
      "create": false,
      "read": false
    },
    "posts": {
      "create": false,
      "read": false,
      "delete": false,
      "getAll": false
    },
    "comments": {
      "create": false,
      "getAll": false,
      "delete": false
    },
    "likes": {
      "create": false,
      "delete": false
    }
  }
}
```

### GET `/roles/:id`
Get a specific role by ID.

**Validations:**
- Valid JWT token required
- Admin permissions required
- Role ID must exist

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `id`: Role ID

**Response:**
```typescript
{
  success: boolean;
  message: string;
  data: {
    id: string;
    name: string;
    description: string;
    permissions: object;
    isSystem: boolean;
    createdAt: string;
    updatedAt: string;
  };
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Rol obtenido exitosamente",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "user",
    "description": "Usuario regular del sistema",
    "permissions": {
      "users": {
        "create": false,
        "read": true,
        "update": true,
        "delete": false,
        "getAll": false
      },
      "pets": {
        "create": true,
        "read": true,
        "update": true,
        "delete": true,
        "getAll": false
      },
      "petTypes": {
        "create": false,
        "read": true,
        "update": false,
        "delete": false,
        "getAll": true
      },
      "petCharacteristics": {
        "create": false,
        "read": true,
        "update": false,
        "delete": false,
        "getAll": true
      },
      "roles": {
        "create": false,
        "read": false,
        "update": false,
        "delete": false,
        "getAll": false
      },
      "admins": {
        "create": false,
        "read": false,
        "update": false,
        "delete": false,
        "getAll": false
      },
      "logs": {
        "read": false,
        "getAll": false
      },
      "caregiverSearch": {
        "read": true
      },
      "reservations": {
        "create": true,
        "read": true,
        "update": true,
        "admin": false
      },
      "reviews": {
        "create": true,
        "read": true
      },
      "posts": {
        "create": true,
        "read": true,
        "delete": true,
        "getAll": true
      },
      "comments": {
        "create": true,
        "getAll": true,
        "delete": true
      },
      "likes": {
        "create": true,
        "delete": true
      }
    },
    "isSystem": true,
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

### POST `/roles`
Create a new role.

**Validations:**
- Valid JWT token required
- Admin permissions required
- Name and description are required
- All permissions must be provided
- Role name must be unique
- Cannot create system roles (superadmin, user)

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```typescript
{
  name: string;
  description: string;
  permissions: {
    users: {
      create: boolean;
      read: boolean;
      update: boolean;
      delete: boolean;
      getAll: boolean;
    };
    roles: {
      create: boolean;
      read: boolean;
      update: boolean;
      delete: boolean;
      getAll: boolean;
    };
    admins: {
      create: boolean;
      read: boolean;
      update: boolean;
      delete: boolean;
      getAll: boolean;
    };
    logs: {
      read: boolean;
      getAll: boolean;
    };
    petTypes: {
      create: boolean;
      read: boolean;
      update: boolean;
      delete: boolean;
      getAll: boolean;
    };
    petCharacteristics: {
      create: boolean;
      read: boolean;
      update: boolean;
      delete: boolean;
      getAll: boolean;
    };
    pets: {
      create: boolean;
      read: boolean;
      update: boolean;
      delete: boolean;
      getAll: boolean;
    };
    caregiverSearch: {
      read: boolean;
    };
    reservations: {
      create: boolean;
      read: boolean;
      update: boolean;
      admin: boolean;
    };
    reviews: {
      create: boolean;
      read: boolean;
    };
    posts: {
      create: boolean;
      read: boolean;
      delete: boolean;
      getAll: boolean;
    };
    comments: {
      create: boolean;
      getAll: boolean;
      delete: boolean;
    };
    likes: {
      create: boolean;
      delete: boolean;
    };
  };
}
```

**Example Request:**
```json
{
  "name": "moderator",
  "description": "Moderador con permisos limitados",
  "permissions": {
    "users": {
      "create": false,
      "read": true,
      "update": false,
      "delete": false,
      "getAll": true
    },
    "roles": {
      "create": false,
      "read": false,
      "update": false,
      "delete": false,
      "getAll": false
    },
    "admins": {
      "create": false,
      "read": false,
      "update": false,
      "delete": false,
      "getAll": false
    },
    "logs": {
      "read": true,
      "getAll": true
    },
    "petTypes": {
      "create": false,
      "read": true,
      "update": false,
      "delete": false,
      "getAll": true
    },
    "petCharacteristics": {
      "create": false,
      "read": true,
      "update": false,
      "delete": false,
      "getAll": true
    },
    "pets": {
      "create": false,
      "read": true,
      "update": false,
      "delete": false,
      "getAll": true
    },
    "caregiverSearch": {
      "read": true
    },
    "reservations": {
      "create": false,
      "read": true,
      "update": false,
      "admin": false
    },
    "reviews": {
      "create": false,
      "read": true
    },
    "posts": {
      "create": false,
      "read": true,
      "delete": true,
      "getAll": true
    },
    "comments": {
      "create": false,
      "getAll": true,
      "delete": true
    },
    "likes": {
      "create": false,
      "delete": false
    }
  }
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Rol creado exitosamente",
  "data": {
    "id": "507f1f77bcf86cd799439012",
    "name": "moderator",
    "description": "Moderador con permisos limitados",
    "permissions": {
      "users": {
        "create": false,
        "read": true,
        "update": false,
        "delete": false,
        "getAll": true
      },
      "roles": {
        "create": false,
        "read": false,
        "update": false,
        "delete": false,
        "getAll": false
      },
      "admins": {
        "create": false,
        "read": false,
        "update": false,
        "delete": false,
        "getAll": false
      },
      "logs": {
        "read": true,
        "getAll": true
      },
      "petTypes": {
        "create": false,
        "read": true,
        "update": false,
        "delete": false,
        "getAll": true
      },
      "petCharacteristics": {
        "create": false,
        "read": true,
        "update": false,
        "delete": false,
        "getAll": true
      },
      "pets": {
        "create": false,
        "read": true,
        "update": false,
        "delete": false,
        "getAll": true
      },
      "caregiverSearch": {
        "read": true
      },
      "reservations": {
        "create": false,
        "read": true,
        "update": false,
        "admin": false
      },
      "reviews": {
        "create": false,
        "read": true
      },
      "posts": {
        "create": false,
        "read": true,
        "delete": true,
        "getAll": true
      },
      "comments": {
        "create": false,
        "getAll": true,
        "delete": true
      },
      "likes": {
        "create": false,
        "delete": false
      }
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
  "message": "El rol ya existe",
  "data": null
}
```

### PUT `/roles/:id`
Update an existing role.

**Validations:**
- Valid JWT token required
- Admin permissions required
- Role ID must exist
- Cannot modify system roles

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `id`: Role ID

**Request Body:**
```typescript
{
  name?: string;
  description?: string;
  permissions?: object;
}
```

**Example Request:**
```json
{
  "description": "Moderador con permisos actualizados",
  "permissions": {
    "users": {
      "create": false,
      "read": true,
      "update": true,
      "delete": false,
      "getAll": true
    }
  }
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Rol actualizado exitosamente",
  "data": {
    "id": "507f1f77bcf86cd799439012",
    "name": "moderator",
    "description": "Moderador con permisos actualizados",
    "permissions": {
      "users": {
        "create": false,
        "read": true,
        "update": true,
        "delete": false,
        "getAll": true
      }
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
  "message": "No se puede modificar roles del sistema",
  "data": null
}
```

### DELETE `/roles/:id`
Delete a role.

**Validations:**
- Valid JWT token required
- Admin permissions required
- Role ID must exist
- Cannot delete system roles

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `id`: Role ID

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
  "message": "No se puede eliminar roles del sistema",
  "data": null
}
```

## Permissions

### Admin Permissions
- `roles.getAll`: Get all roles
- `roles.read`: Get specific role and permissions template
- `roles.create`: Create new roles
- `roles.update`: Update existing roles
- `roles.delete`: Delete roles

## Notes

- System roles (`superadmin`, `user`) cannot be created, modified, or deleted
- All permissions must be provided when creating a role
- Role names must be unique
- Changes to roles are logged for audit purposes
- The permissions template endpoint provides the complete structure with all values set to `false`
- Custom roles can have any combination of permissions
- Role changes affect all users assigned to that role immediately 