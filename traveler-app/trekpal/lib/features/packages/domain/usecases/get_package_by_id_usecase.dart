import '../entities/package_offer_entity.dart';
import '../repositories/packages_repository.dart';

class GetPackageByIdUseCase {
  const GetPackageByIdUseCase(this._repository);

  final PackagesRepository _repository;

  Future<PackageOfferEntity> call(String packageId) {
    return _repository.getPackageById(packageId);
  }
}
