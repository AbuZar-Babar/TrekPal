import '../../../../core/constants/api_constants.dart';
import '../../../../core/network/api_client.dart';
import '../models/bookings_model.dart';

class BookingsRemoteDataSource {
  const BookingsRemoteDataSource(this._apiClient);

  final ApiClient _apiClient;

  Future<List<BookingModel>> getBookings() async {
    final dynamic data = await _apiClient.get(ApiConstants.bookings);
    final Map<String, dynamic> payload = data as Map<String, dynamic>;
    final List<dynamic> items =
        payload['bookings'] as List<dynamic>? ?? <dynamic>[];

    return items
        .map(
          (dynamic item) => BookingModel.fromJson(item as Map<String, dynamic>),
        )
        .toList();
  }

  Future<BookingModel> getBookingById(String bookingId) async {
    final dynamic data = await _apiClient.get(
      ApiConstants.bookingById(bookingId),
    );
    return BookingModel.fromJson(data as Map<String, dynamic>);
  }

  Future<String> acceptBid(String bidId) async {
    final dynamic data = await _apiClient.post(ApiConstants.acceptBid(bidId));
    final Map<String, dynamic> payload = data as Map<String, dynamic>;
    return payload['bookingId'] as String? ?? '';
  }

  Future<BookingModel> cancelBooking(String bookingId) async {
    final dynamic data = await _apiClient.post(
      ApiConstants.cancelBooking(bookingId),
    );
    return BookingModel.fromJson(data as Map<String, dynamic>);
  }
}
