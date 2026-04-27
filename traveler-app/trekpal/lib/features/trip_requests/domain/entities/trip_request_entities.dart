class TripSpecsEntity {
  const TripSpecsEntity({
    required this.stayType,
    required this.roomCount,
    required this.roomPreference,
    required this.transportRequired,
    required this.transportType,
    required this.mealPlan,
    required this.specialRequirements,
  });

  const TripSpecsEntity.defaults()
    : stayType = 'ANY',
      roomCount = 1,
      roomPreference = 'ANY',
      transportRequired = false,
      transportType = 'ANY',
      mealPlan = 'ANY',
      specialRequirements = '';

  final String stayType;
  final int roomCount;
  final String roomPreference;
  final bool transportRequired;
  final String transportType;
  final String mealPlan;
  final String specialRequirements;

  TripSpecsEntity copyWith({
    String? stayType,
    int? roomCount,
    String? roomPreference,
    bool? transportRequired,
    String? transportType,
    String? mealPlan,
    String? specialRequirements,
  }) {
    return TripSpecsEntity(
      stayType: stayType ?? this.stayType,
      roomCount: roomCount ?? this.roomCount,
      roomPreference: roomPreference ?? this.roomPreference,
      transportRequired: transportRequired ?? this.transportRequired,
      transportType: transportType ?? this.transportType,
      mealPlan: mealPlan ?? this.mealPlan,
      specialRequirements: specialRequirements ?? this.specialRequirements,
    );
  }
}

class OfferDetailsEntity {
  const OfferDetailsEntity({
    required this.stayIncluded,
    required this.stayDetails,
    required this.transportIncluded,
    required this.transportDetails,
    required this.mealsIncluded,
    required this.mealDetails,
    required this.extras,
  });

  const OfferDetailsEntity.defaults()
    : stayIncluded = false,
      stayDetails = '',
      transportIncluded = false,
      transportDetails = '',
      mealsIncluded = false,
      mealDetails = '',
      extras = '';

  final bool stayIncluded;
  final String stayDetails;
  final bool transportIncluded;
  final String transportDetails;
  final bool mealsIncluded;
  final String mealDetails;
  final String extras;

  OfferDetailsEntity copyWith({
    bool? stayIncluded,
    String? stayDetails,
    bool? transportIncluded,
    String? transportDetails,
    bool? mealsIncluded,
    String? mealDetails,
    String? extras,
  }) {
    return OfferDetailsEntity(
      stayIncluded: stayIncluded ?? this.stayIncluded,
      stayDetails: stayDetails ?? this.stayDetails,
      transportIncluded: transportIncluded ?? this.transportIncluded,
      transportDetails: transportDetails ?? this.transportDetails,
      mealsIncluded: mealsIncluded ?? this.mealsIncluded,
      mealDetails: mealDetails ?? this.mealDetails,
      extras: extras ?? this.extras,
    );
  }
}

class BidRevisionEntity {
  const BidRevisionEntity({
    required this.id,
    required this.bidId,
    required this.actorRole,
    required this.actorId,
    required this.price,
    required this.offerDetails,
    required this.createdAt,
    this.description,
  });

  final String id;
  final String bidId;
  final String actorRole;
  final String actorId;
  final num price;
  final String? description;
  final OfferDetailsEntity offerDetails;
  final DateTime createdAt;
}

class TripRequestEntity {
  const TripRequestEntity({
    required this.id,
    required this.userId,
    required this.destination,
    required this.startDate,
    required this.endDate,
    required this.travelers,
    required this.tripSpecs,
    required this.status,
    required this.bidsCount,
    required this.createdAt,
    required this.updatedAt,
    this.userName,
    this.budget,
    this.description,
    this.hotelId,
    this.hotelName,
    this.roomId,
    this.roomType,
    this.vehicleId,
    this.vehicleModel,
  });

  final String id;
  final String userId;
  final String? userName;
  final String destination;
  final DateTime startDate;
  final DateTime endDate;
  final num? budget;
  final int travelers;
  final String? description;
  final String? hotelId;
  final String? hotelName;
  final String? roomId;
  final String? roomType;
  final String? vehicleId;
  final String? vehicleModel;
  final TripSpecsEntity tripSpecs;
  final String status;
  final int bidsCount;
  final DateTime createdAt;
  final DateTime updatedAt;

