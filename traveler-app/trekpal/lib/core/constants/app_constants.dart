class AppConstants {
  static const String appName = 'TrekPal';
  static const String appTagline =
      'Plan smarter journeys with verified agencies.';

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
