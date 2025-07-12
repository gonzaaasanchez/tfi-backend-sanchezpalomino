# Users Routes

## Authentication

### GET `/users/me`
Get the authenticated user's profile.

**Validations:**
- Valid JWT token required
- User must exist in database

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
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    avatar?: string;
    role: {
      id: string;
      name: string;
      permissions: object;
    };
    carerConfig?: {
      homeCare: {
        enabled: boolean;
        dayPrice?: number;
      };
      petHomeCare: {
        enabled: boolean;
        visitPrice?: number;
      };
      petTypes: Array<{
        id: string;
        name: string;
      }>;
      careAddress?: string;
      careAddressData?: {
        id: string;
        name: string;
        address: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
      };
    };
    addresses?: Array<{
      id: string;
      name: string;
      address: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    }>;
    createdAt: string;
    updatedAt: string;
  };
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Perfil obtenido exitosamente",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phoneNumber": "+1234567890",
    "avatar": "/api/users/507f1f77bcf86cd799439011/avatar",
    "role": {
      "id": "507f1f77bcf86cd799439012",
      "name": "user",
      "permissions": {}
    },
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
          "id": "507f1f77bcf86cd799439013",
          "name": "Perro"
        }
      ],
      "careAddress": "507f1f77bcf86cd799439014",
      "careAddressData": {
        "id": "507f1f77bcf86cd799439014",
        "name": "Casa",
        "address": "123 Main St",
        "city": "New York",
        "state": "NY",
        "zipCode": "10001",
        "country": "USA"
      }
    },
    "addresses": [
      {
        "id": "507f1f77bcf86cd799439014",
        "name": "Casa",
        "address": "123 Main St",
        "city": "New York",
        "state": "NY",
        "zipCode": "10001",
        "country": "USA"
      }
    ],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
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

### PUT `/users/me`
Update the authenticated user's profile and avatar (optional).

**Validations:**
- Valid JWT token required
- User must exist in database
- Cannot modify sensitive fields (role, _id, createdAt, updatedAt)

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body (multipart/form-data):**
```typescript
{
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
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
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    avatar?: string;
    role: {
      id: string;
      name: string;
      permissions: object;
    };
    carerConfig?: {
      homeCare: {
        enabled: boolean;
        dayPrice?: number;
      };
      petHomeCare: {
        enabled: boolean;
        visitPrice?: number;
      };
      petTypes: Array<{
        id: string;
        name: string;
      }>;
      careAddress?: string;
      careAddressData?: {
        id: string;
        name: string;
        address: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
      };
    };
    addresses?: Array<{
      id: string;
      name: string;
      address: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    }>;
    createdAt: string;
    updatedAt: string;
  };
}
```

**Example Request:**
```json
{
    "firstName": "John",
  "lastName": "Updated",
    "email": "john@example.com",
  "phoneNumber": "+1234567890"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Perfil actualizado exitosamente",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Updated",
    "email": "john@example.com",
    "phoneNumber": "+1234567890",
    "avatar": "/api/users/507f1f77bcf86cd799439011/avatar",
    "role": {
      "id": "507f1f77bcf86cd799439012",
      "name": "user",
      "permissions": {}
    },
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
          "id": "507f1f77bcf86cd799439013",
          "name": "Perro"
        }
      ],
      "careAddress": "507f1f77bcf86cd799439014"
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
  "message": "El email ya está registrado",
  "data": null
}
```

### GET `/users/:id/avatar`
Get a user's profile avatar (public endpoint).

**Validations:**
- User ID must exist
- User must have avatar

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

### PUT `/users/me/carer-config`
Update the authenticated user's care configuration.

