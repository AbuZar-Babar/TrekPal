import '../../domain/entities/booking_entities.dart';
import '../../domain/repositories/bookings_repository.dart';
import '../datasources/bookings_remote_datasource.dart';

class BookingsRepositoryImpl implements BookingsRepository {
  const BookingsRepositoryImpl(this._remoteDataSource);

  final BookingsRemoteDataSource _remoteDataSource;

  @override
  Future<List<BookingEntity>> getBookings() => _remoteDataSource.getBookings();

  @override
  Future<BookingEntity> getBookingById(String bookingId) {
    return _remoteDataSource.getBookingById(bookingId);
  }

  @override
  Future<String> acceptBid(String bidId) => _remoteDataSource.acceptBid(bidId);
}
