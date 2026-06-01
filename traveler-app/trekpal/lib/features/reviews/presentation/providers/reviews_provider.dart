import 'package:flutter/material.dart';

import '../../../../core/network/api_client.dart';
import '../../data/datasources/reviews_remote_datasource.dart';
import '../../domain/entities/review_entities.dart';

class ReviewsProvider extends ChangeNotifier {
  ReviewsProvider({required ApiClient apiClient})
      : _datasource = ReviewsRemoteDatasource(apiClient);

  final ReviewsRemoteDatasource _datasource;

  // Per-booking review cache
  final Map<String, ReviewEntity?> _reviewsByBooking = <String, ReviewEntity?>{};
  final Set<String> _loadedBookings = <String>{};

  bool _isSubmitting = false;
  String? _errorMessage;

  bool get isSubmitting => _isSubmitting;
  String? get errorMessage => _errorMessage;

  ReviewEntity? reviewForBooking(String bookingId) =>
      _reviewsByBooking[bookingId];

  bool hasLoadedReview(String bookingId) => _loadedBookings.contains(bookingId);

  /// Load the existing review for a booking (called on booking details open).
  Future<void> loadReviewForBooking(String bookingId) async {
    if (_loadedBookings.contains(bookingId)) return;
    _loadedBookings.add(bookingId);
    try {
      final ReviewEntity? review =
          await _datasource.getReviewForBooking(bookingId);
      _reviewsByBooking[bookingId] = review;
      notifyListeners();
    } catch (_) {
      // Silently fail — the review section degrades gracefully
    }
  }

  /// Submit a new review.
  Future<void> submitReview({
    required String bookingId,
    required int rating,
    String? comment,
  }) async {
    _isSubmitting = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final ReviewEntity review = await _datasource.createReview(
        bookingId: bookingId,
        rating: rating,
        comment: comment,
      );
      _reviewsByBooking[bookingId] = review;
      _loadedBookings.add(bookingId);
    } catch (e) {
      _errorMessage = e.toString().replaceFirst('Exception: ', '');
      rethrow;
    } finally {
      _isSubmitting = false;
      notifyListeners();
    }
  }
}
