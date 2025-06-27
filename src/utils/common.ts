/**
 * Common utility functions used across the application
 */

import Pet from '../models/Pet';

/**
 * Format a number as currency string (e.g., 1234.56 -> "1.234,56")
 * @param amount - The amount to format
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number): string {
  const rounded = Math.round(amount * 100) / 100;
  const parts = rounded.toString().split('.');
  const integerPart = parts[0];
  const decimalPart = parts[1] || '00';
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const formattedDecimal = decimalPart.padEnd(2, '0').substring(0, 2);
  return `${formattedInteger},${formattedDecimal}`;
}

/**
 * Calculate the number of days between two dates
 * @param startDate - Start date string (YYYY-MM-DD)
 * @param endDate - End date string (YYYY-MM-DD)
 * @returns Number of days difference
 */
export function calculateDaysDifference(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  const diffTime = end.getTime() - start.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param lat1 - Latitude of first point
 * @param lon1 - Longitude of first point
 * @param lat2 - Latitude of second point
 * @param lon2 - Longitude of second point
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
}

/**
 * Get pet type IDs from an array of pet IDs
 * @param petIds - Array of pet IDs
 * @returns Array of pet type IDs
 */
export async function getPetTypesFromPets(petIds: string[]): Promise<string[]> {
  const pets = await Pet.find({ _id: { $in: petIds } }).populate('petType');
  return pets.map((pet) => pet.petType._id.toString());
} 