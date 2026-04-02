import '../entities/package_offer_entity.dart';

abstract class PackagesRepository {
  Future<List<PackageOfferEntity>> getPackages();

  Future<String> applyToPackage({
    required String packageId,
    required DateTime startDate,
  });
}
