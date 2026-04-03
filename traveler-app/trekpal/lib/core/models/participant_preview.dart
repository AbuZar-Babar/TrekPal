class ParticipantPreview {
  const ParticipantPreview({
    required this.userId,
    required this.travelerName,
    required this.initials,
    required this.age,
    required this.gender,
    required this.avatar,
    required this.bookingStatus,
    required this.joinedAt,
  });

  final String userId;
  final String travelerName;
  final String initials;
  final int? age;
  final String? gender;
  final String? avatar;
  final String bookingStatus;
  final DateTime joinedAt;

  String get details {
    final List<String> parts = <String>[
      if (age != null) '$age yrs',
      if ((gender ?? '').trim().isNotEmpty) gender!,
    ];

    return parts.isEmpty ? '-' : parts.join(' • ');
  }

  factory ParticipantPreview.fromJson(Map<String, dynamic> json) {
    return ParticipantPreview(
      userId: json['userId'] as String? ?? '',
      travelerName: json['travelerName'] as String? ?? 'Traveler',
      initials: json['initials'] as String? ?? 'TP',
      age: json['age'] as int?,
      gender: (json['gender'] as String?)?.trim().isNotEmpty == true
          ? json['gender'] as String
          : null,
      avatar: (json['avatar'] as String?)?.trim().isNotEmpty == true
          ? json['avatar'] as String
          : null,
      bookingStatus: json['bookingStatus'] as String? ?? 'PENDING',
      joinedAt:
          DateTime.tryParse(json['joinedAt'] as String? ?? '')?.toLocal() ??
          DateTime.now(),
    );
  }
}
