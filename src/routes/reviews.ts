import { Router, RequestHandler } from 'express';
import mongoose from 'mongoose';
import Review from '../models/Review';
import Reservation from '../models/Reservation';
import User from '../models/User';
import { authMiddleware } from '../middleware/auth';
import { permissionMiddleware } from '../middleware/permissions';
import { ResponseHelper } from '../utils/response';
import { logChanges } from '../utils/audit';
import { RESERVATION_STATUS } from '../types';

const router = Router();

interface CreateReviewRequest {
  rating: number;
  comment?: string;
}

// POST /reservations/:id/reviews - Create review for a specific reservation
const createReview: RequestHandler = async (req, res, next) => {
  try {
    const { id: reservationId } = req.params;
    const { rating, comment }: CreateReviewRequest = req.body;

    // Basic validations
    if (!rating || rating < 1 || rating > 5) {
      ResponseHelper.validationError(
        res,
        'La calificación debe estar entre 1 y 5'
      );
      return;
    }

    // Find reservation and validate it exists
    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
      ResponseHelper.notFound(res, 'Reserva no encontrada');
      return;
    }

    // Validate user has permission to review this reservation
    const isOwner = reservation.user.toString() === req.user?._id?.toString();
    const isCaregiver =
      reservation.caregiver.toString() === req.user?._id?.toString();

    if (!isOwner && !isCaregiver) {
      ResponseHelper.forbidden(
        res,
        'No tienes permisos para crear una reseña de esta reserva'
      );
      return;
    }

    // Validate reservation status is FINISHED
    if (reservation.status !== RESERVATION_STATUS.FINISHED) {
      ResponseHelper.validationError(
        res,
        'Solo se pueden crear reseñas para reservas finalizadas'
      );
      return;
    }

    // Determine reviewer and reviewedUser
    const reviewer = req.user?._id;
    const reviewedUser = isOwner ? reservation.caregiver : reservation.user;

    // Check if review already exists for this user and reservation
    const existingReview = await Review.findOne({
      reservation: reservationId,
      reviewer: reviewer,
    });

    if (existingReview) {
      ResponseHelper.validationError(
        res,
        'Ya has creado una reseña para esta reserva'
      );
      return;
    }

    // Create review
    const review = new Review({
      reservation: reservationId,
      reviewer: reviewer,
      reviewedUser: reviewedUser,
      rating,
      comment,
    });

    await review.save();

    // Log the creation
    await logChanges(
      'Review',
      (review._id as any).toString(),
      req.user?._id?.toString() || '',
      req.user?.firstName || '',
      [
        {
          field: 'rating',
          oldValue: null,
          newValue: rating,
        },
        {
          field: 'comment',
          oldValue: null,
          newValue: comment || '',
        },
      ]
    );

    ResponseHelper.success(res, 'Reseña creada exitosamente', {
      review: {
        id: review._id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /reservations/:id/reviews - Get reviews for a specific reservation
const getReservationReviews: RequestHandler = async (req, res, next) => {
  try {
    const { id: reservationId } = req.params;
    
    // Find reservation and validate it exists
    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
      ResponseHelper.notFound(res, 'Reserva no encontrada');
      return;
    }

    // Validate user has permission to view reviews for this reservation
    const isOwner = reservation.user.toString() === req.user?._id?.toString();
    const isCaregiver =
      reservation.caregiver.toString() === req.user?._id?.toString();
    const isAdmin = req.user?.role?.name === 'admin';

    if (!isOwner && !isCaregiver && !isAdmin) {
      ResponseHelper.forbidden(
        res,
        'No tienes permisos para ver las reseñas de esta reserva'
      );
      return;
    }

    // Get reviews for this reservation
    const reviews = await Review.find({ reservation: reservationId })
      .populate('reviewer', 'firstName lastName email avatar')
      .populate('reviewedUser', 'firstName lastName email avatar')
      .sort({ createdAt: -1 });

    // Check if owner and caregiver have reviewed
    const hasOwnerReview = reviews.some(
      (review) => (review.reviewer as any)._id?.toString() === reservation.user.toString() || review.reviewer.toString() === reservation.user.toString()
    );
    const hasCaregiverReview = reviews.some(
      (review) => (review.reviewer as any)._id?.toString() === reservation.caregiver.toString() || review.reviewer.toString() === reservation.caregiver.toString()
    );

    // Separate reviews by type (owner and caregiver)
    const ownerReview = reviews.find(
      (review) => (review.reviewer as any)._id?.toString() === reservation.user.toString() || review.reviewer.toString() === reservation.user.toString()
    );
    const caregiverReview = reviews.find(
      (review) => (review.reviewer as any)._id?.toString() === reservation.caregiver.toString() || review.reviewer.toString() === reservation.caregiver.toString()
    );

    const formatReview = (review: any) => ({
      id: review._id,
      reviewer: {
        id: (review.reviewer as any)._id,
        firstName: (review.reviewer as any).firstName,
        lastName: (review.reviewer as any).lastName,
        email: (review.reviewer as any).email,
        avatar: (review.reviewer as any).avatar,
      },
      reviewedUser: {
        id: (review.reviewedUser as any)._id,
        firstName: (review.reviewedUser as any).firstName,
        lastName: (review.reviewedUser as any).lastName,
        email: (review.reviewedUser as any).email,
        avatar: (review.reviewedUser as any).avatar,
      },
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
    });

    const combinedReviews = {
      owner: ownerReview ? formatReview(ownerReview) : null,
      caregiver: caregiverReview ? formatReview(caregiverReview) : null,
    };

    ResponseHelper.success(res, 'Reseñas obtenidas exitosamente', {
      reservation: {
        id: reservation._id,
        startDate: reservation.startDate,
        endDate: reservation.endDate,
      },
      reviews: combinedReviews,
      summary: {
        hasOwnerReview,
        hasCaregiverReview,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /users/:id/reviews - Get reviews for a specific user
const getUserReviews: RequestHandler = async (req, res, next) => {
  try {
    const { id: userId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const type = req.query.type as string; // 'given', 'received', or 'all'
    const rating = req.query.rating
      ? parseInt(req.query.rating as string)
      : null;

    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      ResponseHelper.notFound(res, 'Usuario no encontrado');
      return;
    }

    // Validate current user has permission to view these reviews
    const isOwnProfile = userId === req.user?._id?.toString();
    const isAdmin = req.user?.role?.name === 'admin';

    if (!isOwnProfile && !isAdmin) {
      ResponseHelper.forbidden(
        res,
        'No tienes permisos para ver las reseñas de este usuario'
      );
      return;
    }

        // Get all reviews for summary calculation
    const allGivenReviews = await Review.find({ reviewer: userId });
    const allReceivedReviews = await Review.find({ reviewedUser: userId });

    const totalGiven = allGivenReviews.length;
    const totalReceived = allReceivedReviews.length;
    const averageGiven =
      totalGiven > 0
        ? Math.round(
            (allGivenReviews.reduce((sum, review) => sum + review.rating, 0) /
              totalGiven) *
              10
          ) / 10
        : 0;
    const averageReceived =
      totalReceived > 0
        ? Math.round(
            (allReceivedReviews.reduce((sum, review) => sum + review.rating, 0) /
              totalReceived) *
              10
          ) / 10
        : 0;

    // Build filters and get reviews based on type parameter
    let reviews: any[] = [];
    let total = 0;

    if (type === 'given') {
      const filters: any = { reviewer: userId };
      if (rating && rating >= 1 && rating <= 5) {
        filters.rating = rating;
      }
      
      reviews = await Review.find(filters)
        .populate('reservation', 'startDate endDate')
        .populate('reviewer', 'firstName lastName email avatar')
        .populate('reviewedUser', 'firstName lastName email avatar')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
      
      total = await Review.countDocuments(filters);
    } else if (type === 'received') {
      const filters: any = { reviewedUser: userId };
      if (rating && rating >= 1 && rating <= 5) {
        filters.rating = rating;
      }
      
      reviews = await Review.find(filters)
        .populate('reservation', 'startDate endDate')
        .populate('reviewer', 'firstName lastName email avatar')
        .populate('reviewedUser', 'firstName lastName email avatar')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
      
      total = await Review.countDocuments(filters);
    } else {
      // Default: get both given and received reviews
      const givenFilters: any = { reviewer: userId };
      const receivedFilters: any = { reviewedUser: userId };
      
      if (rating && rating >= 1 && rating <= 5) {
        givenFilters.rating = rating;
        receivedFilters.rating = rating;
      }

      const [givenReviews, receivedReviews] = await Promise.all([
        Review.find(givenFilters)
          .populate('reservation', 'startDate endDate')
          .populate('reviewer', 'firstName lastName email avatar')
          .populate('reviewedUser', 'firstName lastName email avatar')
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit),
        Review.find(receivedFilters)
          .populate('reservation', 'startDate endDate')
          .populate('reviewer', 'firstName lastName email avatar')
          .populate('reviewedUser', 'firstName lastName email avatar')
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
      ]);

      reviews = [...givenReviews, ...receivedReviews].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      total = await Review.countDocuments({
        $or: [{ reviewer: userId }, { reviewedUser: userId }]
      });
    }

    const formatReview = (review: any) => ({
      id: review._id,
      reservation: {
        id: (review.reservation as any)._id,
        startDate: (review.reservation as any).startDate,
        endDate: (review.reservation as any).endDate,
      },
      reviewer: {
        id: (review.reviewer as any)._id,
        firstName: (review.reviewer as any).firstName,
        lastName: (review.reviewer as any).lastName,
        email: (review.reviewer as any).email,
        avatar: (review.reviewer as any).avatar,
      },
      reviewedUser: {
        id: (review.reviewedUser as any)._id,
        firstName: (review.reviewedUser as any).firstName,
        lastName: (review.reviewedUser as any).lastName,
        email: (review.reviewedUser as any).email,
        avatar: (review.reviewedUser as any).avatar,
      },
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
    });

    // Separate reviews by type for response
    const formattedReviews = reviews.map(formatReview);
    const givenReviews = formattedReviews.filter(
      (review) => review.reviewer.id === userId
    );
    const receivedReviews = formattedReviews.filter(
      (review) => review.reviewedUser.id === userId
    );

    // Build response based on type
    const responseData: any = {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      summary: {
        totalGiven,
        totalReceived,
        averageGiven,
        averageReceived,
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    };

    if (type === 'given') {
      responseData.reviews = { given: givenReviews };
    } else if (type === 'received') {
      responseData.reviews = { received: receivedReviews };
    } else {
      // Default: show both
      responseData.reviews = { given: givenReviews, received: receivedReviews };
    }

    ResponseHelper.success(res, 'Reseñas obtenidas exitosamente', responseData);
  } catch (error) {
    next(error);
  }
};

// ========================================
// ROUTES
// ========================================

// User routes
router.post(
  '/reservations/:id/reviews',
  authMiddleware,
  permissionMiddleware('reviews', 'create'),
  createReview
);

router.get(
  '/reservations/:id/reviews',
  authMiddleware,
  permissionMiddleware('reviews', 'read'),
  getReservationReviews
);

router.get(
  '/users/:id/reviews',
  authMiddleware,
  permissionMiddleware('reviews', 'read'),
  getUserReviews
);

export default router;
