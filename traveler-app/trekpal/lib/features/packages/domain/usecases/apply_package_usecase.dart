import '../repositories/packages_repository.dart';

class ApplyPackageUseCase {
  const ApplyPackageUseCase(this._repository);

  final PackagesRepository _repository;

  Future<String> call({
    required String packageId,
  }) {
    return _repository.applyToPackage(
      packageId: packageId,
    );
  }
}
