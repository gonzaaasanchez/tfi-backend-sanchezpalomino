# Reservations API - TFI Backend

## Overview

The Reservations API allows users to create, manage, and view pet care reservations. Users can be either pet owners (creating reservations) or caregivers (accepting/rejecting reservations).

## Authentication

All endpoints require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Endpoints

### Create Reservation

**POST** `/api/reservations`

Create a new pet care reservation.

#### Request Body

```json
{
  "startDate": "2024-01-15",
  "endDate": "2024-01-20",
  "careLocation": "pet_home",
  "caregiverId": "507f1f77bcf86cd799439011",
  "petIds": ["507f1f77bcf86cd799439012"],
  "visitsPerDay": 2,
  "userAddressId": "507f1f77bcf86cd799439013",
  "caregiverAddressId": "507f1f77bcf86cd799439014",
  "distance": 5.2
}
```

#### Parameters

| Parameter            | Type     | Required    | Description                        |
| -------------------- | -------- | ----------- | ---------------------------------- |
| `startDate`          | string   | Yes         | Start date (YYYY-MM-DD format)     |
| `endDate`            | string   | Yes         | End date (YYYY-MM-DD format)       |
| `careLocation`       | string   | Yes         | `pet_home` or `caregiver_home`     |
| `caregiverId`        | string   | Yes         | ID of the caregiver                |
| `petIds`             | string[] | Yes         | Array of pet IDs                   |
| `visitsPerDay`       | number   | Conditional | Required for `pet_home` care       |
| `userAddressId`      | string   | Conditional | Required for `pet_home` care       |
| `caregiverAddressId` | string   | Conditional | Required for `caregiver_home` care |
| `distance`           | number   | No          | Distance in kilometers             |

#### Response

```json
{
  "success": true,
  "message": "Reserva creada exitosamente",
  "data": {
    "reservation": {
      "id": "507f1f77bcf86cd799439015",
      "startDate": "2024-01-15",
      "endDate": "2024-01-20",
      "careLocation": "pet_home",
      "totalPrice": "$1,200.00",
      "commission": "$72.00",
      "totalOwner": "$1,272.00",
      "distance": 5.2,
      "status": "waiting_acceptance",
      "createdAt": "2024-01-10T10:30:00.000Z"
    }
  }
}
```

> **Note**: The creation response only shows `totalOwner` (what the owner pays). The `totalCaregiver` value is calculated and stored but not returned in the creation response.

### Get User Reservations

**GET** `/api/reservations`

Get reservations where the user is either the owner or caregiver.

#### Query Parameters

| Parameter | Type   | Default | Description                                    |
| --------- | ------ | ------- | ---------------------------------------------- |
| `page`    | number | 1       | Page number for pagination                     |
| `limit`   | number | 10      | Number of items per page                       |
| `status`  | string | -       | Filter by status                               |
| `role`    | string | -       | Filter by role: `owner`, `caregiver`, or `all` |

#### Status Values

- `payment_pending` - Pendiente de pago
- `payment_rejected` - Pago rechazado
- `waiting_acceptance` - Esperando aceptación del cuidador
- `confirmed` - Confirmada
- `started` - Iniciada
- `finished` - Finalizada
- `rejected` - Rechazada
- `cancelled_owner` - Cancelada por propietario
- `cancelled_caregiver` - Cancelada por cuidador

#### Role Values

- `owner` - Solo reservas donde eres propietario
- `caregiver` - Solo reservas donde eres cuidador
- `all` - Ambas (comportamiento por defecto)

#### Examples

```bash
# All reservations (owner and caregiver)
curl -X GET "http://localhost:3000/api/reservations" \
  -H "Authorization: Bearer <token>"

# Only reservations where you are the owner
curl -X GET "http://localhost:3000/api/reservations?role=owner" \
  -H "Authorization: Bearer <token>"

# Only reservations where you are the caregiver
curl -X GET "http://localhost:3000/api/reservations?role=caregiver" \
  -H "Authorization: Bearer <token>"

# Waiting acceptance reservations where you are the owner
curl -X GET "http://localhost:3000/api/reservations?role=owner&status=waiting_acceptance" \
  -H "Authorization: Bearer <token>"

# With pagination
curl -X GET "http://localhost:3000/api/reservations?page=1&limit=5&role=owner" \
  -H "Authorization: Bearer <token>"
```

#### Response

