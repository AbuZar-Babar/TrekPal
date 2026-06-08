import { prisma } from '../../config/database';
import { BOOKING_STATUS } from '../../config/constants';

type BookingConflictCode = 'VEHICLE_UNAVAILABLE' | 'DRIVER_UNAVAILABLE';

export class BookingAllocationService {
  private buildConflict(message: string, code: BookingConflictCode): Error & { code: BookingConflictCode } {
    const error = new Error(message) as Error & { code: BookingConflictCode };
    error.code = code;
    return error;
  }

  /**
   * Compute the date ranges that a vehicle is considered "occupied" based on mode.
   * - Dedicated: The full range startDate..endDate
   * - Transfer: Only the first day (departure) and the last day (return). In other words,
   *   two transfer-mode bookings conflict only if they share a departure or return date.
   */
  private getOccupiedDateRanges(
    startDate: Date,
    endDate: Date,
    dedicatedVehicle: boolean,
  ): Array<{ start: Date; end: Date }> {
    if (dedicatedVehicle) {
      // Occupies the full range
      return [{ start: startDate, end: endDate }];
    }
    // Transfer: occupies only the departure day and the return day
    // We model each as a 1-day range so overlap detection works cleanly
    const departureEnd = new Date(startDate);
    departureEnd.setDate(departureEnd.getDate() + 1);
    const returnStart = new Date(endDate);
    returnStart.setDate(returnStart.getDate() - 1);
    const ranges: Array<{ start: Date; end: Date }> = [
      { start: startDate, end: departureEnd },
    ];
    // Only add return leg if it's a different day from departure
    if (returnStart.getTime() > startDate.getTime()) {
      ranges.push({ start: returnStart, end: endDate });
    }
    return ranges;
  }

  async assertVehicleAndDriverAvailability(input: {
    bookingId?: string;
    packageId?: string;
    vehicleId: string | null;
    driverId: string | null;
    startDate: Date;
    endDate: Date;
    dedicatedVehicle?: boolean;
  }): Promise<void> {
    if (!input.vehicleId) {
      return;
    }

    const dedicated = input.dedicatedVehicle ?? true;

    const baseExclude: any = {
      NOT: [
        ...(input.bookingId ? [{ id: input.bookingId }] : []),
        ...(input.packageId
          ? [{ packageId: input.packageId }]
          : []),
      ],
      status: BOOKING_STATUS.CONFIRMED,
    };

    // Remove NOT if array is empty (prisma doesn't like NOT: [])
    if (baseExclude.NOT.length === 0) {
      delete baseExclude.NOT;
    }

    // Get the dates this booking occupies
    const occupiedRanges = this.getOccupiedDateRanges(input.startDate, input.endDate, dedicated);

    // For each occupied range, check if there's a conflicting booking
    for (const range of occupiedRanges) {
      const vehicleConflict = await prisma.booking.findFirst({
        where: {
          ...baseExclude,
          vehicleId: input.vehicleId,
          startDate: { lt: range.end },
          endDate: { gt: range.start },
        },
        select: { id: true, dedicatedVehicle: true, startDate: true, endDate: true },
      });

      if (vehicleConflict) {
        throw this.buildConflict(
          'Selected vehicle is already booked for the requested dates',
          'VEHICLE_UNAVAILABLE',
        );
      }
    }

    if (!input.driverId) {
      return;
    }

    for (const range of occupiedRanges) {
      const driverConflict = await prisma.booking.findFirst({
        where: {
          ...baseExclude,
          driverId: input.driverId,
          startDate: { lt: range.end },
          endDate: { gt: range.start },
        },
        select: { id: true },
      });

      if (driverConflict) {
        throw this.buildConflict(
          'Assigned driver is already booked for the requested dates',
          'DRIVER_UNAVAILABLE',
        );
      }
    }
  }

  /**
   * Check if a vehicle is available for given dates/mode without throwing.
   * Returns { available: true } or { available: false, reason: string }.
   */
  async checkVehicleAvailability(input: {
    vehicleId: string;
    driverId: string | null;
    startDate: Date;
    endDate: Date;
    dedicatedVehicle: boolean;
    excludeBookingId?: string;
    excludePackageId?: string;
  }): Promise<{ available: boolean; reason?: string }> {
    try {
      await this.assertVehicleAndDriverAvailability({
        vehicleId: input.vehicleId,
        driverId: input.driverId,
        startDate: input.startDate,
        endDate: input.endDate,
        dedicatedVehicle: input.dedicatedVehicle,
        bookingId: input.excludeBookingId,
        packageId: input.excludePackageId,
      });
      return { available: true };
    } catch (e: any) {
      return { available: false, reason: e.message };
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
