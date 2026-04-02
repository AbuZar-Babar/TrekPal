import '../../../../core/models/participant_preview.dart';
import '../../domain/entities/package_offer_entity.dart';

DateTime _parsePackageDate(dynamic value) {
  if (value is String) {
    return DateTime.tryParse(value)?.toLocal() ?? DateTime.now();
  }

  return DateTime.now();
}

class PackageOfferModel extends PackageOfferEntity {
  const PackageOfferModel({
    required super.id,
    required super.agencyId,
    required super.agencyName,
    required super.name,
    required super.price,
    required super.duration,
    required super.destinations,
    required super.images,
    required super.isActive,
    required super.participantCount,
    required super.participants,
    required super.createdAt,
    required super.updatedAt,
    super.description,
  });

  factory PackageOfferModel.fromJson(Map<String, dynamic> json) {
    final List<dynamic> destinationList =
        json['destinations'] as List<dynamic>? ?? <dynamic>[];
    final List<dynamic> imageList =
        json['images'] as List<dynamic>? ?? <dynamic>[];
    final List<dynamic> participantList =
        json['participants'] as List<dynamic>? ?? <dynamic>[];

    return PackageOfferModel(
      id: json['id'] as String? ?? '',
      agencyId: json['agencyId'] as String? ?? '',
      agencyName: json['agencyName'] as String? ?? 'Agency',
      name: json['name'] as String? ?? '',
      description: json['description'] as String?,
      price: (json['price'] as num?)?.toDouble() ?? 0,
      duration: json['duration'] as int? ?? 1,
      destinations: destinationList
          .map((dynamic item) => item.toString())
          .toList(),
      images: imageList.map((dynamic item) => item.toString()).toList(),
      isActive: json['isActive'] as bool? ?? true,
      participantCount:
          json['participantCount'] as int? ?? participantList.length,
      participants: participantList
          .map(
            (dynamic item) =>
                ParticipantPreview.fromJson(item as Map<String, dynamic>),
          )
          .toList(),
      createdAt: _parsePackageDate(json['createdAt']),
      updatedAt: _parsePackageDate(json['updatedAt']),
    );
  }
}
