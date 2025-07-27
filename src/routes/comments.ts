import { Router, RequestHandler } from 'express';
import Comment from '../models/Comment';
import Post from '../models/Post';
import { authMiddleware } from '../middleware/auth';
import { permissionMiddleware } from '../middleware/permissions';
import { logChanges } from '../utils/auditLogger';
import { ResponseHelper } from '../utils/response';

const router = Router();

// ========================================
// COMMENT SERVICES
// ========================================

// GET /posts/:postId/comments - Get all comments for a post
const getPostComments: RequestHandler = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Verify that the post exists
    const post = await Post.findById(postId);
    if (!post) {
      ResponseHelper.notFound(res, 'Post no encontrado');
      return;
    }

    // Get comments with pagination, ordered by creation date (newest first)
    const comments = await Comment.find({ post: postId })
      .populate('author')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Get total for pagination
    const totalComments = await Comment.countDocuments({ post: postId });
    const totalPages = Math.ceil(totalComments / limit);

    ResponseHelper.success(res, 'Comentarios obtenidos exitosamente', {
      items: comments.map((comment) => ({
        id: comment._id,
        comment: comment.comment,
        author: {
          id: (comment.author as any)._id,
          firstName: (comment.author as any).firstName,
          lastName: (comment.author as any).lastName,
          email: (comment.author as any).email,
          avatar: (comment.author as any).avatar,
        },
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
      })),
      pagination: {
        page,
        limit,
        total: totalComments,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /posts/:postId/comments - Create new comment
const createComment: RequestHandler = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { comment } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      ResponseHelper.unauthorized(res);
      return;
    }

    if (!comment) {
      ResponseHelper.validationError(res, 'El comentario es requerido');
      return;
    }

    // Verify that the post exists
    const post = await Post.findById(postId);
    if (!post) {
      ResponseHelper.notFound(res, 'Post no encontrado');
      return;
    }

    // Create the comment
    const newComment = new Comment({
      comment,
      author: userId,
      post: postId,
    });

    await newComment.save();

    // Increment comments count in the post
    await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });

    // Populate author for response
    await newComment.populate('author');

    // Creation log
    const userName = `${req.user.firstName} ${req.user.lastName}`;
    logChanges(
      'Comment',
      newComment._id?.toString() ?? '',
      userId.toString(),
      userName,
      [
        { field: 'comment', oldValue: null, newValue: comment },
        { field: 'post', oldValue: null, newValue: postId },
      ]
    );

    ResponseHelper.success(
      res,
      'Comentario creado exitosamente',
      {
        id: newComment._id,
        comment: newComment.comment,
        author: {
          id: (newComment.author as any)._id,
          firstName: (newComment.author as any).firstName,
          lastName: (newComment.author as any).lastName,
          email: (newComment.author as any).email,
          avatar: (newComment.author as any).avatar,
        },
        createdAt: newComment.createdAt,
        updatedAt: newComment.updatedAt,
      },
      201
    );
  } catch (error) {
    next(error);
  }
};

// DELETE /comments/:id - Delete comment
const deleteComment: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;
    const userRole = req.user?.role?.name;

    if (!userId) {
      ResponseHelper.unauthorized(res);
      return;
    }

    const comment = await Comment.findById(id).populate('author');

    if (!comment) {
      ResponseHelper.notFound(res, 'Comentario no encontrado');
      return;
    }

    // Check if user is the author or admin
    const isAuthor = comment.author.toString() === userId.toString();
    const isAdmin = userRole === 'superadmin';

    if (!isAuthor && !isAdmin) {
      ResponseHelper.forbidden(
        res,
        'No tienes permisos para borrar este comentario'
      );
      return;
    }

    // Deletion log
    const userName = `${req.user.firstName} ${req.user.lastName}`;
    logChanges('Comment', id, userId.toString(), userName, [
      { field: 'deleted', oldValue: null, newValue: 'true' },
    ]);

    await Comment.findByIdAndDelete(id);

    // Decrement comments count in the post
    await Post.findByIdAndUpdate(comment.post, { $inc: { commentsCount: -1 } });

    ResponseHelper.success(res, 'Comentario eliminado exitosamente');
  } catch (error) {
    next(error);
  }
};

// ========================================
// ROUTES
// ========================================

// Get comments for a post
router.get(
  '/posts/:postId/comments',
  authMiddleware,
  permissionMiddleware('comments', 'getAll'),
  getPostComments
);

// Create comment on a post
router.post(
  '/posts/:postId/comments',
  authMiddleware,
  permissionMiddleware('comments', 'create'),
  createComment
);

// Delete comment
router.delete(
  '/:id',
  authMiddleware,
  permissionMiddleware('comments', 'delete'),
  deleteComment
);

export default router; 