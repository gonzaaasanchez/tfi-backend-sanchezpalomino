import { Router, RequestHandler } from 'express';
import User from '../models/User';
import { authMiddleware } from '../middleware/auth';
import { permissionMiddleware } from '../middleware/permissions';
import { ResponseHelper } from '../utils/response';
import {
  formatCurrency,
  calculateDaysDifference,
  calculateDistance,
  getPetTypesFromPets,
  sanitizeMongooseDoc,
} from '../utils/common';
import { CareLocation, CARE_LOCATION } from '../types';

const router = Router();

interface SearchParams {
  startDate: string;
  endDate: string;
  careLocation: CareLocation;
  petIds: string[];
  visitsPerDay?: number;
  userAddressId?: string;
  maxDistance?: number;
  maxPrice?: number;
}

interface CaregiverSearchResult {
  caregiver: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    avatar?: string;
    carerConfig?: any;
  };
  totalPrice: string;
  commission: string;
  totalWithCommission: string;
  distance?: number;
  daysCount: number;
  startDate: string;
  endDate: string;
  careDetails: {
    visitsCount?: number;
    pricePerDay?: string;
    pricePerVisit?: string;
  };
}

// POST /caregiver-search - Search for available caregivers
const searchCaregivers: RequestHandler = async (req, res, next) => {
  try {
    const {
      startDate,
      endDate,
      careLocation,
      petIds,
      visitsPerDay,
      userAddressId,
      maxDistance,
      maxPrice,
    }: SearchParams = req.body;

    // Sorting parameters from query params
    const sortBy = (req.query.sortBy as 'price' | 'distance') || 'price';
    const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'asc';
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    // Basic validations
    if (
      !startDate ||
      !endDate ||
      !careLocation ||
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

    // Get tomorrow's date in YYYY-MM-DD format
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    // Get start date in YYYY-MM-DD format
    const startStr = start.toISOString().split('T')[0];

    // Compare date strings (more reliable)
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

    // Specific validations by care type
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
    }

    // Calculate number of days
    const daysCount = calculateDaysDifference(startDate, endDate);

    // Get pet types from requested pets
    const petTypeIds = await getPetTypesFromPets(petIds);

    // Build filters to search for caregivers
    const filters: any = {
      carerConfig: { $exists: true, $ne: null },
      _id: { $ne: req.user?._id }, // Exclude authenticated user
    };

    // Filter by enabled care type
    if (careLocation === CARE_LOCATION.PET_HOME) {
      filters['carerConfig.petHomeCare.enabled'] = true;
    } else {
      filters['carerConfig.homeCare.enabled'] = true;
    }

    // Filter by pet types they can care for
    if (petTypeIds.length > 0) {
      filters['carerConfig.petTypes'] = { $in: petTypeIds };
    }

    // Get caregivers that meet basic criteria
    const caregivers = await User.find(filters)
      .populate('carerConfig.petTypes', 'name')
      .skip((page - 1) * limit)
      .limit(limit);

    const results: CaregiverSearchResult[] = [];

    for (const caregiver of caregivers) {
      // Calculate price based on care type
      let totalPrice = 0;
      let pricePerDay: number | undefined;
      let pricePerVisit: number | undefined;
      let visitsCount: number | undefined;

      if (careLocation === CARE_LOCATION.PET_HOME) {
        // Pet home care
        pricePerVisit = caregiver.carerConfig?.petHomeCare?.visitPrice;
        if (!pricePerVisit) continue; // Skip if no visit price

        visitsCount = (visitsPerDay || 0) * daysCount;
        totalPrice = pricePerVisit * visitsCount;
      } else {
        // Caregiver home care
        pricePerDay = caregiver.carerConfig?.homeCare?.dayPrice;
        if (!pricePerDay) continue; // Skip if no daily price

        totalPrice = pricePerDay * daysCount;
      }

      // Filter by maximum price if specified
      if (maxPrice && totalPrice > maxPrice) {
        continue;
      }

      // Calculate distance if maxDistance is specified
      let calculatedDistance: number | undefined;
      if (maxDistance && userAddressId) {
        // Get user's address
        const user = await User.findById(req.user?._id);
        const userAddress = user?.addresses?.find(
          (addr) => (addr as any)._id?.toString() === userAddressId
        );

        if (
          userAddress &&
          caregiver.addresses &&
          caregiver.addresses.length > 0
        ) {
          // Calculate distance with caregiver's first address
          const caregiverAddress = caregiver.addresses[0];
          calculatedDistance = calculateDistance(
            userAddress.coords.lat,
            userAddress.coords.lon,
            caregiverAddress.coords.lat,
            caregiverAddress.coords.lon
          );

          // Round distance to 2 decimal places
          calculatedDistance = Math.round(calculatedDistance * 100) / 100;

          // Filter by maximum distance
          if (calculatedDistance > maxDistance) {
            continue; // Skip if too far
          }
        }
      }

      // Calculate commission (6%)
      const commission = totalPrice * 0.06;
      const totalWithCommission = totalPrice + commission;

      // Create result object
      const result: CaregiverSearchResult = {
        caregiver: {
          ...sanitizeMongooseDoc(caregiver),
          carerConfig: caregiver.carerConfig,
        },
        totalPrice: formatCurrency(totalPrice),
        commission: formatCurrency(commission),
        totalWithCommission: formatCurrency(totalWithCommission),
        distance: calculatedDistance,
        daysCount,
        startDate,
        endDate,
        careDetails: {
          visitsCount,
          pricePerDay: pricePerDay ? formatCurrency(pricePerDay) : undefined,
          pricePerVisit: pricePerVisit
            ? formatCurrency(pricePerVisit)
            : undefined,
        },
      };

      results.push(result);
    }

    // Sort results according to sorting parameters
    results.sort((a, b) => {
      const sortField = sortBy;
      const order = sortOrder;

      let aValue: number;
      let bValue: number;

      if (sortField === 'price') {
        // Convert formatted prices back to numbers for comparison
        aValue = parseFloat(a.totalPrice.replace(/\./g, '').replace(',', '.'));
        bValue = parseFloat(b.totalPrice.replace(/\./g, '').replace(',', '.'));
      } else if (sortField === 'distance') {
        // Use distance (if no distance, put a very high value)
        aValue = a.distance || 999999;
        bValue = b.distance || 999999;
      } else {
        // Fallback to price
        aValue = parseFloat(a.totalPrice.replace(/\./g, '').replace(',', '.'));
        bValue = parseFloat(b.totalPrice.replace(/\./g, '').replace(',', '.'));
      }

      // Apply order
      if (order === 'asc') {
        return aValue - bValue; // Lowest to highest
      } else {
        return bValue - aValue; // Highest to lowest
      }
    });

    // Get total for pagination
    const totalCaregivers = await User.countDocuments(filters);

    ResponseHelper.success(res, 'Búsqueda completada exitosamente', {
      items: results,
      pagination: {
        page,
        limit,
        total: totalCaregivers,
        totalPages: Math.ceil(totalCaregivers / limit),
        hasNextPage: page < Math.ceil(totalCaregivers / limit),
        hasPrevPage: page > 1,
      },
      searchParams: {
        startDate,
        endDate,
        careLocation,
        petIds,
        visitsPerDay,
        userAddressId,
        maxDistance,
        maxPrice,
        daysCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ========================================
// ROUTES
// ========================================
router.post(
  '/',
  authMiddleware,
  permissionMiddleware('caregiverSearch', 'read'),
  searchCaregivers
);

export default router;
