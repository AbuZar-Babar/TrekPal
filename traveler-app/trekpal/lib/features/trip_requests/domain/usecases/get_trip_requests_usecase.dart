import '../entities/trip_request_entities.dart';
import '../repositories/trip_requests_repository.dart';

class GetTripRequestsUseCase {
  const GetTripRequestsUseCase(this._repository);

  final TripRequestsRepository _repository;

  Future<List<TripRequestEntity>> call() => _repository.getTripRequests();
}
