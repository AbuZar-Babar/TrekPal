import { Server as SocketServer } from 'socket.io';

import { offersRoomName, travelerRoomName } from './socket.rooms';

export const MARKETPLACE_EVENTS = {
  OFFER_UPDATED: 'marketplace:offer-updated',
  BID_UPDATED: 'marketplace:bid-updated',
} as const;

export interface OfferUpdatedEventPayload {
  eventType: 'CREATED' | 'UPDATED' | 'DELETED';
  packageId: string;
  agencyId: string;
  name: string;
  isActive: boolean;
  updatedAt: string;
}

export interface BidUpdatedEventPayload {
  eventType: 'CREATED' | 'COUNTEROFFERED' | 'ACCEPTED' | 'REJECTED' | 'UPDATED';
  tripRequestId: string;
  bidId: string;
  agencyId: string;
  agencyName: string;
  status: string;
  awaitingActionBy: string;
  updatedAt: string;
}

let socketServer: SocketServer | null = null;

export const registerSocketServer = (io: SocketServer): void => {
  socketServer = io;
};

export const emitOfferUpdated = (payload: OfferUpdatedEventPayload): void => {
  socketServer
    ?.to(offersRoomName())
    .emit(MARKETPLACE_EVENTS.OFFER_UPDATED, payload);
};

export const emitTravelerBidUpdated = (
  travelerId: string,
  payload: BidUpdatedEventPayload,
): void => {
  socketServer
    ?.to(travelerRoomName(travelerId))
    .emit(MARKETPLACE_EVENTS.BID_UPDATED, payload);
};
