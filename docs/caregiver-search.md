# Caregiver Search Service

## Endpoint

`POST /api/caregiver-search`

### Query Parameters

| Parameter   | Type   | Description                                              | Default   |
| ----------- | ------ | -------------------------------------------------------- | --------- |
| `sortBy`    | string | Sort by field: `"price"` or `"distance"`                 | `"price"` |
| `sortOrder` | string | Sort order: `"asc"` (ascending) or `"desc"` (descending) | `"asc"`   |
| `page`      | number | Page number                                              | `1`       |
| `limit`     | number | Results per page                                         | `10`      |

### Examples

```
POST /api/caregiver-search?sortBy=price&sortOrder=asc&page=1&limit=10
POST /api/caregiver-search?sortBy=distance&sortOrder=desc
POST /api/caregiver-search?page=2&limit=20
```

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
  "reviewsFrom": 4.5
}
```

### Required Parameters

| Field          | Type     | Description                                              |
| -------------- | -------- | -------------------------------------------------------- |
| `startDate`    | string   | Care start date (YYYY-MM-DD) - must be at least tomorrow |
| `endDate`      | string   | Care end date (YYYY-MM-DD)                               |
| `careLocation` | string   | Care type: `"pet_home"` or `"caregiver_home"`            |
| `petIds`       | string[] | Array with pet IDs to be cared for                       |

### Optional Parameters

| Field           | Type   | Description              | Condition                           |
| --------------- | ------ | ------------------------ | ----------------------------------- |
| `visitsPerDay`  | number | Number of visits per day | Only for `careLocation: "pet_home"` |
| `userAddressId` | string | User's address ID        | Required for distance calculation   |
| `maxDistance`   | number | Maximum distance in km   | Works for any care type             |
| `maxPrice`      | number | Maximum price to pay     | Optional                            |
| `reviewsFrom`   | number | Minimum average rating as caregiver (1-5) | Optional                            |

### Sorting Options

The results can be sorted by:

- **`sortBy: "price"`**: Sort by total price
- **`sortBy: "distance"`**: Sort by calculated distance (only works if `maxDistance` is specified)

With order:

- **`sortOrder: "asc"`**: Ascending order (lowest to highest)
- **`sortOrder: "desc"`**: Descending order (highest to lowest)

**Examples:**

- `{"sortBy": "price", "sortOrder": "asc"}` → Cheapest first
- `{"sortBy": "price", "sortOrder": "desc"}` → Most expensive first
- `{"sortBy": "distance", "sortOrder": "asc"}` → Closest first
- `{"sortBy": "distance", "sortOrder": "desc"}` → Farthest first

### Filtering by Reviews

The `reviewsFrom` parameter allows filtering caregivers by their average rating as caregivers:

- **`reviewsFrom: 4.5`**: Only caregivers with average rating ≥ 4.5 as caregivers
- **`reviewsFrom: 3.0`**: Only caregivers with average rating ≥ 3.0 as caregivers
- **Special case**: Caregivers with 0 total reviews are always included (new caregivers)

**Examples:**

- `{"reviewsFrom": 4.5}` → Only highly rated caregivers (≥4.5) or new caregivers
- `{"reviewsFrom": 3.0}` → Only caregivers with good rating (≥3.0) or new caregivers
- No `reviewsFrom` → All caregivers (no rating filter)

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

### Response Structure

The response includes the following fields:

| Field          | Type   | Description                                       |
| -------------- | ------ | ------------------------------------------------- |
| `items`        | array  | Array of caregiver search results                 |
| `pagination`   | object | Pagination information (page, limit, total, etc.) |
| `searchParams` | object | Search parameters used for the query              |

#### Individual Result Structure

Each item in the `items` array contains:

| Field         | Type   | Description                                                                   |
| ------------- | ------ | ----------------------------------------------------------------------------- |
| `caregiver`   | object | Caregiver data (id, name, email, phone, avatar, addresses)                    |
| `totalPrice`  | string | Total caregiver fees (formatted with thousand separators)                     |
| `commission`  | string | 6% commission (formatted with thousand separators)                            |
| `totalOwner`  | string | Total price + commission (formatted with thousand separators)                 |
| `distance`    | number | Calculated distance in km (if maxDistance was specified)                      |
| `daysCount`   | number | Total number of days for the care period (including both start and end dates) |
| `careDetails` | object | Calculation details (visitsCount, pricePerVisit)                              |

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
totalOwner = totalPrice + commission
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

### Example 1: Search for Pet Home Care (Cheapest First)

```bash
curl -X POST "http://localhost:3000/api/caregiver-search?sortBy=price&sortOrder=asc" \
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

### Example 2: Search for Caregiver Home Care with Distance (Closest First)

```bash
curl -X POST "http://localhost:3000/api/caregiver-search?sortBy=distance&sortOrder=asc&page=1&limit=5" \
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

### Example 3: Most Expensive First

```bash
curl -X POST "http://localhost:3000/api/caregiver-search?sortBy=price&sortOrder=desc" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "startDate": "2024-08-01",
    "endDate": "2024-08-03",
    "careLocation": "pet_home",
    "petIds": ["507f1f77bcf86cd799439011"],
    "visitsPerDay": 2,
    "userAddressId": "507f1f77bcf86cd799439013"
  }'
```

## Applied Filters

1. **Care Type**: Only caregivers with the enabled option
2. **Pet Types**: Only caregivers who can care for the requested pet types
3. **Price**: Only caregivers within the specified price range
4. **Distance**: Filter by maximum distance (works for any care type)
5. **Sorting**: Results ordered by specified field and order (default: price ascending)

## Important Notes

- Search requires user authentication
- Caregivers must have their `carerConfig` configured with prices
- Distance is calculated using the Haversine formula between coordinates
- Commission is fixed at 6% of total price
- Results include pagination to handle large data volumes
- Start date must be at least tomorrow (not today)
- All prices are formatted with thousand separators for better readability
