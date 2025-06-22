# Data Models

This document describes all the data models used in the TFI Backend API.

## 👤 User Model

### Schema
```typescript
{
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  avatar: { type: Buffer },
  avatarContentType: { type: String },
  role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true },
  carerConfig: {
    homeCare: {
      enabled: { type: Boolean, default: false },
      dayPrice: { type: Number, default: 0 }
    },
    petHomeCare: {
      enabled: { type: Boolean, default: false },
      visitPrice: { type: Number, default: 0 }
    }
  },
  addresses: [{
    name: { type: String, required: true },
    fullAddress: { type: String, required: true },
    floor: { type: String },
    apartment: { type: String },
    coords: {
      lat: { type: Number, required: true },
      lon: { type: Number, required: true }
    }
  }]
}
```

### Example Document
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phoneNumber": "+1234567890",
  "role": "507f1f77bcf86cd799439012",
  "carerConfig": {
    "homeCare": {
      "enabled": true,
      "dayPrice": 50
    },
    "petHomeCare": {
      "enabled": false,
      "visitPrice": 0
    }
  },
  "addresses": [
    {
      "name": "Home",
      "fullAddress": "Av. Corrientes 1234",
      "floor": "3",
      "apartment": "A",
      "coords": {
        "lat": -34.6037,
        "lon": -58.3816
      }
    }
  ],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## 🏷️ Role Model

### Schema
```typescript
{
  name: { type: String, required: true, unique: true },
  permissions: {
    users: [{ type: String }],
    pets: [{ type: String }],
    petTypes: [{ type: String }],
    petCharacteristics: [{ type: String }],
    roles: [{ type: String }],
    admins: [{ type: String }],
    logs: [{ type: String }]
  }
}
```

### Example Document
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "name": "user",
  "permissions": {
    "users": ["read", "update"],
    "pets": ["read", "create", "update", "delete"],
    "petTypes": ["read"],
    "petCharacteristics": ["read"],
    "roles": [],
    "admins": [],
    "logs": []
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## 👨‍💼 Admin Model

### Schema
```typescript
{
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, default: 'admin' }
}
```

### Example Document
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "firstName": "Admin",
  "lastName": "User",
  "email": "admin@example.com",
  "role": "admin",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## 🐕 PetType Model

### Schema
```typescript
{
  name: { type: String, required: true, unique: true }
}
```

### Example Document
```json
{
  "_id": "507f1f77bcf86cd799439014",
  "name": "Perro",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## 🏷️ PetCharacteristic Model

### Schema
```typescript
{
  name: { type: String, required: true, unique: true }
}
```

### Example Document
```json
{
  "_id": "507f1f77bcf86cd799439015",
  "name": "Tamaño",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## 🐾 Pet Model

### Schema
```typescript
{
  name: { type: String, required: true },
  comment: { type: String },
  avatar: { type: Buffer },
  avatarContentType: { type: String },
  petType: { type: mongoose.Schema.Types.ObjectId, ref: 'PetType', required: true },
  characteristics: [{
    characteristic: { type: mongoose.Schema.Types.ObjectId, ref: 'PetCharacteristic', required: true },
    value: { type: String, required: true }
  }],
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}
```

### Example Document
```json
{
  "_id": "507f1f77bcf86cd799439016",
  "name": "Luna",
  "comment": "Mi perrita favorita",
  "petType": "507f1f77bcf86cd799439014",
  "characteristics": [
    {
      "characteristic": "507f1f77bcf86cd799439015",
      "value": "grande"
    },
    {
      "characteristic": "507f1f77bcf86cd799439017",
      "value": "5 años"
    }
  ],
  "owner": "507f1f77bcf86cd799439011",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## 📊 Audit Log Model

### Schema
```typescript
{
  action: { type: String, required: true, enum: ['CREATE', 'UPDATE', 'DELETE'] },
  entity: { type: String, required: true },
  entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userEmail: { type: String, required: true },
  changes: {
    before: { type: mongoose.Schema.Types.Mixed },
    after: { type: mongoose.Schema.Types.Mixed }
  },
  timestamp: { type: Date, default: Date.now }
}
```

### Example Document
```json
{
  "_id": "507f1f77bcf86cd799439018",
  "action": "CREATE",
  "entity": "Pet",
  "entityId": "507f1f77bcf86cd799439016",
  "userId": "507f1f77bcf86cd799439011",
  "userEmail": "john@example.com",
  "changes": {
    "before": null,
    "after": {
      "name": "Luna",
      "petType": "507f1f77bcf86cd799439014",
      "owner": "507f1f77bcf86cd799439011"
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🔗 Relationships

### User ↔ Role
- **User** has one **Role** (required)
- **Role** can have many **Users**

### User ↔ Pet
- **User** can have many **Pets** (owner relationship)
- **Pet** belongs to one **User** (owner)

### Pet ↔ PetType
- **Pet** has one **PetType** (required)
- **PetType** can have many **Pets**

### Pet ↔ PetCharacteristic
- **Pet** can have many **PetCharacteristics** (through characteristics array)
- **PetCharacteristic** can be used by many **Pets**

### Audit Log ↔ User
- **Audit Log** references one **User** (who performed the action)
- **User** can have many **Audit Logs**

## 📝 Notes

- All models include automatic `createdAt` and `updatedAt` timestamps
- Passwords are hashed using bcrypt before storage
- Avatar images are stored as Buffer in the database
- ObjectId references are used for relationships between collections
- Audit logs track all CRUD operations on main entities