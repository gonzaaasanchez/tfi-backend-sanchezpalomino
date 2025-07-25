# Logs Routes

## Audit System

### GET `/logs/:entityType/:entityId`
Get all logs for a specific entity.

**Validations:**
- Valid JWT token required
- Logs read permissions required

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `entityType`: Type of entity (User, Admin, Role, Pet, etc.)
- `entityId`: ID of the specific entity

**Response:**
```typescript
{
  success: boolean;
  message: string;
  data: Array<{
    id: string;
    entityId: string;
    userId: string;
    userName: string;
    field: string;
    oldValue: any;
    newValue: any;
    timestamp: string;
  }>;
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Logs obtenidos exitosamente",
  "data": [
    {
      "id": "507f1f77bcf86cd799439012",
      "entityId": "507f1f77bcf86cd799439011",
      "userId": "507f1f77bcf86cd799439013",
      "userName": "Juan Pérez",
      "field": "firstName",
      "oldValue": "Juan",
      "newValue": "Juan Carlos",
      "timestamp": "2024-01-15T10:30:00.000Z"
    },
    {
      "id": "507f1f77bcf86cd799439014",
      "entityId": "507f1f77bcf86cd799439011",
      "userId": "507f1f77bcf86cd799439013",
      "userName": "Juan Pérez",
      "field": "email",
      "oldValue": "juan@email.com",
      "newValue": "juan.carlos@email.com",
      "timestamp": "2024-01-15T10:30:00.000Z"
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

### GET `/logs/:entityType`
Get all logs for an entity type with pagination.

**Validations:**
- Valid JWT token required
- Logs getAll permissions required

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `entityType`: Type of entity (User, Admin, Role, Pet, etc.)

**Query Parameters:**
- `limit` (optional): Number of logs to return (default: 50)

**Response:**
```typescript
{
  success: boolean;
  message: string;
  data: Array<{
    id: string;
    entityId: string;
    userId: string;
    userName: string;
    field: string;
    oldValue: any;
    newValue: any;
    timestamp: string;
  }>;
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Logs obtenidos exitosamente",
  "data": [
    {
      "id": "507f1f77bcf86cd799439012",
      "entityId": "507f1f77bcf86cd799439011",
      "userId": "507f1f77bcf86cd799439013",
      "userName": "Juan Pérez",
      "field": "firstName",
      "oldValue": "Juan",
      "newValue": "Juan Carlos",
      "timestamp": "2024-01-15T10:30:00.000Z"
    },
    {
      "id": "507f1f77bcf86cd799439014",
      "entityId": "507f1f77bcf86cd799439015",
      "userId": "507f1f77bcf86cd799439016",
      "userName": "María García",
      "field": "email",
      "oldValue": "maria@email.com",
      "newValue": "maria.garcia@email.com",
      "timestamp": "2024-01-15T09:15:00.000Z"
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

## Supported Entity Types

The audit system tracks changes for the following entities:

| Entity | Description | Database Collection |
|--------|-------------|-------------------|
| User | System users | userlogs |
| Admin | Administrators | adminlogs |
| Role | Roles and permissions | rolelogs |
| Pet | Pets | petlogs |
| PetType | Pet types | pettypelogs |
| PetCharacteristic | Pet characteristics | petcharacteristiclogs |
| Reservation | Reservations | reservationlogs |
| Review | Reviews | reviewlogs |
| Post | Posts | postlogs |
| Comment | Comments | commentlogs |
| Like | Likes | likelogs |
| PasswordReset | Password resets | passwordresetlogs |

## Log Structure

Each log entry contains:

- `id`: Unique log identifier
- `entityId`: ID of the modified entity
- `userId`: ID of the user who made the change
- `userName`: Name of the user who made the change
- `field`: Field that was modified
- `oldValue`: Previous value of the field
- `newValue`: New value of the field
- `timestamp`: Date and time of the change

## Security Considerations

- Passwords are masked as "***" for privacy
- Sensitive data is automatically masked
- Only users with appropriate permissions can access logs
- Logs are immutable once created
- Logs are retained indefinitely for audit purposes 