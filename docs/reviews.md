# Reviews Routes

## Review Management

### POST `/reviews/reservations/:id/reviews`
Create a new review for a completed reservation.

**Validations:**
- Valid JWT token required
- Reservation ID must exist
- User must be the owner of the reservation
- Reservation must be completed
- User can only review once per reservation
- Rating must be between 1 and 5
- Comment is required

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
    id: string;
    reservation: {
      id: string;
      pet: {
        id: string;
        name: string;
        petType: {
          id: string;
          name: string;
        };
      };
      caregiver: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        avatar?: string;
      };
      owner: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        avatar?: string;
      };
      startDate: string;
      endDate: string;
      serviceType: "homeCare" | "petHomeCare";
      status: "completed";
      totalPrice: number;
    };
    rating: number;
    comment: string;
    createdAt: string;
    updatedAt: string;
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
    "id": "507f1f77bcf86cd799439012",
    "reservation": {
      "id": "507f1f77bcf86cd799439011",
      "pet": {
        "id": "507f1f77bcf86cd799439013",
        "name": "Luna",
        "petType": {
          "id": "507f1f77bcf86cd799439014",
          "name": "Perro"
        }
      },
      "caregiver": {
        "id": "507f1f77bcf86cd799439015",
        "firstName": "Maria",
        "lastName": "Garcia",
        "email": "maria@example.com",
        "avatar": "/api/users/507f1f77bcf86cd799439015/avatar"
      },
      "owner": {
        "id": "507f1f77bcf86cd799439016",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "avatar": "/api/users/507f1f77bcf86cd799439016/avatar"
      },
      "startDate": "2024-02-01T10:00:00.000Z",
      "endDate": "2024-02-03T18:00:00.000Z",
      "serviceType": "homeCare",
      "status": "completed",
      "totalPrice": 150
    },
      "rating": 5,
    "comment": "Excelente servicio, muy profesional y cariñoso con mi mascota",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Ya has dejado una reseña para esta reserva",
  "data": null
}
```

### GET `/reviews/users/:id/reviews`
Get reviews for a specific user.

**Validations:**
- Valid JWT token required
- User ID must exist
- User must have permission to view reviews

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
  "message": "Usuario no encontrado",
  "data": null
}
```

### GET `/reviews/reservations/:id/reviews`
Get reviews for a specific reservation.

**Validations:**
- Valid JWT token required
- Reservation ID must exist
- User must be the owner or caregiver of the reservation

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

