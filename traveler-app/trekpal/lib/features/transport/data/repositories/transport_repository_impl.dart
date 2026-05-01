import '../datasources/transport_remote_datasource.dart';
import '../../domain/entities/vehicle_entities.dart';
import '../../domain/repositories/transport_repository.dart';

class TransportRepositoryImpl implements TransportRepository {
  final TransportRemoteDataSource remoteDataSource;

  TransportRepositoryImpl({required this.remoteDataSource});

  @override
  Future<List<VehicleEntity>> getVehicles({String? search, String? type}) {
    return remoteDataSource.getVehicles(search: search, type: type);
  }

  @override
  Future<VehicleEntity> getVehicleById(String id) {
    return remoteDataSource.getVehicleById(id);
  }
}
