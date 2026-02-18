import {
  IAgencyRepository,
  IHotelRepository,
  IVehicleRepository,
  IUserRepository,
  PrismaAgencyRepository,
  PrismaHotelRepository,
  PrismaVehicleRepository,
  PrismaUserRepository,
} from '../../repositories';
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
 * Handles admin operations using repository pattern
 * 
 * NOTE: This is a PROOF OF CONCEPT for the repository pattern.
 * Other modules (auth, transport, etc.) still use direct Prisma access.
 * TODO: Gradually migrate other modules to use this pattern.
 */
export class AdminService {
  private agencyRepo: IAgencyRepository;
  private hotelRepo: IHotelRepository;
  private vehicleRepo: IVehicleRepository;
  private userRepo: IUserRepository;

  constructor(
    agencyRepo?: IAgencyRepository,
    hotelRepo?: IHotelRepository,
    vehicleRepo?: IVehicleRepository,
    userRepo?: IUserRepository
  ) {
    // Use dependency injection with defaults
    this.agencyRepo = agencyRepo || new PrismaAgencyRepository();
    this.hotelRepo = hotelRepo || new PrismaHotelRepository();
    this.vehicleRepo = vehicleRepo || new PrismaVehicleRepository();
    this.userRepo = userRepo || new PrismaUserRepository();
  }

  /**
   * Get all agencies with filtering and pagination
   */
  async getAgencies(
    page: number = 1,
    limit: number = 20,
    status?: string,
    search?: string
  ): Promise<{ agencies: AgencyResponse[]; total: number; page: number; limit: number }> {
    console.log('[Admin Service] Fetching agencies with filters:', {
      page,
      limit,
      status,
      search,
    });

    const filters = { page, limit, status: status as any, search };
    const [agencies, total] = await Promise.all([
      this.agencyRepo.findMany(filters),
      this.agencyRepo.count(filters),
    ]);

    console.log('[Admin Service] Found agencies:', {
      count: agencies.length,
      total,
    });

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
      hotelsCount: agency.hotelsCount || 0,
      vehiclesCount: agency.vehiclesCount || 0,
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
    const agency = await this.agencyRepo.updateStatus(agencyId, APPROVAL_STATUS.APPROVED);

    // Refetch with counts
    const agencies = await this.agencyRepo.findMany({ page: 1, limit: 1 });
    const agencyWithCounts = agencies.find(a => a.id === agencyId) || agency;

    return {
      id: agencyWithCounts.id,
      email: agencyWithCounts.email,
      name: agencyWithCounts.name,
      phone: agencyWithCounts.phone,
      address: agencyWithCounts.address,
      license: agencyWithCounts.license,
      status: agencyWithCounts.status,
      createdAt: agencyWithCounts.createdAt,
      updatedAt: agencyWithCounts.updatedAt,
      hotelsCount: (agencyWithCounts as any).hotelsCount || 0,
      vehiclesCount: (agencyWithCounts as any).vehiclesCount || 0,
    };
  }

