import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../../../core/constants/api_constants.dart';
import '../../../../core/errors/exceptions.dart';
import '../models/hotels_model.dart';

abstract class HotelsRemoteDataSource {
  Future<List<HotelModel>> getHotels({String? search, String? city});
  Future<HotelModel> getHotelById(String id);
}

class HotelsRemoteDataSourceImpl implements HotelsRemoteDataSource {
  final http.Client client;

  HotelsRemoteDataSourceImpl({required this.client});

  @override
  Future<List<HotelModel>> getHotels({String? search, String? city}) async {
    final queryParams = {
      if (search != null) 'search': search,
      if (city != null) 'city': city,
      'status': 'APPROVED',
      'discovery': 'true',
    };

    final uri = Uri.parse('${ApiConstants.baseUrl}${ApiConstants.hotels}')
        .replace(queryParameters: queryParams);

    final response = await client.get(
      uri,
      headers: {'Content-Type': 'application/json'},
    );

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      final List hotels = data['data']['hotels'] ?? [];
      return hotels.map((h) => HotelModel.fromJson(h)).toList();
    } else {
      throw ServerException();
    }
  }

  @override
  Future<HotelModel> getHotelById(String id) async {
    final response = await client.get(
      Uri.parse('${ApiConstants.baseUrl}${ApiConstants.hotels}/$id'),
      headers: {'Content-Type': 'application/json'},
    );

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      return HotelModel.fromJson(data['data']);
    } else {
      throw ServerException();
    }
  }
}
