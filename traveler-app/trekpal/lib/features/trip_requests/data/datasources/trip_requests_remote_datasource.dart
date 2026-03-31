import '../../../../core/constants/api_constants.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/utils/extensions.dart';
import '../../domain/entities/trip_request_entities.dart';
import '../models/trip_requests_model.dart';

class TripRequestsRemoteDataSource {
  const TripRequestsRemoteDataSource(this._apiClient);

  final ApiClient _apiClient;

  Map<String, dynamic> _tripSpecsJson(TripSpecsEntity tripSpecs) {
    return <String, dynamic>{
      'stayType': tripSpecs.stayType,
      'roomCount': tripSpecs.roomCount,
      'roomPreference': tripSpecs.roomPreference,
      'transportRequired': tripSpecs.transportRequired,
      'transportType': tripSpecs.transportType,
      'mealPlan': tripSpecs.mealPlan,
      'specialRequirements': tripSpecs.specialRequirements,
    };
  }

  Map<String, dynamic> _offerDetailsJson(OfferDetailsEntity offerDetails) {
    return <String, dynamic>{
      'stayIncluded': offerDetails.stayIncluded,
      'stayDetails': offerDetails.stayDetails,
      'transportIncluded': offerDetails.transportIncluded,
      'transportDetails': offerDetails.transportDetails,
      'mealsIncluded': offerDetails.mealsIncluded,
      'mealDetails': offerDetails.mealDetails,
      'extras': offerDetails.extras,
    };
  }

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
    required TripSpecsEntity tripSpecs,
    num? budget,
    String? description,
  }) async {
    final String? cleanedDescription = description?.trim();
    final Map<String, dynamic> requestBody = <String, dynamic>{
      'destination': destination,
      'startDate': startDate.toApiDate(),
      'endDate': endDate.toApiDate(),
      'travelers': travelers,
      'tripSpecs': _tripSpecsJson(tripSpecs),
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

  Future<BidModel> getBidThread(String bidId) async {
    final dynamic data = await _apiClient.get(ApiConstants.bidById(bidId));
    return BidModel.fromJson(data as Map<String, dynamic>);
  }

  Future<BidModel> submitCounterOffer({
    required String bidId,
    required num price,
    required OfferDetailsEntity offerDetails,
    String? description,
  }) async {
    final String? cleanedDescription = description?.trim();
    final dynamic data = await _apiClient.post(
      ApiConstants.counterOffer(bidId),
      body: <String, dynamic>{
        'price': price,
        'offerDetails': _offerDetailsJson(offerDetails),
        if (cleanedDescription?.isNotEmpty ?? false)
          'description': cleanedDescription,
      },
    );

    return BidModel.fromJson(data as Map<String, dynamic>);
  }
}
