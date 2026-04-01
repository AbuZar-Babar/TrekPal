import '../entities/auth_entities.dart';
import '../repositories/auth_repository.dart';

class RegisterUseCase {
  const RegisterUseCase(this._repository);

  final AuthRepository _repository;

  Future<AuthSession> call({
    required String name,
    required String email,
    required String password,
    String? phone,
  }) {
    return _repository.registerTraveler(
      name: name,
      email: email,
      password: password,
      phone: phone,
    );
  }
}
