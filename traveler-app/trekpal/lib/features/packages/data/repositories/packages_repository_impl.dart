import '../../domain/entities/package_offer_entity.dart';
import '../../domain/repositories/packages_repository.dart';
import '../datasources/packages_remote_datasource.dart';

class PackagesRepositoryImpl implements PackagesRepository {
  const PackagesRepositoryImpl(this._remoteDataSource);

  final PackagesRemoteDataSource _remoteDataSource;

  @override
  Future<List<PackageOfferEntity>> getPackages() {
    return _remoteDataSource.getPackages();
  }

  @override
  Future<PackageOfferEntity> getPackageById(String packageId) {
    return _remoteDataSource.getPackageById(packageId);
  }

  @override
  Future<String> applyToPackage({
    required String packageId,
    required DateTime startDate,
  }) {
    return _remoteDataSource.applyToPackage(
      packageId: packageId,
      startDate: startDate,
    );
  }
}
