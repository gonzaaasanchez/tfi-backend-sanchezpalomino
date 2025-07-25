import { Router, RequestHandler } from 'express';
import Reservation, { IReservation } from '../models/Reservation';
import User from '../models/User';
import Pet from '../models/Pet';
import { authMiddleware } from '../middleware/auth';
import { permissionMiddleware } from '../middleware/permissions';
import { ResponseHelper } from '../utils/response';
import { logChanges } from '../utils/auditLogger';
import { formatCurrency, calculateDaysDifference } from '../utils/common';
import { addAverageReviewsToUser } from '../utils/userHelpers';
import {
  AddressWithId,
  CareLocation,
  ReservationStatus,
  CARE_LOCATION,
  RESERVATION_STATUS,
} from '../types';

const router = Router();

interface CreateReservationRequest {
  startDate: string;
  endDate: string;
  careLocation: CareLocation;
  caregiverId: string;
  petIds: string[];
  visitsPerDay?: number;
  userAddressId?: string;
  caregiverAddressId?: string;
  distance?: number; // Distancia en km (opcional, viene del frontend)
}

interface CancelReservationRequest {
  reason?: string;
}

// POST /reservations - Create a new reservation
const createReservation: RequestHandler = async (req, res, next) => {
  try {
    const {
      startDate,
      endDate,
      careLocation,
      caregiverId,
      petIds,
      visitsPerDay,
      userAddressId,
      caregiverAddressId,
      distance,
    }: CreateReservationRequest = req.body;

    // Basic validations
    if (
      !startDate ||
      !endDate ||
      !careLocation ||
      !caregiverId ||
      !petIds ||
      petIds.length === 0
    ) {
      ResponseHelper.validationError(res, 'Faltan parámetros requeridos');
      return;
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    const startStr = start.toISOString().split('T')[0];

    if (startStr < tomorrowStr) {
      ResponseHelper.validationError(
        res,
        'La fecha de inicio debe ser al menos mañana'
      );
      return;
    }

    if (end < start) {
      ResponseHelper.validationError(
        res,
        'La fecha de fin debe ser posterior a la fecha de inicio'
      );
      return;
    }

    // Validate care location specific requirements
    if (careLocation === CARE_LOCATION.PET_HOME) {
      if (!visitsPerDay || visitsPerDay <= 0) {
        ResponseHelper.validationError(
          res,
          'La cantidad de visitas por día es requerida para cuidado en hogar de la mascota'
        );
        return;
      }
      if (!userAddressId) {
        ResponseHelper.validationError(
          res,
          'El ID de la dirección del usuario es requerido para cuidado en hogar de la mascota'
        );
        return;
      }
    } else {
      if (!caregiverAddressId) {
        ResponseHelper.validationError(
          res,
          'El ID de la dirección del cuidador es requerido para cuidado en hogar del cuidador'
        );
        return;
      }
    }

    // Check if caregiver exists and has proper configuration
    const caregiver = await User.findById(caregiverId);
    if (!caregiver) {
      ResponseHelper.notFound(res, 'Cuidador no encontrado');
      return;
    }

    if (!caregiver.carerConfig) {
      ResponseHelper.validationError(
        res,
        'El cuidador no tiene configuración de cuidado'
      );
      return;
    }

    // Validate care type is enabled
    if (
      careLocation === CARE_LOCATION.PET_HOME &&
      !caregiver.carerConfig.petHomeCare?.enabled
    ) {
      ResponseHelper.validationError(
        res,
        'El cuidador no ofrece cuidado en hogar de la mascota'
      );
      return;
    }

    if (
      careLocation === CARE_LOCATION.CAREGIVER_HOME &&
      !caregiver.carerConfig.homeCare?.enabled
    ) {
      ResponseHelper.validationError(
        res,
        'El cuidador no ofrece cuidado en su hogar'
      );
      return;
    }

    // Validate pets exist and belong to user
    const pets = await Pet.find({ _id: { $in: petIds }, owner: req.user?._id });
    if (pets.length !== petIds.length) {
      ResponseHelper.validationError(
        res,
        'Algunas mascotas no existen o no pertenecen al usuario'
      );
      return;
    }

    // Check if caregiver can care for these pet types
    const petTypeIds = pets.map((pet) => pet.petType.toString());
    const caregiverPetTypes =
      caregiver.carerConfig.petTypes?.map((pt) => pt.toString()) || [];
    const canCareForAll = petTypeIds.every((ptId) =>
      caregiverPetTypes.includes(ptId)
    );

    if (!canCareForAll) {
      ResponseHelper.validationError(
        res,
        'El cuidador no puede cuidar todos los tipos de mascotas solicitados'
      );
      return;
    }

    // Get addresses
    const user = await User.findById(req.user?._id);
    const userAddress = user?.addresses?.find(
      (addr) => (addr as AddressWithId)._id?.toString() === userAddressId
    ) as AddressWithId | undefined;
    const caregiverAddress = caregiver.addresses?.find(
      (addr) => (addr as AddressWithId)._id?.toString() === caregiverAddressId
    ) as AddressWithId | undefined;

    // Prepare address
    let address: AddressWithId | undefined;
    if (careLocation === CARE_LOCATION.PET_HOME && userAddress) {
      address = userAddress;
    } else if (
      careLocation === CARE_LOCATION.CAREGIVER_HOME &&
      caregiverAddress
    ) {
      address = caregiverAddress;
    }

    if (!address) {
      ResponseHelper.validationError(
        res,
        'No se pudo obtener la dirección requerida'
      );
      return;
    }

    // Calculate prices
    const daysCount = calculateDaysDifference(startDate, endDate);
    let totalPrice = 0;
    let visitsCount: number | undefined;

    if (careLocation === CARE_LOCATION.PET_HOME) {
      const pricePerVisit = caregiver.carerConfig.petHomeCare?.visitPrice;
      if (!pricePerVisit) {
        ResponseHelper.validationError(
          res,
          'El cuidador no tiene precio configurado para visitas'
        );
        return;
      }
      visitsCount = (visitsPerDay as number) * daysCount;
      totalPrice = pricePerVisit * visitsCount;
    } else {
      const pricePerDay = caregiver.carerConfig.homeCare?.dayPrice;
      if (!pricePerDay) {
        ResponseHelper.validationError(
          res,
          'El cuidador no tiene precio configurado por día'
        );
        return;
      }
      totalPrice = pricePerDay * daysCount;
    }

    const commission = totalPrice * 0.06;
    const totalOwner = totalPrice + commission;
    const totalCaregiver = totalPrice - commission;

    // Create reservation
    const reservation = new Reservation({
      startDate,
      endDate,
      careLocation,
      address,
      user: req.user?._id,
      caregiver: caregiverId,
      pets: petIds,
      visitsCount,
      totalPrice,
      commission,
      totalOwner,
      totalCaregiver,
      distance,
      status: RESERVATION_STATUS.PENDING,
    });

    await reservation.save();

    // Log the creation
    await logChanges(
      'Reservation',
      (reservation._id as any).toString(),
      req.user?._id?.toString() || '',
      req.user?.firstName || '',
      [
        {
          field: 'status',
          oldValue: null,
          newValue: RESERVATION_STATUS.PENDING,
        },
        { field: 'careLocation', oldValue: null, newValue: careLocation },
        { field: 'totalPrice', oldValue: null, newValue: totalPrice },
      ]
    );

    ResponseHelper.success(res, 'Reserva creada exitosamente', {
      reservation: {
        id: reservation._id,
        startDate: reservation.startDate,
        endDate: reservation.endDate,
        careLocation: reservation.careLocation,
        totalPrice: formatCurrency(reservation.totalPrice),
        commission: formatCurrency(reservation.commission),
        totalOwner: formatCurrency(reservation.totalOwner),
        distance: reservation.distance,
        status: reservation.status,
        createdAt: reservation.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /reservations - Get user's reservations (paginated)
const getUserReservations: RequestHandler = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    const role = req.query.role as string; // 'owner', 'caregiver', or 'all'

    const filters: any = {};

    // Filter by role
    if (role === 'owner') {
      filters.user = req.user?._id;
    } else if (role === 'caregiver') {
      filters.caregiver = req.user?._id;
    } else {
      // Default: show both owner and caregiver reservations
      filters.$or = [{ user: req.user?._id }, { caregiver: req.user?._id }];
    }

    if (status) {
      filters.status = status;
    }

    const reservations = await Reservation.find(filters)
      .populate('user', 'firstName lastName email avatar phoneNumber')
      .populate('caregiver', 'firstName lastName email avatar phoneNumber')
      .populate({
        path: 'pets',
        select: 'name petType characteristics comment avatar',
        populate: [
          {
            path: 'petType',
            select: 'name',
          },
          {
            path: 'characteristics.characteristic',
            select: 'name',
          },
        ],
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Reservation.countDocuments(filters);

    const formattedReservations = await Promise.all(
      reservations.map(async (reservation) => {
        // Determine if current user is owner or caregiver
        const isOwner =
          reservation.user._id.toString() === req.user?._id?.toString();
        const isCaregiver =
          reservation.caregiver._id.toString() === req.user?._id?.toString();

        // Calculate the appropriate total based on user role
        let totalField = {};
        if (isOwner) {
          totalField = { totalOwner: formatCurrency(reservation.totalOwner) };
        } else if (isCaregiver) {
          totalField = {
            totalCaregiver: formatCurrency(reservation.totalCaregiver),
          };
        } else {
          // For admin or other cases, show both
          totalField = {
            totalOwner: formatCurrency(reservation.totalOwner),
            totalCaregiver: formatCurrency(reservation.totalCaregiver),
          };
        }

        // Prepare user and caregiver data
        const userData = {
          id: (reservation.user as any)._id,
          firstName: (reservation.user as any).firstName,
          lastName: (reservation.user as any).lastName,
          email: (reservation.user as any).email,
          avatar: (reservation.user as any).avatar,
          phoneNumber: (reservation.user as any).phoneNumber,
        };

        const caregiverData = {
          id: (reservation.caregiver as any)._id,
          firstName: (reservation.caregiver as any).firstName,
          lastName: (reservation.caregiver as any).lastName,
          email: (reservation.caregiver as any).email,
          avatar: (reservation.caregiver as any).avatar,
          phoneNumber: (reservation.caregiver as any).phoneNumber,
        };

        // Add average reviews to users
        const userWithReviews = await addAverageReviewsToUser(userData);
        const caregiverWithReviews =
          await addAverageReviewsToUser(caregiverData);

        return {
          id: reservation._id,
          startDate: reservation.startDate,
          endDate: reservation.endDate,
          careLocation: reservation.careLocation,
          address: reservation.address,
          user: userWithReviews,
          caregiver: caregiverWithReviews,
          pets: reservation.pets.map((pet: any) => ({
            id: pet._id,
            name: pet.name,
            petType: pet.petType,
            characteristics: pet.characteristics.map((char: any) => ({
              id: char.characteristic._id,
              name: char.characteristic.name,
              value: char.value,
            })),
            comment: pet.comment,
            avatar: pet.avatar,
          })),
          visitsCount: reservation.visitsCount,
          totalPrice: formatCurrency(reservation.totalPrice),
          commission: formatCurrency(reservation.commission),
          ...totalField,
          distance: reservation.distance,
          status: reservation.status,
          createdAt: reservation.createdAt,
          updatedAt: reservation.updatedAt,
        };
      })
    );

    ResponseHelper.success(res, 'Reservas obtenidas exitosamente', {
      items: formattedReservations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /reservations/:id - Get a specific reservation
const getReservation: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;

    const reservation = await Reservation.findById(id)
      .populate('user', 'firstName lastName email avatar phoneNumber')
      .populate('caregiver', 'firstName lastName email avatar phoneNumber')
      .populate({
        path: 'pets',
        select: 'name petType characteristics comment avatar',
        populate: [
          {
            path: 'petType',
            select: 'name',
          },
          {
            path: 'characteristics.characteristic',
            select: 'name',
          },
        ],
      });

    if (!reservation) {
      ResponseHelper.notFound(res, 'Reserva no encontrada');
      return;
    }

    // Check if user has access to this reservation
    const isOwner =
      reservation.user._id.toString() === req.user?._id?.toString();
    const isCaregiver =
      reservation.caregiver._id.toString() === req.user?._id?.toString();
    const isAdmin = req.user?.role?.name === 'superadmin';

    if (!isOwner && !isCaregiver && !isAdmin) {
      ResponseHelper.forbidden(res, 'No tienes permisos para ver esta reserva');
      return;
    }

    // Calculate the appropriate total based on user role
    let totalField = {};
    if (isOwner) {
      totalField = { totalOwner: formatCurrency(reservation.totalOwner) };
    } else if (isCaregiver) {
      totalField = {
        totalCaregiver: formatCurrency(reservation.totalCaregiver),
      };
    } else {
      // For admin, show both
      totalField = {
        totalOwner: formatCurrency(reservation.totalOwner),
        totalCaregiver: formatCurrency(reservation.totalCaregiver),
      };
    }

    // Prepare user and caregiver data
    const userData = {
      id: (reservation.user as any)._id,
      firstName: (reservation.user as any).firstName,
      lastName: (reservation.user as any).lastName,
      email: (reservation.user as any).email,
      phoneNumber: (reservation.user as any).phoneNumber,
    };

    const caregiverData = {
      id: (reservation.caregiver as any)._id,
      firstName: (reservation.caregiver as any).firstName,
      lastName: (reservation.caregiver as any).lastName,
      email: (reservation.caregiver as any).email,
      phoneNumber: (reservation.caregiver as any).phoneNumber,
    };

    // Add average reviews to users
    const userWithReviews = await addAverageReviewsToUser(userData);
    const caregiverWithReviews = await addAverageReviewsToUser(caregiverData);

    ResponseHelper.success(res, 'Reserva obtenida exitosamente', {
      reservation: {
        id: reservation._id,
        startDate: reservation.startDate,
        endDate: reservation.endDate,
        careLocation: reservation.careLocation,
        address: reservation.address,
        user: userWithReviews,
        caregiver: caregiverWithReviews,
        pets: reservation.pets.map((pet: any) => ({
          id: pet._id,
          name: pet.name,
          petType: pet.petType,
          characteristics: pet.characteristics.map((char: any) => ({
            id: char.characteristic._id,
            name: char.characteristic.name,
            value: char.value,
          })),
          comment: pet.comment,
          avatar: pet.avatar,
        })),
        visitsCount: reservation.visitsCount,
        totalPrice: formatCurrency(reservation.totalPrice),
        commission: formatCurrency(reservation.commission),
        ...totalField,
        distance: reservation.distance,
        status: reservation.status,
        createdAt: reservation.createdAt,
        updatedAt: reservation.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// PUT /reservations/:id/accept - Accept reservation
const acceptReservation: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;

    const reservation = await Reservation.findById(id);
    if (!reservation) {
      ResponseHelper.notFound(res, 'Reserva no encontrada');
      return;
    }

    // Check if user is the caregiver
    if (reservation.caregiver.toString() !== req.user?._id?.toString()) {
      ResponseHelper.forbidden(
        res,
        'Solo el cuidador puede aceptar esta reserva'
      );
      return;
    }

    // Check if reservation is pending
    if (reservation.status !== RESERVATION_STATUS.PENDING) {
      ResponseHelper.validationError(
        res,
        'Solo se pueden aceptar reservas pendientes'
      );
      return;
    }

    // Update status
    reservation.status = RESERVATION_STATUS.CONFIRMED;
    await reservation.save();

    // Log the change
    await logChanges(
      'Reservation',
      (reservation._id as any).toString(),
      req.user?._id?.toString() || '',
      req.user?.firstName || '',
      [
        {
          field: 'status',
          oldValue: RESERVATION_STATUS.PENDING,
          newValue: RESERVATION_STATUS.CONFIRMED,
        },
      ]
    );

    ResponseHelper.success(res, 'Reserva aceptada exitosamente', {
      reservation: {
        id: reservation._id,
        status: reservation.status,
        updatedAt: reservation.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// PUT /reservations/:id/reject - Reject reservation
const rejectReservation: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason }: CancelReservationRequest = req.body;

    const reservation = await Reservation.findById(id);
    if (!reservation) {
      ResponseHelper.notFound(res, 'Reserva no encontrada');
      return;
    }

    // Check if user is the caregiver
    if (reservation.caregiver.toString() !== req.user?._id?.toString()) {
      ResponseHelper.forbidden(
        res,
        'Solo el cuidador puede rechazar esta reserva'
      );
      return;
    }

    // Check if reservation is pending
    if (reservation.status !== RESERVATION_STATUS.PENDING) {
      ResponseHelper.validationError(
        res,
        'Solo se pueden rechazar reservas pendientes'
      );
      return;
    }

    // Update status
    const previousStatus = reservation.status;
    reservation.status = RESERVATION_STATUS.REJECTED;
    await reservation.save();

    // Log the change
    await logChanges(
      'Reservation',
      (reservation._id as any).toString(),
      req.user?._id?.toString() || '',
      req.user?.firstName || '',
      [
        {
          field: 'status',
          oldValue: previousStatus,
          newValue: RESERVATION_STATUS.REJECTED,
        },
      ]
    );

    ResponseHelper.success(res, 'Reserva rechazada exitosamente', {
      reservation: {
        id: reservation._id,
        status: reservation.status,
        updatedAt: reservation.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// PUT /reservations/:id/cancel - Cancel reservation (unified)
const cancelReservation: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason }: CancelReservationRequest = req.body;

    const reservation = await Reservation.findById(id);
    if (!reservation) {
      ResponseHelper.notFound(res, 'Reserva no encontrada');
      return;
    }

    // Check if user has permission to cancel
    const isOwner = reservation.user.toString() === req.user?._id?.toString();
    const isCaregiver =
      reservation.caregiver.toString() === req.user?._id?.toString();
    const isAdmin = req.user?.role?.name === 'admin';

    if (!isOwner && !isCaregiver && !isAdmin) {
      ResponseHelper.forbidden(
        res,
        'No tienes permisos para cancelar esta reserva'
      );
      return;
    }

    // Check if reservation can be cancelled
    const finishedStatuses: ReservationStatus[] = [
      RESERVATION_STATUS.FINISHED,
      RESERVATION_STATUS.CANCELLED_OWNER,
      RESERVATION_STATUS.CANCELLED_CAREGIVER,
    ];
    if (finishedStatuses.includes(reservation.status)) {
      ResponseHelper.validationError(
        res,
        'No se puede cancelar una reserva que ya está finalizada o cancelada'
      );
      return;
    }

    // Determine cancellation status based on who cancels
    let newStatus: ReservationStatus;
    if (isOwner) {
      newStatus = RESERVATION_STATUS.CANCELLED_OWNER;
    } else if (isCaregiver) {
      newStatus = RESERVATION_STATUS.CANCELLED_CAREGIVER;
    } else {
      // Admin cancellation - default to owner cancellation
      newStatus = RESERVATION_STATUS.CANCELLED_OWNER;
    }

    const previousStatus = reservation.status;
    reservation.status = newStatus;
    await reservation.save();

    // Log the change
    await logChanges(
      'Reservation',
      (reservation._id as any).toString(),
      req.user?._id?.toString() || '',
      req.user?.firstName || '',
      [{ field: 'status', oldValue: previousStatus, newValue: newStatus }]
    );

    ResponseHelper.success(res, 'Reserva cancelada exitosamente', {
      reservation: {
        id: reservation._id,
        status: reservation.status,
        updatedAt: reservation.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ========================================
// ADMIN ROUTES
// ========================================

// GET /reservations/admin/all - Admin: Get all reservations (paginated)
const getAllReservations: RequestHandler = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    const userId = req.query.userId as string;
    const caregiverId = req.query.caregiverId as string;

    const filters: any = {};

    if (status) {
      filters.status = status;
    }

    if (userId) {
      filters.user = userId;
    }

    if (caregiverId) {
      filters.caregiver = caregiverId;
    }

    const reservations = await Reservation.find(filters)
      .populate('user', 'firstName lastName email avatar phoneNumber')
      .populate('caregiver', 'firstName lastName email avatar phoneNumber')
      .populate({
        path: 'pets',
        select: 'name petType characteristics comment avatar',
        populate: [
          {
            path: 'petType',
            select: 'name',
          },
          {
            path: 'characteristics.characteristic',
            select: 'name',
          },
        ],
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Reservation.countDocuments(filters);

    const formattedReservations = reservations.map((reservation) => ({
      id: reservation._id,
      startDate: reservation.startDate,
      endDate: reservation.endDate,
      careLocation: reservation.careLocation,
      address: reservation.address,
      user: {
        id: (reservation.user as any)._id,
        firstName: (reservation.user as any).firstName,
        lastName: (reservation.user as any).lastName,
        email: (reservation.user as any).email,
        avatar: (reservation.user as any).avatar,
        phoneNumber: (reservation.user as any).phoneNumber,
      },
      caregiver: {
        id: (reservation.caregiver as any)._id,
        firstName: (reservation.caregiver as any).firstName,
        lastName: (reservation.caregiver as any).lastName,
        email: (reservation.caregiver as any).email,
        avatar: (reservation.caregiver as any).avatar,
        phoneNumber: (reservation.caregiver as any).phoneNumber,
      },
      pets: reservation.pets.map((pet: any) => ({
        id: pet._id,
        name: pet.name,
        petType: pet.petType,
        characteristics: pet.characteristics.map((char: any) => ({
          id: char.characteristic._id,
          name: char.characteristic.name,
          value: char.value,
        })),
        comment: pet.comment,
        avatar: pet.avatar,
      })),
      visitsCount: reservation.visitsCount,
      totalPrice: formatCurrency(reservation.totalPrice),
      commission: formatCurrency(reservation.commission),
      totalOwner: formatCurrency(reservation.totalOwner),
      totalCaregiver: formatCurrency(reservation.totalCaregiver),
      distance: reservation.distance,
      status: reservation.status,
      createdAt: reservation.createdAt,
      updatedAt: reservation.updatedAt,
    }));

    ResponseHelper.success(res, 'Reservas obtenidas exitosamente', {
      items: formattedReservations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /reservations/admin/:id - Admin: Get a specific reservation
const getReservationAdmin: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;

    const reservation = await Reservation.findById(id)
      .populate('user', 'firstName lastName email phoneNumber')
      .populate('caregiver', 'firstName lastName email phoneNumber')
      .populate({
        path: 'pets',
        select: 'name petType characteristics comment avatar',
        populate: [
          {
            path: 'petType',
            select: 'name',
          },
          {
            path: 'characteristics.characteristic',
            select: 'name',
          },
        ],
      });

    if (!reservation) {
      ResponseHelper.notFound(res, 'Reserva no encontrada');
      return;
    }

    ResponseHelper.success(res, 'Reserva obtenida exitosamente', {
      reservation: {
        id: reservation._id,
        startDate: reservation.startDate,
        endDate: reservation.endDate,
        careLocation: reservation.careLocation,
        address: reservation.address,
        user: {
          id: (reservation.user as any)._id,
          firstName: (reservation.user as any).firstName,
          lastName: (reservation.user as any).lastName,
          email: (reservation.user as any).email,
          phoneNumber: (reservation.user as any).phoneNumber,
        },
        caregiver: {
          id: (reservation.caregiver as any)._id,
          firstName: (reservation.caregiver as any).firstName,
          lastName: (reservation.caregiver as any).lastName,
          email: (reservation.caregiver as any).email,
          phoneNumber: (reservation.caregiver as any).phoneNumber,
        },
        pets: reservation.pets.map((pet: any) => ({
          id: pet._id,
          name: pet.name,
          petType: pet.petType,
          characteristics: pet.characteristics.map((char: any) => ({
            id: char.characteristic._id,
            name: char.characteristic.name,
            value: char.value,
          })),
          comment: pet.comment,
          avatar: pet.avatar,
        })),
        visitsCount: reservation.visitsCount,
        totalPrice: formatCurrency(reservation.totalPrice),
        commission: formatCurrency(reservation.commission),
        totalOwner: formatCurrency(reservation.totalOwner),
        totalCaregiver: formatCurrency(reservation.totalCaregiver),
        distance: reservation.distance,
        status: reservation.status,
        createdAt: reservation.createdAt,
        updatedAt: reservation.updatedAt,
      },
    });
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
  permissionMiddleware('reservations', 'create'),
  createReservation
);
router.get(
  '/',
  authMiddleware,
  permissionMiddleware('reservations', 'getAll'),
  getUserReservations
);
router.get(
  '/:id',
  authMiddleware,
  permissionMiddleware('reservations', 'read'),
  getReservation
);
router.put(
  '/:id/accept',
  authMiddleware,
  permissionMiddleware('reservations', 'update'),
  acceptReservation
);
router.put(
  '/:id/reject',
  authMiddleware,
  permissionMiddleware('reservations', 'update'),
  rejectReservation
);
router.put(
  '/:id/cancel',
  authMiddleware,
  permissionMiddleware('reservations', 'update'),
  cancelReservation
);

// Admin routes
router.get(
  '/admin/all',
  authMiddleware,
  permissionMiddleware('reservations', 'getAll'),
  getAllReservations
);
router.get(
  '/admin/:id',
  authMiddleware,
  permissionMiddleware('reservations', 'read'),
  getReservationAdmin
);

export default router;
