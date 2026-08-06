import type { PropertyType } from '../types/auth';

/**
 * Returns UI-adapted labels based on the business property type.
 *
 * Hotels don't "rent" rooms — guests pay nightly. Apartments/boarding houses
 * have monthly rent. Airbnb is short-term bookings. This helper drives the
 * adaptive labelling across the Revenue Tracker screens.
 */
export function getPropertyLabels(propertyType: PropertyType | null | undefined) {
  switch (propertyType) {
    case 'HOTEL':
      return {
        occupantLabel: 'Guest',
        occupantsLabel: 'Guests',
        revenueLabel: 'Nightly Revenue',
        paymentLabel: 'Booking',
        paymentsLabel: 'Bookings',
        unitLabel: 'Room',
        unitsLabel: 'Rooms',
        /** Hotels charge per night — rent tracking doesn't apply */
        supportsRentTracking: false,
        /** Hotels DO have vacancy (occupancy tracking) */
        supportsVacancy: true,
        vacancyLabel: 'Occupancy Gap',
        emptyLabel: 'Room available (no booking)',
      };
    case 'AIRBNB':
      return {
        occupantLabel: 'Guest',
        occupantsLabel: 'Guests',
        revenueLabel: 'Booking Revenue',
        paymentLabel: 'Booking Payment',
        paymentsLabel: 'Booking Payments',
        unitLabel: 'Unit',
        unitsLabel: 'Units',
        supportsRentTracking: false,
        supportsVacancy: true,
        vacancyLabel: 'Gap Between Bookings',
        emptyLabel: 'No upcoming booking',
      };
    case 'BOARDING_HOUSE':
      return {
        occupantLabel: 'Boarder',
        occupantsLabel: 'Boarders',
        revenueLabel: 'Monthly Revenue',
        paymentLabel: 'Board Payment',
        paymentsLabel: 'Board Payments',
        unitLabel: 'Room',
        unitsLabel: 'Rooms',
        supportsRentTracking: true,
        supportsVacancy: true,
        vacancyLabel: 'Vacant Room',
        emptyLabel: 'No boarder',
      };
    case 'COMMERCIAL':
      return {
        occupantLabel: 'Tenant',
        occupantsLabel: 'Tenants',
        revenueLabel: 'Lease Revenue',
        paymentLabel: 'Lease Payment',
        paymentsLabel: 'Lease Payments',
        unitLabel: 'Space',
        unitsLabel: 'Spaces',
        supportsRentTracking: true,
        supportsVacancy: true,
        vacancyLabel: 'Vacant Space',
        emptyLabel: 'No tenant',
      };
    case 'APARTMENT':
    default:
      return {
        occupantLabel: 'Tenant',
        occupantsLabel: 'Tenants',
        revenueLabel: 'Monthly Rent',
        paymentLabel: 'Rent Payment',
        paymentsLabel: 'Rent Payments',
        unitLabel: 'Unit',
        unitsLabel: 'Units',
        supportsRentTracking: true,
        supportsVacancy: true,
        vacancyLabel: 'Vacant Unit',
        emptyLabel: 'No tenant',
      };
  }
}

export type PropertyLabels = ReturnType<typeof getPropertyLabels>;
