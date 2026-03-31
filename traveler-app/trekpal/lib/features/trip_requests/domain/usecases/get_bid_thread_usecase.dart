import '../entities/trip_request_entities.dart';
import '../repositories/trip_requests_repository.dart';

class GetBidThreadUseCase {
  const GetBidThreadUseCase(this._repository);

  final TripRequestsRepository _repository;

  Future<BidEntity> call(String bidId) => _repository.getBidThread(bidId);
}
