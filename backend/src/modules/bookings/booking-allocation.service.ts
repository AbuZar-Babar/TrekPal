import { prisma } from '../../config/database';
import { BOOKING_STATUS } from '../../config/constants';

type BookingConflictCode = 'VEHICLE_UNAVAILABLE' | 'DRIVER_UNAVAILABLE';

export class BookingAllocationService {
  private buildConflict(message: string, code: BookingConflictCode): Error & { code: BookingConflictCode } {
    const error = new Error(message) as Error & { code: BookingConflictCode };
    error.code = code;
    return error;
  }

  async assertVehicleAndDriverAvailability(input: {
    bookingId?: string;
    vehicleId: string | null;
    driverId: string | null;
    startDate: Date;
    endDate: Date;
  }): Promise<void> {
    if (!input.vehicleId) {
      return;
    }

    const overlapWhere = {
      NOT: input.bookingId ? { id: input.bookingId } : undefined,
      status: BOOKING_STATUS.CONFIRMED,
      startDate: {
        lt: input.endDate,
      },
      endDate: {
        gt: input.startDate,
      },
    };

    const vehicleConflict = await prisma.booking.findFirst({
      where: {
        ...overlapWhere,
        vehicleId: input.vehicleId,
      },
      select: { id: true },
    });

    if (vehicleConflict) {
      throw this.buildConflict('Selected vehicle is already booked for the requested dates', 'VEHICLE_UNAVAILABLE');
    }

    if (!input.driverId) {
      return;
    }

    const driverConflict = await prisma.booking.findFirst({
      where: {
        ...overlapWhere,
        driverId: input.driverId,
      },
      select: { id: true },
    });

    if (driverConflict) {
      throw this.buildConflict('Assigned driver is already booked for the requested dates', 'DRIVER_UNAVAILABLE');
    }
  }

  async getVehicleDriverSnapshot(vehicleId: string | null): Promise<{
    driverId: string | null;
    driverNameSnapshot: string | null;
    driverPhoneSnapshot: string | null;
    vehicleNumberSnapshot: string | null;
  }> {
    if (!vehicleId) {
      return {
        driverId: null,
        driverNameSnapshot: null,
        driverPhoneSnapshot: null,
        vehicleNumberSnapshot: null,
      };
    }

    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      select: {
        driverId: true,
        vehicleNumber: true,
        driver: {
          select: {
            name: true,
            phone: true,
          },
        },
      },
    });

    if (!vehicle) {
      throw new Error('Selected vehicle was not found');
    }

    return {
      driverId: vehicle.driverId,
      driverNameSnapshot: vehicle.driver.name,
      driverPhoneSnapshot: vehicle.driver.phone,
      vehicleNumberSnapshot: vehicle.vehicleNumber,
    };
  }
}

export const bookingAllocationService = new BookingAllocationService();
