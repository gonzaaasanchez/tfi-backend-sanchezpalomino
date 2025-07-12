# Posts Routes

## Post Management

### POST `/posts`
Create a new post (requires authentication).

**Validations:**
- Valid JWT token required
- Title is required (3-100 characters)
- Description is required (10-1000 characters)
- Image file is required

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body (multipart/form-data):**
```typescript
{
  title: string;
  description: string;
  imageFile: File;
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  data: {
    id: string;
    title: string;
    description: string;
    image: string;
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
  "title": "Mi mascota feliz",
  "description": "Compartiendo un momento especial con mi mascota en el parque"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Post creado exitosamente",
  "data": {
    "id": "507f1f77bcf86cd799439014",
    "title": "Mi mascota feliz",
    "description": "Compartiendo un momento especial con mi mascota en el parque",
    "image": "/api/posts/507f1f77bcf86cd799439014/image",
    "commentsCount": 0,
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
  "message": "El título y la descripción son requeridos",
  "data": null
}
```

### GET `/posts`
Get all posts with pagination (requires authentication).

**Validations:**
- Valid JWT token required

**Headers:**
```
Authorization: Bearer <token>
```

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
      title: string;
      description: string;
      image: string;
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
  "message": "Feed obtenido exitosamente",
  "data": {
    "items": [
      {
        "id": "507f1f77bcf86cd799439014",
        "title": "Mi mascota feliz",
        "description": "Compartiendo un momento especial con mi mascota en el parque",
        "image": "/api/posts/507f1f77bcf86cd799439014/image",
        "commentsCount": 5,
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

### DELETE `/posts/:id`
Delete own post (requires authentication).

**Validations:**
- Valid JWT token required
- User must be the author of the post

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `id`: Post ID

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
  "message": "Post eliminado exitosamente",
  "data": null
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "No tienes permisos para borrar este post",
  "data": null
}
```

### GET `/posts/:id/image`
Get post image (public endpoint).

**Path Parameters:**
- `id`: Post ID

**Response:**
- Image file with appropriate Content-Type header

**Error Response:**
```json
{
  "success": false,
  "message": "Imagen no encontrada",
  "data": null
}
```

## Admin Services

### GET `/posts/admin`
Get all posts with pagination and filters (admin only).

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
- `search`: Search by title or description (admin only)
- `author`: Filter by author ID (admin only)

**Response:**
```typescript
{
  success: boolean;
  message: string;
  data: {
    items: Array<{
      id: string;
      title: string;
      description: string;
      image: string;
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
  "message": "Posts obtenidos exitosamente",
  "data": {
    "items": [
      {
        "id": "507f1f77bcf86cd799439014",
        "title": "Mi mascota feliz",
        "description": "Compartiendo un momento especial con mi mascota en el parque",
        "image": "/api/posts/507f1f77bcf86cd799439014/image",
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

### GET `/posts/admin/:id`
Get specific post (admin only).

**Validations:**
- Valid JWT token required
- Admin permissions required

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `id`: Post ID

**Response:**
```typescript
{
  success: boolean;
  message: string;
  data: {
    id: string;
    title: string;
    description: string;
    image: string;
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

**Success Response:**
```json
{
  "success": true,
  "message": "Post obtenido exitosamente",
  "data": {
    "id": "507f1f77bcf86cd799439014",
    "title": "Mi mascota feliz",
    "description": "Compartiendo un momento especial con mi mascota en el parque",
    "image": "/api/posts/507f1f77bcf86cd799439014/image",
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

### DELETE `/posts/admin/:id`
Delete post (admin only).

**Validations:**
- Valid JWT token required
- Admin permissions required

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `id`: Post ID

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
  "message": "Post eliminado exitosamente",
  "data": null
}
```

## Permissions

### User Permissions
- `posts.create`: Create new posts
- `posts.read`: Access feed
- `posts.delete`: Delete own posts

### Admin Permissions
- `posts.read`: Access feed and view individual posts
- `posts.delete`: Delete any post
- `posts.getAll`: Access admin list with filters

## Notes

- Posts are ordered by creation date (newest first)
- Images are stored as buffers in the database
- Users can only delete their own posts
- Admins can delete any post
- No edit functionality is currently available
- Feed is paginated for performance
- All timestamps are in ISO format 