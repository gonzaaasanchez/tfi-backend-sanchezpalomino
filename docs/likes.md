# Likes Routes

## Like Management

### POST `/posts/:postId/like`
Give like to a specific post (requires authentication).

**Validations:**
- Valid JWT token required
- Post must exist
- User must not have already liked the post

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `postId`: Post ID

**Response:**
```typescript
{
  success: boolean;
  message: string;
  data: {
    id: string;
    post: string;
    user: string;
    createdAt: string;
  };
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Like agregado exitosamente",
  "data": {
    "id": "507f1f77bcf86cd799439014",
    "post": "507f1f77bcf86cd799439015",
    "user": "507f1f77bcf86cd799439016",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Ya has dado like a este post",
  "data": null
}
```

### DELETE `/posts/:postId/like`
Remove like from a specific post (requires authentication).

**Validations:**
- Valid JWT token required
- Post must exist
- User must have already liked the post

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `postId`: Post ID

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
  "message": "Like removido exitosamente",
  "data": null
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "No has dado like a este post",
  "data": null
}
```

## Permissions

### User Permissions
- `likes.create`: Give likes to posts
- `likes.delete`: Remove likes from posts

### Admin Permissions
- `likes.create`: Give likes to posts
- `likes.delete`: Remove likes from posts

## Notes

- Users can only like a post once (unique constraint)
- Likes automatically increment/decrement the post's `likesCount`
- The `hasLiked` field is included in post responses via aggregation
- All timestamps are in ISO format
- Likes are consumed independently from posts 