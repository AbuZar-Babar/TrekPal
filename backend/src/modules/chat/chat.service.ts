import { prisma } from '../../config/database';
import {
  APPROVAL_STATUS,
  BOOKING_STATUS,
  ROLES,
} from '../../config/constants';
import { createSignedKycUrl, isHttpUrl } from '../../services/kyc-storage.service';
import {
  ChatActor,
  ChatMessageResponse,
  ChatParticipantResponse,
  ChatRoomResponse,
} from './chat.types';

const activeBookingFilter = {
  status: {
    not: BOOKING_STATUS.CANCELLED,
  },
} as const;

const roomInclude = {
  package: {
    select: {
      id: true,
      name: true,
      description: true,
      agencyId: true,
      agency: {
        select: {
          id: true,
          name: true,
        },
      },
      bookings: {
        where: activeBookingFilter,
        orderBy: {
          createdAt: 'asc' as const,
        },
        select: {
          userId: true,
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      },
    },
  },
  messages: {
    orderBy: {
      createdAt: 'desc' as const,
    },
    take: 1,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
      agency: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
} as const;

const messageInclude = {
  user: {
    select: {
      id: true,
      name: true,
      avatar: true,
    },
  },
  agency: {
    select: {
      id: true,
      name: true,
    },
  },
} as const;

export class ChatService {
  private async resolveAvatarUrl(value?: string | null): Promise<string | null> {
    if (!value) {
      return null;
    }

    if (isHttpUrl(value)) {
      return value;
    }

    try {
      return await createSignedKycUrl(value);
    } catch {
      return null;
    }
  }

  async resolveActorFromAuth(authUid: string, role: string): Promise<ChatActor> {
    if (role === ROLES.TRAVELER) {
      const traveler = await prisma.user.findUnique({
        where: { authUid },
        select: {
          id: true,
          name: true,
        },
      });

      if (!traveler) {
        throw new Error('Traveler not found');
      }

      return {
        role: ROLES.TRAVELER,
        travelerId: traveler.id,
        travelerName: traveler.name?.trim() || 'Traveler',
      };
    }

    if (role === ROLES.AGENCY) {
      const agency = await prisma.agency.findUnique({
        where: { authUid },
        select: {
          id: true,
          name: true,
          status: true,
        },
      });

      if (!agency) {
        throw new Error('Agency not found');
      }

      if (agency.status !== APPROVAL_STATUS.APPROVED) {
        throw new Error(
          agency.status === APPROVAL_STATUS.REJECTED
            ? 'Agency account was rejected'
            : 'Agency account is pending approval',
        );
      }

      return {
        role: ROLES.AGENCY,
        agencyId: agency.id,
        agencyName: agency.name,
      };
    }

    throw new Error('Forbidden');
  }

  private async mapParticipant(booking: {
    user: { id: string; name: string | null; avatar: string | null } | null;
  }): Promise<ChatParticipantResponse | null> {
    if (!booking.user) {
      return null;
    }

    return {
      id: booking.user.id,
      name: booking.user.name?.trim() || 'Traveler',
      avatar: await this.resolveAvatarUrl(booking.user.avatar),
    };
  }

  private async mapMessage(message: {
    id: string;
    groupId: string;
    senderType: string;
    content: string;
    createdAt: Date;
    userId: string | null;
    agencyId: string | null;
    user?: { id: string; name: string | null; avatar: string | null } | null;
    agency?: { id: string; name: string } | null;
  }): Promise<ChatMessageResponse> {
    if (message.senderType === ROLES.AGENCY) {
      return {
        id: message.id,
        roomId: message.groupId,
        senderType: ROLES.AGENCY,
        senderId: message.agencyId ?? '',
        senderName: message.agency?.name ?? 'Agency',
        senderAvatar: null,
        content: message.content,
        createdAt: message.createdAt,
      };
    }

    return {
      id: message.id,
      roomId: message.groupId,
      senderType: ROLES.TRAVELER,
      senderId: message.userId ?? '',
      senderName: message.user?.name?.trim() || 'Traveler',
      senderAvatar: await this.resolveAvatarUrl(message.user?.avatar),
      content: message.content,
      createdAt: message.createdAt,
    };
  }

  private async mapRoom(room: any): Promise<ChatRoomResponse> {
    if (!room.package) {
      throw new Error('Chat room package not found');
    }

    const participants = (
      await Promise.all(
        room.package.bookings.map((booking: any) => this.mapParticipant(booking)),
      )
    ).filter((participant): participant is ChatParticipantResponse => participant != null);

    return {
      id: room.id,
      packageId: room.package.id,
      title: room.package.name,
      agencyId: room.package.agency.id,
      agencyName: room.package.agency.name,
      participantCount: participants.length,
      participants,
      latestMessagePreview: room.messages[0]?.content ?? null,
      latestMessageAt: room.messages[0]?.createdAt ?? null,
    };
  }

  private async ensurePackageRoom(
    packageId: string,
    packageName: string,
    packageDescription?: string | null,
  ) {
    return prisma.tripGroup.upsert({
      where: { packageId },
      update: {
        name: packageName,
        description: packageDescription ?? null,
      },
      create: {
        packageId,
        name: packageName,
        description: packageDescription ?? null,
      },
      include: roomInclude,
    });
  }

  private assertPackageAccess(
    tripPackage: {
      agencyId: string;
      bookings: Array<{ userId: string }>;
    },
    actor: ChatActor,
  ): void {
    if (actor.role === ROLES.AGENCY) {
      if (tripPackage.agencyId !== actor.agencyId) {
        throw new Error('Forbidden');
      }
      return;
    }

    const hasBooking = tripPackage.bookings.some(
      (booking) => booking.userId === actor.travelerId,
    );
    if (!hasBooking) {
      throw new Error('Forbidden');
    }
  }

  private async getPackageForActor(packageId: string, actor: ChatActor) {
    const tripPackage = await prisma.package.findUnique({
      where: { id: packageId },
      select: {
        id: true,
        name: true,
        description: true,
        agencyId: true,
        bookings: {
          where: activeBookingFilter,
          select: {
            userId: true,
          },
        },
      },
    });

    if (!tripPackage) {
      throw new Error('Trip offer not found');
    }

    this.assertPackageAccess(tripPackage, actor);

    if (tripPackage.bookings.length === 0) {
      throw new Error('Chat room is not available for this offer yet');
    }

    return tripPackage;
  }

  async getRoomByPackageId(
    packageId: string,
    actor: ChatActor,
  ): Promise<ChatRoomResponse> {
    const tripPackage = await this.getPackageForActor(packageId, actor);
    const room = await this.ensurePackageRoom(
      tripPackage.id,
      tripPackage.name,
      tripPackage.description,
    );

    return this.mapRoom(room);
  }

  async getRoomById(roomId: string, actor: ChatActor): Promise<ChatRoomResponse> {
    const room = await prisma.tripGroup.findUnique({
      where: { id: roomId },
      include: roomInclude,
    });

    if (!room || !room.packageId || !room.package) {
      throw new Error('Chat room not found');
    }

    this.assertPackageAccess(room.package, actor);

    return this.mapRoom(room);
  }

  async listRooms(actor: ChatActor): Promise<ChatRoomResponse[]> {
    let packageIds: string[] = [];

    if (actor.role === ROLES.TRAVELER) {
      const bookings = await prisma.booking.findMany({
        where: {
          userId: actor.travelerId,
          packageId: { not: null },
          status: {
            not: BOOKING_STATUS.CANCELLED,
          },
        },
        select: {
          packageId: true,
        },
      });

      packageIds = Array.from(
        new Set(
          bookings
            .map((booking) => booking.packageId)
            .filter((value): value is string => !!value),
        ),
      );
    } else {
      const packages = await prisma.package.findMany({
        where: {
          agencyId: actor.agencyId,
          bookings: {
            some: activeBookingFilter,
          },
        },
        select: {
          id: true,
          name: true,
          description: true,
        },
      });

      await Promise.all(
        packages.map((tripPackage) =>
          this.ensurePackageRoom(
            tripPackage.id,
            tripPackage.name,
            tripPackage.description,
          ),
        ),
      );

      packageIds = packages.map((tripPackage) => tripPackage.id);
    }

    if (packageIds.length === 0) {
      return [];
    }

    if (actor.role === ROLES.TRAVELER) {
      const packages = await prisma.package.findMany({
        where: {
          id: {
            in: packageIds,
          },
        },
        select: {
          id: true,
          name: true,
          description: true,
        },
      });

      await Promise.all(
        packages.map((tripPackage) =>
          this.ensurePackageRoom(
            tripPackage.id,
            tripPackage.name,
            tripPackage.description,
          ),
        ),
      );
    }

    const rooms = await prisma.tripGroup.findMany({
      where: {
        packageId: {
          in: packageIds,
        },
      },
      include: roomInclude,
    });

    const mappedRooms = await Promise.all(rooms.map((room) => this.mapRoom(room)));
    return mappedRooms.sort((left, right) => {
      const rightTime =
        right.latestMessageAt?.getTime() ?? 0;
      const leftTime =
        left.latestMessageAt?.getTime() ?? 0;
      return rightTime - leftTime;
    });
  }

  async getMessages(
    roomId: string,
    actor: ChatActor,
  ): Promise<ChatMessageResponse[]> {
    await this.getRoomById(roomId, actor);

    const messages = await prisma.message.findMany({
      where: { groupId: roomId },
      orderBy: {
        createdAt: 'asc',
      },
      include: messageInclude,
    });

    return Promise.all(messages.map((message) => this.mapMessage(message)));
  }

  async createMessage(
    roomId: string,
    actor: ChatActor,
    content: string,
  ): Promise<ChatMessageResponse> {
    const trimmedContent = content.trim();
    if (trimmedContent.length < 1) {
      throw new Error('Message cannot be empty');
    }

    if (trimmedContent.length > 1000) {
      throw new Error('Message is too long');
    }

    await this.getRoomById(roomId, actor);

    const message = await prisma.message.create({
      data: {
        groupId: roomId,
        senderType: actor.role,
        content: trimmedContent,
        ...(actor.role === ROLES.TRAVELER
          ? { userId: actor.travelerId }
          : { agencyId: actor.agencyId }),
      },
      include: messageInclude,
    });

    return this.mapMessage(message);
  }
}

export const chatService = new ChatService();
