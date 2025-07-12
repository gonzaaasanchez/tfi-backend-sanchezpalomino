# Caregiver Search Routes

## Caregiver Search

### POST `/caregiverSearch`
Search for available caregivers that meet the specified criteria.

**Validations:**
- Valid JWT token required
- User must have permissions to search caregivers
- Start date and end date are required
- Care location must be valid
- Pet IDs array is required
- Start date must be in the future
- End date must be after start date

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
  petIds: string[];
  visitsPerDay?: number;
  userAddressId?: string;
  caregiverAddressId?: string;
  distance?: number;
  maxDistance?: number;
  maxPrice?: number;
  reviewsFrom?: number;
}
```

**Query Parameters:**
- `sortBy`: Sort by field ("price" or "distance") - default: "price"
- `sortOrder`: Sort order ("asc" or "desc") - default: "asc"
- `page`: Page number - default: 1
- `limit`: Results per page - default: 10

**Response:**
```typescript
{
  success: boolean;
  message: string;
  data: {
    items: Array<{
      caregiver: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        phoneNumber?: string;
        avatar?: string;
        reviews?: {
          averageRatingAsUser: number;
          totalReviewsAsUser: number;
          averageRatingAsCaregiver: number;
          totalReviewsAsCaregiver: number;
        };
        addresses: Array<{
          id: string;
          name: string;
          address: string;
          city: string;
          state: string;
          zipCode: string;
          country: string;
          coords: {
            lat: number;
            lon: number;
          };
        }>;
        carerConfig?: {
          homeCare?: {
            enabled: boolean;
            dayPrice?: number;
          };
          petHomeCare?: {
            enabled: boolean;
            visitPrice?: number;
          };
          petTypes: Array<{
            id: string;
            name: string;
          }>;
        };
      };
      totalPrice: string;
      commission: string;
      totalOwner: string;
      distance?: number;
      daysCount: number;
      careDetails: {
        visitsCount?: number;
        pricePerDay?: string;
        pricePerVisit?: string;
      };
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
    searchParams: {
      startDate: string;
      endDate: string;
      careLocation: string;
      petIds: string[];
      visitsPerDay?: number;
      userAddressId?: string;
      maxDistance?: number;
      maxPrice?: number;
      reviewsFrom?: number;
      daysCount: number;
    };
  };
}
```

**Example Request:**
```json
{
  "startDate": "2024-07-29",
  "endDate": "2024-07-31",
  "careLocation": "pet_home",
  "petIds": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"],
  "visitsPerDay": 2,
  "userAddressId": "507f1f77bcf86cd799439013",
  "maxDistance": 10,
  "maxPrice": 50000,
  "reviewsFrom": 4.5
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Búsqueda completada exitosamente",
  "data": {
    "items": [
      {
        "caregiver": {
          "id": "507f1f77bcf86cd799439014",
          "firstName": "María",
          "lastName": "González",
          "email": "maria@gonzalez.com",
          "phoneNumber": "+5434112345678",
          "avatar": "/api/users/507f1f77bcf86cd799439014/avatar",
          "reviews": {
            "averageRatingAsUser": 4.2,
            "totalReviewsAsUser": 8,
            "averageRatingAsCaregiver": 4.8,
            "totalReviewsAsCaregiver": 25
          },
          "addresses": [
            {
              "id": "507f1f77bcf86cd799439015",
              "name": "Casa",
              "address": "San Martín 1234",
              "city": "Rosario",
              "state": "Santa Fe",
              "zipCode": "2000",
              "country": "Argentina",
              "coords": {
                "lat": -32.9468,
                "lon": -60.6393
              }
            }
          ],
          "carerConfig": {
            "homeCare": {
              "enabled": false,
              "dayPrice": null
            },
            "petHomeCare": {
              "enabled": true,
              "visitPrice": 5000
            },
            "petTypes": [
              {
                "id": "507f1f77bcf86cd799439016",
                "name": "Perro"
              }
            ]
          }
        },
        "totalPrice": "30.000,00",
        "commission": "1.800,00",
        "totalOwner": "31.800,00",
        "distance": 2.5,
        "daysCount": 3,
        "careDetails": {
          "visitsCount": 6,
          "pricePerVisit": "5.000,00"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 5,
      "totalPages": 1,
      "hasNextPage": false,
      "hasPrevPage": false
    },
    "searchParams": {
      "startDate": "2024-07-29",
      "endDate": "2024-07-31",
      "careLocation": "pet_home",
      "petIds": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"],
      "visitsPerDay": 2,
      "userAddressId": "507f1f77bcf86cd799439013",
      "maxDistance": 10,
      "maxPrice": 50000,
      "reviewsFrom": 4.5,
      "daysCount": 3
    }
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Las fechas son requeridas",
  "data": null
}
```

**Notes:**
- The system filters caregivers based on enabled care type, pet types they can care for, configured prices, distance, and date availability
- Distance calculation only works if `userAddressId` and `maxDistance` are provided
- `reviewsFrom` filters caregivers by minimum average rating (caregivers with 0 reviews are always included)
- Results are sorted by price or distance based on `sortBy` parameter
- Commission is calculated as 6% of the total price
