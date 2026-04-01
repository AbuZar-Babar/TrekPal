import '../entities/auth_entities.dart';

abstract class AuthRepository {
  Future<AuthSession> login({required String email, required String password});

  Future<AuthSession> registerTraveler({
    required String name,
    required String email,
    required String password,
    String? phone,
  });

  Future<AuthUser> fetchProfile();

  Future<void> submitTravelerKyc(TravelerKycSubmission submission);

  Future<AuthSession?> restoreSession();

  Future<void> saveSession(AuthSession session);

  Future<void> logout();
}