**Response:**
```typescript
{
  success: boolean;
  message: string;
  data: {
    reviews: Array<{
      id: string;
      reservation: {
        id: string;
        pet: {
          id: string;
          name: string;
          petType: {
            id: string;
            name: string;
          };
        };
        caregiver: {
          id: string;
          firstName: string;
          lastName: string;
          email: string;
          avatar?: string;
        };
        owner: {
          id: string;
          firstName: string;
          lastName: string;
          email: string;
          avatar?: string;
        };
        startDate: string;
        endDate: string;
        serviceType: "homeCare" | "petHomeCare";
        status: "completed";
        totalPrice: number;
      };
      rating: number;
      comment: string;
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
  "message": "Reseñas obtenidas exitosamente",
  "data": {
    "reviews": [
      {
        "id": "507f1f77bcf86cd799439012",
        "reservation": {
          "id": "507f1f77bcf86cd799439011",
          "pet": {
            "id": "507f1f77bcf86cd799439013",
            "name": "Luna",
            "petType": {
              "id": "507f1f77bcf86cd799439014",
              "name": "Perro"
            }
          },
          "caregiver": {
            "id": "507f1f77bcf86cd799439015",
            "firstName": "Maria",
            "lastName": "Garcia",
            "email": "maria@example.com",
            "avatar": "/api/users/507f1f77bcf86cd799439015/avatar"
          },
          "owner": {
            "id": "507f1f77bcf86cd799439016",
            "firstName": "John",
            "lastName": "Doe",
            "email": "john@example.com",
            "avatar": "/api/users/507f1f77bcf86cd799439016/avatar"
          },
          "startDate": "2024-02-01T10:00:00.000Z",
          "endDate": "2024-02-03T18:00:00.000Z",
          "serviceType": "homeCare",
          "status": "completed",
          "totalPrice": 150
        },
        "rating": 5,
        "comment": "Excelente servicio, muy profesional y cariñoso con mi mascota",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
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

**Error Response:**
```json
{
  "success": false,
  "message": "No autorizado",
  "data": null
}
```

### GET `/reviews/received`
Get reviews received by the authenticated user (as caregiver). **Paginated**

**Validations:**
- Valid JWT token required

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `rating`: Filter by rating (1-5)

**Response:**
```typescript
{
  success: boolean;
  message: string;
  data: {
    reviews: Array<{
      id: string;
      reservation: {
        id: string;
        pet: {
          id: string;
          name: string;
          petType: {
            id: string;
            name: string;
          };
        };
        caregiver: {
          id: string;
          firstName: string;
          lastName: string;
          email: string;
          avatar?: string;
        };
        owner: {
          id: string;
          firstName: string;
          lastName: string;
          email: string;
          avatar?: string;
        };
        startDate: string;
        endDate: string;
        serviceType: "homeCare" | "petHomeCare";
        status: "completed";
        totalPrice: number;
      };
      rating: number;
      comment: string;
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
  "message": "Reseñas recibidas obtenidas exitosamente",
  "data": {
    "reviews": [
      {
        "id": "507f1f77bcf86cd799439012",
    "reservation": {
          "id": "507f1f77bcf86cd799439011",
          "pet": {
            "id": "507f1f77bcf86cd799439013",
            "name": "Luna",
            "petType": {
              "id": "507f1f77bcf86cd799439014",
              "name": "Perro"
            }
        },
          "caregiver": {
            "id": "507f1f77bcf86cd799439015",
            "firstName": "Maria",
            "lastName": "Garcia",
          "email": "maria@example.com",
            "avatar": "/api/users/507f1f77bcf86cd799439015/avatar"
          },
          "owner": {
            "id": "507f1f77bcf86cd799439016",
            "firstName": "John",
            "lastName": "Doe",
            "email": "john@example.com",
            "avatar": "/api/users/507f1f77bcf86cd799439016/avatar"
          },
          "startDate": "2024-02-01T10:00:00.000Z",
          "endDate": "2024-02-03T18:00:00.000Z",
          "serviceType": "homeCare",
          "status": "completed",
          "totalPrice": 150
        },
        "rating": 5,
        "comment": "Excelente servicio, muy profesional y cariñoso con mi mascota",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 5,
      "totalPages": 1
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

### GET `/reviews/:id`
Get a specific review.

**Validations:**
- Valid JWT token required
- Review ID must exist

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
    reservation: {
      id: string;
      pet: {
        id: string;
        name: string;
        petType: {
          id: string;
          name: string;
        };
      };
      caregiver: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        avatar?: string;
      };
      owner: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        avatar?: string;
      };
      startDate: string;
      endDate: string;
      serviceType: "homeCare" | "petHomeCare";
      status: "completed";
      totalPrice: number;
    };
    rating: number;
    comment: string;
    createdAt: string;
    updatedAt: string;
  };
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Reseña obtenida exitosamente",
  "data": {
    "id": "507f1f77bcf86cd799439012",
    "reservation": {
      "id": "507f1f77bcf86cd799439011",
      "pet": {
        "id": "507f1f77bcf86cd799439013",
        "name": "Luna",
        "petType": {
          "id": "507f1f77bcf86cd799439014",
          "name": "Perro"
        }
      },
      "caregiver": {
        "id": "507f1f77bcf86cd799439015",
        "firstName": "Maria",
        "lastName": "Garcia",
        "email": "maria@example.com",
        "avatar": "/api/users/507f1f77bcf86cd799439015/avatar"
      },
      "owner": {
        "id": "507f1f77bcf86cd799439016",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "avatar": "/api/users/507f1f77bcf86cd799439016/avatar"
      },
      "startDate": "2024-02-01T10:00:00.000Z",
      "endDate": "2024-02-03T18:00:00.000Z",
      "serviceType": "homeCare",
      "status": "completed",
      "totalPrice": 150
    },
    "rating": 5,
    "comment": "Excelente servicio, muy profesional y cariñoso con mi mascota",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Reseña no encontrada",
  "data": null
}
```

### PUT `/reviews/:id`
Update a review (only by the author).

**Validations:**
- Valid JWT token required
- Review ID must exist
- User must be the author of the review
- Rating must be between 1 and 5
- Comment is required

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```typescript
{
  rating: number;
  comment: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  data: {
    id: string;
    reservation: {
      id: string;
      pet: {
        id: string;
        name: string;
        petType: {
          id: string;
          name: string;
        };
      };
      caregiver: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        avatar?: string;
      };
      owner: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        avatar?: string;
      };
      startDate: string;
      endDate: string;
      serviceType: "homeCare" | "petHomeCare";
      status: "completed";
      totalPrice: number;
    };
    rating: number;
    comment: string;
    createdAt: string;
    updatedAt: string;
  };
}
```

**Example Request:**
```json
{
  "rating": 4,
  "comment": "Muy buen servicio, actualizado mi opinión"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Reseña actualizada exitosamente",
  "data": {
    "id": "507f1f77bcf86cd799439012",
    "reservation": {
      "id": "507f1f77bcf86cd799439011",
      "pet": {
        "id": "507f1f77bcf86cd799439013",
        "name": "Luna",
        "petType": {
          "id": "507f1f77bcf86cd799439014",
          "name": "Perro"
        }
          },
      "caregiver": {
        "id": "507f1f77bcf86cd799439015",
        "firstName": "Maria",
        "lastName": "Garcia",
        "email": "maria@example.com",
        "avatar": "/api/users/507f1f77bcf86cd799439015/avatar"
          },
      "owner": {
        "id": "507f1f77bcf86cd799439016",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "avatar": "/api/users/507f1f77bcf86cd799439016/avatar"
          },
      "startDate": "2024-02-01T10:00:00.000Z",
      "endDate": "2024-02-03T18:00:00.000Z",
      "serviceType": "homeCare",
      "status": "completed",
      "totalPrice": 150
    },
    "rating": 4,
    "comment": "Muy buen servicio, actualizado mi opinión",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "No puedes editar esta reseña",
  "data": null
}
```

### DELETE `/reviews/:id`
Delete a review (only by the author).

**Validations:**
- Valid JWT token required
- Review ID must exist
- User must be the author of the review

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
  "message": "Reseña eliminada exitosamente",
  "data": null
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "No puedes eliminar esta reseña",
  "data": null
}
```

## Admin Review Management

### GET `/reviews/admin/all`
Get all reviews with advanced filters (admin only). **Paginated**

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
- `rating`: Filter by rating (1-5)
- `owner`: Filter by owner ID
- `caregiver`: Filter by caregiver ID
- `startDate`: Filter by start date
- `endDate`: Filter by end date

**Response:**
```typescript
{
  success: boolean;
  message: string;
  data: {
    reviews: Array<{
      id: string;
      reservation: {
        id: string;
        pet: {
          id: string;
          name: string;
          petType: {
            id: string;
            name: string;
          };
        };
        caregiver: {
          id: string;
          firstName: string;
          lastName: string;
          email: string;
          avatar?: string;
        };
        owner: {
          id: string;
          firstName: string;
          lastName: string;
          email: string;
          avatar?: string;
        };
        startDate: string;
        endDate: string;
        serviceType: "homeCare" | "petHomeCare";
        status: "completed";
        totalPrice: number;
      };
      rating: number;
      comment: string;
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
  "message": "Reseñas obtenidas exitosamente",
  "data": {
    "reviews": [
      {
        "id": "507f1f77bcf86cd799439012",
        "reservation": {
      "id": "507f1f77bcf86cd799439011",
          "pet": {
            "id": "507f1f77bcf86cd799439013",
            "name": "Luna",
            "petType": {
              "id": "507f1f77bcf86cd799439014",
              "name": "Perro"
            }
    },
          "caregiver": {
            "id": "507f1f77bcf86cd799439015",
            "firstName": "Maria",
            "lastName": "Garcia",
            "email": "maria@example.com",
            "avatar": "/api/users/507f1f77bcf86cd799439015/avatar"
          },
          "owner": {
            "id": "507f1f77bcf86cd799439016",
            "firstName": "John",
            "lastName": "Doe",
            "email": "john@example.com",
            "avatar": "/api/users/507f1f77bcf86cd799439016/avatar"
          },
          "startDate": "2024-02-01T10:00:00.000Z",
          "endDate": "2024-02-03T18:00:00.000Z",
          "serviceType": "homeCare",
          "status": "completed",
          "totalPrice": 150
        },
          "rating": 5,
        "comment": "Excelente servicio, muy profesional y cariñoso con mi mascota",
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