class AppConstants {
  static const String appName = 'TrekPal';
  static const String appTagline =
      'Plan smarter journeys with verified agencies.';
  static const String appSignature = 'THE EDITORIAL VOYAGER';
  static const String appQuote =
      'The journey not only changes the destination, but the traveler within.';

  static const int defaultPageSize = 20;
  static const Duration apiTimeout = Duration(seconds: 15);

  static const List<String> tripRequestStatuses = <String>[
    'PENDING',
    'ACCEPTED',
    'CANCELLED',
  ];

  static const List<String> bookingStatuses = <String>[
    'PENDING',
    'CONFIRMED',
    'CANCELLED',
    'COMPLETED',
  ];
}
