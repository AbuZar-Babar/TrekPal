import 'dart:io';

import 'package:flutter/foundation.dart';

class ApiConstants {
  static String get baseUrl {
    const String override = String.fromEnvironment(
      'API_BASE_URL',
      defaultValue: '',
    );
    if (override.isNotEmpty) {
      return override;
    }

    if (kIsWeb) {
      return 'http://localhost:3000/api';
    }

    if (Platform.isAndroid) {
      return 'http://10.0.2.2:3000/api';
    }

    return 'http://localhost:3000/api';
  }

  static const String login = '/auth/login';
  static const String registerTraveler = '/auth/register/user';
  static const String verifyCnic = '/auth/verify-cnic';
  static const String authProfile = '/auth/profile';

  static const String tripRequests = '/trip-requests';
  static const String bids = '/bids';
  static const String bookings = '/bookings';

  static String tripRequestById(String id) => '$tripRequests/$id';
  static String tripRequestBids(String tripRequestId) =>
      '$bids/trip-request/$tripRequestId';
  static String acceptBid(String bidId) => '$bids/$bidId/accept';
  static String bookingById(String bookingId) => '$bookings/$bookingId';

  static String get connectionHint {
    if (kIsWeb) {
      return 'Web builds use localhost by default. Start the backend on this same machine or override API_BASE_URL.';
    }

    if (Platform.isAndroid) {
      return 'Android emulators use 10.0.2.2. If you are testing on a physical phone, override API_BASE_URL to your PC IP address.';
    }

    return 'Desktop builds use localhost by default. Make sure the backend is running on this machine or override API_BASE_URL.';
  }
}
