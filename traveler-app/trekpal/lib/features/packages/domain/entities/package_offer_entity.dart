import '../../../../core/models/participant_preview.dart';

class PackageOfferEntity {
  const PackageOfferEntity({
    required this.id,
    required this.agencyId,
    required this.agencyName,
    required this.name,
    required this.price,
    required this.duration,
    required this.destinations,
    required this.images,
    required this.isActive,
    required this.participantCount,
    required this.participants,
    required this.createdAt,
    required this.updatedAt,
    this.description,
  });

  final String id;
  final String agencyId;
  final String agencyName;
  final String name;
  final String? description;
  final num price;
  final int duration;
  final List<String> destinations;
  final List<String> images;
  final bool isActive;
  final int participantCount;
  final List<ParticipantPreview> participants;
  final DateTime createdAt;
  final DateTime updatedAt;
}
