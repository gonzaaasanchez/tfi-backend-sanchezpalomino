import { Router, RequestHandler } from 'express';
import Post from '../models/Post';
import Like from '../models/Like';
import { authMiddleware } from '../middleware/auth';
import { permissionMiddleware } from '../middleware/permissions';
import { logChanges } from '../utils/auditLogger';
import { uploadImage, handleUploadError } from '../middleware/upload';
import { ResponseHelper } from '../utils/response';

const router = Router();

// ========================================
// USER SERVICES
// ========================================

// POST /posts - Create new post
const createPost: RequestHandler = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      ResponseHelper.unauthorized(res);
      return;
    }

    if (!title || !description) {
      ResponseHelper.validationError(
        res,
        'El título y la descripción son requeridos'
      );
      return;
    }

    if (!req.file) {
      ResponseHelper.validationError(res, 'La imagen es requerida');
      return;
    }

    // Prepare post data
    const postData: any = {
      title,
      description,
      image: `/api/posts/${userId}/image`, // Temporary URL, will be updated later
      imageBuffer: req.file.buffer,
      imageContentType: req.file.mimetype,
      author: userId,
    };

    // Create the post
    const post = new Post(postData);
    await post.save();

    // Update image URL with the real post ID
    post.image = `/api/posts/${post._id}/image`;
    await post.save();

    // Populate author for response
    await post.populate('author');

    // Creation log
    const userName = `${req.user.firstName} ${req.user.lastName}`;
    logChanges(
      'Post',
      post._id?.toString() ?? '',
      userId.toString(),
      userName,
      [
        { field: 'title', oldValue: null, newValue: title },
        { field: 'description', oldValue: null, newValue: description },
      ]
    );

    ResponseHelper.success(
      res,
      'Post creado exitosamente',
      {
        id: post._id,
        title: post.title,
        description: post.description,
        image: post.image,
        commentsCount: post.commentsCount,
        author: {
          id: (post.author as any)._id,
          firstName: (post.author as any).firstName,
          lastName: (post.author as any).lastName,
          email: (post.author as any).email,
        },
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      },
      201
    );
  } catch (error) {
    next(error);
  }
};

// GET /posts - Get all posts with pagination and filters
const getAllPosts: RequestHandler = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const userId = req.user?._id;

    // Build filters
    const filters: any = {};

    // Only admins can use search and author filters
    if (req.user?.role?.name === 'superadmin') {
      if (req.query.search) {
        const searchRegex = new RegExp(req.query.search as string, 'i');
        filters.$or = [{ title: searchRegex }, { description: searchRegex }];
      }

      if (req.query.author) {
        filters.author = req.query.author;
      }
    }

    // Get posts with aggregation to include hasLiked field
    const posts = await Post.aggregate([
      { $match: filters },
      {
        $lookup: {
          from: 'users',
          localField: 'author',
          foreignField: '_id',
          as: 'author'
        }
      },
      { $unwind: '$author' },
      {
        $lookup: {
          from: 'likes',
          let: { postId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$post', '$$postId'] },
                    { $eq: ['$user', userId] }
                  ]
                }
              }
            }
          ],
          as: 'userLike'
        }
      },
      {
        $addFields: {
          hasLiked: { $toBool: { $gt: [{ $size: '$userLike' }, 0] } }
        }
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit }
    ]);

    // Get total for pagination
    const totalPosts = await Post.countDocuments(filters);
    const totalPages = Math.ceil(totalPosts / limit);

    ResponseHelper.success(res, 'Posts obtenidos exitosamente', {
      items: posts.map((post) => ({
        id: post._id,
        title: post.title,
        description: post.description,
        image: post.image,
        commentsCount: post.commentsCount,
        likesCount: post.likesCount,
        hasLiked: post.hasLiked,
        author: {
          id: post.author._id,
          firstName: post.author.firstName,
          lastName: post.author.lastName,
          email: post.author.email,
        },
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      })),
      pagination: {
        page,
        limit,
        total: totalPosts,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /posts/:id - Delete own post
const deletePost: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      ResponseHelper.unauthorized(res);
      return;
    }

    const post = await Post.findById(id).populate('author');

    if (!post) {
      ResponseHelper.notFound(res, 'Post no encontrado');
      return;
    }

    // Check if user is the author
    if (post.author.toString() !== userId.toString()) {
      ResponseHelper.forbidden(res, 'No tienes permisos para borrar este post');
      return;
    }

    // Deletion log
    const userName = `${req.user.firstName} ${req.user.lastName}`;
    logChanges('Post', id, userId.toString(), userName, [
      { field: 'deleted', oldValue: null, newValue: 'true' },
    ]);

    await Post.findByIdAndDelete(id);

    ResponseHelper.success(res, 'Post eliminado exitosamente');
  } catch (error) {
    next(error);
  }
};

