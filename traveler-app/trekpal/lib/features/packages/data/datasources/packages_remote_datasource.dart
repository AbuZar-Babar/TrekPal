import '../../../../core/constants/api_constants.dart';
import '../../../../core/network/api_client.dart';
import '../models/package_offer_model.dart';

class PackagesRemoteDataSource {
  const PackagesRemoteDataSource(this._apiClient);

  final ApiClient _apiClient;

  Future<List<PackageOfferModel>> getPackages() async {
    final dynamic data = await _apiClient.get(ApiConstants.packages);
    final Map<String, dynamic> payload = data as Map<String, dynamic>;
    final List<dynamic> items =
        payload['packages'] as List<dynamic>? ?? <dynamic>[];

    return items
        .map(
          (dynamic item) =>
              PackageOfferModel.fromJson(item as Map<String, dynamic>),
        )
        .toList();
  }

  Future<PackageOfferModel> getPackageById(String packageId) async {
    final dynamic data = await _apiClient.get(ApiConstants.packageById(packageId));
    return PackageOfferModel.fromJson(data as Map<String, dynamic>);
  }

  Future<String> applyToPackage({
    required String packageId,
  }) async {
    final dynamic data = await _apiClient.post(
      ApiConstants.applyPackage(packageId),
    );

    final Map<String, dynamic> payload = data as Map<String, dynamic>;
    return payload['bookingId'] as String? ?? '';
  }
}
