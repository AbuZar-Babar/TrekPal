import '../entities/package_offer_entity.dart';
import '../repositories/packages_repository.dart';

class GetPackagesUseCase {
  const GetPackagesUseCase(this._repository);

  final PackagesRepository _repository;

  Future<List<PackageOfferEntity>> call() => _repository.getPackages();
}
