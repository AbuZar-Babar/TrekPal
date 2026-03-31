// TODO: Implement formatters
// Date, currency, phone number formatting

import 'package:intl/intl.dart';

class AppFormatters {
  static String currency(num? value) {
    if (value == null) {
      return 'Budget open';
    }

    return NumberFormat.currency(
      locale: 'en_PK',
      symbol: 'PKR ',
      decimalDigits: 0,
    ).format(value);
  }

  static String date(DateTime value) => DateFormat('dd MMM yyyy').format(value);

  static String dateTime(DateTime value) =>
      DateFormat('dd MMM yyyy, hh:mm a').format(value);

  static String dateRange(DateTime start, DateTime end) {
    return '${date(start)} - ${date(end)}';
  }

  static String cnic(String input) {
    if (input.length != 13) {
      return input;
    }

    return '${input.substring(0, 5)}-${input.substring(5, 12)}-${input.substring(12)}';
  }
}
