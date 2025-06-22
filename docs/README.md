# API Documentation

This directory contains the complete API documentation organized by service modules.

## 📚 Available Documentation

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

### 👨‍💼 [Admin Services](./admin.md)
- Role management
- Admin user management
- Audit logs
- System administration

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