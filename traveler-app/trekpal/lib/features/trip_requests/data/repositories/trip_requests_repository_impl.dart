import '../../domain/entities/trip_request_entities.dart';
import '../../domain/repositories/trip_requests_repository.dart';
import '../datasources/trip_requests_remote_datasource.dart';

class TripRequestsRepositoryImpl implements TripRequestsRepository {
  const TripRequestsRepositoryImpl(this._remoteDataSource);

  final TripRequestsRemoteDataSource _remoteDataSource;

  @override
  Future<List<TripRequestEntity>> getTripRequests() {
    return _remoteDataSource.getTripRequests();
  }

  @override
  Future<TripRequestEntity> createTripRequest({
    required String destination,
    required DateTime startDate,
    required DateTime endDate,
    required int travelers,
    required TripSpecsEntity tripSpecs,
    num? budget,
    String? description,
  }) {
    return _remoteDataSource.createTripRequest(
      destination: destination,
      startDate: startDate,
      endDate: endDate,
      travelers: travelers,
      tripSpecs: tripSpecs,
      budget: budget,
      description: description,
    );
  }

  @override
  Future<List<BidEntity>> getBids(String tripRequestId) {
    return _remoteDataSource.getBids(tripRequestId);
  }

  @override
  Future<BidEntity> getBidThread(String bidId) {
    return _remoteDataSource.getBidThread(bidId);
  }

  @override
  Future<BidEntity> submitCounterOffer({
    required String bidId,
    required num price,
    required OfferDetailsEntity offerDetails,
    String? description,
  }) {
    return _remoteDataSource.submitCounterOffer(
      bidId: bidId,
      price: price,
      offerDetails: offerDetails,
      description: description,
    );
  }
}
