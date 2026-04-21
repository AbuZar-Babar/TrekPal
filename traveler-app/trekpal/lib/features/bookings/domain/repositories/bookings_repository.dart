import '../entities/booking_entities.dart';

abstract class BookingsRepository {
  Future<List<BookingEntity>> getBookings();

  Future<BookingEntity> getBookingById(String bookingId);

  Future<String> acceptBid(String bidId);

  Future<BookingEntity> cancelBooking(String bookingId);
}
