import mongoose from 'mongoose';
import User from '../models/User';
import Pet from '../models/Pet';
import PetType from '../models/PetType';
import Reservation from '../models/Reservation';
import { RESERVATION_STATUS } from '../types';

interface DashboardStatsParams {
  period?: string;
  startDate?: string;
  endDate?: string;
}

interface DashboardStats {
  stats: {
    totalUsers: number;
    totalReservations: number;
    totalPets: number;
    usersGrowth: number;
    reservationsGrowth: number;
    petsGrowth: number;
  };
  petTypes: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  newUsers: Array<{
    month: string;
    users: number;
  }>;
  reservations: Array<{
    month: string;
    reservations: number;
  }>;
  revenue: Array<{
    category: string;
    revenue: number;
    color: string;
  }>;
}

// Paleta de colores predefinida para generar colores consistentes
const COLOR_PALETTE = [
  '#3182CE', // Blue
  '#E53E3E', // Red
  '#38A169', // Green
  '#805AD5', // Purple
  '#DD6B20', // Orange
  '#319795', // Teal
  '#D69E2E',   // Yellow
  '#E53E3E', // Red
  '#38A169', // Green
  '#805AD5', // Purple
  '#DD6B20', // Orange
  '#319795', // Teal
];

// Función para generar color consistente basado en ID
function getConsistentColor(id: string): string {
  // Usar el hash del ID para generar un índice consistente
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    const char = id.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Usar el valor absoluto del hash para obtener un índice positivo
  const index = Math.abs(hash) % COLOR_PALETTE.length;
  return COLOR_PALETTE[index];
}

// Función principal para obtener estadísticas del dashboard
export async function getDashboardStats(
  params: DashboardStatsParams = {}
): Promise<DashboardStats> {
  const { period = '12m', startDate, endDate } = params;

  // Calcular fechas basadas en el período
  const endDateObj = endDate ? new Date(endDate) : new Date();
  const startDateObj = startDate 
    ? new Date(startDate) 
    : new Date(endDateObj.getTime() - getPeriodInMonths(period) * 30 * 24 * 60 * 60 * 1000);

  // Ejecutar todas las consultas en paralelo para mejor performance
  const [
    totalUsers,
    totalReservations,
    totalPets,
    usersGrowth,
    reservationsGrowth,
    petsGrowth,
    petTypesDistribution,
    newUsersByMonth,
    reservationsByMonth,
    revenueByCategory
  ] = await Promise.all([
    getTotalUsers(),
    getTotalReservations(),
    getTotalPets(),
    getUsersGrowth(startDateObj, endDateObj),
    getReservationsGrowth(startDateObj, endDateObj),
    getPetsGrowth(startDateObj, endDateObj),
    getPetTypesDistribution(),
    getNewUsersByMonth(startDateObj, endDateObj),
    getReservationsByMonth(startDateObj, endDateObj),
    getRevenueByCategory(startDateObj, endDateObj)
  ]);

  return {
    stats: {
      totalUsers,
      totalReservations,
      totalPets,
      usersGrowth,
      reservationsGrowth,
      petsGrowth,
    },
    petTypes: petTypesDistribution,
    newUsers: newUsersByMonth,
    reservations: reservationsByMonth,
    revenue: revenueByCategory,
  };
}

// Función para obtener el total de usuarios
async function getTotalUsers(): Promise<number> {
  return await User.countDocuments();
}

// Función para obtener el total de reservas (excluyendo canceladas)
async function getTotalReservations(): Promise<number> {
  return await Reservation.countDocuments({
    status: { 
      $nin: [RESERVATION_STATUS.CANCELLED_OWNER, RESERVATION_STATUS.CANCELLED_CAREGIVER] 
    }
  });
}

// Función para obtener el total de mascotas
async function getTotalPets(): Promise<number> {
  return await Pet.countDocuments();
}

// Función para calcular el crecimiento de usuarios
async function getUsersGrowth(startDate: Date, endDate: Date): Promise<number> {
  const currentPeriodStart = new Date(startDate);
  const currentPeriodEnd = new Date(endDate);
  
  // Calcular período anterior
  const periodDuration = currentPeriodEnd.getTime() - currentPeriodStart.getTime();
  const previousPeriodEnd = new Date(currentPeriodStart.getTime());
  const previousPeriodStart = new Date(currentPeriodStart.getTime() - periodDuration);

  const [currentPeriodUsers, previousPeriodUsers] = await Promise.all([
    User.countDocuments({
      createdAt: { $gte: currentPeriodStart, $lte: currentPeriodEnd }
    }),
    User.countDocuments({
      createdAt: { $gte: previousPeriodStart, $lt: currentPeriodStart }
    })
  ]);

  if (previousPeriodUsers === 0) {
    return currentPeriodUsers > 0 ? 100 : 0;
  }

  return Math.round(((currentPeriodUsers - previousPeriodUsers) / previousPeriodUsers) * 100);
}

