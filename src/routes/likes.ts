import { Router, RequestHandler } from 'express';
import Like from '../models/Like';
import Post from '../models/Post';
import { authMiddleware } from '../middleware/auth';
import { permissionMiddleware } from '../middleware/permissions';
import { logChanges } from '../utils/auditLogger';
import { ResponseHelper } from '../utils/response';

const router = Router();

// ========================================
// LIKE SERVICES
// ========================================

// POST /posts/:postId/like - Give like to a post
const giveLike: RequestHandler = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      ResponseHelper.unauthorized(res);
      return;
    }

    // Verify that the post exists
    const post = await Post.findById(postId);
    if (!post) {
      ResponseHelper.notFound(res, 'Post no encontrado');
      return;
    }

    // Check if user already liked the post
    const existingLike = await Like.findOne({ user: userId, post: postId });
    if (existingLike) {
      ResponseHelper.validationError(res, 'Ya has dado like a este post');
      return;
    }

    // Create the like
    const newLike = new Like({
      user: userId,
      post: postId,
    });

    await newLike.save();

    // Increment likes count in the post
    await Post.findByIdAndUpdate(postId, { $inc: { likesCount: 1 } });

    // Creation log
    const userName = `${req.user.firstName} ${req.user.lastName}`;
    logChanges('Like', newLike._id?.toString() ?? '', userId.toString(), userName, [
      { field: 'post', oldValue: null, newValue: postId },
    ]);

    ResponseHelper.success(res, 'Like agregado exitosamente', {
      id: newLike._id,
      post: postId,
      user: userId,
      createdAt: newLike.createdAt,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /posts/:postId/like - Remove like from a post
const removeLike: RequestHandler = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      ResponseHelper.unauthorized(res);
      return;
    }

    // Verify that the post exists
    const post = await Post.findById(postId);
    if (!post) {
      ResponseHelper.notFound(res, 'Post no encontrado');
      return;
    }

    // Find and delete the like
    const like = await Like.findOneAndDelete({ user: userId, post: postId });
    if (!like) {
      ResponseHelper.notFound(res, 'No has dado like a este post');
      return;
    }

    // Decrement likes count in the post
    await Post.findByIdAndUpdate(postId, { $inc: { likesCount: -1 } });

    // Deletion log
    const userName = `${req.user.firstName} ${req.user.lastName}`;
    logChanges('Like', like._id?.toString() ?? '', userId.toString(), userName, [
      { field: 'deleted', oldValue: null, newValue: 'true' },
    ]);

    ResponseHelper.success(res, 'Like removido exitosamente');
  } catch (error) {
    next(error);
  }
};

// ========================================
// ROUTES
// ========================================

// Give like to a post
router.post(
  '/posts/:postId/like',
  authMiddleware,
  permissionMiddleware('likes', 'create'),
  giveLike
);

// Remove like from a post
router.delete(
  '/posts/:postId/like',
  authMiddleware,
  permissionMiddleware('likes', 'delete'),
  removeLike
);

export default router; 