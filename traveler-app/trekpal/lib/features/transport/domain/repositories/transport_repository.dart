import '../entities/vehicle_entities.dart';

abstract class TransportRepository {
  Future<List<VehicleEntity>> getVehicles({String? search, String? type});
  Future<VehicleEntity> getVehicleById(String id);
}
