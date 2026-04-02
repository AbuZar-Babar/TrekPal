/**
 * Application constants
 */
export const ROLES = {
  TRAVELER: 'TRAVELER',
  AGENCY: 'AGENCY',
  ADMIN: 'ADMIN',
} as const;

export type UserRole = typeof ROLES[keyof typeof ROLES];

export const BOOKING_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
} as const;

export type BookingStatus = typeof BOOKING_STATUS[keyof typeof BOOKING_STATUS];

export const BID_STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
} as const;

export type BidStatus = typeof BID_STATUS[keyof typeof BID_STATUS];

export const BID_AWAITING_ACTION = {
  TRAVELER: 'TRAVELER',
  AGENCY: 'AGENCY',
  NONE: 'NONE',
} as const;

export type BidAwaitingAction =
  typeof BID_AWAITING_ACTION[keyof typeof BID_AWAITING_ACTION];

export const APPROVAL_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;

export type ApprovalStatus = typeof APPROVAL_STATUS[keyof typeof APPROVAL_STATUS];

export const TRAVELER_KYC_STATUS = {
  NOT_SUBMITTED: 'NOT_SUBMITTED',
  PENDING: 'PENDING',
  VERIFIED: 'VERIFIED',
  REJECTED: 'REJECTED',
} as const;

export type TravelerKycStatus =
  typeof TRAVELER_KYC_STATUS[keyof typeof TRAVELER_KYC_STATUS];

export const normalizeTravelerKycStatus = (
  value: unknown,
): TravelerKycStatus => {
  switch (value) {
    case TRAVELER_KYC_STATUS.PENDING:
      return TRAVELER_KYC_STATUS.PENDING;
    case TRAVELER_KYC_STATUS.VERIFIED:
      return TRAVELER_KYC_STATUS.VERIFIED;
    case TRAVELER_KYC_STATUS.REJECTED:
      return TRAVELER_KYC_STATUS.REJECTED;
    default:
      return TRAVELER_KYC_STATUS.NOT_SUBMITTED;
  }
};