  TripRequestEntity copyWith({
    String? id,
    String? userId,
    String? userName,
    String? destination,
    DateTime? startDate,
    DateTime? endDate,
    num? budget,
    bool clearBudget = false,
    int? travelers,
    String? description,
    bool clearDescription = false,
    TripSpecsEntity? tripSpecs,
    String? status,
    int? bidsCount,
    DateTime? createdAt,
    DateTime? updatedAt,
    String? hotelId,
    String? hotelName,
    String? roomId,
    String? roomType,
    String? vehicleId,
    String? vehicleModel,
    bool clearHotel = false,
    bool clearRoom = false,
    bool clearVehicle = false,
  }) {
    return TripRequestEntity(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      userName: userName ?? this.userName,
      destination: destination ?? this.destination,
      startDate: startDate ?? this.startDate,
      endDate: endDate ?? this.endDate,
      budget: clearBudget ? null : (budget ?? this.budget),
      travelers: travelers ?? this.travelers,
      description: clearDescription ? null : (description ?? this.description),
      tripSpecs: tripSpecs ?? this.tripSpecs,
      status: status ?? this.status,
      bidsCount: bidsCount ?? this.bidsCount,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      hotelId: clearHotel ? null : (hotelId ?? this.hotelId),
      hotelName: clearHotel ? null : (hotelName ?? this.hotelName),
      roomId: clearRoom ? null : (roomId ?? this.roomId),
      roomType: clearRoom ? null : (roomType ?? this.roomType),
      vehicleId: clearVehicle ? null : (vehicleId ?? this.vehicleId),
      vehicleModel: clearVehicle ? null : (vehicleModel ?? this.vehicleModel),
    );
  }
}

class BidEntity {
  const BidEntity({
    required this.id,
    required this.tripRequestId,
    required this.agencyId,
    required this.agencyName,
    required this.price,
    required this.offerDetails,
    required this.status,
    required this.awaitingActionBy,
    required this.revisionCount,
    required this.createdAt,
    required this.updatedAt,
    this.description,
    this.tripDestination,
    this.tripStartDate,
    this.tripEndDate,
    this.revisions = const <BidRevisionEntity>[],
  });

  final String id;
  final String tripRequestId;
  final String agencyId;
  final String agencyName;
  final num price;
  final String? description;
  final OfferDetailsEntity offerDetails;
  final String status;
  final String awaitingActionBy;
  final int revisionCount;
  final DateTime createdAt;
  final DateTime updatedAt;
  final String? tripDestination;
  final DateTime? tripStartDate;
  final DateTime? tripEndDate;
  final List<BidRevisionEntity> revisions;

  BidEntity copyWith({
    String? id,
    String? tripRequestId,
    String? agencyId,
    String? agencyName,
    num? price,
    String? description,
    bool clearDescription = false,
    OfferDetailsEntity? offerDetails,
    String? status,
    String? awaitingActionBy,
    int? revisionCount,
    DateTime? createdAt,
    DateTime? updatedAt,
    String? tripDestination,
    DateTime? tripStartDate,
    DateTime? tripEndDate,
    List<BidRevisionEntity>? revisions,
  }) {
    return BidEntity(
      id: id ?? this.id,
      tripRequestId: tripRequestId ?? this.tripRequestId,
      agencyId: agencyId ?? this.agencyId,
      agencyName: agencyName ?? this.agencyName,
      price: price ?? this.price,
      description: clearDescription ? null : (description ?? this.description),
      offerDetails: offerDetails ?? this.offerDetails,
      status: status ?? this.status,
      awaitingActionBy: awaitingActionBy ?? this.awaitingActionBy,
      revisionCount: revisionCount ?? this.revisionCount,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      tripDestination: tripDestination ?? this.tripDestination,
      tripStartDate: tripStartDate ?? this.tripStartDate,
      tripEndDate: tripEndDate ?? this.tripEndDate,
      revisions: revisions ?? this.revisions,
    );
  }
}
