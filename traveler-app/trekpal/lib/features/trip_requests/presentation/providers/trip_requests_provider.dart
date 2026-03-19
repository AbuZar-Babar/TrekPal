import 'package:flutter/foundation.dart';

import '../../domain/entities/trip_request_entities.dart';
import '../../domain/usecases/create_trip_request_usecase.dart';
import '../../domain/usecases/get_trip_requests_usecase.dart';
import '../../domain/usecases/view_bids_usecase.dart';

class TripRequestsProvider extends ChangeNotifier {
  TripRequestsProvider({
    required GetTripRequestsUseCase getTripRequestsUseCase,
    required CreateTripRequestUseCase createTripRequestUseCase,
    required ViewBidsUseCase viewBidsUseCase,
  }) : _getTripRequestsUseCase = getTripRequestsUseCase,
       _createTripRequestUseCase = createTripRequestUseCase,
       _viewBidsUseCase = viewBidsUseCase;

  final GetTripRequestsUseCase _getTripRequestsUseCase;
  final CreateTripRequestUseCase _createTripRequestUseCase;
  final ViewBidsUseCase _viewBidsUseCase;

  List<TripRequestEntity> _tripRequests = <TripRequestEntity>[];
  List<BidEntity> _currentBids = <BidEntity>[];
  bool _isLoading = false;
  bool _isSubmitting = false;
  bool _isBidsLoading = false;
  String? _errorMessage;

  List<TripRequestEntity> get tripRequests => _tripRequests;
  List<BidEntity> get currentBids => _currentBids;
  bool get isLoading => _isLoading;
  bool get isSubmitting => _isSubmitting;
  bool get isBidsLoading => _isBidsLoading;
  String? get errorMessage => _errorMessage;

  Future<void> fetchTripRequests({bool force = false}) async {
    if (_tripRequests.isNotEmpty && !force) {
      return;
    }

    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _tripRequests = await _getTripRequestsUseCase();
    } catch (error) {
      _errorMessage = _readableError(error);
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<TripRequestEntity> createTripRequest({
    required String destination,
    required DateTime startDate,
    required DateTime endDate,
    required int travelers,
    num? budget,
    String? description,
  }) async {
    _isSubmitting = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final TripRequestEntity created = await _createTripRequestUseCase(
        destination: destination,
        startDate: startDate,
        endDate: endDate,
        travelers: travelers,
        budget: budget,
        description: description,
      );
      _tripRequests = <TripRequestEntity>[created, ..._tripRequests];
      return created;
    } catch (error) {
      _errorMessage = _readableError(error);
      rethrow;
    } finally {
      _isSubmitting = false;
      notifyListeners();
    }
  }

  Future<List<BidEntity>> fetchBids(String tripRequestId) async {
    _isBidsLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _currentBids = await _viewBidsUseCase(tripRequestId);
      return _currentBids;
    } catch (error) {
      _errorMessage = _readableError(error);
      rethrow;
    } finally {
      _isBidsLoading = false;
      notifyListeners();
    }
  }

  void syncTripRequestStatus(String tripRequestId, String status) {
    _tripRequests = _tripRequests
        .map(
          (TripRequestEntity request) => request.id == tripRequestId
              ? TripRequestEntity(
                  id: request.id,
                  userId: request.userId,
                  userName: request.userName,
                  destination: request.destination,
                  startDate: request.startDate,
                  endDate: request.endDate,
                  budget: request.budget,
                  travelers: request.travelers,
                  description: request.description,
                  status: status,
                  bidsCount: request.bidsCount,
                  createdAt: request.createdAt,
                  updatedAt: DateTime.now(),
                )
              : request,
        )
        .toList();
    notifyListeners();
  }

  String _readableError(Object error) {
    final String text = error.toString();
    if (text.startsWith('Exception: ')) {
      return text.substring('Exception: '.length);
    }
    return text;
  }
}
