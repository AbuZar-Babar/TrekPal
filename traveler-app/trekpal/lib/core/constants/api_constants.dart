import 'dart:io';

import 'package:flutter/foundation.dart';

class ApiConstants {
  static const String _defaultBaseUrl =
      'https://trekpal-backend-api.onrender.com/api';

  static String get baseUrl {
    const String override = String.fromEnvironment(
      'API_BASE_URL',
      defaultValue: '',
    );
    if (override.isNotEmpty) {
      return override;
    }

    return _defaultBaseUrl;
  }

  static const String login = '/auth/login';
  static const String registerTraveler = '/auth/register/user';
  static const String authProfile = '/auth/profile';
  static const String usersProfile = '/users/profile';
  static const String usersProfileAvatar = '/users/profile/avatar';
  static const String travelerKyc = '/users/profile/kyc';

  static const String tripRequests = '/trip-requests';
  static const String bids = '/bids';
  static const String bookings = '/bookings';
  static const String packages = '/packages';
  static const String chat = '/chat';

  static String tripRequestById(String id) => '$tripRequests/$id';
  static String tripRequestBids(String tripRequestId) =>
      '$bids/trip-request/$tripRequestId';
  static String bidById(String bidId) => '$bids/$bidId';
  static String counterOffer(String bidId) => '$bids/$bidId/counteroffer';
  static String acceptBid(String bidId) => '$bids/$bidId/accept';
  static String bookingById(String bookingId) => '$bookings/$bookingId';
  static String applyPackage(String packageId) => '$packages/$packageId/apply';
  static String get chatRooms => '$chat/rooms';
  static String chatRoomById(String roomId) => '$chat/rooms/$roomId';
  static String chatRoomMessages(String roomId) => '$chat/rooms/$roomId/messages';
  static String chatRoomByPackage(String packageId) => '$chat/package/$packageId';

  static String get socketUrl {
    final Uri uri = Uri.parse(baseUrl);
    final List<String> segments = List<String>.from(uri.pathSegments);
    if (segments.isNotEmpty && segments.last == 'api') {
      segments.removeLast();
    }

    final String socketPath = segments.isEmpty ? '' : '/${segments.join('/')}';
    return uri.replace(path: socketPath, query: null, fragment: null).toString();
  }

  static String get connectionHint {
    if (kIsWeb) {
      return 'Web builds use the live Render backend by default. Override API_BASE_URL if you want to target a local or alternate backend.';
    }

    if (Platform.isAndroid) {
      return 'Android builds use the live Render backend by default. Override API_BASE_URL if you want to target a local emulator host or another backend.';
    }

    return 'Desktop builds use the live Render backend by default. Override API_BASE_URL if you want to target a local or alternate backend.';
  }
}