```json
{
  "success": true,
  "message": "Reservas obtenidas exitosamente",
  "data": {
    "items": [
      {
        "id": "507f1f77bcf86cd799439015",
        "startDate": "2024-01-15",
        "endDate": "2024-01-20",
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
        "user": {
          "id": "507f1f77bcf86cd799439016",
          "firstName": "Juan",
          "lastName": "Pérez",
          "email": "juan@email.com",
          "avatar": "avatar.jpg"
        },
        "caregiver": {
          "id": "507f1f77bcf86cd799439017",
          "firstName": "María",
          "lastName": "García",
          "email": "maria@email.com",
          "avatar": "avatar.jpg"
        },
        "pets": [
          {
            "id": "507f1f77bcf86cd799439012",
            "name": "Luna",
            "petType": {
              "id": "507f1f77bcf86cd799439018",
              "name": "Perro"
            },
            "characteristics": [
              {
                "id": "507f1f77bcf86cd799439019",
                "name": "Temperamento",
                "value": "Amigable"
              }
            ],
            "comment": "Muy juguetona y sociable",
            "avatar": "/api/pets/507f1f77bcf86cd799439012/avatar"
          }
        ],
        "visitsCount": 10,
        "totalPrice": "$1,200.00",
        "commission": "$72.00",
        "totalOwner": "$1,272.00",
        "distance": 5.2,
        "status": "waiting_acceptance",
        "createdAt": "2024-01-10T10:30:00.000Z",
        "updatedAt": "2024-01-10T10:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

> **Note**: The total field returned depends on the user's role in the reservation:
> - **Owner**: Returns `totalOwner` (what they pay)
> - **Caregiver**: Returns `totalCaregiver` (what they receive)
> - **Admin**: Returns both `totalOwner` and `totalCaregiver`

### Get Specific Reservation

**GET** `/api/reservations/:id`

Get details of a specific reservation.

#### Response

```json
{
  "success": true,
  "message": "Reserva obtenida exitosamente",
  "data": {
    "reservation": {
      "id": "507f1f77bcf86cd799439015",
      "startDate": "2024-01-15",
      "endDate": "2024-01-20",
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
      "user": {
        "id": "507f1f77bcf86cd799439016",
        "firstName": "Juan",
        "lastName": "Pérez",
        "email": "juan@email.com",
        "phoneNumber": "+5491112345678",
        "avatar": "avatar.jpg"
      },
      "caregiver": {
        "id": "507f1f77bcf86cd799439017",
        "firstName": "María",
        "lastName": "García",
        "email": "maria@email.com",
        "phoneNumber": "+5491187654321",
        "avatar": "avatar.jpg"
      },
      "pets": [
        {
          "id": "507f1f77bcf86cd799439012",
          "name": "Luna",
          "petType": {
            "id": "507f1f77bcf86cd799439018",
            "name": "Perro"
          },
          "characteristics": [
            {
              "id": "507f1f77bcf86cd799439019",
              "name": "Temperamento",
              "value": "Amigable"
            }
          ],
          "comment": "Muy juguetona y sociable",
          "avatar": "/api/pets/507f1f77bcf86cd799439012/avatar"
        }
      ],
      "visitsCount": 10,
      "totalPrice": "$1,200.00",
      "commission": "$72.00",
      "totalOwner": "$1,272.00",
      "distance": 5.2,
      "status": "waiting_acceptance",
      "createdAt": "2024-01-10T10:30:00.000Z",
      "updatedAt": "2024-01-10T10:30:00.000Z"
    }
  }
}
```

> **Note**: The total field returned depends on the user's role in the reservation:
> - **Owner**: Returns `totalOwner` (what they pay)
> - **Caregiver**: Returns `totalCaregiver` (what they receive)
> - **Admin**: Returns both `totalOwner` and `totalCaregiver`

### Accept Reservation

**PUT** `/api/reservations/:id/accept`

Caregiver accepts a waiting acceptance reservation.

#### Response

```json
{
  "success": true,
  "message": "Reserva aceptada exitosamente",
  "data": {
    "reservation": {
      "id": "507f1f77bcf86cd799439015",
      "status": "confirmed",
      "updatedAt": "2024-01-10T11:00:00.000Z"
    }
  }
}
```

### Reject Reservation

**PUT** `/api/reservations/:id/reject`

Caregiver rejects a waiting acceptance reservation.

#### Request Body

```json
{
  "reason": "No puedo cuidar ese tipo de mascota"
}
```

#### Parameters

| Parameter | Type   | Required | Description                    |
| --------- | ------ | -------- | ------------------------------ |
| `reason`  | string | No       | Optional reason for rejection  |

#### Response

```json
{
  "success": true,
  "message": "Reserva rechazada exitosamente",
  "data": {
    "reservation": {
      "id": "507f1f77bcf86cd799439015",
      "status": "rejected",
      "updatedAt": "2024-01-10T11:15:00.000Z"
    }
  }
}
```

### Cancel Reservation

**PUT** `/api/reservations/:id/cancel`

Cancel a reservation (can be done by owner, caregiver, or admin).

#### Request Body

```json
{
  "reason": "Cambio de planes"
}
```

#### Response

```json
{
  "success": true,
  "message": "Reserva cancelada exitosamente",
  "data": {
    "reservation": {
      "id": "507f1f77bcf86cd799439015",
      "status": "cancelled_owner",
      "updatedAt": "2024-01-10T11:30:00.000Z"
    }
  }
}
```

## Admin Endpoints

### Get All Reservations (Admin)

**GET** `/api/reservations/admin/all`

Get all reservations in the system (admin only).

#### Query Parameters

| Parameter     | Type   | Default | Description                |
| ------------- | ------ | ------- | -------------------------- |
| `page`        | number | 1       | Page number for pagination |
| `limit`       | number | 10      | Number of items per page   |
| `status`      | string | -       | Filter by status           |
| `userId`      | string | -       | Filter by user ID          |
| `caregiverId` | string | -       | Filter by caregiver ID     |

#### Response

```json
{
  "success": true,
  "message": "Reservas obtenidas exitosamente",
  "data": {
    "items": [
      {
        "id": "507f1f77bcf86cd799439015",
        "startDate": "2024-01-15",
        "endDate": "2024-01-20",
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
        "user": {
          "id": "507f1f77bcf86cd799439016",
          "firstName": "Juan",
          "lastName": "Pérez",
          "email": "juan@email.com",
          "avatar": "avatar.jpg",
          "phoneNumber": "+5491112345678"
        },
        "caregiver": {
          "id": "507f1f77bcf86cd799439017",
          "firstName": "María",
          "lastName": "García",
          "email": "maria@email.com",
          "avatar": "avatar.jpg",
          "phoneNumber": "+5491187654321"
        },
        "pets": [
          {
            "id": "507f1f77bcf86cd799439012",
            "name": "Luna",
            "petType": {
              "id": "507f1f77bcf86cd799439018",
              "name": "Perro"
            },
            "characteristics": [
              {
                "id": "507f1f77bcf86cd799439019",
                "name": "Temperamento",
                "value": "Amigable"
              }
            ],
            "comment": "Muy juguetona y sociable",
            "avatar": "/api/pets/507f1f77bcf86cd799439012/avatar"
          }
        ],
        "visitsCount": 10,
        "totalPrice": "$1,200.00",
        "commission": "$72.00",
        "totalOwner": "$1,272.00",
        "totalCaregiver": "$1,128.00",
        "distance": 5.2,
        "status": "waiting_acceptance",
        "createdAt": "2024-01-10T10:30:00.000Z",
        "updatedAt": "2024-01-10T10:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

> **Note**: Admin endpoints always return both `totalOwner` and `totalCaregiver` fields for complete financial visibility.

### Get Specific Reservation (Admin)

**GET** `/api/reservations/admin/:id`

Get details of a specific reservation (admin only).

#### Response

```json
{
  "success": true,
  "message": "Reserva obtenida exitosamente",
  "data": {
    "reservation": {
      "id": "507f1f77bcf86cd799439015",
      "startDate": "2024-01-15",
      "endDate": "2024-01-20",
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
      "user": {
        "id": "507f1f77bcf86cd799439016",
        "firstName": "Juan",
        "lastName": "Pérez",
        "email": "juan@email.com",
        "phoneNumber": "+5491112345678"
      },
      "caregiver": {
        "id": "507f1f77bcf86cd799439017",
        "firstName": "María",
        "lastName": "García",
        "email": "maria@email.com",
        "phoneNumber": "+5491187654321"
      },
      "pets": [
        {
          "id": "507f1f77bcf86cd799439012",
          "name": "Luna",
          "petType": {
            "id": "507f1f77bcf86cd799439018",
            "name": "Perro"
          },
          "characteristics": [
            {
              "id": "507f1f77bcf86cd799439019",
              "name": "Temperamento",
              "value": "Amigable"
            }
          ],
          "comment": "Muy juguetona y sociable",
          "avatar": "/api/pets/507f1f77bcf86cd799439012/avatar"
        }
      ],
      "visitsCount": 10,
      "totalPrice": "$1,200.00",
      "commission": "$72.00",
      "totalOwner": "$1,272.00",
      "totalCaregiver": "$1,128.00",
      "distance": 5.2,
      "status": "waiting_acceptance",
      "createdAt": "2024-01-10T10:30:00.000Z",
      "updatedAt": "2024-01-10T10:30:00.000Z"
    }
  }
}
```

> **Note**: Admin endpoints always return both `totalOwner` and `totalCaregiver` fields for complete financial visibility.

## Error Responses

### Validation Error

```json
{
  "success": false,
  "message": "Faltan parámetros requeridos",
  "error": "VALIDATION_ERROR"
}
```

### Not Found

```json
{
  "success": false,
  "message": "Reserva no encontrada",
  "error": "NOT_FOUND"
}
```

### Forbidden

```json
{
  "success": false,
  "message": "No tienes permisos para ver esta reserva",
  "error": "FORBIDDEN"
}
```