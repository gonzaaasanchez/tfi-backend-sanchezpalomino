# API Documentation

This directory contains the complete API documentation organized by service modules.

## 📚 Available Documentation

### 📊 [Data Models](./models.md)
- Complete schema documentation
- Example documents
- Model relationships
- Database structure overview

### 🔐 [Authentication](./authentication.md)
- User registration and login
- JWT token management

### 👥 [Users](./users.md)
- User profile management
- Avatar upload and management
- Address management
- Care configuration
- Admin user management

### 🐕 [Pet Types](./pet-types.md)
- Pet type CRUD operations
- Admin management of pet types

### 🏷️ [Pet Characteristics](./pet-characteristics.md)
- Pet characteristic CRUD operations
- Admin management of characteristics

### 🐾 [Pets](./pets.md)
- Pet CRUD operations
- Pet avatar management
- User pet management
- Admin pet services

### 🔍 [Caregiver Search](./caregiver-search.md)
- Search for available caregivers
- Filter by care type, pet types, price, and distance
- Automatic price calculation with commission
- Pagination and sorting

### 📅 [Reservations](./reservations.md)
- Create and manage pet care reservations
- Filter reservations by role (owner/caregiver)
- Accept and cancel reservations
- Admin reservation management
- Status tracking and updates

### ⭐ [Reviews](./reviews.md)
- Create reviews for completed reservations
- Get reviews by reservation or user
- Filter reviews by type (given/received)
- Rating and comment management
- Review statistics and summaries

### 👨‍💼 [Admin Services](./admin.md)
- Role management
- Admin user management
- Audit logs
- System administration

### 📊 [Dashboard Statistics](./dashboard.md)
- System statistics and KPIs
- Pet types distribution charts
- User growth trends
- Reservation analytics
- Revenue by service category
- Configurable time periods

### 🔧 [Configuration](./config.md)
- System configuration management
- Environment settings
- Admin configuration services

### 📧 [Email Services](./emails.md)
- Email notification system
- Template management
- Email delivery services

### 📝 [Posts](./posts.md)
- Social media posts
- Post creation and management
- Feed and timeline services

### 💬 [Comments](./comments.md)
- Post comments management
- Comment moderation
- User interaction services

### 👍 [Likes](./likes.md)
- Post and comment likes
- Like management
- User engagement tracking

### 🔍 [Audit Logs](./audit.md)
- System audit trail
- Change tracking
- Security monitoring

### 📋 [System Logs](./logs.md)
- Application logs
- Error tracking
- System monitoring

### 🎭 [Roles & Permissions](./roles.md)
- Role-based access control
- Permission management
- Security configuration

### 📋 [Data Types](./types.md)
- API data types
- Type definitions
- Schema documentation

## 🔐 Authentication

For protected endpoints, include the header:
```
Authorization: Bearer <token>
```

## 📝 Response Format

All API responses follow this standard format:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data here
  }
}
```

### 📋 List Responses

For endpoints that return lists (with pagination), the data is always structured as:

```json
{
  "success": true,
  "message": "Items retrieved successfully",
  "data": {
    "items": [
      // Array of items
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

**Important:** List data is always returned under the `items` key within the `data` object.

## 🚨 Error Responses

Error responses follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "ERROR_CODE"
}
```

## 📄 Pagination

List endpoints support pagination with these query parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

Pagination response includes:
```json
{
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
``` 