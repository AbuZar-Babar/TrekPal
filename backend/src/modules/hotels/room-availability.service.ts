import { prisma } from '../../config/database';

export class RoomAvailabilityService {
  /**
   * Initializes availability for a new room or updated quantity
   * Defaults to 1 year of availability
   */
  async initializeAvailability(roomId: string, totalQuantity: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const availabilities = [];
    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      availabilities.push({
        roomId,
        date,
        available: totalQuantity,
      });
    }

    // Upsert to handle existing records if quantity changes
    for (const av of availabilities) {
      await prisma.roomAvailability.upsert({
        where: {
          roomId_date: {
            roomId: av.roomId,
            date: av.date,
          },
        },
        update: {
          available: av.available,
        },
        create: av,
      });
    }
  }

  /**
   * Checks if a room is available for a date range
   */
  async checkAvailability(roomId: string, startDate: Date, endDate: Date, count: number = 1): Promise<boolean> {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);

    const availabilities = await prisma.roomAvailability.findMany({
      where: {
        roomId,
        date: {
          gte: start,
          lt: end, // Usually we book till the night before checkout
        },
      },
    });

    // If we don't have records for some dates, assume not available (or check room existence)
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    if (availabilities.length < nights) return false;

    return availabilities.every(av => av.available >= count);
  }

  /**
   * Deducts rooms from availability
   */
  async deductAvailability(roomId: string, startDate: Date, endDate: Date, count: number = 1) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);

    await prisma.roomAvailability.updateMany({
      where: {
        roomId,
        date: {
          gte: start,
          lt: end,
        },
      },
      data: {
        available: {
          decrement: count,
        },
      },
    });
  }

  /**
   * Restores rooms to availability
   */
  async restoreAvailability(roomId: string, startDate: Date, endDate: Date, count: number = 1) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);

    await prisma.roomAvailability.updateMany({
      where: {
        roomId,
        date: {
          gte: start,
          lt: end,
        },
      },
      data: {
        available: {
          increment: count,
        },
      },
    });
  }
}

export const roomAvailabilityService = new RoomAvailabilityService();
