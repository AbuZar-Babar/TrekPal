import '../../domain/entities/trip_request_entities.dart';

DateTime _parseTripDate(dynamic value) {
  if (value is String) {
    return DateTime.tryParse(value)?.toLocal() ?? DateTime.now();
  }

  return DateTime.now();
}

Map<String, dynamic> _asMap(dynamic value) {
  if (value is Map<String, dynamic>) {
    return value;
  }

  if (value is Map) {
    return value.map(
      (dynamic key, dynamic mapValue) => MapEntry(key.toString(), mapValue),
    );
  }

  return <String, dynamic>{};
}

class TripSpecsModel extends TripSpecsEntity {
  const TripSpecsModel({
    required super.stayType,
    required super.roomCount,
    required super.roomPreference,
    required super.transportRequired,
    required super.transportType,
    required super.mealPlan,
    required super.specialRequirements,
  });

  factory TripSpecsModel.fromJson(dynamic json) {
    final Map<String, dynamic> payload = _asMap(json);

    return TripSpecsModel(
      stayType: payload['stayType'] as String? ?? 'ANY',
      roomCount: payload['roomCount'] as int? ?? 1,
      roomPreference: payload['roomPreference'] as String? ?? 'ANY',
      transportRequired: payload['transportRequired'] as bool? ?? false,
      transportType: payload['transportType'] as String? ?? 'ANY',
      mealPlan: payload['mealPlan'] as String? ?? 'ANY',
      specialRequirements: payload['specialRequirements'] as String? ?? '',
    );
  }
}

class OfferDetailsModel extends OfferDetailsEntity {
  const OfferDetailsModel({
    required super.stayIncluded,
    required super.stayDetails,
    required super.transportIncluded,
    required super.transportDetails,
    required super.mealsIncluded,
    required super.mealDetails,
    required super.extras,
  });

  factory OfferDetailsModel.fromJson(dynamic json) {
    final Map<String, dynamic> payload = _asMap(json);

    return OfferDetailsModel(
      stayIncluded: payload['stayIncluded'] as bool? ?? false,
      stayDetails: payload['stayDetails'] as String? ?? '',
      transportIncluded: payload['transportIncluded'] as bool? ?? false,
      transportDetails: payload['transportDetails'] as String? ?? '',
      mealsIncluded: payload['mealsIncluded'] as bool? ?? false,
      mealDetails: payload['mealDetails'] as String? ?? '',
      extras: payload['extras'] as String? ?? '',
    );
  }
}

class BidRevisionModel extends BidRevisionEntity {
  const BidRevisionModel({
    required super.id,
    required super.bidId,
    required super.actorRole,
    required super.actorId,
    required super.price,
    required super.offerDetails,
    required super.createdAt,
    super.description,
  });

  factory BidRevisionModel.fromJson(Map<String, dynamic> json) {
    return BidRevisionModel(
      id: json['id'] as String? ?? '',
      bidId: json['bidId'] as String? ?? '',
      actorRole: json['actorRole'] as String? ?? 'AGENCY',
      actorId: json['actorId'] as String? ?? '',
      price: (json['price'] as num?)?.toDouble() ?? 0,
      description: json['description'] as String?,
      offerDetails: OfferDetailsModel.fromJson(json['offerDetails']),
      createdAt: _parseTripDate(json['createdAt']),
    );
  }
}

class TripRequestModel extends TripRequestEntity {
  const TripRequestModel({
    required super.id,
    required super.userId,
    required super.destination,
    required super.startDate,
    required super.endDate,
    required super.travelers,
    required super.tripSpecs,
    required super.status,
    required super.bidsCount,
    required super.createdAt,
    required super.updatedAt,
    super.userName,
    super.budget,
    super.description,
    super.hotelId,
    super.hotelName,
    super.roomId,
    super.roomType,
    super.vehicleId,
    super.vehicleModel,
  });

  factory TripRequestModel.fromJson(Map<String, dynamic> json) {
    return TripRequestModel(
      id: json['id'] as String? ?? '',
      userId: json['userId'] as String? ?? '',
      userName: json['userName'] as String?,
      destination: json['destination'] as String? ?? 'Unknown destination',
      startDate: _parseTripDate(json['startDate']),
      endDate: _parseTripDate(json['endDate']),
      budget: (json['budget'] as num?)?.toDouble(),
      travelers: json['travelers'] as int? ?? 1,
      description: json['description'] as String?,
      tripSpecs: TripSpecsModel.fromJson(json['tripSpecs']),
      status: json['status'] as String? ?? 'PENDING',
      bidsCount: json['bidsCount'] as int? ?? 0,
      createdAt: _parseTripDate(json['createdAt']),
      updatedAt: _parseTripDate(json['updatedAt']),
      hotelId: json['hotel']?['id'] as String?,
      hotelName: json['hotel']?['name'] as String?,
      roomId: json['room']?['id'] as String?,
      roomType: json['room']?['type'] as String?,
      vehicleId: json['vehicle']?['id'] as String?,
      vehicleModel: json['vehicle']?['model'] as String?,
    );
  }
}

class BidModel extends BidEntity {
  const BidModel({
    required super.id,
    required super.tripRequestId,
    required super.agencyId,
    required super.agencyName,
    required super.price,
    required super.offerDetails,
    required super.status,
    required super.awaitingActionBy,
    required super.revisionCount,
    required super.createdAt,
    required super.updatedAt,
    super.description,
    super.tripDestination,
    super.tripStartDate,
    super.tripEndDate,
    super.revisions,
  });

  factory BidModel.fromJson(Map<String, dynamic> json) {
    final List<dynamic> revisions =
        json['revisions'] as List<dynamic>? ?? const <dynamic>[];

    return BidModel(
      id: json['id'] as String? ?? '',
      tripRequestId: json['tripRequestId'] as String? ?? '',
      agencyId: json['agencyId'] as String? ?? '',
      agencyName: json['agencyName'] as String? ?? 'Agency',
      price: (json['price'] as num?)?.toDouble() ?? 0,
      description: json['description'] as String?,
      offerDetails: OfferDetailsModel.fromJson(json['offerDetails']),
      status: json['status'] as String? ?? 'PENDING',
      awaitingActionBy: json['awaitingActionBy'] as String? ?? 'NONE',
      revisionCount: json['revisionCount'] as int? ?? revisions.length,
      createdAt: _parseTripDate(json['createdAt']),
      updatedAt: _parseTripDate(json['updatedAt']),
      tripDestination: json['tripDestination'] as String?,
      tripStartDate: json['tripStartDate'] == null
          ? null
          : _parseTripDate(json['tripStartDate']),
      tripEndDate: json['tripEndDate'] == null
          ? null
          : _parseTripDate(json['tripEndDate']),
      revisions: revisions
          .map(
            (dynamic item) =>
                BidRevisionModel.fromJson(item as Map<String, dynamic>),
          )
          .toList(),
    );
  }
}
