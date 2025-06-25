import { Router, RequestHandler } from 'express';
import User from '../models/User';
import Pet from '../models/Pet';
import { authMiddleware } from '../middleware/auth';
import { permissionMiddleware } from '../middleware/permissions';
import { ResponseHelper } from '../utils/response';

const router = Router();

// Interfaz para los parámetros de búsqueda
interface SearchParams {
  startDate: string;
  endDate: string;
  careLocation: 'pet_home' | 'caregiver_home'; // hogar de la mascota o hogar del cuidador
  petIds: string[]; // IDs de las mascotas a cuidar
  visitsPerDay?: number; // Solo para hogar de la mascota
  userAddressId?: string; // Solo para hogar de la mascota
  maxDistance?: number; // Distancia máxima en km
  maxPrice?: number; // Precio máximo a pagar
  page?: number;
  limit?: number;
}

// Interfaz para el resultado de búsqueda
interface CaregiverSearchResult {
  caregiver: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    avatar?: string;
    addresses: any[];
  };
  totalPrice: number; // Precio total de los honorarios
  commission: number; // Comisión del 6%
  totalWithCommission: number; // Precio total + comisión
  careDetails: {
    daysCount: number;
    visitsCount?: number;
    pricePerDay?: number;
    pricePerVisit?: number;
  };
}

// Función para calcular la diferencia en días entre dos fechas (incluyendo ambas)
function calculateDaysDifference(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Ajustar las fechas para incluir ambos días
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays + 1; // +1 para incluir ambos días
}

// Función para calcular la distancia entre dos coordenadas (fórmula de Haversine)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distancia en km
  return distance;
}

// Función para obtener los tipos de mascotas de una lista de mascotas
async function getPetTypesFromPets(petIds: string[]): Promise<string[]> {
  const pets = await Pet.find({ _id: { $in: petIds } }).populate('petType');
  return pets.map(pet => pet.petType._id.toString());
}

// POST /caregiver-search - Buscar cuidadores disponibles
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
      page = 1,
      limit = 10
    }: SearchParams = req.body;

    // Validaciones básicas
    if (!startDate || !endDate || !careLocation || !petIds || petIds.length === 0) {
      ResponseHelper.validationError(res, 'Faltan parámetros requeridos');
      return;
    }

    // Validar fechas
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();
    
    // Normalizar fechas para comparar solo la fecha (sin tiempo)
    const startDateOnly = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const endDateOnly = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    const nowDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // La fecha de inicio debe ser al menos mañana (no hoy)
    const tomorrow = new Date(nowDateOnly);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (startDateOnly < tomorrow) {
      ResponseHelper.validationError(res, 'La fecha de inicio debe ser al menos mañana');
      return;
    }
    
    if (endDateOnly < startDateOnly) {
      ResponseHelper.validationError(res, 'La fecha de fin debe ser posterior a la fecha de inicio');
      return;
    }

    // Validaciones específicas por tipo de cuidado
    if (careLocation === 'pet_home') {
      if (!visitsPerDay || visitsPerDay <= 0) {
        ResponseHelper.validationError(res, 'La cantidad de visitas por día es requerida para cuidado en hogar de la mascota');
        return;
      }
      if (!userAddressId) {
        ResponseHelper.validationError(res, 'El ID de la dirección del usuario es requerido para cuidado en hogar de la mascota');
        return;
      }
    }

    // Calcular cantidad de días
    const daysCount = calculateDaysDifference(startDate, endDate);

    // Obtener tipos de mascotas de las mascotas solicitadas
    const petTypeIds = await getPetTypesFromPets(petIds);

    // Construir filtros para buscar cuidadores
    const filters: any = {
      'carerConfig': { $exists: true, $ne: null },
      '_id': { $ne: req.user?._id } // Excluir al usuario autenticado
    };

    // Filtrar por tipo de cuidado habilitado
    if (careLocation === 'pet_home') {
      filters['carerConfig.petHomeCare.enabled'] = true;
    } else {
      filters['carerConfig.homeCare.enabled'] = true;
    }

    // Filtrar por tipos de mascotas que puede cuidar
    if (petTypeIds.length > 0) {
      filters['carerConfig.petTypes'] = { $in: petTypeIds };
    }

    // Obtener cuidadores que cumplen con los criterios básicos
    const caregivers = await User.find(filters)
      .populate('carerConfig.petTypes', 'name')
      .skip((page - 1) * limit)
      .limit(limit);

    const results: CaregiverSearchResult[] = [];

    for (const caregiver of caregivers) {
      // Calcular precio según el tipo de cuidado
      let totalPrice = 0;
      let pricePerDay: number | undefined;
      let pricePerVisit: number | undefined;
      let visitsCount: number | undefined;

      if (careLocation === 'pet_home') {
        // Cuidado en hogar de la mascota
        pricePerVisit = caregiver.carerConfig?.petHomeCare?.visitPrice;
        if (!pricePerVisit) continue; // Saltar si no tiene precio por visita

        visitsCount = (visitsPerDay || 0) * daysCount;
        totalPrice = pricePerVisit * visitsCount;
      } else {
        // Cuidado en hogar del cuidador
        pricePerDay = caregiver.carerConfig?.homeCare?.dayPrice;
        if (!pricePerDay) continue; // Saltar si no tiene precio por día

        totalPrice = pricePerDay * daysCount;
      }

      // Filtrar por precio máximo si se especifica
      if (maxPrice && totalPrice > maxPrice) {
        continue;
      }

      // Filtrar por distancia si se especifica y es cuidado en hogar de la mascota
      if (maxDistance && careLocation === 'pet_home' && userAddressId) {
        // Obtener la dirección del usuario
        const user = await User.findById(req.user?._id);
        const userAddress = user?.addresses?.find(addr => (addr as any)._id?.toString() === userAddressId);
        
        if (userAddress && caregiver.addresses && caregiver.addresses.length > 0) {
          // Calcular distancia con la primera dirección del cuidador (simplificado)
          const caregiverAddress = caregiver.addresses[0];
          const distance = calculateDistance(
            userAddress.coords.lat,
            userAddress.coords.lon,
            caregiverAddress.coords.lat,
            caregiverAddress.coords.lon
          );
          
          if (distance > maxDistance) {
            continue; // Saltar si está muy lejos
          }
        }
      }

      // Calcular comisión (6%)
      const commission = totalPrice * 0.06;
      const totalWithCommission = totalPrice + commission;

      // Crear objeto de resultado
      const result: CaregiverSearchResult = {
        caregiver: {
          _id: (caregiver._id as any).toString(),
          firstName: caregiver.firstName,
          lastName: caregiver.lastName,
          email: caregiver.email,
          phoneNumber: caregiver.phoneNumber,
          avatar: caregiver.avatar,
          addresses: caregiver.addresses || []
        },
        totalPrice,
        commission,
        totalWithCommission,
        careDetails: {
          daysCount,
          visitsCount,
          pricePerDay,
          pricePerVisit
        }
      };

      results.push(result);
    }

    // Ordenar por precio total (más barato primero)
    results.sort((a, b) => a.totalPrice - b.totalPrice);

    // Obtener total para paginación
    const totalCaregivers = await User.countDocuments(filters);

    ResponseHelper.success(res, 'Búsqueda completada exitosamente', {
      results,
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
        daysCount
      }
    });

  } catch (error) {
    next(error);
  }
};

// Rutas
router.post('/', authMiddleware, permissionMiddleware('caregiverSearch', 'read'), searchCaregivers);

export default router; 