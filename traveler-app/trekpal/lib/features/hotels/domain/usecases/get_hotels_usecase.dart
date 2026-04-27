import '../entities/hotel_entities.dart';
import '../repositories/hotels_repository.dart';

class GetHotelsUseCase {
  final HotelsRepository repository;

  GetHotelsUseCase(this.repository);

  Future<List<HotelEntity>> call({String? search, String? city}) {
    return repository.getHotels(search: search, city: city);
  }
}
