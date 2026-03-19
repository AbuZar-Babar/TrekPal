import '../../../../core/constants/api_constants.dart';
import '../../../../core/network/api_client.dart';
import '../models/auth_model.dart';

class AuthRemoteDataSource {
  const AuthRemoteDataSource(this._apiClient);

  final ApiClient _apiClient;

  Future<AuthSessionModel> login({
    required String email,
    required String password,
  }) async {
    final dynamic data = await _apiClient.post(
      ApiConstants.login,
      authenticated: false,
      body: <String, dynamic>{'email': email, 'password': password},
    );

    return AuthSessionModel.fromJson(data as Map<String, dynamic>);
  }

  Future<AuthSessionModel> registerTraveler({
    required String name,
    required String email,
    required String password,
    String? phone,
    String? cnic,
  }) async {
    final dynamic data = await _apiClient.post(
      ApiConstants.registerTraveler,
      authenticated: false,
      body: <String, dynamic>{
        'name': name,
        'email': email,
        'password': password,
        if (phone != null && phone.trim().isNotEmpty) 'phone': phone.trim(),
        if (cnic != null && cnic.trim().isNotEmpty)
          'cnic': cnic.replaceAll(RegExp(r'\D'), ''),
      },
    );

    return AuthSessionModel.fromJson(data as Map<String, dynamic>);
  }

  Future<void> verifyCnic({required String cnic, String? cnicImageUrl}) async {
    await _apiClient.post(
      ApiConstants.verifyCnic,
      body: <String, dynamic>{
        'cnic': cnic.replaceAll(RegExp(r'\D'), ''),
        if (cnicImageUrl != null && cnicImageUrl.trim().isNotEmpty)
          'cnicImage': cnicImageUrl.trim(),
      },
    );
  }
}
