# Pets Routes

## POST `/pets`
Create a new pet (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Body (multipart/form-data):**
```
name: "Luna" (required)
comment: "Mi perrita favorita" (optional)
petTypeId: "..." (required)
characteristics: [
  {
    "characteristicId": "...",
    "value": "grande"
  },
  {
    "characteristicId": "...",
    "value": "5 años"
  }
] (optional)
avatarFile: [file] (optional)
```

**Response:**
```json
{
  "success": true,
  "message": "Mascota creada exitosamente",
  "data": {
    "_id": "...",
    "name": "Luna",
    "comment": "Mi perrita favorita",
    "avatar": "/api/pets/.../avatar",
    "petType": {
      "_id": "...",
      "name": "Perro"
    },
    "characteristics": [
      {
        "characteristic": {
          "_id": "...",
          "name": "Tamaño"
        },
        "value": "grande"
      },
      {
        "characteristic": {
          "_id": "...",
          "name": "Edad"
        },
        "value": "5 años"
      }
    ],
    "owner": {
      "_id": "...",
      "firstName": "John",
      "lastName": "Doe"
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## GET `/pets/my`
Get the authenticated user's pets with pagination and filters.

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
```json
{
  "success": true,
  "message": "Mascotas obtenidas exitosamente",
  "data": {
    "pets": [
      {
        "_id": "...",
        "name": "Luna",
        "comment": "Mi perrita favorita",
        "avatar": "/api/pets/.../avatar",
        "petType": {
          "_id": "...",
          "name": "Perro"
        },
        "characteristics": [
          {
            "characteristic": {
              "_id": "...",
              "name": "Tamaño"
            },
            "value": "grande"
          }
        ],
        "owner": {
          "_id": "...",
          "firstName": "John",
          "lastName": "Doe"
        }
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

## GET `/pets/:id`
Get a specific pet (only if owner).

**Headers:**
```
Authorization: Bearer <token>
```

## PUT `/pets/:id`
Update a pet (only if owner).

**Headers:**
```
Authorization: Bearer <token>
```

**Body (multipart/form-data):**
```
name: "Luna Bella" (optional)
comment: "Mi perrita favorita actualizada" (optional)
petTypeId: "..." (optional)
characteristics: [...] (optional)
avatarFile: [file] (optional)
```

## DELETE `/pets/:id`
Delete a pet (only if owner).

**Headers:**
```
Authorization: Bearer <token>
```

## GET `/pets/:id/avatar`
Get a pet's avatar (public endpoint).

**Response:** Binary image data with appropriate Content-Type header.

## Admin Pet Services

### GET `/pets/admin/all`
Get all pets with advanced filters (admin only).

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
```json
{
  "success": true,
  "message": "Mascotas obtenidas exitosamente",
  "data": {
    "pets": [
      {
        "_id": "...",
        "name": "Luna",
        "comment": "Mi perrita favorita",
        "avatar": "/api/pets/.../avatar",
        "petType": {
          "_id": "...",
          "name": "Perro"
        },
        "characteristics": [
          {
            "characteristic": {
              "_id": "...",
              "name": "Tamaño"
            },
            "value": "grande"
          }
        ],
        "owner": {
          "_id": "...",
          "firstName": "John",
          "lastName": "Doe"
        }
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

### GET `/pets/admin/:id`
Get any pet by ID (admin only).

**Headers:**
```
Authorization: Bearer <token>
``` 