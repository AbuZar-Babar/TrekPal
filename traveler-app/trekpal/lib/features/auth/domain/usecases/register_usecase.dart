import '../entities/auth_entities.dart';
import '../repositories/auth_repository.dart';

class RegisterUseCase {
  const RegisterUseCase(this._repository);

  final AuthRepository _repository;

  Future<AuthSession> call({required TravelerRegistrationInput input}) {
    return _repository.registerTraveler(input: input);
  }
}
