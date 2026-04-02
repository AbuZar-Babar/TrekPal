class ParticipantPreview {
  const ParticipantPreview({
    required this.userId,
    required this.travelerName,
    required this.initials,
    required this.bookingStatus,
    required this.joinedAt,
  });

  final String userId;
  final String travelerName;
  final String initials;
  final String bookingStatus;
  final DateTime joinedAt;

  factory ParticipantPreview.fromJson(Map<String, dynamic> json) {
    return ParticipantPreview(
      userId: json['userId'] as String? ?? '',
      travelerName: json['travelerName'] as String? ?? 'Traveler',
      initials: json['initials'] as String? ?? 'TP',
      bookingStatus: json['bookingStatus'] as String? ?? 'PENDING',
      joinedAt:
          DateTime.tryParse(json['joinedAt'] as String? ?? '')?.toLocal() ??
          DateTime.now(),
    );
  }
}
