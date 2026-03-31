import '../entities/trip_request_entities.dart';
import '../repositories/trip_requests_repository.dart';

class CreateTripRequestUseCase {
  const CreateTripRequestUseCase(this._repository);

  final TripRequestsRepository _repository;

  Future<TripRequestEntity> call({
    required String destination,
    required DateTime startDate,
    required DateTime endDate,
    required int travelers,
    required TripSpecsEntity tripSpecs,
    num? budget,
    String? description,
  }) {
    return _repository.createTripRequest(
      destination: destination,
      startDate: startDate,
      endDate: endDate,
      travelers: travelers,
      tripSpecs: tripSpecs,
      budget: budget,
      description: description,
    );
  }
}
