# Admin Routes

## Admin Authentication

### POST `/admins/login`
Login for administrators.

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "admin": {
      "id": "string",
      "firstName": "string",
      "lastName": "string",
      "email": "string",
      "role": {
        "id": "string",
        "name": "string",
        "permissions": {}
      },
      "createdAt": "string",
      "updatedAt": "string"
    },
    "token": "string"
  }
}
```

**Notes:**
- Uses separate authentication from regular users
- Token includes `type: 'admin'` for admin-specific middleware
- Only admins can access admin endpoints

### GET `/admins/me`
Get authenticated admin profile.

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
    "admin": {
      "id": "string",
      "firstName": "string",
      "lastName": "string",
      "email": "string",
      "role": {
        "id": "string",
        "name": "string",
        "permissions": {}
      },
      "createdAt": "string",
      "updatedAt": "string"
    }
  }
}
```

## Roles Management

### GET `/roles`
Get all roles (admin only).

**Headers:**
```
Authorization: Bearer <token>
```

### POST `/roles`
Create a new role (admin only).

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "name": "moderator",
  "permissions": {
    "users": ["read", "update"],
    "pets": ["read", "create", "update", "delete"]
  }
}
```

### PUT `/roles/:id`
Update a role (admin only).

**Headers:**
```
Authorization: Bearer <token>
```

### DELETE `/roles/:id`
Delete a role (admin only).

**Headers:**
```
Authorization: Bearer <token>
```

## Admins Management

### GET `/admins`
Get all admins (admin only).

**Headers:**
```
Authorization: Bearer <token>
```

### POST `/admins`
Create a new admin (admin only).

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "firstName": "Admin",
  "lastName": "User",
  "email": "admin@example.com",
  "password": "123456",
  "role": "admin"
}
```

### PUT `/admins/:id`
Update an admin (admin only).

**Headers:**
```
Authorization: Bearer <token>
```

### DELETE `/admins/:id`
Delete an admin (admin only).

**Headers:**
```
Authorization: Bearer <token>
```

## Audit Logs

### GET `/logs`
Get audit logs (admin only).

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `action`: Filter by action type
- `entity`: Filter by entity type
- `userId`: Filter by user ID
- `startDate`: Filter by start date
- `endDate`: Filter by end date

**Response:**
```json
{
  "success": true,
  "message": "Logs obtenidos exitosamente",
  "data": {
    "logs": [
      {
        "id": "...",
        "action": "CREATE",
        "entity": "Pet",
        "entityId": "...",
        "userId": "...",
        "userEmail": "john@example.com",
        "changes": {
          "before": null,
          "after": {
            "name": "Luna",
            "petType": "..."
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

## 🔧 **Audit System**

The audit system uses `auditLogger.ts` to record all database changes. Each entity has its own log collection:

- **Users**: `userlogs`
- **Admins**: `adminlogs`
- **Roles**: `rolelogs`
- **Pets**: `petlogs`
- **Pet Types**: `pettypelogs`
- **Pet Characteristics**: `petcharacteristiclogs`
- **Reservations**: `reservationlogs`
- **Reviews**: `reviewlogs`

### 📊 **Log Structure**

Each log entry contains:
- `userId`: ID of the user who made the change
- `userName`: Full name of the user
- `entityId`: ID of the modified entity
- `field`: Field that changed
- `oldValue`: Previous value
- `newValue`: New value
- `timestamp`: Date and time of the change

### 🛡️ **Security**

- Logs are **immutable** - they cannot be modified
- Only users with `logs.read` and `logs.getAll` permissions can access
- Superadmin have automatic full access 