**Validations:**
- Valid JWT token required
- Only carerConfig field is allowed to be updated
- If homeCare.enabled is true, dayPrice is required
- If petHomeCare.enabled is true, visitPrice is required
- petTypes must be valid IDs of existing pet types
- careAddress must be a valid ID of one of the user's addresses (or null to clear it)

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```typescript
{
  carerConfig: {
    homeCare: {
      enabled: boolean;
      dayPrice?: number;
    };
    petHomeCare: {
      enabled: boolean;
      visitPrice?: number;
    };
    petTypes: string[];
    careAddress?: string | null;
  };
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  data: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    carerConfig: {
      homeCare: {
        enabled: boolean;
        dayPrice?: number;
      };
      petHomeCare: {
        enabled: boolean;
        visitPrice?: number;
      };
      petTypes: Array<{
        id: string;
        name: string;
      }>;
      careAddress?: string;
    };
  };
}
```

**Example Request:**
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
    "petTypes": ["507f1f77bcf86cd799439013", "507f1f77bcf86cd799439014"],
    "careAddress": "507f1f77bcf86cd799439015"
  }
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Configuración de cuidado actualizada exitosamente",
  "data": {
    "id": "507f1f77bcf86cd799439011",
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
          "id": "507f1f77bcf86cd799439013",
          "name": "Perro"
        },
        {
          "id": "507f1f77bcf86cd799439014",
          "name": "Gato"
        }
      ],
      "careAddress": "507f1f77bcf86cd799439015"
    }
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Si el cuidado en casa está habilitado, el precio diario es requerido",
  "data": null
}
```

## Address Management

### GET `/users/me/addresses`
Get the authenticated user's addresses.

**Validations:**
- Valid JWT token required

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
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  }>;
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Direcciones obtenidas exitosamente",
  "data": [
    {
      "id": "507f1f77bcf86cd799439014",
      "name": "Casa",
      "address": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "USA"
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

### GET `/users/me/addresses/:id`
Get a specific address of the authenticated user.

**Validations:**
- Valid JWT token required
- Address ID must exist and belong to user

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
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Dirección obtenida exitosamente",
  "data": {
    "id": "507f1f77bcf86cd799439014",
    "name": "Casa",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Dirección no encontrada",
  "data": null
}
```

### POST `/users/me/addresses`
Add a new address to the authenticated user.

**Validations:**
- Valid JWT token required
- All address fields are required
- Address name must be unique for the user

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```typescript
{
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
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
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}
```

**Example Request:**
```json
{
  "name": "Trabajo",
  "address": "456 Business Ave",
  "city": "New York",
  "state": "NY",
  "zipCode": "10002",
  "country": "USA"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Dirección agregada exitosamente",
  "data": {
    "id": "507f1f77bcf86cd799439015",
    "name": "Trabajo",
    "address": "456 Business Ave",
    "city": "New York",
    "state": "NY",
    "zipCode": "10002",
    "country": "USA"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Ya existe una dirección con ese nombre",
  "data": null
}
```

### PUT `/users/me/addresses/:id`
Update a specific address of the authenticated user.

**Validations:**
- Valid JWT token required
- Address ID must exist and belong to user
- Address name must be unique for the user (if changed)

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```typescript
{
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
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
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}
```

**Example Request:**
```json
{
  "name": "Casa Actualizada",
  "address": "789 New St",
  "city": "New York",
  "state": "NY",
  "zipCode": "10003",
  "country": "USA"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Dirección actualizada exitosamente",
  "data": {
    "id": "507f1f77bcf86cd799439014",
    "name": "Casa Actualizada",
    "address": "789 New St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10003",
    "country": "USA"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Dirección no encontrada",
  "data": null
}
```

### DELETE `/users/me/addresses/:id`
Delete a specific address of the authenticated user.

