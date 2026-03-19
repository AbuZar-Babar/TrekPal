import '../entities/trip_request_entities.dart';

abstract class TripRequestsRepository {
  Future<List<TripRequestEntity>> getTripRequests();

  Future<TripRequestEntity> createTripRequest({
    required String destination,
    required DateTime startDate,
    required DateTime endDate,
    required int travelers,
    num? budget,
    String? description,
  });

  Future<List<BidEntity>> getBids(String tripRequestId);
}
