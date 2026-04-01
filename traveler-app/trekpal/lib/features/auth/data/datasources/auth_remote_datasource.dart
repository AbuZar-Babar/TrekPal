import '../../../../core/constants/api_constants.dart';
import '../../../../core/network/api_client.dart';
import '../../domain/entities/auth_entities.dart';
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
  }) async {
    final dynamic data = await _apiClient.post(
      ApiConstants.registerTraveler,
      authenticated: false,
      body: <String, dynamic>{
        'name': name,
        'email': email,
        'password': password,
        if (phone != null && phone.trim().isNotEmpty) 'phone': phone.trim(),
      },
    );

    return AuthSessionModel.fromJson(data as Map<String, dynamic>);
  }

  Future<AuthUserModel> fetchProfile() async {
    final dynamic data = await _apiClient.get(ApiConstants.authProfile);
    return AuthUserModel.fromJson(data as Map<String, dynamic>);
  }

  Future<void> submitTravelerKyc(TravelerKycSubmission submission) async {
    await _apiClient.postMultipart(
      ApiConstants.travelerKyc,
      fields: <String, String>{
        'cnic': submission.cnic.replaceAll(RegExp(r'\D'), ''),
        'dateOfBirth': submission.dateOfBirth.toIso8601String(),
        'city': submission.city.trim(),
        'residentialAddress': submission.residentialAddress.trim(),
        'emergencyContactName': submission.emergencyContactName.trim(),
        'emergencyContactPhone': submission.emergencyContactPhone.trim(),
      },
      files: <MultipartFilePayload>[
        MultipartFilePayload(
          fieldName: submission.cnicFrontImage.fieldName,
          fileName: submission.cnicFrontImage.fileName,
          bytes: submission.cnicFrontImage.bytes,
        ),
        MultipartFilePayload(
          fieldName: submission.selfieImage.fieldName,
          fileName: submission.selfieImage.fileName,
          bytes: submission.selfieImage.bytes,
        ),
      ],
    );
  }
}
