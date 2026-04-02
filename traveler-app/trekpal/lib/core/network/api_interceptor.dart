// TODO: Implement API interceptor for request/response handling
// Add authentication tokens, error handling, logging

import 'dart:convert';

import '../error/exceptions.dart';

class ApiInterceptor {
  static Map<String, String> buildHeaders({String? token}) {
    return <String, String>{
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      if (token != null && token.isNotEmpty) 'Authorization': 'Bearer $token',
    };
  }

  static dynamic unwrapData(Map<String, dynamic> body) {
    if (body.containsKey('data')) {
      return body['data'];
    }

    return body;
  }

  static String extractMessage(
    Map<String, dynamic> body, {
    String fallback = 'Request failed',
  }) {
    final dynamic details = body['details'];
    if (details is List) {
      for (final dynamic detail in details) {
        if (detail is Map<String, dynamic>) {
          final dynamic message = detail['message'];
          if (message is String && message.trim().isNotEmpty) {
            return message;
          }
        }
      }
    }

    final dynamic errors = body['errors'];
    if (errors is List) {
      for (final dynamic error in errors) {
        if (error is Map<String, dynamic>) {
          final dynamic message = error['message'];
          if (message is String && message.trim().isNotEmpty) {
            return message;
          }
        }
      }
    }

    final dynamic message = body['message'] ?? body['error'];
    if (message is String && message.trim().isNotEmpty) {
      return message;
    }

    return fallback;
  }

  static ApiException parseException({
    required int statusCode,
    required String body,
  }) {
    try {
      final dynamic decoded = jsonDecode(body);
      if (decoded is Map<String, dynamic>) {
        return ApiException(
          extractMessage(decoded, fallback: 'Request failed'),
          statusCode: statusCode,
        );
      }
    } catch (_) {
      if (body.trim().isNotEmpty) {
        return ApiException(body.trim(), statusCode: statusCode);
      }
    }

    if (statusCode == 401) {
      return const ApiException('Authentication required', statusCode: 401);
    }

    return ApiException(
      'Request failed with status $statusCode',
      statusCode: statusCode,
    );
  }
}
