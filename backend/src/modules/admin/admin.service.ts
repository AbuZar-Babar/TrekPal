import { prisma } from '../../config/database';
import { APPROVAL_STATUS } from '../../config/constants';
import {
  AgencyResponse,
  HotelResponse,
  VehicleResponse,
  UserResponse,
  DashboardStats,
} from './admin.types';

/**
 * Admin Service
 * Handles admin operations
 */
export class AdminService {
  /**
   * Get all agencies with filtering and pagination
   */
  async getAgencies(
    page: number = 1,
    limit: number = 20,
    status?: string,
    search?: string
  ): Promise<{ agencies: AgencyResponse[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { license: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [agencies, total] = await Promise.all([
      prisma.agency.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              hotels: true,
              vehicles: true,
            },
          },
        },
      }),
      prisma.agency.count({ where }),
    ]);

    const agenciesResponse: AgencyResponse[] = agencies.map((agency) => ({
      id: agency.id,
      email: agency.email,
      name: agency.name,
      phone: agency.phone,
      address: agency.address,
      license: agency.license,
      status: agency.status,
      createdAt: agency.createdAt,
      updatedAt: agency.updatedAt,
      hotelsCount: agency._count.hotels,
      vehiclesCount: agency._count.vehicles,
    }));

    return {
      agencies: agenciesResponse,
      total,
      page,
      limit,
    };
  }

  /**
   * Approve an agency
   */
  async approveAgency(agencyId: string, reason?: string): Promise<AgencyResponse> {
    const agency = await prisma.agency.update({
      where: { id: agencyId },
      data: {
        status: APPROVAL_STATUS.APPROVED,
      },
      include: {
        _count: {
          select: {
            hotels: true,
            vehicles: true,
          },
        },
      },
    });

    return {
      id: agency.id,
      email: agency.email,
      name: agency.name,
      phone: agency.phone,
      address: agency.address,
      license: agency.license,
      status: agency.status,
      createdAt: agency.createdAt,
      updatedAt: agency.updatedAt,
      hotelsCount: agency._count.hotels,
      vehiclesCount: agency._count.vehicles,
    };
  }

  /**
   * Reject an agency
   */
  async rejectAgency(agencyId: string, reason?: string): Promise<AgencyResponse> {
    const agency = await prisma.agency.update({
      where: { id: agencyId },
      data: {
        status: APPROVAL_STATUS.REJECTED,
      },
      include: {
        _count: {
          select: {
            hotels: true,
            vehicles: true,
          },
        },
      },
    });

    return {
      id: agency.id,
      email: agency.email,
      name: agency.name,
      phone: agency.phone,
      address: agency.address,
      license: agency.license,
      status: agency.status,
      createdAt: agency.createdAt,
      updatedAt: agency.updatedAt,
      hotelsCount: agency._count.hotels,
      vehiclesCount: agency._count.vehicles,
    };
  }

  /**
   * Get all hotels with filtering and pagination
   */
  async getHotels(
    page: number = 1,
    limit: number = 20,
    status?: string,
    search?: string
  ): Promise<{ hotels: HotelResponse[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [hotels, total] = await Promise.all([
      prisma.hotel.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          agency: {
            select: {
              name: true,
            },
          },
          _count: {
            select: {
              rooms: true,
            },
          },
        },
      }),
      prisma.hotel.count({ where }),
    ]);

    const hotelsResponse: HotelResponse[] = hotels.map((hotel) => ({
      id: hotel.id,
      agencyId: hotel.agencyId,
      agencyName: hotel.agency.name,
      name: hotel.name,
      description: hotel.description,
      address: hotel.address,
      city: hotel.city,
      country: hotel.country,
      rating: hotel.rating,
      status: hotel.status,
      images: hotel.images,
      amenities: hotel.amenities,
      createdAt: hotel.createdAt,
      roomsCount: hotel._count.rooms,
    }));

    return {
      hotels: hotelsResponse,
      total,
      page,
      limit,
    };
  }

  /**
   * Approve a hotel
   */
  async approveHotel(hotelId: string, reason?: string): Promise<HotelResponse> {
    const hotel = await prisma.hotel.update({
      where: { id: hotelId },
      data: {
        status: APPROVAL_STATUS.APPROVED,
      },
      include: {
        agency: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            rooms: true,
          },
        },
      },
    });

    return {
      id: hotel.id,
      agencyId: hotel.agencyId,
      agencyName: hotel.agency.name,
      name: hotel.name,
      description: hotel.description,
      address: hotel.address,
      city: hotel.city,
      country: hotel.country,
      rating: hotel.rating,
      status: hotel.status,
      images: hotel.images,
      amenities: hotel.amenities,
      createdAt: hotel.createdAt,
      roomsCount: hotel._count.rooms,
    };
  }

  /**
   * Reject a hotel
   */
  async rejectHotel(hotelId: string, reason?: string): Promise<HotelResponse> {
    const hotel = await prisma.hotel.update({
      where: { id: hotelId },
      data: {
        status: APPROVAL_STATUS.REJECTED,
      },
      include: {
        agency: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            rooms: true,
          },
        },
      },
    });

    return {
      id: hotel.id,
      agencyId: hotel.agencyId,
      agencyName: hotel.agency.name,
      name: hotel.name,
      description: hotel.description,
      address: hotel.address,
      city: hotel.city,
      country: hotel.country,
      rating: hotel.rating,
      status: hotel.status,
      images: hotel.images,
      amenities: hotel.amenities,
      createdAt: hotel.createdAt,
      roomsCount: hotel._count.rooms,
    };
  }

  /**
   * Get all vehicles with filtering and pagination
   */
  async getVehicles(
    page: number = 1,
    limit: number = 20,
    status?: string,
    search?: string
  ): Promise<{ vehicles: VehicleResponse[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { make: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
        { type: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [vehicles, total] = await Promise.all([
      prisma.vehicle.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          agency: {
            select: {
              name: true,
            },
          },
        },
      }),
      prisma.vehicle.count({ where }),
    ]);

    const vehiclesResponse: VehicleResponse[] = vehicles.map((vehicle) => ({
      id: vehicle.id,
      agencyId: vehicle.agencyId,
      agencyName: vehicle.agency.name,
      type: vehicle.type,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      capacity: vehicle.capacity,
      pricePerDay: vehicle.pricePerDay,
      status: vehicle.status,
      isAvailable: vehicle.isAvailable,
      images: vehicle.images,
      createdAt: vehicle.createdAt,
    }));

    return {
      vehicles: vehiclesResponse,
      total,
      page,
      limit,
    };
  }

  /**
   * Approve a vehicle
   */
  async approveVehicle(vehicleId: string, reason?: string): Promise<VehicleResponse> {
    const vehicle = await prisma.vehicle.update({
      where: { id: vehicleId },
      data: {
        status: APPROVAL_STATUS.APPROVED,
      },
      include: {
        agency: {
          select: {
            name: true,
          },
        },
      },
    });

    return {
      id: vehicle.id,
      agencyId: vehicle.agencyId,
      agencyName: vehicle.agency.name,
      type: vehicle.type,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      capacity: vehicle.capacity,
      pricePerDay: vehicle.pricePerDay,
      status: vehicle.status,
      isAvailable: vehicle.isAvailable,
      images: vehicle.images,
      createdAt: vehicle.createdAt,
    };
  }

  /**
   * Reject a vehicle
   */
  async rejectVehicle(vehicleId: string, reason?: string): Promise<VehicleResponse> {
    const vehicle = await prisma.vehicle.update({
      where: { id: vehicleId },
      data: {
        status: APPROVAL_STATUS.REJECTED,
      },
      include: {
        agency: {
          select: {
            name: true,
          },
        },
      },
    });

    return {
      id: vehicle.id,
      agencyId: vehicle.agencyId,
      agencyName: vehicle.agency.name,
      type: vehicle.type,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      capacity: vehicle.capacity,
      pricePerDay: vehicle.pricePerDay,
      status: vehicle.status,
      isAvailable: vehicle.isAvailable,
      images: vehicle.images,
      createdAt: vehicle.createdAt,
    };
  }

  /**
   * Get all users with pagination
   */
  async getUsers(
    page: number = 1,
    limit: number = 20,
    search?: string
  ): Promise<{ users: UserResponse[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              bookings: true,
              tripRequests: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    const usersResponse: UserResponse[] = users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      cnic: user.cnic,
      cnicVerified: user.cnicVerified,
      createdAt: user.createdAt,
      bookingsCount: user._count.bookings,
      tripRequestsCount: user._count.tripRequests,
    }));

    return {
      users: usersResponse,
      total,
      page,
      limit,
    };
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    const [
      totalUsers,
      totalAgencies,
      approvedAgencies,
      pendingAgencies,
      totalHotels,
      approvedHotels,
      pendingHotels,
      totalVehicles,
      approvedVehicles,
      pendingVehicles,
      totalBookings,
      bookings,
      recentUsers,
      recentAgencies,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.agency.count(),
      prisma.agency.count({ where: { status: APPROVAL_STATUS.APPROVED } }),
      prisma.agency.count({ where: { status: APPROVAL_STATUS.PENDING } }),
      prisma.hotel.count(),
      prisma.hotel.count({ where: { status: APPROVAL_STATUS.APPROVED } }),
      prisma.hotel.count({ where: { status: APPROVAL_STATUS.PENDING } }),
      prisma.vehicle.count(),
      prisma.vehicle.count({ where: { status: APPROVAL_STATUS.APPROVED } }),
      prisma.vehicle.count({ where: { status: APPROVAL_STATUS.PENDING } }),
      prisma.booking.count(),
      prisma.booking.findMany({
        select: { totalAmount: true },
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
      }),
      prisma.agency.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
      }),
    ]);

    const totalRevenue = bookings.reduce((sum, booking) => sum + booking.totalAmount, 0);

    return {
      totalUsers,
      totalAgencies,
      approvedAgencies,
      pendingAgencies,
      totalHotels,
      approvedHotels,
      pendingHotels,
      totalVehicles,
      approvedVehicles,
      pendingVehicles,
      totalBookings,
      totalRevenue,
      recentRegistrations: {
        users: recentUsers,
        agencies: recentAgencies,
      },
    };
  }
}

export const adminService = new AdminService();
