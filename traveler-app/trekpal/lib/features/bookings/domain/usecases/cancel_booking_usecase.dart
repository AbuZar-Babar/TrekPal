import '../entities/booking_entities.dart';
import '../repositories/bookings_repository.dart';

class CancelBookingUseCase {
  const CancelBookingUseCase(this._repository);

  final BookingsRepository _repository;

  Future<BookingEntity> call(String bookingId) {
    return _repository.cancelBooking(bookingId);
  }
}
