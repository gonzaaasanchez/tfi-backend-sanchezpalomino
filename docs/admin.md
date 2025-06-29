# Admin Routes

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