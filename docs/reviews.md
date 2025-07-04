# Reviews API

This document describes the Reviews API endpoints for the TFI Backend.

## 📋 Overview

The Reviews API allows users to create and retrieve reviews for completed reservations. Reviews can only be created for reservations with "finished" status, and each user can only write one review per reservation.

## 🔐 Authentication

All endpoints require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## 📍 Base URL

```
/api
```

## 🚀 Endpoints

### POST /reservations/:id/reviews

Create a new review for a specific reservation.

#### Request

**URL Parameters:**
- `id` (string, required): Reservation ID

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <jwt_token>
```

**Body:**
```json
{
  "rating": 5,
  "comment": "Excelente servicio, muy responsable"
}
```

**Body Parameters:**
- `rating` (number, required): Rating from 1 to 5 stars
- `comment` (string, optional): Review comment (max 500 characters)

#### Response

**Success (201):**
```json
{
  "success": true,
  "message": "Review creada exitosamente",
  "data": {
    "review": {
      "id": "507f1f77bcf86cd799439030",
      "rating": 5,
      "comment": "Excelente servicio, muy responsable",
      "createdAt": "2024-01-21T10:00:00.000Z"
    }
  }
}
```

**Error (400) - Validation Error:**
```json
{
  "success": false,
  "message": "La calificación debe estar entre 1 y 5"
}
```

**Error (403) - Forbidden:**
```json
{
  "success": false,
  "message": "No tienes permisos para crear una review de esta reserva"
}
```

**Error (400) - Reservation Not Finished:**
```json
{
  "success": false,
  "message": "Solo se pueden crear reviews para reservas finalizadas"
}
```

**Error (400) - Duplicate Review:**
```json
{
  "success": false,
  "message": "Ya has creado una review para esta reserva"
}
```

#### Business Rules

- User must be the owner or caregiver of the reservation
- Reservation must have status "finished"
- User can only write one review per reservation
- Rating must be between 1 and 5
- Comment is optional but limited to 500 characters

---

### GET /reservations/:id/reviews

Get all reviews for a specific reservation.

#### Request

**URL Parameters:**
- `id` (string, required): Reservation ID

**Headers:**
```
Authorization: Bearer <jwt_token>
```

#### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Reviews obtenidas exitosamente",
  "data": {
    "reservation": {
      "id": "507f1f77bcf86cd799439020",
      "startDate": "2024-01-15T00:00:00.000Z",
      "endDate": "2024-01-20T00:00:00.000Z"
    },
    "reviews": [
      {
        "id": "507f1f77bcf86cd799439030",
        "reviewer": {
          "id": "507f1f77bcf86cd799439011",
          "firstName": "Juan",
          "lastName": "Pérez",
          "email": "juan@example.com",
          "avatar": "avatar_url"
        },
        "reviewedUser": {
          "id": "507f1f77bcf86cd799439021",
          "firstName": "María",
          "lastName": "García",
          "email": "maria@example.com",
          "avatar": "avatar_url"
        },
        "rating": 5,
        "comment": "Excelente servicio, muy responsable",
        "createdAt": "2024-01-21T10:00:00.000Z"
      }
    ],
    "summary": {
      "hasOwnerReview": true,
      "hasCaregiverReview": false
    }
  }
}
```

**Error (403) - Forbidden:**
```json
{
  "success": false,
  "message": "No tienes permisos para ver las reviews de esta reserva"
}
```

#### Business Rules

- User must be the owner, caregiver, or admin of the reservation
- Maximum 2 reviews per reservation (one from owner, one from caregiver)

---

### GET /users/:id/reviews

Get reviews for a specific user with filtering options.

#### Request

**URL Parameters:**
- `id` (string, required): User ID

**Query Parameters:**
- `type` (string, optional): Filter by review type
  - `"given"`: Reviews written by the user
  - `"received"`: Reviews received by the user
  - `"all"` or not provided: Both given and received reviews
- `rating` (number, optional): Filter by specific rating (1-5)
- `page` (number, optional): Page number for pagination (default: 1)
- `limit` (number, optional): Items per page (default: 10)

**Headers:**
```
Authorization: Bearer <jwt_token>
```

#### Response

**Success (200) - With type=given:**
```json
{
  "success": true,
  "message": "Reviews obtenidas exitosamente",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "firstName": "Juan",
      "lastName": "Pérez"
    },
    "reviews": {
      "given": [
        {
          "id": "507f1f77bcf86cd799439030",
          "reservation": {
            "id": "507f1f77bcf86cd799439020",
            "startDate": "2024-01-15T00:00:00.000Z",
            "endDate": "2024-01-20T00:00:00.000Z"
          },
          "reviewer": {
            "id": "507f1f77bcf86cd799439011",
            "firstName": "Juan",
            "lastName": "Pérez",
            "email": "juan@example.com",
            "avatar": "avatar_url"
          },
          "reviewedUser": {
            "id": "507f1f77bcf86cd799439021",
            "firstName": "María",
            "lastName": "García",
            "email": "maria@example.com",
            "avatar": "avatar_url"
          },
          "rating": 5,
          "comment": "Excelente servicio",
          "createdAt": "2024-01-21T10:00:00.000Z"
        }
      ]
    },
    "summary": {
      "totalGiven": 15,
      "totalReceived": 23,
      "averageGiven": 4.2,
      "averageReceived": 4.8
    },
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 15,
      "totalPages": 2,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

**Success (200) - With type=all (default):**
```json
{
  "success": true,
  "message": "Reviews obtenidas exitosamente",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "firstName": "Juan",
      "lastName": "Pérez"
    },
    "reviews": {
      "given": [
        {
          "id": "507f1f77bcf86cd799439030",
          "reservation": { ... },
          "reviewer": { ... },
          "reviewedUser": { ... },
          "rating": 5,
          "comment": "Excelente servicio",
          "createdAt": "2024-01-21T10:00:00.000Z"
        }
      ],
      "received": [
        {
          "id": "507f1f77bcf86cd799439031",
          "reservation": { ... },
          "reviewer": { ... },
          "reviewedUser": { ... },
          "rating": 4,
          "comment": "Muy buen dueño",
          "createdAt": "2024-01-22T10:00:00.000Z"
        }
      ]
    },
    "summary": {
      "totalGiven": 15,
      "totalReceived": 23,
      "averageGiven": 4.2,
      "averageReceived": 4.8
    },
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 38,
      "totalPages": 4,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

**Error (403) - Forbidden:**
```json
{
  "success": false,
  "message": "No tienes permisos para ver las reviews de este usuario"
}
```

#### Business Rules

- User can only view their own reviews (unless admin)
- Reviews are separated by type when type=all
- Summary statistics include both given and received reviews
- Pagination applies to the filtered results

---

## 🔧 Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Validation error |
| 401 | Unauthorized - Invalid or missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error |

## 📝 Notes

- All timestamps are in ISO 8601 format
- Ratings are integers from 1 to 5
- Comments are optional but limited to 500 characters
- Reviews can only be created for finished reservations
- Each user can only write one review per reservation
- Admin users can view all reviews
- Pagination is applied to large result sets 