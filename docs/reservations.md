# Reservations Routes

## Reservation Management

### POST `/reservations`
Create a new reservation.

**Validations:**
- Valid JWT token required
- All fields are required
- Start date must be in the future
- End date must be after start date
- Pet must belong to the authenticated user
- Caregiver must exist and be different from the user
- Caregiver must have care configuration enabled
- Caregiver must accept the pet type
- Caregiver must have a care address configured
- Reservation dates must not conflict with existing reservations

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```typescript
{
  startDate: string;
  endDate: string;
  careLocation: "pet_home" | "caregiver_home";
  caregiverId: string;
  petIds: string[];
  visitsPerDay?: number;
  userAddressId?: string;
  caregiverAddressId?: string;
  distance?: number;
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  data: {
    id: string;
    startDate: string;
    endDate: string;
    careLocation: "pet_home" | "caregiver_home";
    address: {
      id: string;
      name: string;
      address: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      phoneNumber?: string;
      avatar?: string;
    };
    caregiver: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      phoneNumber?: string;
      avatar?: string;
    };
    pets: Array<{
      id: string;
      name: string;
      petType: {
        id: string;
        name: string;
      };
      characteristics: Array<{
        id: string;
        name: string;
        value: string;
      }>;
      comment?: string;
      avatar?: string;
    }>;
    visitsCount?: number;
    totalPrice: string;
    commission: string;
    totalOwner: string;
    totalCaregiver: string;
    distance?: number;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
}
```

**Example Request:**
```json
{
  "startDate": "2024-02-01T10:00:00.000Z",
  "endDate": "2024-02-03T18:00:00.000Z",
  "careLocation": "pet_home",
  "caregiverId": "507f1f77bcf86cd799439012",
  "petIds": ["507f1f77bcf86cd799439011"],
  "visitsPerDay": 2,
  "userAddressId": "507f1f77bcf86cd799439013",
  "caregiverAddressId": "507f1f77bcf86cd799439014",
  "distance": 5.2
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Reserva creada exitosamente",
  "data": {
    "id": "507f1f77bcf86cd799439013",
    "startDate": "2024-02-01T10:00:00.000Z",
    "endDate": "2024-02-03T18:00:00.000Z",
    "careLocation": "pet_home",
    "address": {
      "id": "507f1f77bcf86cd799439016",
      "name": "Casa",
      "address": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "USA"
    },
    "user": {
      "id": "507f1f77bcf86cd799439015",
<<<<<<< Updated upstream
      "startDate": "2024-01-15",
      "endDate": "2024-01-20",
      "careLocation": "pet_home",
      "totalPrice": "$1,200.00",
      "commission": "$72.00",
      "totalOwner": "$1,272.00",
      "distance": 5.2,
      "status": "pending",
      "createdAt": "2024-01-10T10:30:00.000Z"
    }
=======
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phoneNumber": "+1234567891",
      "avatar": "/api/users/507f1f77bcf86cd799439015/avatar"
    },
    "caregiver": {
      "id": "507f1f77bcf86cd799439012",
      "firstName": "Maria",
      "lastName": "Garcia",
      "email": "maria@example.com",
      "phoneNumber": "+1234567890",
      "avatar": "/api/users/507f1f77bcf86cd799439012/avatar"
    },
    "pets": [
      {
        "id": "507f1f77bcf86cd799439011",
        "name": "Luna",
        "petType": {
          "id": "507f1f77bcf86cd799439014",
          "name": "Perro"
        },
        "characteristics": [
          {
            "id": "507f1f77bcf86cd799439017",
            "name": "Tamaño",
            "value": "Grande"
          }
        ],
        "comment": "Mi perrita favorita",
        "avatar": "/api/pets/507f1f77bcf86cd799439011/avatar"
      }
    ],
    "visitsCount": 6,
    "totalPrice": "30.000,00",
    "commission": "1.800,00",
    "totalOwner": "31.800,00",
    "totalCaregiver": "28.200,00",
    "distance": 5.2,
    "status": "payment_pending",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
>>>>>>> Stashed changes
  }
}
```

<<<<<<< Updated upstream
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

- `pending` - Pendiente
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

# Pending reservations where you are the owner
curl -X GET "http://localhost:3000/api/reservations?role=owner&status=pending" \
  -H "Authorization: Bearer <token>"

# With pagination
curl -X GET "http://localhost:3000/api/reservations?page=1&limit=5&role=owner" \
  -H "Authorization: Bearer <token>"
=======
**Error Response:**
```json
{
  "success": false,
  "message": "El cuidador no acepta este tipo de mascota",
  "data": null
}
>>>>>>> Stashed changes
```

### GET `/reservations`
Get the authenticated user's reservations. **Paginated**

