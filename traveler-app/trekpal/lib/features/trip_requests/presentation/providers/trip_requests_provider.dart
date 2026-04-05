import 'package:flutter/foundation.dart';

import '../../domain/entities/trip_request_entities.dart';
import '../../domain/usecases/create_trip_request_usecase.dart';
import '../../domain/usecases/get_bid_thread_usecase.dart';
import '../../domain/usecases/get_trip_requests_usecase.dart';
import '../../domain/usecases/submit_counter_offer_usecase.dart';
import '../../domain/usecases/view_bids_usecase.dart';

class TripRequestsProvider extends ChangeNotifier {
  TripRequestsProvider({
    required GetTripRequestsUseCase getTripRequestsUseCase,
    required CreateTripRequestUseCase createTripRequestUseCase,
    required ViewBidsUseCase viewBidsUseCase,
    required GetBidThreadUseCase getBidThreadUseCase,
    required SubmitCounterOfferUseCase submitCounterOfferUseCase,
  }) : _getTripRequestsUseCase = getTripRequestsUseCase,
       _createTripRequestUseCase = createTripRequestUseCase,
       _viewBidsUseCase = viewBidsUseCase,
       _getBidThreadUseCase = getBidThreadUseCase,
       _submitCounterOfferUseCase = submitCounterOfferUseCase;

  final GetTripRequestsUseCase _getTripRequestsUseCase;
  final CreateTripRequestUseCase _createTripRequestUseCase;
  final ViewBidsUseCase _viewBidsUseCase;
  final GetBidThreadUseCase _getBidThreadUseCase;
  final SubmitCounterOfferUseCase _submitCounterOfferUseCase;

  List<TripRequestEntity> _tripRequests = <TripRequestEntity>[];
  List<BidEntity> _currentBids = <BidEntity>[];
  BidEntity? _selectedBidThread;
  String? _activeTripRequestId;
  String? _activeBidId;
  bool _isLoading = false;
  bool _isSubmitting = false;
  bool _isBidsLoading = false;
  bool _isBidThreadLoading = false;
  bool _isNegotiating = false;
  String? _errorMessage;

  List<TripRequestEntity> get tripRequests => _tripRequests;
  List<BidEntity> get currentBids => _currentBids;
  BidEntity? get selectedBidThread => _selectedBidThread;
  bool get isLoading => _isLoading;
  bool get isSubmitting => _isSubmitting;
  bool get isBidsLoading => _isBidsLoading;
  bool get isBidThreadLoading => _isBidThreadLoading;
  bool get isNegotiating => _isNegotiating;
  String? get errorMessage => _errorMessage;

  void setActiveTripRequest(String? tripRequestId) {
    _activeTripRequestId = tripRequestId;
  }

  void setActiveBidThread(String? bidId) {
    _activeBidId = bidId;
  }

  TripRequestEntity? findTripRequestById(String tripRequestId) {
    for (final TripRequestEntity request in _tripRequests) {
      if (request.id == tripRequestId) {
        return request;
      }
    }
    return null;
  }

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
    required TripSpecsEntity tripSpecs,
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
        tripSpecs: tripSpecs,
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

  Future<BidEntity> fetchBidThread(String bidId) async {
    _isBidThreadLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final BidEntity bid = await _getBidThreadUseCase(bidId);
      _selectedBidThread = bid;
      _mergeBidIntoCurrentList(bid);
      return bid;
    } catch (error) {
      _errorMessage = _readableError(error);
      rethrow;
    } finally {
      _isBidThreadLoading = false;
      notifyListeners();
    }
  }

  Future<BidEntity> submitCounterOffer({
    required String bidId,
    required num price,
    required OfferDetailsEntity offerDetails,
    String? description,
  }) async {
    _isNegotiating = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final BidEntity updated = await _submitCounterOfferUseCase(
        bidId: bidId,
        price: price,
        offerDetails: offerDetails,
        description: description,
      );
      _selectedBidThread = updated;
      _mergeBidIntoCurrentList(updated);
      return updated;
    } catch (error) {
      _errorMessage = _readableError(error);
      rethrow;
    } finally {
      _isNegotiating = false;
      notifyListeners();
    }
  }

  void clearSelectedBidThread() {
    _selectedBidThread = null;
    notifyListeners();
  }

  Future<void> refreshFromBidLiveEvent({
    required String tripRequestId,
    String? bidId,
  }) async {
    await fetchTripRequests(force: true);

    if (_activeTripRequestId == tripRequestId) {
      try {
        await fetchBids(tripRequestId);
      } catch (_) {}
    }

    final String? selectedBidId = _selectedBidThread?.id;
    final bool shouldRefreshSelectedBid =
        (bidId != null && _activeBidId == bidId) ||
        (selectedBidId != null &&
            _selectedBidThread?.tripRequestId == tripRequestId);

    if (!shouldRefreshSelectedBid) {
      return;
    }

    final String? targetBidId = _activeBidId ?? selectedBidId ?? bidId;
    if (targetBidId == null) {
      return;
    }

    try {
      await fetchBidThread(targetBidId);
    } catch (_) {}
  }

  void syncTripRequestStatus(
    String tripRequestId,
    String status, {
    String? acceptedBidId,
  }) {
    _tripRequests = _tripRequests
        .map(
          (TripRequestEntity request) => request.id == tripRequestId
              ? request.copyWith(status: status, updatedAt: DateTime.now())
              : request,
        )
        .toList();

    _currentBids = _currentBids
        .map(
          (BidEntity bid) => bid.tripRequestId == tripRequestId
              ? bid.copyWith(
                  status: bid.id == (acceptedBidId ?? _selectedBidThread?.id)
                      ? 'ACCEPTED'
                      : 'REJECTED',
                  awaitingActionBy: 'NONE',
                  updatedAt: DateTime.now(),
                )
              : bid,
        )
        .toList();

    if (_selectedBidThread != null &&
        _selectedBidThread!.tripRequestId == tripRequestId) {
      _selectedBidThread = _selectedBidThread!.copyWith(
        status:
            _selectedBidThread!.id == (acceptedBidId ?? _selectedBidThread!.id)
            ? 'ACCEPTED'
            : 'REJECTED',
        awaitingActionBy: 'NONE',
        updatedAt: DateTime.now(),
      );
    }

    notifyListeners();
  }

  void _mergeBidIntoCurrentList(BidEntity updated) {
    final int existingIndex = _currentBids.indexWhere(
      (BidEntity bid) => bid.id == updated.id,
    );

    if (existingIndex == -1) {
      _currentBids = <BidEntity>[updated, ..._currentBids];
    } else {
      _currentBids = <BidEntity>[
        ..._currentBids.sublist(0, existingIndex),
        updated,
        ..._currentBids.sublist(existingIndex + 1),
      ];
    }

    _currentBids.sort(
      (BidEntity a, BidEntity b) => b.updatedAt.compareTo(a.updatedAt),
    );
  }

  String _readableError(Object error) {
    final String text = error.toString();
    if (text.startsWith('Exception: ')) {
      return text.substring('Exception: '.length);
    }
    return text;
  }
}
