import '../entities/trip_request_entities.dart';
import '../repositories/trip_requests_repository.dart';

class ViewBidsUseCase {
  const ViewBidsUseCase(this._repository);

  final TripRequestsRepository _repository;

  Future<List<BidEntity>> call(String tripRequestId) {
    return _repository.getBids(tripRequestId);
  }
}
