# Caregiver Search Service

## Endpoint

`POST /api/caregiver-search`

## Description

This service allows users to search for available caregivers that meet the specified criteria. The system filters caregivers based on:

- Enabled care type (pet's home or caregiver's home)
- Pet types they can care for
- Configured prices
- Distance (for pet home care)
- Date availability

## Authentication

Requires authentication via JWT token in the header `Authorization: Bearer <token>`

## Input Parameters

### Body (JSON)

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
  "page": 1,
  "limit": 10
}
```

### Required Parameters

| Field | Type | Description |
|-------|------|-------------|
| `startDate` | string | Care start date (YYYY-MM-DD) |
| `endDate` | string | Care end date (YYYY-MM-DD) |
| `careLocation` | string | Care type: `"pet_home"` or `"caregiver_home"` |
| `petIds` | string[] | Array with pet IDs to be cared for |

### Optional Parameters

| Field | Type | Description | Condition |
|-------|------|-------------|-----------|
| `visitsPerDay` | number | Number of visits per day | Only for `careLocation: "pet_home"` |
| `userAddressId` | string | User's address ID | Only for `careLocation: "pet_home"` |
| `maxDistance` | number | Maximum distance in km | Only for `careLocation: "pet_home"` |
| `maxPrice` | number | Maximum price to pay | Optional |
| `page` | number | Page number (default: 1) | Optional |
| `limit` | number | Results per page (default: 10) | Optional |

## Response

### Successful Response (200)

```json
{
  "success": true,
  "message": "Search completed successfully",
  "data": {
    "results": [
      {
        "caregiver": {
          "_id": "507f1f77bcf86cd799439014",
          "firstName": "María",
          "lastName": "González",
          "email": "maria@gonzalez.com",
          "phoneNumber": "+5434112345678",
          "avatar": "/api/users/507f1f77bcf86cd799439014/avatar",
          "addresses": [
            {
              "_id": "507f1f77bcf86cd799439015",
              "name": "Casa",
              "fullAddress": "San Martín 1234, Rosario, Santa Fe",
              "coords": {
                "lat": -32.9468,
                "lon": -60.6393
              }
            }
          ]
        },
        "totalPrice": 30000,
        "commission": 1800,
        "totalWithCommission": 31800,
        "careDetails": {
          "daysCount": 3,
          "visitsCount": 6,
          "pricePerVisit": 5000
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
      "daysCount": 3
    }
  }
}
```

### Result Structure

| Field | Type | Description |
|-------|------|-------------|
| `caregiver` | object | Caregiver data |
| `totalPrice` | number | Total caregiver fees |
| `commission` | number | 6% commission |
| `totalWithCommission` | number | Total price + commission |
| `careDetails` | object | Calculation details |

### Calculations

#### For Pet Home Care (`pet_home`)
```
totalPrice = pricePerVisit × visitsPerDay × daysCount
```

#### For Caregiver Home Care (`caregiver_home`)
```
totalPrice = pricePerDay × daysCount
```

#### Commission
```
commission = totalPrice × 0.06
totalWithCommission = totalPrice + commission
```

#### Day Calculation
Days are calculated including both start and end dates.
Example: 29/07 to 31/07 = 3 days (29, 30, 31)

## Error Codes

### 400 - Validation Error
```json
{
  "success": false,
  "message": "Missing required parameters"
}
```

### 400 - Past Date
```json
{
  "success": false,
  "message": "Start date cannot be in the past"
}
```

### 400 - Invalid Dates
```json
{
  "success": false,
  "message": "End date must be after start date"
}
```

### 400 - Missing Parameters for Pet Home
```json
{
  "success": false,
  "message": "Visits per day is required for pet home care"
}
```

## Usage Examples

### Example 1: Search for Pet Home Care
```bash
curl -X POST http://localhost:3000/api/caregiver-search \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "startDate": "2024-08-01",
    "endDate": "2024-08-03",
    "careLocation": "pet_home",
    "petIds": ["507f1f77bcf86cd799439011"],
    "visitsPerDay": 3,
    "userAddressId": "507f1f77bcf86cd799439013",
    "maxDistance": 15,
    "maxPrice": 75000
  }'
```

### Example 2: Search for Caregiver Home Care
```bash
curl -X POST http://localhost:3000/api/caregiver-search \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "startDate": "2024-08-05",
    "endDate": "2024-08-07",
    "careLocation": "caregiver_home",
    "petIds": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"],
    "maxPrice": 100000
  }'
```

## Applied Filters

1. **Care Type**: Only caregivers with the enabled option
2. **Pet Types**: Only caregivers who can care for the requested pet types
3. **Price**: Only caregivers within the specified price range
4. **Distance**: Only for pet home care, filter by maximum distance
5. **Sorting**: Results ordered by total price (cheapest first)

## Important Notes

- Search requires user authentication
- Caregivers must have their `carerConfig` configured with prices
- Distance is calculated using the Haversine formula between coordinates
- Commission is fixed at 6% of total price
- Results include pagination to handle large data volumes 