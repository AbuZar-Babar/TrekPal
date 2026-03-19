import '../entities/auth_entities.dart';

abstract class AuthRepository {
  Future<AuthSession> login({required String email, required String password});

  Future<AuthSession> registerTraveler({
    required String name,
    required String email,
    required String password,
    String? phone,
    String? cnic,
  });

  Future<void> verifyCnic({required String cnic, String? cnicImageUrl});

  Future<AuthSession?> restoreSession();

  Future<void> logout();
}
