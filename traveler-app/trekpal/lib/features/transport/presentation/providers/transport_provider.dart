import 'package:flutter/foundation.dart';
import '../../domain/entities/vehicle_entities.dart';
import '../../domain/usecases/get_vehicles_usecase.dart';

class TransportProvider extends ChangeNotifier {
  final GetVehiclesUseCase _getVehiclesUseCase;

  TransportProvider({required GetVehiclesUseCase getVehiclesUseCase})
      : _getVehiclesUseCase = getVehiclesUseCase;

  List<VehicleEntity> _vehicles = [];
  bool _isLoading = false;
  String? _errorMessage;

  List<VehicleEntity> get vehicles => _vehicles;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  Future<void> fetchVehicles({String? search, String? type}) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _vehicles = await _getVehiclesUseCase(search: search, type: type);
    } catch (e) {
      _errorMessage = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
