import '../entities/package_offer_entity.dart';

abstract class PackagesRepository {
  Future<List<PackageOfferEntity>> getPackages();

  Future<PackageOfferEntity> getPackageById(String packageId);

  Future<String> applyToPackage({
    required String packageId,
  });
}
