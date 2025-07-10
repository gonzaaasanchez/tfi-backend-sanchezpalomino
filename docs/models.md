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
    },
    petTypes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PetType' }]
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

**Optional fields in API responses (not stored in database):**

- `reviews`: Object containing review statistics (only present in certain contexts)
  - `averageRatingAsUser`: Average rating as user (1-5, rounded to 1 decimal)
  - `totalReviewsAsUser`: Total number of reviews received as user
  - `averageRatingAsCaregiver`: Average rating as caregiver (1-5, rounded to 1 decimal)
  - `totalReviewsAsCaregiver`: Total number of reviews received as caregiver

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
    },
    "petTypes": []
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

## 📅 Reservation Model

### Schema

```typescript
{
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  careLocation: {
    type: String,
    required: true,
    enum: ['pet_home', 'caregiver_home']
  },
  address: {
    name: { type: String, required: true },
    fullAddress: { type: String, required: true },
    floor: { type: String },
    apartment: { type: String },
    coords: {
      lat: { type: Number, required: true },
      lon: { type: Number, required: true }
    }
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  caregiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true }],
  visitsCount: {
    type: Number,
    required: function() { return this.careLocation === 'pet_home'; }
  },
  totalPrice: { type: Number, required: true },
  commission: { type: Number, required: true },
  totalOwner: { type: Number, required: true },
  totalCaregiver: { type: Number, required: true },
  distance: { type: Number },
  status: {
    type: String,
    required: true,
    enum: ['payment_pending', 'payment_rejected', 'waiting_acceptance', 'confirmed', 'started', 'finished', 'rejected', 'cancelled_owner', 'cancelled_caregiver'],
    default: 'waiting_acceptance'
  }
}
```

### Example Document

```json
{
  "_id": "507f1f77bcf86cd799439020",
  "startDate": "2024-01-15T00:00:00.000Z",
  "endDate": "2024-01-20T00:00:00.000Z",
  "careLocation": "pet_home",
  "address": {
    "name": "Casa Principal",
    "fullAddress": "Av. Corrientes 1234, Buenos Aires",
    "floor": "3",
    "apartment": "A",
    "coords": {
      "lat": -34.6037,
      "lon": -58.3816
    }
  },
  "user": "507f1f77bcf86cd799439011",
  "caregiver": "507f1f77bcf86cd799439021",
  "pets": ["507f1f77bcf86cd799439016"],
  "visitsCount": 10,
  "totalPrice": 1200,
  "commission": 72,
  "totalOwner": 1272,
  "totalCaregiver": 1128,
  "distance": 5.2,
  "status": "waiting_acceptance",
  "createdAt": "2024-01-10T10:30:00.000Z",
  "updatedAt": "2024-01-10T10:30:00.000Z"
}
```

### Price Calculation Logic

- **totalPrice**: Base price for the service
- **commission**: 6% of totalPrice (platform fee)
- **totalOwner**: totalPrice + commission (what the owner pays)
- **totalCaregiver**: totalPrice - commission (what the caregiver receives)

### Care Location Types

- **pet_home**: Care provided at the pet's home (requires visitsPerDay)
- **caregiver_home**: Care provided at the caregiver's home

### Status Values

- **payment_pending**: Reservation created, pending payment
- **payment_rejected**: Payment failed, reservation rejected
- **waiting_acceptance**: Awaiting caregiver confirmation
- **confirmed**: Caregiver has accepted the reservation
- **started**: Care period has begun
- **finished**: Care period has ended
- **rejected**: Caregiver has rejected the reservation
- **cancelled_owner**: Cancelled by the pet owner
- **cancelled_caregiver**: Cancelled by the caregiver

## ⭐ Review Model

### Schema

```typescript
{
  reservation: { type: mongoose.Schema.Types.ObjectId, ref: 'Reservation', required: true },
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reviewedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, maxlength: 500 }
}
```

### Example Document

```json
{
  "_id": "507f1f77bcf86cd799439030",
  "reservation": "507f1f77bcf86cd799439020",
  "reviewer": "507f1f77bcf86cd799439011",
  "reviewedUser": "507f1f77bcf86cd799439021",
  "rating": 5,
  "comment": "Excelente servicio, muy responsable con mi mascota",
  "createdAt": "2024-01-21T10:00:00.000Z",
  "updatedAt": "2024-01-21T10:00:00.000Z"
}
```

### Review Rules

- **One review per user per reservation**: Each user (owner or caregiver) can only write one review per reservation
- **Reservation must be finished**: Reviews can only be created for reservations with status "finished"
- **Rating range**: Must be between 1 and 5 stars
- **Comment optional**: Comments are optional but limited to 500 characters
- **Self-review prevention**: A user cannot review themselves

### Review Types

- **Owner Review**: When the pet owner reviews the caregiver
- **Caregiver Review**: When the caregiver reviews the pet owner

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

### Reservation ↔ User (Owner)

- **Reservation** has one **User** as owner (required)
- **User** can have many **Reservations** as owner

### Reservation ↔ User (Caregiver)

- **Reservation** has one **User** as caregiver (required)
- **User** can have many **Reservations** as caregiver

### Reservation ↔ Pet

- **Reservation** can have many **Pets** (array of pet IDs)
- **Pet** can be part of many **Reservations**

### Review ↔ Reservation

- **Review** belongs to one **Reservation** (required)
- **Reservation** can have up to two **Reviews** (one from owner, one from caregiver)

### Review ↔ User (Reviewer)

- **Review** has one **User** as reviewer (who writes the review)
- **User** can write many **Reviews**

### Review ↔ User (Reviewed)

- **Review** has one **User** as reviewed (who receives the review)
- **User** can receive many **Reviews**

## 📝 Notes

- All models include automatic `createdAt` and `updatedAt` timestamps
- Passwords are hashed using bcrypt before storage
- Avatar images are stored as Buffer in the database
- ObjectId references are used for relationships between collections
- Audit logs track all CRUD operations on main entities
