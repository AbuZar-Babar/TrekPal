import '../entities/trip_request_entities.dart';
import '../repositories/trip_requests_repository.dart';

class SubmitCounterOfferUseCase {
  const SubmitCounterOfferUseCase(this._repository);

  final TripRequestsRepository _repository;

  Future<BidEntity> call({
    required String bidId,
    required num price,
    required OfferDetailsEntity offerDetails,
    String? description,
  }) {
    return _repository.submitCounterOffer(
      bidId: bidId,
      price: price,
      offerDetails: offerDetails,
      description: description,
    );
  }
}
