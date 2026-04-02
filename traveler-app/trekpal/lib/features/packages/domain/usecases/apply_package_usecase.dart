import '../repositories/packages_repository.dart';

class ApplyPackageUseCase {
  const ApplyPackageUseCase(this._repository);

  final PackagesRepository _repository;

  Future<String> call({
    required String packageId,
    required DateTime startDate,
  }) {
    return _repository.applyToPackage(
      packageId: packageId,
      startDate: startDate,
    );
  }
}
