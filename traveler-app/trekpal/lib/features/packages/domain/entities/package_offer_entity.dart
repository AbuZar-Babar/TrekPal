import '../../../../core/models/participant_preview.dart';

class OfferHotelSummary {
  const OfferHotelSummary({
    required this.id,
    required this.name,
    required this.city,
    required this.country,
    required this.rating,
    required this.image,
    required this.images,
  });

  final String id;
  final String name;
  final String city;
  final String country;
  final num? rating;
  final String? image;
  final List<String> images;
}

class OfferVehicleSummary {
  const OfferVehicleSummary({
    required this.id,
    required this.type,
    required this.make,
    required this.model,
    required this.capacity,
    required this.image,
    required this.images,
  });

  final String id;
  final String type;
  final String make;
  final String model;
  final int capacity;
  final String? image;
  final List<String> images;
}

class PackageOfferEntity {
  const PackageOfferEntity({
    required this.id,
    required this.agencyId,
    required this.agencyName,
    required this.hotelId,
    required this.vehicleId,
    required this.name,
    required this.price,
    required this.duration,
    required this.startDate,
    required this.destinations,
    required this.images,
    required this.isActive,
    required this.participantCount,
    required this.participants,
    required this.hotel,
    required this.vehicle,
    required this.createdAt,
    required this.updatedAt,
    this.description,
  });

  final String id;
  final String agencyId;
  final String agencyName;
  final String? hotelId;
  final String? vehicleId;
  final String name;
  final String? description;
  final num price;
  final int duration;
  final DateTime? startDate;
  final List<String> destinations;
  final List<String> images;
  final bool isActive;
  final int participantCount;
  final List<ParticipantPreview> participants;
  final OfferHotelSummary? hotel;
  final OfferVehicleSummary? vehicle;
  final DateTime createdAt;
  final DateTime updatedAt;
}
