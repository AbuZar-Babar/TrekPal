import { z } from 'zod';

import { BID_AWAITING_ACTION, ROLES, type BidAwaitingAction } from '../../config/constants';

const booleanSchema = z.preprocess((value) => {
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true') {
      return true;
    }

    if (normalized === 'false') {
      return false;
    }
  }

  return value;
}, z.boolean());

const descriptionSchema = z.preprocess((value) => {
  if (typeof value !== 'string') {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}, z.string().trim().max(1000).optional());

export const defaultOfferDetails = {
  stayIncluded: false,
  stayDetails: '',
  transportIncluded: false,
  transportDetails: '',
  mealsIncluded: false,
  mealDetails: '',
  extras: '',
} as const;

export const offerDetailsSchema = z.object({
  stayIncluded: booleanSchema.default(defaultOfferDetails.stayIncluded),
  stayDetails: z
    .string()
    .trim()
    .max(500, 'Stay details must be 500 characters or less')
    .default(defaultOfferDetails.stayDetails),
  transportIncluded: booleanSchema.default(defaultOfferDetails.transportIncluded),
  transportDetails: z
    .string()
    .trim()
    .max(500, 'Transport details must be 500 characters or less')
    .default(defaultOfferDetails.transportDetails),
  mealsIncluded: booleanSchema.default(defaultOfferDetails.mealsIncluded),
  mealDetails: z
    .string()
    .trim()
    .max(500, 'Meal details must be 500 characters or less')
    .default(defaultOfferDetails.mealDetails),
  extras: z
    .string()
    .trim()
    .max(500, 'Extras must be 500 characters or less')
    .default(defaultOfferDetails.extras),
});

export const agencyBidFiltersSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.enum(['PENDING', 'ACCEPTED', 'REJECTED']).optional(),
});

export const createBidSchema = z.object({
  tripRequestId: z.string().trim().min(1, 'Trip request is required'),
  price: z.coerce.number().positive('Price must be greater than zero'),
  description: descriptionSchema,
  offerDetails: offerDetailsSchema.default(defaultOfferDetails),
});

export const counterOfferSchema = z.object({
  price: z.coerce.number().positive('Price must be greater than zero'),
  description: descriptionSchema,
  offerDetails: offerDetailsSchema.default(defaultOfferDetails),
});

export type OfferDetails = z.infer<typeof offerDetailsSchema>;
export type CreateBidInput = z.infer<typeof createBidSchema>;
export type CounterOfferInput = z.infer<typeof counterOfferSchema>;
export type AgencyBidFiltersInput = z.infer<typeof agencyBidFiltersSchema>;
export type BidActorRole = typeof ROLES.TRAVELER | typeof ROLES.AGENCY;

export interface BidRevisionResponse {
  id: string;
  bidId: string;
  actorRole: BidActorRole;
  actorId: string;
  price: number;
  description: string | null;
  offerDetails: OfferDetails;
  createdAt: Date;
}

export interface BidResponse {
  id: string;
  tripRequestId: string;
  agencyId: string;
  agencyName: string;
  price: number;
  description: string | null;
  offerDetails: OfferDetails;
  status: string;
  awaitingActionBy: BidAwaitingAction;
  revisionCount: number;
  createdAt: Date;
  updatedAt: Date;
  tripDestination?: string;
  tripStartDate?: Date;
  tripEndDate?: Date;
  revisions?: BidRevisionResponse[];
}

export function normalizeOfferDetails(input: unknown): OfferDetails {
  const parsed = offerDetailsSchema.safeParse(input ?? {});
  if (parsed.success) {
    return parsed.data;
  }

  return offerDetailsSchema.parse({});
}

export function normalizeAwaitingAction(input: unknown): BidAwaitingAction {
  if (
    input === BID_AWAITING_ACTION.TRAVELER ||
    input === BID_AWAITING_ACTION.AGENCY ||
    input === BID_AWAITING_ACTION.NONE
  ) {
    return input;
  }

  return BID_AWAITING_ACTION.NONE;
}

export function offerDetailsToJson(
  offerDetails: OfferDetails,
): Record<string, unknown> {
  return offerDetails as unknown as Record<string, unknown>;
}
