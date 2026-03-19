// TODO: Implement form validators
// Email, password, CNIC, phone number validation

class AppValidators {
  static String? requiredText(
    String? value, {
    String fieldName = 'This field',
  }) {
    if (value == null || value.trim().isEmpty) {
      return '$fieldName is required';
    }

    return null;
  }

  static String? email(String? value) {
    final String? required = requiredText(value, fieldName: 'Email');
    if (required != null) {
      return required;
    }

    final RegExp emailRegex = RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$');
    if (!emailRegex.hasMatch(value!.trim())) {
      return 'Enter a valid email address';
    }

    return null;
  }

  static String? password(String? value) {
    final String? required = requiredText(value, fieldName: 'Password');
    if (required != null) {
      return required;
    }

    if (value!.trim().length < 8) {
      return 'Password must be at least 8 characters';
    }

    return null;
  }

  static String? cnic(String? value) {
    final String? required = requiredText(value, fieldName: 'CNIC');
    if (required != null) {
      return required;
    }

    final String digitsOnly = value!.replaceAll(RegExp(r'\D'), '');
    if (digitsOnly.length != 13) {
      return 'CNIC must be 13 digits';
    }

    return null;
  }

  static String? positiveInteger(String? value, {String fieldName = 'Value'}) {
    final String? required = requiredText(value, fieldName: fieldName);
    if (required != null) {
      return required;
    }

    final int? parsed = int.tryParse(value!.trim());
    if (parsed == null || parsed <= 0) {
      return '$fieldName must be greater than zero';
    }

    return null;
  }

  static String? budget(String? value) {
    if (value == null || value.trim().isEmpty) {
      return null;
    }

    final num? parsed = num.tryParse(value.trim());
    if (parsed == null || parsed < 0) {
      return 'Enter a valid budget';
    }

    return null;
  }
}
