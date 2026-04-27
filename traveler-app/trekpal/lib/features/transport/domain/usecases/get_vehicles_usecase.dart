import '../entities/vehicle_entities.dart';
import '../repositories/transport_repository.dart';

class GetVehiclesUseCase {
  final TransportRepository repository;

  GetVehiclesUseCase(this.repository);

  Future<List<VehicleEntity>> call({String? search, String? type}) {
    return repository.getVehicles(search: search, type: type);
  }
}
