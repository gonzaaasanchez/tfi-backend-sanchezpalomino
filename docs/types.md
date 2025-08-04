# Shared Types - TFI Backend

## Overview

This document describes the shared TypeScript types used throughout the project to maintain consistency in data structures.

## Address Types

### Address

Base type to represent a physical address.

```typescript
interface Address {
  name: string; // Descriptive name for the address
  fullAddress: string; // Complete address
  floor?: string; // Floor (optional)
  apartment?: string; // Department/Apartment (optional)
  coords: {
    lat: number; // Latitude
    lon: number; // Longitude
  };
}
```

### AddressWithId

Extension of the `Address` type that includes an optional ID. Used when addresses are stored in arrays with MongoDB ObjectId.

```typescript
interface AddressWithId extends Address {
  _id?: string | any; // Optional ID (MongoDB ObjectId)
}
```

### AddressWithoutId

Alias of the `Address` type for clarity when used as a single object without ID.

```typescript
type AddressWithoutId = Address;
```

## Reservation Status Constants

### RESERVATION_STATUS

Constants for reservation status values to ensure consistency across the application.

```typescript
export const RESERVATION_STATUS = {
  PAYMENT_PENDING: 'payment_pending',
  PAYMENT_REJECTED: 'payment_rejected',
  WAITING_ACCEPTANCE: 'waiting_acceptance',
  CONFIRMED: 'confirmed',
  STARTED: 'started',
  FINISHED: 'finished',
  CANCELLED_OWNER: 'cancelledOwner',
  CANCELLED_CAREGIVER: 'cancelledCaregiver',
  REJECTED: 'rejected',
} as const;

export type ReservationStatus =
  (typeof RESERVATION_STATUS)[keyof typeof RESERVATION_STATUS];
```

## Care Location Constants

### CARE_LOCATION

Constants for care location types to ensure consistency across the application.

```typescript
export const CARE_LOCATION = {
  PET_HOME: 'pet_home',
  CAREGIVER_HOME: 'caregiver_home',
} as const;

export type CareLocation = (typeof CARE_LOCATION)[keyof typeof CARE_LOCATION];
```

## Permission Constants

### PERMISSIONS

Constants for permission types to ensure consistency across the application.

```typescript
export const PERMISSIONS = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  GET_ALL: 'getAll',
  ADMIN: 'admin',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
```

## Usage in the Project

### User Model

```typescript
import { AddressWithId } from '../types';

export interface IUser extends Document {
  // ... other fields
  addresses?: AddressWithId[]; // Array of addresses with IDs
}
```

### Reservation Model

```typescript
import { AddressWithoutId, CareLocation, ReservationStatus } from '../types';

export interface IReservation extends Document {
  // ... other fields
  careLocation: CareLocation; // Using constant type
  address: AddressWithoutId; // Single address without ID
  status: ReservationStatus; // Using constant type
}
```

### Routes and Controllers

```typescript
import { AddressWithId, CARE_LOCATION, RESERVATION_STATUS } from '../types';

// Using constants for comparisons
if (careLocation === CARE_LOCATION.PET_HOME) {
  // Handle pet home care
}

if (reservation.status === RESERVATION_STATUS.WAITING_ACCEPTANCE) {
  // Handle waiting acceptance reservation
}
```

## Usage Example

```typescript
// Create an address
const address: Address = {
  name: 'Main House',
  fullAddress: 'Av. Corrientes 1234, Buenos Aires, Argentina',
  floor: '3',
  apartment: 'A',
  coords: {
    lat: -34.6037,
    lon: -58.3816,
  },
};

// Use in an array (like in User)
const addresses: AddressWithId[] = [
  {
    _id: '507f1f77bcf86cd799439011',
    ...address,
  },
];

// Use as single object (like in Reservation)
const reservationAddress: AddressWithoutId = address;

// Use constants for status
const reservationStatus: ReservationStatus = RESERVATION_STATUS.WAITING_ACCEPTANCE;

// Use constants for care location
const careLocation: CareLocation = CARE_LOCATION.PET_HOME;
```
