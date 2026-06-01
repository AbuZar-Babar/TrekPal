class ReviewEntity {
  const ReviewEntity({
    required this.id,
    required this.userId,
    required this.bookingId,
    required this.rating,
    required this.createdAt,
    required this.updatedAt,
    this.hotelId,
    this.comment,
    this.userName,
    this.destination,
  });

  final String id;
  final String userId;
  final String bookingId;
  final String? hotelId;
  final int rating;
  final String? comment;
  final String? userName;
  final String? destination;
  final DateTime createdAt;
  final DateTime updatedAt;
}
