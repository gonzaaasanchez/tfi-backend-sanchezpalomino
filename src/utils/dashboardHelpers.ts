import User from '../models/User';
import Pet from '../models/Pet';
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
  '#38A169', // Green
  '#805AD5', // Purple
  '#D69E2E', // Yellow
  '#F56565', // Light Red
  '#ED8936', // Light Orange
  '#4FD1C7', // Light Teal
  '#ECC94B', // Light Yellow
  '#FC8181', // Pink
  '#68D391', // Mint
  '#B794F4', // Lavender
  '#F6AD55', // Peach
  '#81E6D9', // Cyan
];

// Function to generate consistent color based on ID
function getConsistentColor(id: string): string {
  // Use a better hash function to reduce collisions
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    const char = id.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  // Add additional entropy using the length and position
  hash = hash + id.length + (id.charCodeAt(0) || 0);

  // Use absolute value and modulo to get a positive index
  const index = Math.abs(hash) % COLOR_PALETTE.length;
  return COLOR_PALETTE[index];
}

// Main function to get dashboard statistics
export async function getDashboardStats(
  params: DashboardStatsParams = {}
): Promise<DashboardStats> {
  const { period = '12m', startDate, endDate } = params;

  // Calculate dates based on period
  const endDateObj = endDate ? new Date(endDate) : new Date();
  const startDateObj = startDate
    ? new Date(startDate)
    : new Date(
        endDateObj.getTime() -
          getPeriodInMonths(period) * 30 * 24 * 60 * 60 * 1000
      );

  // Execute all queries in parallel for better performance
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
    revenueByCategory,
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
    getRevenueByCategory(startDateObj, endDateObj),
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

// Function to get total users
async function getTotalUsers(): Promise<number> {
  return await User.countDocuments();
}

// Function to get total reservations (excluding cancelled)
async function getTotalReservations(): Promise<number> {
  return await Reservation.countDocuments({
    status: {
      $nin: [
        RESERVATION_STATUS.CANCELLED_OWNER,
        RESERVATION_STATUS.CANCELLED_CAREGIVER,
      ],
    },
  });
}

// Function to get total pets
async function getTotalPets(): Promise<number> {
  return await Pet.countDocuments();
}

// Function to calculate user growth
async function getUsersGrowth(startDate: Date, endDate: Date): Promise<number> {
  const currentPeriodStart = new Date(startDate);
  const currentPeriodEnd = new Date(endDate);

  // Calculate previous period
  const periodDuration =
    currentPeriodEnd.getTime() - currentPeriodStart.getTime();
  const previousPeriodStart = new Date(
    currentPeriodStart.getTime() - periodDuration
  );

  const [currentPeriodUsers, previousPeriodUsers] = await Promise.all([
    User.countDocuments({
      createdAt: { $gte: currentPeriodStart, $lte: currentPeriodEnd },
    }),
    User.countDocuments({
      createdAt: { $gte: previousPeriodStart, $lt: currentPeriodStart },
    }),
  ]);

  // Handle edge cases for growth calculation
  if (previousPeriodUsers === 0) {
    // If there were no users in previous period
    if (currentPeriodUsers === 0) {
      return 0; // No change
    } else {
      return 100; // From 0 to some users = 100% growth
    }
  }

  // Calculate percentage change
  const growthPercentage = ((currentPeriodUsers - previousPeriodUsers) / previousPeriodUsers) * 100;
  return Math.round(growthPercentage);
}

// Function to calculate reservations growth
async function getReservationsGrowth(
  startDate: Date,
  endDate: Date
): Promise<number> {
  const currentPeriodStart = new Date(startDate);
  const currentPeriodEnd = new Date(endDate);

  const periodDuration =
    currentPeriodEnd.getTime() - currentPeriodStart.getTime();
  const previousPeriodEnd = new Date(currentPeriodStart.getTime());
  const previousPeriodStart = new Date(
    currentPeriodStart.getTime() - periodDuration
  );

  const [currentPeriodReservations, previousPeriodReservations] =
    await Promise.all([
      Reservation.countDocuments({
        createdAt: { $gte: currentPeriodStart, $lte: currentPeriodEnd },
        status: {
          $nin: [
            RESERVATION_STATUS.CANCELLED_OWNER,
            RESERVATION_STATUS.CANCELLED_CAREGIVER,
          ],
        },
      }),
      Reservation.countDocuments({
        createdAt: { $gte: previousPeriodStart, $lt: currentPeriodStart },
        status: {
          $nin: [
            RESERVATION_STATUS.CANCELLED_OWNER,
            RESERVATION_STATUS.CANCELLED_CAREGIVER,
          ],
        },
      }),
    ]);

  // Handle edge cases for growth calculation
  if (previousPeriodReservations === 0) {
    // If there were no reservations in previous period
    if (currentPeriodReservations === 0) {
      return 0; // No change
    } else {
      return 100; // From 0 to some reservations = 100% growth
    }
  }

  // Calculate percentage change
  const growthPercentage = ((currentPeriodReservations - previousPeriodReservations) / previousPeriodReservations) * 100;
  return Math.round(growthPercentage);
}

// Function to calculate pets growth
async function getPetsGrowth(startDate: Date, endDate: Date): Promise<number> {
  const currentPeriodStart = new Date(startDate);
  const currentPeriodEnd = new Date(endDate);

  const periodDuration =
    currentPeriodEnd.getTime() - currentPeriodStart.getTime();
  const previousPeriodStart = new Date(
    currentPeriodStart.getTime() - periodDuration
  );

  const [currentPeriodPets, previousPeriodPets] = await Promise.all([
    Pet.countDocuments({
      createdAt: { $gte: currentPeriodStart, $lte: currentPeriodEnd },
    }),
    Pet.countDocuments({
      createdAt: { $gte: previousPeriodStart, $lt: currentPeriodStart },
    }),
  ]);

  // Handle edge cases for growth calculation
  if (previousPeriodPets === 0) {
    // If there were no pets in previous period
    if (currentPeriodPets === 0) {
      return 0; // No change
    } else {
      return 100; // From 0 to some pets = 100% growth
    }
  }

  // Calculate percentage change
  const growthPercentage = ((currentPeriodPets - previousPeriodPets) / previousPeriodPets) * 100;
  return Math.round(growthPercentage);
}

// Function to get pet types distribution
async function getPetTypesDistribution(): Promise<
  Array<{ name: string; value: number; color: string }>
> {
  const result = await Pet.aggregate([
    {
      $lookup: {
        from: 'pettypes',
        localField: 'petType',
        foreignField: '_id',
        as: 'petTypeData',
      },
    },
    {
      $unwind: '$petTypeData',
    },
    {
      $group: {
        _id: '$petTypeData.name',
        value: { $sum: 1 },
      },
    },
    {
      $sort: { value: -1 },
    },
  ]);

  return result.map((item) => ({
    name: item._id,
    value: item.value,
    color: getConsistentColor(item._id),
  }));
}

// Function to get new users by month
async function getNewUsersByMonth(
  startDate: Date,
  endDate: Date
): Promise<Array<{ month: string; users: number }>> {
  const result = await User.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        users: { $sum: 1 },
      },
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 },
    },
  ]);

  // Convert result to map for easy access
  const dataMap = new Map();
  result.forEach((item) => {
    const key = `${item._id.year}-${item._id.month}`;
    dataMap.set(key, item.users);
  });

  // Generate all months in the period
  const months = [];
  
  // Start from the first day of the first month in the period
  const currentDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  
  // If the start date is not at the beginning of a month, move to the next month
  if (startDate.getDate() > 1) {
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  while (currentDate <= endDate) {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1; // getMonth() returns 0-11
    const key = `${year}-${month}`;

    months.push({
      month: getMonthAbbreviation(month),
      users: dataMap.get(key) || 0,
    });

    // Move to next month
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  return months;
}

// Function to get reservations by month
async function getReservationsByMonth(
  startDate: Date,
  endDate: Date
): Promise<Array<{ month: string; reservations: number }>> {
  const result = await Reservation.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        status: {
          $nin: [
            RESERVATION_STATUS.CANCELLED_OWNER,
            RESERVATION_STATUS.CANCELLED_CAREGIVER,
          ],
        },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        reservations: { $sum: 1 },
      },
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 },
    },
  ]);

  // Convert result to map for easy access
  const dataMap = new Map();
  result.forEach((item) => {
    const key = `${item._id.year}-${item._id.month}`;
    dataMap.set(key, item.reservations);
  });

  // Generate all months in the period
  const months = [];
  
  // Start from the first day of the first month in the period
  const currentDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  
  // If the start date is not at the beginning of a month, move to the next month
  if (startDate.getDate() > 1) {
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  while (currentDate <= endDate) {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1; // getMonth() returns 0-11
    const key = `${year}-${month}`;

    months.push({
      month: getMonthAbbreviation(month),
      reservations: dataMap.get(key) || 0,
    });

    // Move to next month
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  return months;
}

// Function to get revenue by category
async function getRevenueByCategory(
  startDate: Date,
  endDate: Date
): Promise<Array<{ category: string; revenue: number; color: string }>> {
  const result = await Reservation.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        status: {
          $nin: [
            RESERVATION_STATUS.CANCELLED_OWNER,
            RESERVATION_STATUS.CANCELLED_CAREGIVER,
          ],
        },
      },
    },
    {
      $group: {
        _id: '$careLocation',
        revenue: { $sum: '$totalPrice' },
      },
    },
    {
      $sort: { revenue: -1 },
    },
  ]);

  return result.map((item) => ({
    category: getCategoryName(item._id),
    revenue: item.revenue,
    color: getConsistentColor(item._id),
  }));
}

// Helper functions
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
    'Ene',
    'Feb',
    'Mar',
    'Abr',
    'May',
    'Jun',
    'Jul',
    'Ago',
    'Sep',
    'Oct',
    'Nov',
    'Dic',
  ];
  return months[month - 1] || 'Dic';
}

function getCategoryName(careLocation: string): string {
  const categoryMap: { [key: string]: string } = {
    pet_home: 'Hogar de la Mascota',
    caregiver_home: 'Hogar del Cuidador',
  };
  return categoryMap[careLocation] || 'Otros';
}
