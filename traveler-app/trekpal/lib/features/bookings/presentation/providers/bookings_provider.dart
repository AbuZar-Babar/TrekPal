import 'package:flutter/foundation.dart';

import '../../domain/entities/booking_entities.dart';
import '../../domain/repositories/bookings_repository.dart';
import '../../domain/usecases/accept_bid_usecase.dart';
import '../../domain/usecases/get_bookings_usecase.dart';

class BookingsProvider extends ChangeNotifier {
  BookingsProvider({
    required GetBookingsUseCase getBookingsUseCase,
    required AcceptBidUseCase acceptBidUseCase,
    required BookingsRepository bookingsRepository,
  }) : _getBookingsUseCase = getBookingsUseCase,
       _acceptBidUseCase = acceptBidUseCase,
       _bookingsRepository = bookingsRepository;

  final GetBookingsUseCase _getBookingsUseCase;
  final AcceptBidUseCase _acceptBidUseCase;
  final BookingsRepository _bookingsRepository;

  List<BookingEntity> _bookings = <BookingEntity>[];
  BookingEntity? _selectedBooking;
  bool _isLoading = false;
  String? _errorMessage;

  List<BookingEntity> get bookings => _bookings;
  BookingEntity? get selectedBooking => _selectedBooking;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  BookingEntity? bookingForPackage(String packageId) {
    return _bookings.cast<BookingEntity?>().firstWhere(
      (BookingEntity? booking) =>
          booking?.packageId == packageId && booking?.status != 'CANCELLED',
      orElse: () => null,
    );
  }

  Future<void> fetchBookings({bool force = false}) async {
    if (_bookings.isNotEmpty && !force) {
      return;
    }

    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _bookings = await _getBookingsUseCase();
    } catch (error) {
      _errorMessage = _readableError(error);
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> refreshFromBookingLiveEvent({
    required String bookingId,
  }) async {
    await fetchBookings(force: true);

    if (_selectedBooking?.id == bookingId) {
      try {
        await fetchBookingById(bookingId);
      } catch (_) {}
    }
  }

  Future<BookingEntity> fetchBookingById(String bookingId) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _selectedBooking = await _bookingsRepository.getBookingById(bookingId);
      return _selectedBooking!;
    } catch (error) {
      _errorMessage = _readableError(error);
      final BookingEntity? fallbackBooking = _bookings.cast<BookingEntity?>()
          .firstWhere(
            (BookingEntity? booking) => booking?.id == bookingId,
            orElse: () => null,
          );
      if (fallbackBooking != null) {
        _selectedBooking = fallbackBooking;
        return fallbackBooking;
      }
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<String> acceptBid(String bidId) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final String bookingId = await _acceptBidUseCase(bidId);
      _bookings = await _getBookingsUseCase();
      return bookingId;
    } catch (error) {
      _errorMessage = _readableError(error);
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<BookingEntity> cancelBooking(String bookingId) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final BookingEntity updated = await _bookingsRepository.cancelBooking(
        bookingId,
      );

      _selectedBooking = updated;
      final int index = _bookings.indexWhere(
        (BookingEntity booking) => booking.id == bookingId,
      );
      if (index != -1) {
        final List<BookingEntity> next = List<BookingEntity>.from(_bookings);
        next[index] = updated;
        _bookings = next;
      }

      return updated;
    } catch (error) {
      _errorMessage = _readableError(error);
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  String _readableError(Object error) {
    final String text = error.toString();
    if (text.startsWith('Exception: ')) {
      return text.substring('Exception: '.length);
    }
    return text;
  }
}