  /**
   * Reject an agency
   */
  async rejectAgency(agencyId: string, reason?: string): Promise<AgencyResponse> {
    const agency = await this.agencyRepo.updateStatus(agencyId, APPROVAL_STATUS.REJECTED);

    // Refetch with counts
    const agencies = await this.agencyRepo.findMany({ page: 1, limit: 1 });
    const agencyWithCounts = agencies.find(a => a.id === agencyId) || agency;

    return {
      id: agencyWithCounts.id,
      email: agencyWithCounts.email,
      name: agencyWithCounts.name,
      phone: agencyWithCounts.phone,
      address: agencyWithCounts.address,
      license: agencyWithCounts.license,
      status: agencyWithCounts.status,
      createdAt: agencyWithCounts.createdAt,
      updatedAt: agencyWithCounts.updatedAt,
      hotelsCount: (agencyWithCounts as any).hotelsCount || 0,
      vehiclesCount: (agencyWithCounts as any).vehiclesCount || 0,
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
    const filters = { page, limit, status: status as any, search };
    const [hotels, total] = await Promise.all([
      this.hotelRepo.findMany(filters),
      this.hotelRepo.count(filters),
    ]);

    const hotelsResponse: HotelResponse[] = hotels.map((hotel) => ({
      id: hotel.id,
      agencyId: hotel.agencyId,
      agencyName: hotel.agencyName || '',
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
      roomsCount: hotel.roomsCount || 0,
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
    const hotel = await this.hotelRepo.updateStatus(hotelId, APPROVAL_STATUS.APPROVED);

    // Refetch with relations
    const hotels = await this.hotelRepo.findMany({ page: 1, limit: 1 });
    const hotelWithRelations = hotels.find(h => h.id === hotelId) || hotel;

    return {
      id: hotelWithRelations.id,
      agencyId: hotelWithRelations.agencyId,
      agencyName: (hotelWithRelations as any).agencyName || '',
      name: hotelWithRelations.name,
      description: hotelWithRelations.description,
      address: hotelWithRelations.address,
      city: hotelWithRelations.city,
      country: hotelWithRelations.country,
      rating: hotelWithRelations.rating,
      status: hotelWithRelations.status,
      images: hotelWithRelations.images,
      amenities: hotelWithRelations.amenities,
      createdAt: hotelWithRelations.createdAt,
      roomsCount: (hotelWithRelations as any).roomsCount || 0,
    };
  }

  /**
   * Reject a hotel
   */
  async rejectHotel(hotelId: string, reason?: string): Promise<HotelResponse> {
    const hotel = await this.hotelRepo.updateStatus(hotelId, APPROVAL_STATUS.REJECTED);

    // Refetch with relations
    const hotels = await this.hotelRepo.findMany({ page: 1, limit: 1 });
    const hotelWithRelations = hotels.find(h => h.id === hotelId) || hotel;

    return {
      id: hotelWithRelations.id,
      agencyId: hotelWithRelations.agencyId,
      agencyName: (hotelWithRelations as any).agencyName || '',
      name: hotelWithRelations.name,
      description: hotelWithRelations.description,
      address: hotelWithRelations.address,
      city: hotelWithRelations.city,
      country: hotelWithRelations.country,
      rating: hotelWithRelations.rating,
      status: hotelWithRelations.status,
      images: hotelWithRelations.images,
      amenities: hotelWithRelations.amenities,
      createdAt: hotelWithRelations.createdAt,
      roomsCount: (hotelWithRelations as any).roomsCount || 0,
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
    const filters = { page, limit, status: status as any, search };
    const [vehicles, total] = await Promise.all([
      this.vehicleRepo.findMany(filters),
      this.vehicleRepo.count(filters),
    ]);

    const vehiclesResponse: VehicleResponse[] = vehicles.map((vehicle) => ({
      id: vehicle.id,
      agencyId: vehicle.agencyId,
      agencyName: vehicle.agencyName || '',
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
    const vehicle = await this.vehicleRepo.updateStatus(vehicleId, APPROVAL_STATUS.APPROVED);

    // Refetch with relations
    const vehicles = await this.vehicleRepo.findMany({ page: 1, limit: 1 });
    const vehicleWithRelations = vehicles.find(v => v.id === vehicleId) || vehicle;

    return {
      id: vehicleWithRelations.id,
      agencyId: vehicleWithRelations.agencyId,
      agencyName: (vehicleWithRelations as any).agencyName || '',
      type: vehicleWithRelations.type,
      make: vehicleWithRelations.make,
      model: vehicleWithRelations.model,
      year: vehicleWithRelations.year,
      capacity: vehicleWithRelations.capacity,
      pricePerDay: vehicleWithRelations.pricePerDay,
      status: vehicleWithRelations.status,
      isAvailable: vehicleWithRelations.isAvailable,
      images: vehicleWithRelations.images,
      createdAt: vehicleWithRelations.createdAt,
    };
  }

  /**
   * Reject a vehicle
   */
  async rejectVehicle(vehicleId: string, reason?: string): Promise<VehicleResponse> {
    const vehicle = await this.vehicleRepo.updateStatus(vehicleId, APPROVAL_STATUS.REJECTED);

    // Refetch with relations
    const vehicles = await this.vehicleRepo.findMany({ page: 1, limit: 1 });
    const vehicleWithRelations = vehicles.find(v => v.id === vehicleId) || vehicle;

    return {
      id: vehicleWithRelations.id,
      agencyId: vehicleWithRelations.agencyId,
      agencyName: (vehicleWithRelations as any).agencyName || '',
      type: vehicleWithRelations.type,
      make: vehicleWithRelations.make,
      model: vehicleWithRelations.model,
      year: vehicleWithRelations.year,
      capacity: vehicleWithRelations.capacity,
      pricePerDay: vehicleWithRelations.pricePerDay,
      status: vehicleWithRelations.status,
      isAvailable: vehicleWithRelations.isAvailable,
      images: vehicleWithRelations.images,
      createdAt: vehicleWithRelations.createdAt,
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
    const filters = { page, limit, search };
    const [users, total] = await Promise.all([
      this.userRepo.findMany(filters),
      this.userRepo.count(filters),
    ]);

    const usersResponse: UserResponse[] = users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      cnic: user.cnic,
      cnicVerified: user.cnicVerified,
      createdAt: user.createdAt,
      bookingsCount: user.bookingsCount || 0,
      tripRequestsCount: user.tripRequestsCount || 0,
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
   * Uses real PostgreSQL data via repositories
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
      this.userRepo.count(),
      this.agencyRepo.count(),
      this.agencyRepo.count({ status: APPROVAL_STATUS.APPROVED }),
      this.agencyRepo.count({ status: APPROVAL_STATUS.PENDING }),
      this.hotelRepo.count(),
      this.hotelRepo.count({ status: APPROVAL_STATUS.APPROVED }),
      this.hotelRepo.count({ status: APPROVAL_STATUS.PENDING }),
      this.vehicleRepo.count(),
      this.vehicleRepo.count({ status: APPROVAL_STATUS.APPROVED }),
      this.vehicleRepo.count({ status: APPROVAL_STATUS.PENDING }),
      prisma.booking.count(), // Booking repo not created yet
      prisma.booking.findMany({ select: { totalAmount: true } }),
      this.userRepo.countRecentRegistrations(7),
      prisma.agency.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
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

  /**
   * Get revenue chart data (last 6 months)
   * Returns monthly revenue aggregated from bookings
   */
  async getRevenueChartData(range: string = '6months'): Promise<{ month: string; revenue: number }[]> {
    const months = 6; // TODO: Parse range parameter
    const data: { month: string; revenue: number }[] = [];

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

      const bookings = await prisma.booking.findMany({
        where: {
          createdAt: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
        select: { totalAmount: true },
      });

      const revenue = bookings.reduce((sum, b) => sum + b.totalAmount, 0);

      data.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
        revenue,
      });
    }

    return data;
  }

  /**
   * Get bookings chart data (last 6 months)
   * Returns monthly booking counts
   */
  async getBookingsChartData(range: string = '6months'): Promise<{ month: string; bookings: number }[]> {
    const months = 6; // TODO: Parse range parameter
    const data: { month: string; bookings: number }[] = [];

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

      const count = await prisma.booking.count({
        where: {
          createdAt: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
      });

      data.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
        bookings: count,
      });
    }

    return data;
  }

  /**
   * Get user growth data (last 6 months)
   * Returns cumulative user count by month
   */
  async getUserGrowthData(range: string = '6months'): Promise<{ month: string; users: number }[]> {
    const months = 6; // TODO: Parse range parameter
    const data: { month: string; users: number }[] = [];

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

      const count = await prisma.user.count({
        where: {
          createdAt: {
            lte: monthEnd,
          },
        },
      });

      data.push({
        month: monthEnd.toLocaleDateString('en-US', { month: 'short' }),
        users: count,
      });
    }

    return data;
  }
}

// Export singleton instance
export const adminService = new AdminService();