**Validations:**
- Valid JWT token required

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `status`: Filter by status
- `careLocation`: Filter by care location
- `startDate`: Filter by start date
- `endDate`: Filter by end date

**Response:**
```typescript
{
  success: boolean;
  message: string;
  data: {
    reservations: Array<{
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
        phoneNumber?: string;
        avatar?: string;
      };
      owner: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        phoneNumber?: string;
        avatar?: string;
      };
      startDate: string;
      endDate: string;
      serviceType: "homeCare" | "petHomeCare";
      status: "payment_pending" | "payment_rejected" | "waiting_acceptance" | "confirmed" | "started" | "finished" | "cancelledOwner" | "cancelledCaregiver" | "rejected";
      totalPrice: number;
      notes?: string;
      careAddress: {
        id: string;
        name: string;
        address: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
      };
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
  "message": "Reservas obtenidas exitosamente",
  "data": {
    "reservations": [
      {
        "id": "507f1f77bcf86cd799439013",
        "pet": {
          "id": "507f1f77bcf86cd799439011",
          "name": "Luna",
          "petType": {
            "id": "507f1f77bcf86cd799439014",
            "name": "Perro"
          }
        },
        "caregiver": {
          "id": "507f1f77bcf86cd799439012",
          "firstName": "Maria",
          "lastName": "Garcia",
          "email": "maria@example.com",
          "phoneNumber": "+1234567890",
          "avatar": "/api/users/507f1f77bcf86cd799439012/avatar"
        },
<<<<<<< Updated upstream
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
        "status": "pending",
        "createdAt": "2024-01-10T10:30:00.000Z",
        "updatedAt": "2024-01-10T10:30:00.000Z"
=======
        "owner": {
          "id": "507f1f77bcf86cd799439015",
          "firstName": "John",
          "lastName": "Doe",
          "email": "john@example.com",
          "phoneNumber": "+1234567891",
          "avatar": "/api/users/507f1f77bcf86cd799439015/avatar"
        },
        "startDate": "2024-02-01T10:00:00.000Z",
        "endDate": "2024-02-03T18:00:00.000Z",
        "serviceType": "homeCare",
        "status": "waiting_acceptance",
        "totalPrice": 150,
        "notes": "Mi perro necesita atención especial",
        "careAddress": {
          "id": "507f1f77bcf86cd799439016",
          "name": "Casa",
          "address": "123 Main St",
          "city": "New York",
          "state": "NY",
          "zipCode": "10001",
          "country": "USA"
        },
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
>>>>>>> Stashed changes
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



### GET `/reservations/:id`
Get a specific reservation.

**Validations:**
- Valid JWT token required
- Reservation ID must exist
- User must be the owner or caregiver of the reservation

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
      phoneNumber?: string;
      avatar?: string;
    };
    owner: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      phoneNumber?: string;
      avatar?: string;
    };
    startDate: string;
    endDate: string;
    serviceType: "homeCare" | "petHomeCare";
    status: "payment_pending" | "payment_rejected" | "waiting_acceptance" | "confirmed" | "started" | "finished" | "cancelledOwner" | "cancelledCaregiver" | "rejected";
    totalPrice: number;
    notes?: string;
    careAddress: {
      id: string;
      name: string;
      address: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
    createdAt: string;
    updatedAt: string;
  };
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Reserva obtenida exitosamente",
  "data": {
    "id": "507f1f77bcf86cd799439013",
    "pet": {
      "id": "507f1f77bcf86cd799439011",
      "name": "Luna",
      "petType": {
        "id": "507f1f77bcf86cd799439014",
        "name": "Perro"
      }
    },
    "caregiver": {
      "id": "507f1f77bcf86cd799439012",
      "firstName": "Maria",
      "lastName": "Garcia",
      "email": "maria@example.com",
      "phoneNumber": "+1234567890",
      "avatar": "/api/users/507f1f77bcf86cd799439012/avatar"
    },
    "owner": {
      "id": "507f1f77bcf86cd799439015",
<<<<<<< Updated upstream
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
      "status": "pending",
      "createdAt": "2024-01-10T10:30:00.000Z",
      "updatedAt": "2024-01-10T10:30:00.000Z"
    }
=======
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phoneNumber": "+1234567891",
      "avatar": "/api/users/507f1f77bcf86cd799439015/avatar"
    },
    "startDate": "2024-02-01T10:00:00.000Z",
    "endDate": "2024-02-03T18:00:00.000Z",
    "serviceType": "homeCare",
    "status": "waiting_acceptance",
    "totalPrice": 150,
    "notes": "Mi perro necesita atención especial",
    "careAddress": {
      "id": "507f1f77bcf86cd799439016",
      "name": "Casa",
      "address": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "USA"
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
>>>>>>> Stashed changes
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Reserva no encontrada",
  "data": null
}
```

