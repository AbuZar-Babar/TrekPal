import '../entities/trip_request_entities.dart';

abstract class TripRequestsRepository {
  Future<List<TripRequestEntity>> getTripRequests();

  Future<TripRequestEntity> createTripRequest({
    required String destination,
    required DateTime startDate,
    required DateTime endDate,
    required int travelers,
    required TripSpecsEntity tripSpecs,
    num? budget,
    String? description,
  });

  Future<List<BidEntity>> getBids(String tripRequestId);

  Future<BidEntity> getBidThread(String bidId);

  Future<BidEntity> submitCounterOffer({
    required String bidId,
    required num price,
    required OfferDetailsEntity offerDetails,
    String? description,
  });
}
