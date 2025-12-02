/// Route constants for navigation
class RouteConstants {
  // Auth routes
  static const String login = '/login';
  static const String register = '/register';
  static const String cnicVerification = '/cnic-verification';

  // Home
  static const String home = '/home';

  // Trip Requests
  static const String tripRequests = '/trip-requests';
  static const String createTripRequest = '/trip-requests/create';
  static const String tripRequestDetails = '/trip-requests/:id';
  static const String bidsView = '/trip-requests/:id/bids';

  // Bookings
  static const String bookings = '/bookings';
  static const String bookingDetails = '/bookings/:id';

  // Hotels
  static const String hotelSearch = '/hotels/search';
  static const String hotelDetails = '/hotels/:id';
  static const String hotelBooking = '/hotels/:id/book';

  // Transport
  static const String transportSearch = '/transport/search';
  static const String transportBooking = '/transport/:id/book';

  // Chat
  static const String chatList = '/chat';
  static const String chatRoom = '/chat/:id';

  // Trip Groups
  static const String tripGroups = '/trip-groups';

  // Reviews
  static const String reviewForm = '/reviews/create';

  // Profile
  static const String profile = '/profile';
}

