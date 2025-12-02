/// API constants for the TrekPal Traveler App
class ApiConstants {
  // Base URL
  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://localhost:3000/api',
  );

  // Auth endpoints
  static const String login = '/auth/login';
  static const String register = '/auth/register';
  static const String verifyCnic = '/auth/verify-cnic';
  static const String refreshToken = '/auth/refresh';

  // Trip Request endpoints
  static const String tripRequests = '/trip-requests';
  static const String createTripRequest = '/trip-requests';
  static const String getTripRequests = '/trip-requests';
  static const String getTripRequestBids = '/trip-requests/{id}/bids';

  // Booking endpoints
  static const String bookings = '/bookings';
  static const String acceptBid = '/bids/{id}/accept';

  // Hotel endpoints
  static const String hotels = '/hotels';
  static const String searchHotels = '/hotels/search';
  static const String bookHotel = '/hotels/{id}/book';

  // Transport endpoints
  static const String transport = '/transport';
  static const String searchTransport = '/transport/search';
  static const String bookTransport = '/transport/{id}/book';

  // Chat endpoints
  static const String chat = '/chat';
  static const String messages = '/chat/messages';

  // Trip Groups endpoints
  static const String tripGroups = '/trip-groups';
  static const String createGroup = '/trip-groups';
  static const String joinGroup = '/trip-groups/{id}/join';

  // Reviews endpoints
  static const String reviews = '/reviews';
  static const String createReview = '/reviews';

  // Profile endpoints
  static const String profile = '/users/profile';
  static const String updateProfile = '/users/profile';
}

