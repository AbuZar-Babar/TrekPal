import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../../../core/constants/api_constants.dart';
import '../../../../core/errors/exceptions.dart';
import '../models/vehicle_model.dart';

abstract class TransportRemoteDataSource {
  Future<List<VehicleModel>> getVehicles({String? search, String? type});
  Future<VehicleModel> getVehicleById(String id);
}

class TransportRemoteDataSourceImpl implements TransportRemoteDataSource {
  final http.Client client;

  TransportRemoteDataSourceImpl({required this.client});

  @override
  Future<List<VehicleModel>> getVehicles({String? search, String? type}) async {
    final queryParams = {
      if (search != null) 'search': search,
      if (type != null) 'type': type,
      'status': 'APPROVED',
    };

    final uri = Uri.parse('${ApiConstants.baseUrl}${ApiConstants.transport}')
        .replace(queryParameters: queryParams);

    final response = await client.get(
      uri,
      headers: {'Content-Type': 'application/json'},
    );

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      final List vehicles = data['data']['vehicles'] ?? [];
      return vehicles.map((v) => VehicleModel.fromJson(v)).toList();
    } else {
      throw ServerException();
    }
  }

  @override
  Future<VehicleModel> getVehicleById(String id) async {
    final response = await client.get(
      Uri.parse('${ApiConstants.baseUrl}${ApiConstants.transport}/$id'),
      headers: {'Content-Type': 'application/json'},
    );

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      return VehicleModel.fromJson(data['data']);
    } else {
      throw ServerException();
    }
  }
}
