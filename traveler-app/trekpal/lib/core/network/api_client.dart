import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:http/http.dart' as http;

import '../constants/api_constants.dart';
import '../constants/app_constants.dart';
import '../error/exceptions.dart';
import 'api_interceptor.dart';

class MultipartFilePayload {
  const MultipartFilePayload({
    required this.fieldName,
    required this.fileName,
    required this.bytes,
  });

  final String fieldName;
  final String fileName;
  final List<int> bytes;
}

class ApiClient {
  ApiClient({
    required Future<String?> Function() tokenProvider,
    http.Client? httpClient,
  }) : _tokenProvider = tokenProvider,
       _httpClient = httpClient ?? http.Client();

  final Future<String?> Function() _tokenProvider;
  final http.Client _httpClient;

  Future<dynamic> get(
    String path, {
    Map<String, dynamic>? queryParameters,
    bool authenticated = true,
  }) {
    return _send(
      'GET',
      path,
      queryParameters: queryParameters,
      authenticated: authenticated,
    );
  }

  Future<dynamic> post(
    String path, {
    Map<String, dynamic>? body,
    bool authenticated = true,
  }) {
    return _send('POST', path, body: body, authenticated: authenticated);
  }

  Future<dynamic> postMultipart(
    String path, {
    required Map<String, String> fields,
    List<MultipartFilePayload> files = const <MultipartFilePayload>[],
    bool authenticated = true,
  }) async {
    try {
      final Uri uri = Uri.parse('${ApiConstants.baseUrl}$path');
      final String? token = authenticated ? await _tokenProvider() : null;
      final http.MultipartRequest request = http.MultipartRequest('POST', uri)
        ..headers.addAll(<String, String>{
          'Accept': 'application/json',
          if (token != null && token.isNotEmpty)
            'Authorization': 'Bearer $token',
        })
        ..fields.addAll(fields);

      for (final MultipartFilePayload file in files) {
        request.files.add(
          http.MultipartFile.fromBytes(
            file.fieldName,
            file.bytes,
            filename: file.fileName,
          ),
        );
      }

      final http.StreamedResponse streamedResponse = await request
          .send()
          .timeout(AppConstants.apiTimeout);
      final http.Response response = await http.Response.fromStream(
        streamedResponse,
      );

      return _handleResponse(response);
    } on SocketException {
      throw NetworkException(
        'Unable to reach TrekPal services at ${ApiConstants.baseUrl}. Check that the backend is running and the API_BASE_URL matches this device.',
      );
    } on http.ClientException {
      throw NetworkException(
        'Unable to reach TrekPal services at ${ApiConstants.baseUrl}. Check that the backend is running and the API_BASE_URL matches this device.',
      );
    } on TimeoutException {
      throw NetworkException(
        'The request to ${ApiConstants.baseUrl} timed out after ${AppConstants.apiTimeout.inSeconds}s. This usually means the backend URL is unreachable from this device.',
      );
    }
  }

  Future<dynamic> put(
    String path, {
    Map<String, dynamic>? body,
    bool authenticated = true,
  }) {
    return _send('PUT', path, body: body, authenticated: authenticated);
  }

  Future<dynamic> delete(
    String path, {
    Map<String, dynamic>? body,
    bool authenticated = true,
  }) {
    return _send('DELETE', path, body: body, authenticated: authenticated);
  }

  Future<dynamic> _send(
    String method,
    String path, {
    Map<String, dynamic>? body,
    Map<String, dynamic>? queryParameters,
    required bool authenticated,
  }) async {
    try {
      final Uri uri = Uri.parse('${ApiConstants.baseUrl}$path').replace(
        queryParameters: queryParameters?.map(
          (String key, dynamic value) => MapEntry(key, '$value'),
        ),
      );

      final String? token = authenticated ? await _tokenProvider() : null;
      final Map<String, String> headers = ApiInterceptor.buildHeaders(
        token: token,
      );

      late http.Response response;
      switch (method) {
        case 'GET':
          response = await _httpClient
              .get(uri, headers: headers)
              .timeout(AppConstants.apiTimeout);
          break;
        case 'POST':
          response = await _httpClient
              .post(
                uri,
                headers: headers,
                body: jsonEncode(body ?? <String, dynamic>{}),
              )
              .timeout(AppConstants.apiTimeout);
          break;
        case 'PUT':
          response = await _httpClient
              .put(
                uri,
                headers: headers,
                body: jsonEncode(body ?? <String, dynamic>{}),
              )
              .timeout(AppConstants.apiTimeout);
          break;
        case 'DELETE':
          response = await _httpClient
              .delete(
                uri,
                headers: headers,
                body: body == null ? null : jsonEncode(body),
              )
              .timeout(AppConstants.apiTimeout);
          break;
        default:
          throw const ApiException('Unsupported HTTP method');
      }

      return _handleResponse(response);
    } on SocketException {
      throw NetworkException(
        'Unable to reach TrekPal services at ${ApiConstants.baseUrl}. Check that the backend is running and the API_BASE_URL matches this device.',
      );
    } on http.ClientException {
      throw NetworkException(
        'Unable to reach TrekPal services at ${ApiConstants.baseUrl}. Check that the backend is running and the API_BASE_URL matches this device.',
      );
    } on TimeoutException {
      throw NetworkException(
        'The request to ${ApiConstants.baseUrl} timed out after ${AppConstants.apiTimeout.inSeconds}s. This usually means the backend URL is unreachable from this device.',
      );
    }
  }

  dynamic _handleResponse(http.Response response) {
    if (response.statusCode < 200 || response.statusCode >= 300) {
      final ApiException exception = ApiInterceptor.parseException(
        statusCode: response.statusCode,
        body: response.body,
      );

      if (exception.statusCode == 401) {
        throw UnauthorizedException(exception.message);
      }

      throw exception;
    }

    if (response.body.trim().isEmpty) {
      return null;
    }

    final dynamic decoded = jsonDecode(response.body);
    if (decoded is Map<String, dynamic>) {
      return ApiInterceptor.unwrapData(decoded);
    }

    return decoded;
  }
}
