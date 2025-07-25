# Comments Routes

## Comment Management

### GET `/posts/:postId/comments`
Get all comments for a specific post (requires authentication).

**Validations:**
- Valid JWT token required
- Post must exist

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `postId`: Post ID

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

**Response:**
```typescript
{
  success: boolean;
  message: string;
  data: {
    items: Array<{
      id: string;
      comment: string;
      author: {
        id: string;
        name: string;
        email: string;
      };
      createdAt: string;
      updatedAt: string;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Comentarios obtenidos exitosamente",
  "data": {
    "items": [
      {
        "id": "507f1f77bcf86cd799439014",
        "comment": "¡Qué linda mascota!",
        "author": {
          "id": "507f1f77bcf86cd799439015",
          "name": "John Doe",
          "email": "john@example.com"
        },
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Post no encontrado",
  "data": null
}
```

### POST `/posts/:postId/comments`
Create a new comment on a specific post (requires authentication).

**Validations:**
- Valid JWT token required
- Post must exist
- Comment is required (1-500 characters)

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `postId`: Post ID

**Request Body:**
```typescript
{
  comment: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  data: {
    id: string;
    comment: string;
    author: {
      id: string;
      name: string;
      email: string;
    };
    createdAt: string;
    updatedAt: string;
  };
}
```

**Example Request:**
```json
{
  "comment": "¡Qué linda mascota! Me encanta la foto."
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Comentario creado exitosamente",
  "data": {
    "id": "507f1f77bcf86cd799439014",
    "comment": "¡Qué linda mascota! Me encanta la foto.",
    "author": {
      "id": "507f1f77bcf86cd799439015",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "El comentario es requerido",
  "data": null
}
```

### DELETE `/comments/:id`
Delete a comment (requires authentication).

**Validations:**
- Valid JWT token required
- User must be the author of the comment OR be an admin
- Comment must exist

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `id`: Comment ID

**Response:**
```typescript
{
  success: boolean;
  message: string;
  data: null;
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Comentario eliminado exitosamente",
  "data": null
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "No tienes permisos para borrar este comentario",
  "data": null
}
```

## Permissions

### User Permissions
- `comments.create`: Create comments on posts
- `comments.getAll`: View comments on posts
- `comments.delete`: Delete own comments

### Admin Permissions
- `comments.create`: Create comments on posts
- `comments.getAll`: View comments on posts
- `comments.delete`: Delete any comment

## Notes

- Comments are ordered by creation date (newest first)
- Users can comment multiple times on the same post
- Users can comment on multiple different posts
- Comments are paginated for performance
- All timestamps are in ISO format
- Comments are not included in post responses (consumed independently)
- Users can only delete their own comments
- Admins can delete any comment 