### PUT `/reservations/:id/accept`
Accept a reservation (caregiver only).

**Validations:**
- Valid JWT token required
- Reservation ID must exist
- User must be the caregiver of the reservation
- Reservation status must be "waiting_acceptance"

<<<<<<< Updated upstream
Caregiver accepts a pending reservation.
=======
**Headers:**
```
Authorization: Bearer <token>
```
>>>>>>> Stashed changes

**Response:**
```typescript
{
  success: boolean;
  message: string;
  data: {
    reservation: {
      id: string;
      status: string;
      updatedAt: string;
    };
  };
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Reserva aceptada exitosamente",
  "data": {
    "reservation": {
      "id": "507f1f77bcf86cd799439013",
      "status": "confirmed",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

<<<<<<< Updated upstream
### Reject Reservation

**PUT** `/api/reservations/:id/reject`

Caregiver rejects a pending reservation.

#### Request Body

=======
**Error Response:**
>>>>>>> Stashed changes
```json
{
  "success": false,
  "message": "Solo el cuidador puede aceptar esta reserva",
  "data": null
}
```

### PUT `/reservations/:id/reject`
Reject a reservation (caregiver only).

**Validations:**
- Valid JWT token required
- Reservation ID must exist
- User must be the caregiver of the reservation
- Reservation status must be "waiting_acceptance"

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```typescript
{
  reason?: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  data: {
    reservation: {
      id: string;
      status: string;
      updatedAt: string;
    };
  };
}
```

**Example Request:**
```json
{
  "reason": "No puedo atender en esas fechas"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Reserva rechazada exitosamente",
  "data": {
    "reservation": {
      "id": "507f1f77bcf86cd799439013",
      "status": "rejected",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Solo el cuidador puede rechazar esta reserva",
  "data": null
}
```

### PUT `/reservations/:id/cancel`
Cancel a reservation (owner or caregiver).

**Validations:**
- Valid JWT token required
- Reservation ID must exist
- User must be the owner or caregiver of the reservation
- Cannot cancel if reservation is already finished or cancelled

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```typescript
{
  reason?: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  data: {
    reservation: {
      id: string;
      status: string;
      updatedAt: string;
    };
  };
}
```

**Example Request:**
```json
{
  "reason": "Cambio de planes"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Reserva cancelada exitosamente",
  "data": {
    "reservation": {
      "id": "507f1f77bcf86cd799439013",
      "status": "cancelledOwner",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "No tienes permisos para cancelar esta reserva",
  "data": null
}
```



## Admin Reservation Management

### GET `/reservations/admin/all`
Get all reservations with advanced filters (admin only). **Paginated**

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
- `status`: Filter by status
- `userId`: Filter by user ID
- `caregiverId`: Filter by caregiver ID

**Response:**
```typescript
{
  success: boolean;
  message: string;
  data: {
    items: Array<{
      id: string;
      startDate: string;
      endDate: string;
      careLocation: string;
      address: {
        name: string;
        fullAddress: string;
        floor?: string;
        apartment?: string;
        coords: {
          lat: number;
          lon: number;
        };
      };
      user: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        avatar?: string;
        phoneNumber?: string;
      };
      caregiver: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        avatar?: string;
        phoneNumber?: string;
      };
      pets: Array<{
        id: string;
        name: string;
        petType: {
          id: string;
          name: string;
        };
        characteristics: Array<{
          id: string;
          name: string;
          value: string;
        }>;
        comment?: string;
        avatar?: string;
      }>;
      visitsCount: number;
      totalPrice: string;
      commission: string;
      totalOwner: string;
      totalCaregiver: string;
      distance?: number;
      status: "payment_pending" | "payment_rejected" | "waiting_acceptance" | "confirmed" | "started" | "finished" | "cancelledOwner" | "cancelledCaregiver" | "rejected";
      createdAt: string;
      updatedAt: string;
    }>;
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
  "message": "Reservas obtenidas exitosamente",
  "data": {
    "items": [
      {
        "id": "507f1f77bcf86cd799439013",
        "startDate": "2024-02-01T10:00:00.000Z",
        "endDate": "2024-02-03T18:00:00.000Z",
        "careLocation": "pet_home",
        "address": {
          "name": "Casa",
          "fullAddress": "123 Main St, New York, NY 10001",
          "floor": "2",
          "apartment": "A",
          "coords": {
            "lat": 40.7128,
            "lon": -74.0060
          }
        },
        "user": {
          "id": "507f1f77bcf86cd799439015",
          "firstName": "John",
          "lastName": "Doe",
          "email": "john@example.com",
          "phoneNumber": "+1234567891",
          "avatar": "/api/users/507f1f77bcf86cd799439015/avatar"
        },
        "caregiver": {
          "id": "507f1f77bcf86cd799439012",
          "firstName": "Maria",
          "lastName": "Garcia",
          "email": "maria@example.com",
          "phoneNumber": "+1234567890",
          "avatar": "/api/users/507f1f77bcf86cd799439012/avatar"
        },
        "pets": [
          {
            "id": "507f1f77bcf86cd799439011",
            "name": "Luna",
            "petType": {
              "id": "507f1f77bcf86cd799439014",
              "name": "Perro"
            },
            "characteristics": [
              {
                "id": "507f1f77bcf86cd799439017",
                "name": "Tamaño",
                "value": "Mediano"
              }
            ],
            "comment": "Perro muy tranquilo",
            "avatar": "/api/pets/507f1f77bcf86cd799439011/avatar"
          }
        ],
<<<<<<< Updated upstream
        "visitsCount": 10,
        "totalPrice": "$1,200.00",
        "commission": "$72.00",
        "totalOwner": "$1,272.00",
        "totalCaregiver": "$1,128.00",
        "distance": 5.2,
        "status": "pending",
        "createdAt": "2024-01-10T10:30:00.000Z",
        "updatedAt": "2024-01-10T10:30:00.000Z"
=======
        "visitsCount": 3,
        "totalPrice": "$150.00",
        "commission": "$15.00",
        "totalOwner": "$135.00",
        "totalCaregiver": "$135.00",
        "distance": 2.5,
        "status": "waiting_acceptance",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
>>>>>>> Stashed changes
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

**Error Response:**
```json
{
  "success": false,
  "message": "No autorizado",
  "data": null
}
```

### GET `/reservations/admin/:id`
Get a specific reservation (admin only).

**Validations:**
- Valid JWT token required
- Admin permissions required
- Reservation ID must exist

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
      careLocation: string;
      address: {
        name: string;
        fullAddress: string;
        floor?: string;
        apartment?: string;
        coords: {
          lat: number;
          lon: number;
        };
      };
      user: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        phoneNumber?: string;
      };
      caregiver: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        phoneNumber?: string;
      };
      pets: Array<{
        id: string;
        name: string;
        petType: {
          id: string;
          name: string;
        };
        characteristics: Array<{
          id: string;
          name: string;
          value: string;
        }>;
        comment?: string;
        avatar?: string;
      }>;
      visitsCount: number;
      totalPrice: string;
      commission: string;
      totalOwner: string;
      totalCaregiver: string;
      distance?: number;
      status: "payment_pending" | "payment_rejected" | "waiting_acceptance" | "confirmed" | "started" | "finished" | "cancelledOwner" | "cancelledCaregiver" | "rejected";
      createdAt: string;
      updatedAt: string;
    };
  };
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Reserva obtenida exitosamente",
  "data": {
    "reservation": {
      "id": "507f1f77bcf86cd799439013",
      "startDate": "2024-02-01T10:00:00.000Z",
      "endDate": "2024-02-03T18:00:00.000Z",
      "careLocation": "pet_home",
      "address": {
        "name": "Casa",
        "fullAddress": "123 Main St, New York, NY 10001",
        "floor": "2",
        "apartment": "A",
        "coords": {
          "lat": 40.7128,
          "lon": -74.0060
        }
      },
      "user": {
        "id": "507f1f77bcf86cd799439015",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "phoneNumber": "+1234567891"
      },
      "caregiver": {
        "id": "507f1f77bcf86cd799439012",
        "firstName": "Maria",
        "lastName": "Garcia",
        "email": "maria@example.com",
        "phoneNumber": "+1234567890"
      },
      "pets": [
        {
          "id": "507f1f77bcf86cd799439011",
          "name": "Luna",
          "petType": {
            "id": "507f1f77bcf86cd799439014",
            "name": "Perro"
          },
          "characteristics": [
            {
              "id": "507f1f77bcf86cd799439017",
              "name": "Tamaño",
              "value": "Mediano"
            }
          ],
          "comment": "Perro muy tranquilo",
          "avatar": "/api/pets/507f1f77bcf86cd799439011/avatar"
        }
      ],
<<<<<<< Updated upstream
      "visitsCount": 10,
      "totalPrice": "$1,200.00",
      "commission": "$72.00",
      "totalOwner": "$1,272.00",
      "totalCaregiver": "$1,128.00",
      "distance": 5.2,
      "status": "pending",
      "createdAt": "2024-01-10T10:30:00.000Z",
      "updatedAt": "2024-01-10T10:30:00.000Z"
=======
      "visitsCount": 3,
      "totalPrice": "$150.00",
      "commission": "$15.00",
      "totalOwner": "$135.00",
      "totalCaregiver": "$135.00",
      "distance": 2.5,
      "status": "waiting_acceptance",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
>>>>>>> Stashed changes
    }
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Reserva no encontrada",
  "data": null
}
```