// Shared types for the application

export interface Address {
  name: string;
  fullAddress: string;
  floor?: string;
  apartment?: string;
  coords: {
    lat: number;
    lon: number;
  };
}

// Type for address with optional _id (when used in arrays)
export interface AddressWithId extends Address {
  _id?: string | any; // For when addresses are stored in arrays with ObjectId
}

// Type for address without _id (when used as single object)
export type AddressWithoutId = Address;

// Reservation status constants
export const RESERVATION_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  STARTED: 'started',
  FINISHED: 'finished',
  CANCELLED_OWNER: 'cancelledOwner',
  CANCELLED_CAREGIVER: 'cancelledCaregiver',
} as const;

export type ReservationStatus =
  (typeof RESERVATION_STATUS)[keyof typeof RESERVATION_STATUS];

// Care location constants
export const CARE_LOCATION = {
  PET_HOME: 'pet_home',
  CAREGIVER_HOME: 'caregiver_home',
} as const;

export type CareLocation = (typeof CARE_LOCATION)[keyof typeof CARE_LOCATION];

// Permission constants
export const PERMISSIONS = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  GET_ALL: 'getAll',
  ADMIN: 'admin',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
