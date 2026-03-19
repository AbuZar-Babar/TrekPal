import '../repositories/bookings_repository.dart';

class AcceptBidUseCase {
  const AcceptBidUseCase(this._repository);

  final BookingsRepository _repository;

  Future<String> call(String bidId) => _repository.acceptBid(bidId);
}
