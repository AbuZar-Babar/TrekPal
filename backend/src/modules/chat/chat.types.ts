import { ROLES } from '../../config/constants';

export interface ChatParticipantResponse {
  id: string;
  name: string;
  avatar: string | null;
}

export interface ChatRoomResponse {
  id: string;
  packageId: string;
  title: string;
  agencyId: string;
  agencyName: string;
  participantCount: number;
  participants: ChatParticipantResponse[];
  latestMessagePreview: string | null;
  latestMessageAt: Date | null;
}

export interface ChatMessageResponse {
  id: string;
  roomId: string;
  senderType: typeof ROLES.TRAVELER | typeof ROLES.AGENCY;
  senderId: string;
  senderName: string;
  senderAvatar: string | null;
  content: string;
  createdAt: Date;
}

export type ChatActor =
  | {
      role: typeof ROLES.TRAVELER;
      travelerId: string;
      travelerName: string;
    }
  | {
      role: typeof ROLES.AGENCY;
      agencyId: string;
      agencyName: string;
    };
