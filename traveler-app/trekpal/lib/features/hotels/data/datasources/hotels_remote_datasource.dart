import '../../../../core/constants/api_constants.dart';
import '../../../../core/network/api_client.dart';
import '../models/hotels_model.dart';

abstract class HotelsRemoteDataSource {
  Future<List<HotelModel>> getHotels({String? search, String? city});
  Future<HotelModel> getHotelById(String id);
}

class HotelsRemoteDataSourceImpl implements HotelsRemoteDataSource {
  final ApiClient apiClient;

  HotelsRemoteDataSourceImpl({required this.apiClient});

  @override
  Future<List<HotelModel>> getHotels({String? search, String? city}) async {
    final queryParams = {
      if (search != null) 'search': search,
      if (city != null) 'city': city,
      'status': 'APPROVED',
      'discovery': 'true',
    };

    final dynamic data = await apiClient.get(
      ApiConstants.hotels,
      queryParameters: queryParams,
      authenticated: true,
    );
    final List hotels = (data as Map<String, dynamic>)['hotels'] ?? [];
    return hotels.map((h) => HotelModel.fromJson(h)).toList();
  }

  @override
  Future<HotelModel> getHotelById(String id) async {
    final dynamic data = await apiClient.get(
      '${ApiConstants.hotels}/$id',
      authenticated: true,
    );
    return HotelModel.fromJson(data as Map<String, dynamic>);
  }
}
