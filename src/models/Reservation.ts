import mongoose, { Document, Schema } from 'mongoose';
import {
  AddressWithoutId,
  CareLocation,
  ReservationStatus,
  CARE_LOCATION,
  RESERVATION_STATUS,
} from '../types';

export interface IReservation extends Document {
  startDate: Date;
  endDate: Date;
  careLocation: CareLocation;
  address: AddressWithoutId;
  user: mongoose.Types.ObjectId;
  caregiver: mongoose.Types.ObjectId;
  pets: mongoose.Types.ObjectId[];
  visitsCount?: number;
  totalPrice: number;
  commission: number;
  totalWithCommission: number;
  distance?: number;
  status: ReservationStatus;
  createdAt: Date;
  updatedAt: Date;
}

const reservationSchema = new Schema<IReservation>(
  {
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    careLocation: {
      type: String,
      enum: Object.values(CARE_LOCATION),
      required: true,
    },
    address: {
      name: {
        type: String,
        required: true,
      },
      fullAddress: {
        type: String,
        required: true,
      },
      floor: {
        type: String,
        required: false,
      },
      apartment: {
        type: String,
        required: false,
      },
      coords: {
        lat: {
          type: Number,
          required: true,
        },
        lon: {
          type: Number,
          required: true,
        },
      },
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    caregiver: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    pets: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Pet',
        required: true,
      },
    ],
    visitsCount: {
      type: Number,
      required: function () {
        return this.careLocation === CARE_LOCATION.PET_HOME;
      },
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    commission: {
      type: Number,
      required: true,
    },
    totalWithCommission: {
      type: Number,
      required: true,
    },
    distance: {
      type: Number,
    },
    status: {
      type: String,
      enum: Object.values(RESERVATION_STATUS),
      default: RESERVATION_STATUS.PENDING,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
reservationSchema.index({ user: 1, createdAt: -1 });
reservationSchema.index({ caregiver: 1, createdAt: -1 });
reservationSchema.index({ status: 1 });
reservationSchema.index({ startDate: 1, endDate: 1 });

export default mongoose.model<IReservation>('Reservation', reservationSchema);
