# Reviews Routes

## Review Management

### POST `/reservations/:id/reviews`
Create a new review for a completed reservation.

**Validations:**
- Valid JWT token required
- Reservation ID must exist
- User must be the owner or caregiver of the reservation
- Reservation must be completed (FINISHED status)
- User can only review once per reservation
- Rating must be between 1 and 5

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```typescript
{
  rating: number;
  comment?: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  data: {
    review: {
      id: string;
      rating: number;
      comment: string;
      createdAt: string;
    };
  };
}
```

**Example Request:**
```json
{
  "rating": 5,
  "comment": "Excelente servicio, muy profesional y cariñoso con mi mascota"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Reseña creada exitosamente",
  "data": {
    "review": {
      "id": "507f1f77bcf86cd799439012",
      "rating": 5,
      "comment": "Excelente servicio, muy profesional y cariñoso con mi mascota",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Ya has creado una reseña para esta reserva",
  "data": null
}
```

### GET `/reservations/:id/reviews`
Get reviews for a specific reservation.

**Validations:**
- Valid JWT token required
- Reservation ID must exist
- User must be the owner, caregiver, or admin of the reservation

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
    reservation: {
      id: string;
      startDate: string;
      endDate: string;
    };
    reviews: {
      owner?: {
        id: string;
        reviewer: {
          id: string;
          firstName: string;
          lastName: string;
          email: string;
          avatar?: string;
        };
        reviewedUser: {
          id: string;
          firstName: string;
          lastName: string;
          email: string;
          avatar?: string;
        };
        rating: number;
        comment: string;
        createdAt: string;
      };
      caregiver?: {
        id: string;
        reviewer: {
          id: string;
          firstName: string;
          lastName: string;
          email: string;
          avatar?: string;
        };
        reviewedUser: {
          id: string;
          firstName: string;
          lastName: string;
          email: string;
          avatar?: string;
        };
        rating: number;
        comment: string;
        createdAt: string;
      };
    };
    summary: {
      hasOwnerReview: boolean;
      hasCaregiverReview: boolean;
    };
  };
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Reseñas obtenidas exitosamente",
  "data": {
    "reservation": {
      "id": "507f1f77bcf86cd799439011",
      "startDate": "2024-02-01T10:00:00.000Z",
      "endDate": "2024-02-03T18:00:00.000Z"
    },
    "reviews": {
      "owner": {
        "id": "507f1f77bcf86cd799439012",
        "reviewer": {
          "id": "507f1f77bcf86cd799439016",
          "firstName": "John",
          "lastName": "Doe",
          "email": "john@example.com",
          "avatar": "/api/users/507f1f77bcf86cd799439016/avatar"
        },
        "reviewedUser": {
          "id": "507f1f77bcf86cd799439015",
          "firstName": "Maria",
          "lastName": "Garcia",
          "email": "maria@example.com",
          "avatar": "/api/users/507f1f77bcf86cd799439015/avatar"
        },
        "rating": 5,
        "comment": "Excelente servicio, muy profesional y cariñoso con mi mascota",
        "createdAt": "2024-01-01T00:00:00.000Z"
      },
      "caregiver": {
        "id": "507f1f77bcf86cd799439013",
        "reviewer": {
          "id": "507f1f77bcf86cd799439015",
          "firstName": "Maria",
          "lastName": "Garcia",
          "email": "maria@example.com",
          "avatar": "/api/users/507f1f77bcf86cd799439015/avatar"
        },
        "reviewedUser": {
          "id": "507f1f77bcf86cd799439016",
          "firstName": "John",
          "lastName": "Doe",
          "email": "john@example.com",
          "avatar": "/api/users/507f1f77bcf86cd799439016/avatar"
        },
        "rating": 4,
        "comment": "Muy buen dueño, mascota bien cuidada",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    },
    "summary": {
      "hasOwnerReview": true,
      "hasCaregiverReview": true
    }
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "No tienes permisos para ver las reseñas de esta reserva",
  "data": null
}
```

### GET `/users/:id/reviews`
Get reviews for a specific user.

**Validations:**
- Valid JWT token required
- User ID must exist
- User must be viewing their own profile or be an admin

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `type`: Filter by type ("given", "received", or "all")
- `rating`: Filter by rating (1-5)

**Response:**
```typescript
{
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      firstName: string;
      lastName: string;
    };
    summary: {
      totalGiven: number;
      totalReceived: number;
      averageGiven: number;
      averageReceived: number;
    };
    reviews: {
      given?: Array<{
        id: string;
        reservation: {
          id: string;
          startDate: string;
          endDate: string;
        };
        reviewer: {
          id: string;
          firstName: string;
          lastName: string;
          email: string;
          avatar?: string;
        };
        reviewedUser: {
          id: string;
          firstName: string;
          lastName: string;
          email: string;
          avatar?: string;
        };
        rating: number;
        comment?: string;
        createdAt: string;
      }>;
      received?: Array<{
        id: string;
        reservation: {
          id: string;
          startDate: string;
          endDate: string;
        };
        reviewer: {
          id: string;
          firstName: string;
          lastName: string;
          email: string;
          avatar?: string;
        };
        reviewedUser: {
          id: string;
          firstName: string;
          lastName: string;
          email: string;
          avatar?: string;
        };
        rating: number;
        comment?: string;
        createdAt: string;
      }>;
    };
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Reseñas obtenidas exitosamente",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "firstName": "John",
      "lastName": "Doe"
    },
    "summary": {
      "totalGiven": 5,
      "totalReceived": 3,
      "averageGiven": 4.2,
      "averageReceived": 4.8
    },
    "reviews": {
      "given": [
        {
          "id": "507f1f77bcf86cd799439012",
          "reservation": {
            "id": "507f1f77bcf86cd799439013",
            "startDate": "2024-02-01T10:00:00.000Z",
            "endDate": "2024-02-03T18:00:00.000Z"
          },
          "reviewer": {
            "id": "507f1f77bcf86cd799439011",
            "firstName": "John",
            "lastName": "Doe",
            "email": "john@example.com",
            "avatar": "/api/users/507f1f77bcf86cd799439011/avatar"
          },
          "reviewedUser": {
            "id": "507f1f77bcf86cd799439014",
            "firstName": "Maria",
            "lastName": "Garcia",
            "email": "maria@example.com",
            "avatar": "/api/users/507f1f77bcf86cd799439014/avatar"
          },
          "rating": 5,
          "comment": "Excelente servicio",
          "createdAt": "2024-01-01T00:00:00.000Z"
        }
      ],
      "received": [
        {
          "id": "507f1f77bcf86cd799439015",
          "reservation": {
            "id": "507f1f77bcf86cd799439016",
            "startDate": "2024-02-01T10:00:00.000Z",
            "endDate": "2024-02-03T18:00:00.000Z"
          },
          "reviewer": {
            "id": "507f1f77bcf86cd799439017",
            "firstName": "Ana",
            "lastName": "Lopez",
            "email": "ana@example.com",
            "avatar": "/api/users/507f1f77bcf86cd799439017/avatar"
          },
          "reviewedUser": {
            "id": "507f1f77bcf86cd799439011",
            "firstName": "John",
            "lastName": "Doe",
            "email": "john@example.com",
            "avatar": "/api/users/507f1f77bcf86cd799439011/avatar"
          },
          "rating": 4,
          "comment": "Muy buen cuidador",
          "createdAt": "2024-01-01T00:00:00.000Z"
        }
      ]
    },
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 8,
      "totalPages": 1,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "No tienes permisos para ver las reseñas de este usuario",
  "data": null
}
``` 