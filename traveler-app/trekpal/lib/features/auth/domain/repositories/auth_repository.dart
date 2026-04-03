import '../entities/auth_entities.dart';

abstract class AuthRepository {
  Future<AuthSession> login({required String email, required String password});

  Future<AuthSession> registerTraveler({
    required TravelerRegistrationInput input,
  });

  Future<AuthUser> fetchProfile();

  Future<AuthUser> updateProfile(TravelerProfileUpdate update);

  Future<AuthUser> uploadAvatar(ProfileImageUpload upload);

  Future<void> submitTravelerKyc(TravelerKycSubmission submission);

  Future<AuthSession?> restoreSession();

  Future<void> saveSession(AuthSession session);

  Future<void> logout();
}
