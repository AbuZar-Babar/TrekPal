import '../../domain/entities/review_entities.dart';

DateTime _parseDate(dynamic value) {
  if (value is String) return DateTime.tryParse(value)?.toLocal() ?? DateTime.now();
  return DateTime.now();
}

class ReviewModel extends ReviewEntity {
  const ReviewModel({
    required super.id,
    required super.userId,
    required super.bookingId,
    required super.rating,
    required super.createdAt,
    required super.updatedAt,
    super.hotelId,
    super.comment,
    super.userName,
    super.destination,
  });

  factory ReviewModel.fromJson(Map<String, dynamic> json) {
    return ReviewModel(
      id: json['id'] as String? ?? '',
      userId: json['userId'] as String? ?? '',
      bookingId: json['bookingId'] as String? ?? '',
      hotelId: json['hotelId'] as String?,
      rating: (json['rating'] as num?)?.toInt() ?? 1,
      comment: json['comment'] as String?,
      userName: json['userName'] as String?,
      destination: json['destination'] as String?,
      createdAt: _parseDate(json['createdAt']),
      updatedAt: _parseDate(json['updatedAt']),
    );
  }
}
