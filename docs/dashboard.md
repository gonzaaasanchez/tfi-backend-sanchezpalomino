# Dashboard Statistics 📊

## General Description

The dashboard provides general statistics and key metrics of the pet care system, allowing administrators to monitor business growth and make informed decisions based on historical data.

## Endpoints

### GET /api/dashboard/stats

Gets all dashboard statistics for visualization in charts and KPIs.

#### Authentication
- **Type**: JWT Token
- **Permissions**: Administrators only (`admin`)

#### Query Parameters (Optional)

| Parameter | Type | Description | Allowed Values | Default |
|-----------|------|-------------|----------------|---------|
| `period` | string | Data period to query | `3m`, `6m`, `12m`, `24m` | `12m` |
| `startDate` | string | Custom start date | ISO format (YYYY-MM-DD) | Automatically calculated |
| `endDate` | string | Custom end date | ISO format (YYYY-MM-DD) | Current date |

#### Request Example

```bash
GET /api/dashboard/stats?period=12m
Authorization: Bearer <jwt_token>
```

#### Successful Response (200)

```json
{
  "success": true,
  "message": "Dashboard data retrieved successfully",
  "data": {
    "stats": {
      "totalUsers": 1247,
      "totalReservations": 856,
      "totalPets": 2134,
      "usersGrowth": 12,
      "reservationsGrowth": 8,
      "petsGrowth": -5
    },
    "petTypes": [
      {
        "name": "Perros",
        "value": 45,
        "color": "#3182CE"
      },
      {
        "name": "Gatos",
        "value": 35,
        "color": "#E53E3E"
      },
      {
        "name": "Peces",
        "value": 18,
        "color": "#38A169"
      },
      {
        "name": "Otros",
        "value": 2,
        "color": "#DD6B20"
      }
    ],
    "newUsers": [
      {
        "month": "Ene",
        "users": 120
      },
      {
        "month": "Feb",
        "users": 150
      }
    ],
    "reservations": [
      {
        "month": "Ene",
        "reservations": 85
      },
      {
        "month": "Feb",
        "reservations": 92
      }
    ],
    "revenue": [
      {
        "category": "Pet Home Care",
        "revenue": 45000,
        "color": "#3182CE"
      },
      {
        "category": "Caregiver Home Care",
        "revenue": 75000,
        "color": "#E53E3E"
      }
    ]
  }
}
```

#### Data Structure

##### Stats (Main KPIs)
- `totalUsers`: Total number of registered users
- `totalReservations`: Total number of reservations (excluding cancelled)
- `totalPets`: Total number of registered pets
- `usersGrowth`: Percentage growth of users vs previous period
- `reservationsGrowth`: Percentage growth of reservations vs previous period
- `petsGrowth`: Percentage growth of pets vs previous period

##### PetTypes (Pet Types Distribution)
- `name`: Pet type name
- `value`: Number of pets of that type
- `color`: Hexadecimal color for the chart

##### NewUsers (New Users by Month)
- `month`: Month abbreviation (Jan, Feb, Mar, etc.)
- `users`: Number of new registered users

##### Reservations (Reservations by Month)
- `month`: Month abbreviation (Jan, Feb, Mar, etc.)
- `reservations`: Number of reservations made

##### Revenue (Revenue by Category)
- `category`: Service category
- `revenue`: Total revenue in the category
- `color`: Hexadecimal color for the chart

#### Error Codes

| Code | Description |
|------|-------------|
| 400 | Invalid period |
| 401 | Unauthorized (invalid or expired token) |
| 403 | Access denied (no administrator permissions) |
| 500 | Internal server error |

#### Error Example

```json
{
  "success": false,
  "message": "Invalid period. Must be: 3m, 6m, 12m, or 24m",
  "data": null
}
```

## Implemented Charts

### 1. Pet Types Distribution (Pie Chart)
- **Purpose**: Show the proportion of each pet type in the system
- **Data**: `petTypes` array
- **Colors**: Predefined for each pet type

### 2. New Users by Month (Bar Chart)
- **Purpose**: Visualize the growth of registered users month by month
- **Data**: `newUsers` array
- **Period**: Configurable (3m, 6m, 12m, 24m)

### 3. Reservations Trend by Month (Line Chart)
- **Purpose**: Show the evolution of reservations over time
- **Data**: `reservations` array
- **Period**: Configurable (3m, 6m, 12m, 24m)

### 4. Revenue by Service Category (Area Chart)
- **Purpose**: Analyze which services generate more revenue
- **Data**: `revenue` array
- **Categories**: Pet Home Care, Caregiver Home Care

## Technical Considerations

### Performance
- Queries are executed in parallel to optimize response time
- MongoDB aggregations are used for efficient calculations
- Cache implementation with 5-10 minute TTL is recommended for data that doesn't change frequently

### Security
- Only users with administrator permissions can access
- Input parameter validation
- Output data sanitization

### Scalability
- Queries are optimized for large data volumes
- Indexes are used in collections to improve performance
- Date filters to reduce the volume of processed data

## Color Palette

### Pet Types
- Dogs: `#3182CE` (Blue)
- Cats: `#E53E3E` (Red)
- Fish: `#38A169` (Green)
- Birds: `#805AD5` (Purple)
- Others: `#DD6B20` (Orange)

### Revenue Categories
- Pet Home Care: `#3182CE` (Blue)
- Caregiver Home Care: `#E53E3E` (Red)
- Others: `#38A169` (Green)

## Implementation Notes

- Growth percentages can be negative (indicating decline)
- Cancelled reservations are excluded from all calculations
- Months are displayed in abbreviated format in Spanish
- Revenue is calculated based on the `totalPrice` field of reservations
- Default period is 12 months if not specified 