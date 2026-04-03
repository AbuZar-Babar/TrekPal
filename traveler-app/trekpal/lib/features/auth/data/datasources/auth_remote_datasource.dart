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
    required TravelerRegistrationInput input,
  }) async {
    final dynamic data = await _apiClient.post(
      ApiConstants.registerTraveler,
      authenticated: false,
      body: <String, dynamic>{
        'name': input.name,
        'email': input.email,
        'password': input.password,
        'phone': input.phone.trim(),
        'dateOfBirth': input.dateOfBirth.toIso8601String(),
        'gender': input.gender,
        'address': input.address.trim(),
      },
    );

    return AuthSessionModel.fromJson(data as Map<String, dynamic>);
  }

  Future<AuthUserModel> fetchProfile() async {
    final dynamic data = await _apiClient.get(ApiConstants.usersProfile);
    return AuthUserModel.fromJson(data as Map<String, dynamic>);
  }

  Future<AuthUserModel> updateProfile(TravelerProfileUpdate update) async {
    final dynamic data = await _apiClient.put(
      ApiConstants.usersProfile,
      body: <String, dynamic>{
        if (update.name != null) 'name': update.name,
        if (update.phone != null) 'phone': update.phone,
        if (update.address != null) 'residentialAddress': update.address,
      },
    );

    return AuthUserModel.fromJson(data as Map<String, dynamic>);
  }

  Future<AuthUserModel> uploadAvatar(ProfileImageUpload upload) async {
    final dynamic data = await _apiClient.postMultipart(
      ApiConstants.usersProfileAvatar,
      fields: const <String, String>{},
      files: <MultipartFilePayload>[
        MultipartFilePayload(
          fieldName: 'image',
          fileName: upload.fileName,
          bytes: upload.bytes,
          mimeType: upload.mimeType,
        ),
      ],
    );

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
          mimeType: submission.cnicFrontImage.mimeType,
        ),
        MultipartFilePayload(
          fieldName: submission.selfieImage.fieldName,
          fileName: submission.selfieImage.fileName,
          bytes: submission.selfieImage.bytes,
          mimeType: submission.selfieImage.mimeType,
        ),
      ],
    );
  }
}