**Validations:**
- Valid JWT token required
- Address ID must exist and belong to user
- Cannot delete address if it's being used as care address

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
  "message": "Dirección eliminada exitosamente",
  "data": null
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "No se puede eliminar una dirección que está siendo usada como dirección de cuidado",
  "data": null
}
```

## Admin User Management

### GET `/users/:id` (Admin)
Get a specific user by ID (requires admin permissions).

**Validations:**
- Valid JWT token required
- Admin permissions required
- User ID must exist

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
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    avatar?: string;
    role: {
      id: string;
      name: string;
      permissions: object;
    };
    carerConfig?: {
      homeCare: {
        enabled: boolean;
        dayPrice?: number;
      };
      petHomeCare: {
        enabled: boolean;
        visitPrice?: number;
      };
      petTypes: Array<{
        id: string;
        name: string;
      }>;
      careAddress?: string;
      careAddressData?: {
        id: string;
        name: string;
        address: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
      };
    };
    addresses?: Array<{
      id: string;
      name: string;
      address: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    }>;
    createdAt: string;
    updatedAt: string;
  };
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Usuario obtenido exitosamente",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phoneNumber": "+1234567890",
    "avatar": "/api/users/507f1f77bcf86cd799439011/avatar",
    "role": {
      "id": "507f1f77bcf86cd799439012",
      "name": "user",
      "permissions": {}
    },
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
          "id": "507f1f77bcf86cd799439013",
          "name": "Perro"
        }
      ],
      "careAddress": "507f1f77bcf86cd799439014"
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
  "message": "Usuario no encontrado",
  "data": null
}
```

### PUT `/users/:id` (Admin)
Update a specific user's profile and avatar (optional) (requires admin permissions).

**Validations:**
- Valid JWT token required
- Admin permissions required
- User ID must exist
- Cannot modify sensitive fields (_id, createdAt, updatedAt)

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body (multipart/form-data):**
```typescript
{
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  role?: string;
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
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    avatar?: string;
    role: {
      id: string;
      name: string;
      permissions: object;
    };
    carerConfig?: {
      homeCare: {
        enabled: boolean;
        dayPrice?: number;
      };
      petHomeCare: {
        enabled: boolean;
        visitPrice?: number;
      };
      petTypes: Array<{
        id: string;
        name: string;
      }>;
      careAddress?: string;
      careAddressData?: {
        id: string;
        name: string;
        address: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
      };
    };
    addresses?: Array<{
      id: string;
      name: string;
      address: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    }>;
    createdAt: string;
    updatedAt: string;
  };
}
```

**Example Request:**
```json
{
  "firstName": "John",
  "lastName": "Updated",
  "email": "john@example.com",
  "phoneNumber": "+1234567890",
  "role": "507f1f77bcf86cd799439012"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Usuario actualizado exitosamente",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Updated",
    "email": "john@example.com",
    "phoneNumber": "+1234567890",
    "avatar": "/api/users/507f1f77bcf86cd799439011/avatar",
    "role": {
      "id": "507f1f77bcf86cd799439012",
      "name": "user",
      "permissions": {}
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
  "message": "Usuario no encontrado",
  "data": null
}
```

### GET `/users` (Admin)
Get all users with pagination and filters (admin only). **Paginated**

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
- `search`: Search by name, email, or phone number
- `role`: Filter by role ID

**Response:**
```typescript
{
  success: boolean;
  message: string;
  data: {
    users: Array<{
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      phoneNumber?: string;
      avatar?: string;
      role: {
        id: string;
        name: string;
        permissions: object;
      };
      carerConfig?: {
        homeCare: {
          enabled: boolean;
          dayPrice?: number;
        };
        petHomeCare: {
          enabled: boolean;
          visitPrice?: number;
        };
        petTypes: Array<{
          id: string;
          name: string;
        }>;
        careAddress?: string;
        careAddressData?: {
          id: string;
          name: string;
          address: string;
          city: string;
          state: string;
          zipCode: string;
          country: string;
        };
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
  "message": "Usuarios obtenidos exitosamente",
  "data": {
    "users": [
      {
        "id": "507f1f77bcf86cd799439011",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "phoneNumber": "+1234567890",
        "avatar": "/api/users/507f1f77bcf86cd799439011/avatar",
        "role": {
          "id": "507f1f77bcf86cd799439012",
          "name": "user",
          "permissions": {}
        },
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
              "id": "507f1f77bcf86cd799439013",
              "name": "Perro"
            }
          ],
          "careAddress": "507f1f77bcf86cd799439014"
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