// Función para calcular el crecimiento de reservas
async function getReservationsGrowth(startDate: Date, endDate: Date): Promise<number> {
  const currentPeriodStart = new Date(startDate);
  const currentPeriodEnd = new Date(endDate);
  
  const periodDuration = currentPeriodEnd.getTime() - currentPeriodStart.getTime();
  const previousPeriodEnd = new Date(currentPeriodStart.getTime());
  const previousPeriodStart = new Date(currentPeriodStart.getTime() - periodDuration);

  const [currentPeriodReservations, previousPeriodReservations] = await Promise.all([
    Reservation.countDocuments({
      createdAt: { $gte: currentPeriodStart, $lte: currentPeriodEnd },
      status: { 
        $nin: [RESERVATION_STATUS.CANCELLED_OWNER, RESERVATION_STATUS.CANCELLED_CAREGIVER] 
      }
    }),
    Reservation.countDocuments({
      createdAt: { $gte: previousPeriodStart, $lt: currentPeriodStart },
      status: { 
        $nin: [RESERVATION_STATUS.CANCELLED_OWNER, RESERVATION_STATUS.CANCELLED_CAREGIVER] 
      }
    })
  ]);

  if (previousPeriodReservations === 0) {
    return currentPeriodReservations > 0 ? 100 : 0;
  }

  return Math.round(((currentPeriodReservations - previousPeriodReservations) / previousPeriodReservations) * 100);
}

// Función para calcular el crecimiento de mascotas
async function getPetsGrowth(startDate: Date, endDate: Date): Promise<number> {
  const currentPeriodStart = new Date(startDate);
  const currentPeriodEnd = new Date(endDate);
  
  const periodDuration = currentPeriodEnd.getTime() - currentPeriodStart.getTime();
  const previousPeriodEnd = new Date(currentPeriodStart.getTime());
  const previousPeriodStart = new Date(currentPeriodStart.getTime() - periodDuration);

  const [currentPeriodPets, previousPeriodPets] = await Promise.all([
    Pet.countDocuments({
      createdAt: { $gte: currentPeriodStart, $lte: currentPeriodEnd }
    }),
    Pet.countDocuments({
      createdAt: { $gte: previousPeriodStart, $lt: currentPeriodStart }
    })
  ]);

  if (previousPeriodPets === 0) {
    return currentPeriodPets > 0 ? 100 : 0;
  }

  return Math.round(((currentPeriodPets - previousPeriodPets) / previousPeriodPets) * 100);
}

// Función para obtener distribución de tipos de mascotas
async function getPetTypesDistribution(): Promise<Array<{ name: string; value: number; color: string }>> {
  const result = await Pet.aggregate([
    {
      $lookup: {
        from: 'pettypes',
        localField: 'petType',
        foreignField: '_id',
        as: 'petTypeData'
      }
    },
    {
      $unwind: '$petTypeData'
    },
    {
      $group: {
        _id: '$petTypeData.name',
        value: { $sum: 1 }
      }
    },
    {
      $sort: { value: -1 }
    }
  ]);

  return result.map(item => ({
    name: item._id,
    value: item.value,
    color: getConsistentColor(item._id)
  }));
}

// Función para obtener nuevos usuarios por mes
async function getNewUsersByMonth(startDate: Date, endDate: Date): Promise<Array<{ month: string; users: number }>> {
  const result = await User.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        users: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 }
    }
  ]);

  return result.map(item => ({
    month: getMonthAbbreviation(item._id.month),
    users: item.users
  }));
}

// Función para obtener reservas por mes
async function getReservationsByMonth(startDate: Date, endDate: Date): Promise<Array<{ month: string; reservations: number }>> {
  const result = await Reservation.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        status: { 
          $nin: [RESERVATION_STATUS.CANCELLED_OWNER, RESERVATION_STATUS.CANCELLED_CAREGIVER] 
        }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        reservations: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 }
    }
  ]);

  return result.map(item => ({
    month: getMonthAbbreviation(item._id.month),
    reservations: item.reservations
  }));
}

// Función para obtener ingresos por categoría
async function getRevenueByCategory(startDate: Date, endDate: Date): Promise<Array<{ category: string; revenue: number; color: string }>> {
  const result = await Reservation.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        status: { 
          $nin: [RESERVATION_STATUS.CANCELLED_OWNER, RESERVATION_STATUS.CANCELLED_CAREGIVER] 
        }
      }
    },
    {
      $group: {
        _id: '$careLocation',
        revenue: { $sum: '$totalPrice' }
      }
    },
    {
      $sort: { revenue: -1 }
    }
  ]);

  return result.map(item => ({
    category: getCategoryName(item._id),
    revenue: item.revenue,
    color: getConsistentColor(item._id)
  }));
}

// Funciones auxiliares
function getPeriodInMonths(period: string): number {
  const periodMap: { [key: string]: number } = {
    '3m': 3,
    '6m': 6,
    '12m': 12,
    '24m': 24,
  };
  return periodMap[period] || 12;
}

function getMonthAbbreviation(month: number): string {
  const months = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
  ];
  return months[month - 1] || 'Des';
}

function getCategoryName(careLocation: string): string {
  const categoryMap: { [key: string]: string } = {
    'pet_home': 'Pet Home Care',
    'caregiver_home': 'Caregiver Home Care',
  };
  return categoryMap[careLocation] || 'Otros';
} 