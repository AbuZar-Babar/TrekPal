import '../../../../core/constants/api_constants.dart';
import '../../../../core/network/api_client.dart';
import '../models/reviews_model.dart';

class ReviewsRemoteDatasource {
  const ReviewsRemoteDatasource(this._apiClient);
  final ApiClient _apiClient;

  Future<ReviewModel> createReview({
    required String bookingId,
    required int rating,
    String? comment,
  }) async {
    final dynamic response = await _apiClient.post(
      '/reviews',
      body: <String, dynamic>{
        'bookingId': bookingId,
        'rating': rating,
        if (comment != null && comment.trim().isNotEmpty) 'comment': comment.trim(),
      },
    );

    final Map<String, dynamic> data =
        (response as Map<String, dynamic>)['data'] as Map<String, dynamic>;
    return ReviewModel.fromJson(data);
  }

  Future<ReviewModel?> getReviewForBooking(String bookingId) async {
    final dynamic response = await _apiClient.get('/reviews/booking/$bookingId');
    final dynamic data =
        (response as Map<String, dynamic>)['data'];
    if (data == null) return null;
    return ReviewModel.fromJson(data as Map<String, dynamic>);
  }
}
