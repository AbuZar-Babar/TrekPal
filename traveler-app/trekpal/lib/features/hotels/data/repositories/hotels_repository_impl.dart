import '../datasources/hotels_remote_datasource.dart';
import '../../domain/entities/hotel_entities.dart';
import '../../domain/repositories/hotels_repository.dart';

class HotelsRepositoryImpl implements HotelsRepository {
  final HotelsRemoteDataSource remoteDataSource;

  HotelsRepositoryImpl({required this.remoteDataSource});

  @override
  Future<List<HotelEntity>> getHotels({String? search, String? city}) {
    return remoteDataSource.getHotels(search: search, city: city);
  }

  @override
  Future<HotelEntity> getHotelById(String id) {
    return remoteDataSource.getHotelById(id);
  }
}
