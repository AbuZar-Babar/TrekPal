import '../../../../core/constants/api_constants.dart';
import '../../../../core/network/api_client.dart';
import '../models/vehicle_model.dart';

abstract class TransportRemoteDataSource {
  Future<List<VehicleModel>> getVehicles({String? search, String? type});
  Future<VehicleModel> getVehicleById(String id);
}

class TransportRemoteDataSourceImpl implements TransportRemoteDataSource {
  final ApiClient apiClient;

  TransportRemoteDataSourceImpl({required this.apiClient});

  @override
  Future<List<VehicleModel>> getVehicles({String? search, String? type}) async {
    final queryParams = {
      if (search != null) 'search': search,
      if (type != null) 'type': type,
      'status': 'APPROVED',
    };

    final dynamic data = await apiClient.get(
      ApiConstants.transport,
      queryParameters: queryParams,
      authenticated: true,
    );
    final List vehicles = (data as Map<String, dynamic>)['vehicles'] ?? [];
    return vehicles.map((v) => VehicleModel.fromJson(v)).toList();
  }

  @override
  Future<VehicleModel> getVehicleById(String id) async {
    final dynamic data = await apiClient.get(
      '${ApiConstants.transport}/$id',
      authenticated: true,
    );
    return VehicleModel.fromJson(data as Map<String, dynamic>);
  }
}