// GET /posts/:id/image - Get post image
const getPostImage: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id);

    if (!post) {
      ResponseHelper.notFound(res, 'Post no encontrado');
      return;
    }

    if (!post.imageBuffer || !post.imageContentType) {
      ResponseHelper.notFound(res, 'Imagen no encontrada');
      return;
    }

    res.set('Content-Type', post.imageContentType);
    res.send(post.imageBuffer);
  } catch (error) {
    next(error);
  }
};

// ========================================
// ADMIN SERVICES
// ========================================

// GET /posts/admin/:id - Get specific post (admin only)
const getPostAsAdmin: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    const post = await Post.findById(id).populate('author');

    if (!post) {
      ResponseHelper.notFound(res, 'Post no encontrado');
      return;
    }

    // Check if user has liked this post
    const hasLiked = await Like.exists({ post: id, user: userId });

    ResponseHelper.success(res, 'Post obtenido exitosamente', {
      id: post._id,
      title: post.title,
      description: post.description,
      image: post.image,
      commentsCount: post.commentsCount,
      likesCount: post.likesCount,
      hasLiked: !!hasLiked,
      author: {
        id: (post.author as any)._id,
        firstName: (post.author as any).firstName,
        lastName: (post.author as any).lastName,
        email: (post.author as any).email,
      },
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /posts/admin/:id - Delete post (admin only)
const deletePostAsAdmin: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const adminId = req.user?._id;

    if (!adminId) {
      ResponseHelper.unauthorized(res);
      return;
    }

    const post = await Post.findById(id).populate('author');

    if (!post) {
      ResponseHelper.notFound(res, 'Post no encontrado');
      return;
    }

    // Deletion log
    const adminName = `${req.user.firstName} ${req.user.lastName}`;
    logChanges('Post', id, adminId.toString(), adminName, [
      { field: 'deleted', oldValue: null, newValue: 'true' },
    ]);

    await Post.findByIdAndDelete(id);

    ResponseHelper.success(res, 'Post eliminado exitosamente');
  } catch (error) {
    next(error);
  }
};

// ========================================
// ROUTES
// ========================================

// User routes
router.post(
  '/',
  authMiddleware,
  permissionMiddleware('posts', 'create'),
  uploadImage.single('image'),
  handleUploadError,
  createPost
);

router.get(
  '/',
  authMiddleware,
  permissionMiddleware('posts', 'getAll'),
  getAllPosts
);

router.delete(
  '/:id',
  authMiddleware,
  permissionMiddleware('posts', 'delete'),
  deletePost
);

router.get('/:id/image', getPostImage);

// Admin routes

router.get(
  '/admin/:id',
  authMiddleware,
  permissionMiddleware('posts', 'read'),
  getPostAsAdmin
);

router.delete(
  '/admin/:id',
  authMiddleware,
  permissionMiddleware('posts', 'delete'),
  deletePostAsAdmin
);

export default router;
