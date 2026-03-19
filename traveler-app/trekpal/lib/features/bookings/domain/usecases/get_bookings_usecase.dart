import '../entities/booking_entities.dart';
import '../repositories/bookings_repository.dart';

class GetBookingsUseCase {
  const GetBookingsUseCase(this._repository);

  final BookingsRepository _repository;

  Future<List<BookingEntity>> call() => _repository.getBookings();
}
