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

  static String? minLength(
    String? value, {
    required int min,
    String fieldName = 'This field',
  }) {
    final String? required = requiredText(value, fieldName: fieldName);
    if (required != null) {
      return required;
    }

    if (value!.trim().length < min) {
      return '$fieldName must be at least $min characters';
    }

    return null;
  }

  static String? maxLength(
    String? value, {
    required int max,
    String fieldName = 'This field',
  }) {
    if (value == null || value.trim().isEmpty) {
      return null;
    }

    if (value.trim().length > max) {
      return '$fieldName must be $max characters or less';
    }

    return null;
  }

  static String? phone(String? value, {String fieldName = 'Phone number'}) {
    final String? required = requiredText(value, fieldName: fieldName);
    if (required != null) {
      return required;
    }

    final String digitsOnly = value!.replaceAll(RegExp(r'\D'), '');
    if (digitsOnly.length < 5) {
      return '$fieldName must be at least 5 digits';
    }

    if (value.trim().length > 30) {
      return '$fieldName is too long';
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

  static String? integerLimit(
    String? value, {
    required int min,
    int? max,
    String fieldName = 'Value',
  }) {
    final String? required = requiredText(value, fieldName: fieldName);
    if (required != null) {
      return required;
    }

    final int? parsed = int.tryParse(value!.trim());
    if (parsed == null) {
      return '$fieldName must be a whole number';
    }

    if (parsed < min) {
      return '$fieldName must be at least $min';
    }

    if (max != null && parsed > max) {
      return '$fieldName must be $max or less';
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

  static String? dateOfBirth(DateTime? value) {
    if (value == null) {
      return 'Date of birth is required';
    }

    if (value.isAfter(DateTime.now())) {
      return 'Date of birth cannot be in the future';
    }

    return null;
  }
}
