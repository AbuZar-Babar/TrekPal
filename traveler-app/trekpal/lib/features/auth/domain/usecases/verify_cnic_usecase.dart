import '../repositories/auth_repository.dart';

class VerifyCnicUseCase {
  const VerifyCnicUseCase(this._repository);

  final AuthRepository _repository;

  Future<void> call({required String cnic, String? cnicImageUrl}) {
    return _repository.verifyCnic(cnic: cnic, cnicImageUrl: cnicImageUrl);
  }
}
