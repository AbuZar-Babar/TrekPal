import '../entities/hotel_entities.dart';

abstract class HotelsRepository {
  Future<List<HotelEntity>> getHotels({String? search, String? city});
  Future<HotelEntity> getHotelById(String id);
}
