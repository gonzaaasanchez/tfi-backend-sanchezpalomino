# Caregiver Search Service

## Endpoint

`POST /api/caregiver-search`

## Description

This service allows users to search for available caregivers that meet the specified criteria. The system filters caregivers based on:

- Enabled care type (pet's home or caregiver's home)
- Pet types they can care for
- Configured prices
- Distance (for any care type)
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
| `startDate` | string | Care start date (YYYY-MM-DD) - must be at least tomorrow |
| `endDate` | string | Care end date (YYYY-MM-DD) |
| `careLocation` | string | Care type: `"pet_home"` or `"caregiver_home"` |
| `petIds` | string[] | Array with pet IDs to be cared for |

### Optional Parameters

| Field | Type | Description | Condition |
|-------|------|-------------|-----------|
| `visitsPerDay` | number | Number of visits per day | Only for `careLocation: "pet_home"` |
| `userAddressId` | string | User's address ID | Required for distance calculation |
| `maxDistance` | number | Maximum distance in km | Works for any care type |
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
    "items": [
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
        "totalPrice": "30.000,00",
        "commission": "1.800,00",
        "totalWithCommission": "31.800,00",
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
      "daysCount": 3
    }
  }
}
```

### Response Structure

The response includes the following fields:

| Field | Type | Description |
|-------|------|-------------|
| `items` | array | Array of caregiver search results |
| `pagination` | object | Pagination information (page, limit, total, etc.) |
| `searchParams` | object | Search parameters used for the query |

#### Individual Result Structure

Each item in the `items` array contains:

| Field | Type | Description |
|-------|------|-------------|
| `caregiver` | object | Caregiver data (id, name, email, phone, avatar, addresses) |
| `totalPrice` | string | Total caregiver fees (formatted with thousand separators) |
| `commission` | string | 6% commission (formatted with thousand separators) |
| `totalWithCommission` | string | Total price + commission (formatted with thousand separators) |
| `distance` | number | Calculated distance in km (if maxDistance was specified) |
| `daysCount` | number | Total number of days for the care period (including both start and end dates) |
| `careDetails` | object | Calculation details (visitsCount, pricePerVisit) |

### Price Formatting

All price fields are formatted with:
- **Thousand separator**: `.` (dot)
- **Decimal separator**: `,` (comma)
- **Always 2 decimal places**

Examples:
- `"30.000,00"` instead of `30000`
- `"1.250,50"` instead of `1250.5`

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

### 400 - Date Validation
```json
{
  "success": false,
  "message": "Start date must be at least tomorrow"
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

### Example 2: Search for Caregiver Home Care with Distance
```bash
curl -X POST http://localhost:3000/api/caregiver-search \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "startDate": "2024-08-05",
    "endDate": "2024-08-07",
    "careLocation": "caregiver_home",
    "petIds": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"],
    "userAddressId": "507f1f77bcf86cd799439013",
    "maxDistance": 20,
    "maxPrice": 100000
  }'
```

## Applied Filters

1. **Care Type**: Only caregivers with the enabled option
2. **Pet Types**: Only caregivers who can care for the requested pet types
3. **Price**: Only caregivers within the specified price range
4. **Distance**: Filter by maximum distance (works for any care type)
5. **Sorting**: Results ordered by total price (cheapest first)

## Important Notes

- Search requires user authentication
- Caregivers must have their `carerConfig` configured with prices
- Distance is calculated using the Haversine formula between coordinates
- Commission is fixed at 6% of total price
- Results include pagination to handle large data volumes
- Start date must be at least tomorrow (not today)
- All prices are formatted with thousand separators for better readability 