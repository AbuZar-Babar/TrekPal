// TODO: Implement useful extensions
// String, DateTime, BuildContext extensions

import 'package:intl/intl.dart';

extension DateTimeX on DateTime {
  String toApiDate() => DateFormat('yyyy-MM-dd').format(this);

  String toDisplayDate() => DateFormat('dd MMM yyyy').format(this);
}

extension StringX on String {
  String get sentenceCase {
    if (trim().isEmpty) {
      return this;
    }

    return '${this[0].toUpperCase()}${substring(1).toLowerCase()}';
  }
}
