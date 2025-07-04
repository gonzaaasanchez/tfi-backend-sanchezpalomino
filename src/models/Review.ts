import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
  reservation: mongoose.Types.ObjectId;
  reviewer: mongoose.Types.ObjectId;
  reviewedUser: mongoose.Types.ObjectId;
  rating: number;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    reservation: {
      type: Schema.Types.ObjectId,
      ref: 'Reservation',
      required: [true, 'La reserva es requerida'],
    },
    reviewer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El revisor es requerido'],
    },
    reviewedUser: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El usuario evaluado es requerido'],
    },
    rating: {
      type: Number,
      required: [true, 'La calificación es requerida'],
      min: [1, 'La calificación mínima es 1'],
      max: [5, 'La calificación máxima es 5'],
    },
    comment: {
      type: String,
      required: false,
      trim: true,
      maxlength: [500, 'El comentario no puede exceder 500 caracteres'],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
reviewSchema.index({ reservation: 1, reviewer: 1 }, { unique: true }); // One review per reservation per reviewer
reviewSchema.index({ reviewedUser: 1 }); // To search reviews of a user
reviewSchema.index({ reviewer: 1 }); // To search reviews made by a user
reviewSchema.index({ createdAt: -1 }); // To sort by date
reviewSchema.index({ rating: 1 }); // For rating filters

// Custom validation to ensure reviewer and reviewedUser are different
reviewSchema.pre('save', function (next) {
  const review = this as any;

  if (review.reviewer.toString() === review.reviewedUser.toString()) {
    return next(new Error('Un usuario no puede evaluarse a sí mismo'));
  }

  next();
});

// Static method to get average rating of a user as caregiver
reviewSchema.statics.getAverageRatingAsCaregiver = async function (userId: string) {
  const result = await this.aggregate([
    { 
      $match: { 
        reviewedUser: new mongoose.Types.ObjectId(userId),
        // Join with reservations to check if the reviewed user was the caregiver
        $lookup: {
          from: 'reservations',
          localField: 'reservation',
          foreignField: '_id',
          as: 'reservationData'
        }
      } 
    },
    {
      $match: {
        'reservationData.caregiver': new mongoose.Types.ObjectId(userId)
      }
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  return result.length > 0
    ? {
        averageRating: Math.round(result[0].averageRating * 10) / 10,
        totalReviews: result[0].totalReviews,
      }
    : { averageRating: 0, totalReviews: 0 };
};

// Static method to get average rating of a user as user (owner)
reviewSchema.statics.getAverageRatingAsUser = async function (userId: string) {
  const result = await this.aggregate([
    { 
      $match: { 
        reviewedUser: new mongoose.Types.ObjectId(userId),
        // Join with reservations to check if the reviewed user was the user (owner)
        $lookup: {
          from: 'reservations',
          localField: 'reservation',
          foreignField: '_id',
          as: 'reservationData'
        }
      } 
    },
    {
      $match: {
        'reservationData.user': new mongoose.Types.ObjectId(userId)
      }
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  return result.length > 0
    ? {
        averageRating: Math.round(result[0].averageRating * 10) / 10,
        totalReviews: result[0].totalReviews,
      }
    : { averageRating: 0, totalReviews: 0 };
};

export default mongoose.model<IReview>('Review', reviewSchema);
