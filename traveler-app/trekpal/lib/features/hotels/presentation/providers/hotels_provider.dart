import 'package:flutter/foundation.dart';
import '../../domain/entities/hotel_entities.dart';
import '../../domain/usecases/get_hotels_usecase.dart';

class HotelsProvider extends ChangeNotifier {
  final GetHotelsUseCase _getHotelsUseCase;

  HotelsProvider({required GetHotelsUseCase getHotelsUseCase})
      : _getHotelsUseCase = getHotelsUseCase;

  List<HotelEntity> _hotels = [];
  bool _isLoading = false;
  String? _errorMessage;

  List<HotelEntity> get hotels => _hotels;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  Future<void> fetchHotels({String? search, String? city}) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _hotels = await _getHotelsUseCase(search: search, city: city);
    } catch (e) {
      _errorMessage = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
