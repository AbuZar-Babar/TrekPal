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

  Future<String> applyToPackage({
    required String packageId,
    required DateTime startDate,
  }) async {
    final dynamic data = await _apiClient.post(
      ApiConstants.applyPackage(packageId),
      body: <String, dynamic>{
        'startDate': startDate.toIso8601String(),
      },
    );

    final Map<String, dynamic> payload = data as Map<String, dynamic>;
    return payload['bookingId'] as String? ?? '';
  }
}
