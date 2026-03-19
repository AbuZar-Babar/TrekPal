class TripRequestEntity {
  const TripRequestEntity({
    required this.id,
    required this.userId,
    required this.destination,
    required this.startDate,
    required this.endDate,
    required this.travelers,
    required this.status,
    required this.bidsCount,
    required this.createdAt,
    required this.updatedAt,
    this.userName,
    this.budget,
    this.description,
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
  final String status;
  final int bidsCount;
  final DateTime createdAt;
  final DateTime updatedAt;
}

class BidEntity {
  const BidEntity({
    required this.id,
    required this.tripRequestId,
    required this.agencyId,
    required this.agencyName,
    required this.price,
    required this.status,
    required this.createdAt,
    required this.updatedAt,
    this.description,
    this.tripDestination,
    this.tripStartDate,
    this.tripEndDate,
  });

  final String id;
  final String tripRequestId;
  final String agencyId;
  final String agencyName;
  final num price;
  final String? description;
  final String status;
  final DateTime createdAt;
  final DateTime updatedAt;
  final String? tripDestination;
  final DateTime? tripStartDate;
  final DateTime? tripEndDate;
}
