import '../../../../core/constants/api_constants.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/utils/extensions.dart';
import '../models/trip_requests_model.dart';

class TripRequestsRemoteDataSource {
  const TripRequestsRemoteDataSource(this._apiClient);

  final ApiClient _apiClient;

  Future<List<TripRequestModel>> getTripRequests() async {
    final dynamic data = await _apiClient.get(ApiConstants.tripRequests);
    final Map<String, dynamic> payload = data as Map<String, dynamic>;
    final List<dynamic> items =
        payload['tripRequests'] as List<dynamic>? ?? <dynamic>[];

    return items
        .map(
          (dynamic item) =>
              TripRequestModel.fromJson(item as Map<String, dynamic>),
        )
        .toList();
  }

  Future<TripRequestModel> createTripRequest({
    required String destination,
    required DateTime startDate,
    required DateTime endDate,
    required int travelers,
    num? budget,
    String? description,
  }) async {
    final String? cleanedDescription = description?.trim();
    final Map<String, dynamic> requestBody = <String, dynamic>{
      'destination': destination,
      'startDate': startDate.toApiDate(),
      'endDate': endDate.toApiDate(),
      'travelers': travelers,
    };
    if (budget != null) {
      requestBody['budget'] = budget;
    }
    if (cleanedDescription?.isNotEmpty ?? false) {
      requestBody['description'] = cleanedDescription;
    }

    final dynamic data = await _apiClient.post(
      ApiConstants.tripRequests,
      body: requestBody,
    );

    return TripRequestModel.fromJson(data as Map<String, dynamic>);
  }

  Future<List<BidModel>> getBids(String tripRequestId) async {
    final dynamic data = await _apiClient.get(
      ApiConstants.tripRequestBids(tripRequestId),
    );
    final List<dynamic> items = data as List<dynamic>? ?? <dynamic>[];

    return items
        .map((dynamic item) => BidModel.fromJson(item as Map<String, dynamic>))
        .toList();
  }
}
