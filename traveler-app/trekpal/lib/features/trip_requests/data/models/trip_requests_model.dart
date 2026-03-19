import '../../domain/entities/trip_request_entities.dart';

DateTime _parseTripDate(dynamic value) {
  if (value is String) {
    return DateTime.tryParse(value)?.toLocal() ?? DateTime.now();
  }

  return DateTime.now();
}

class TripRequestModel extends TripRequestEntity {
  const TripRequestModel({
    required super.id,
    required super.userId,
    required super.destination,
    required super.startDate,
    required super.endDate,
    required super.travelers,
    required super.status,
    required super.bidsCount,
    required super.createdAt,
    required super.updatedAt,
    super.userName,
    super.budget,
    super.description,
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
      status: json['status'] as String? ?? 'PENDING',
      bidsCount: json['bidsCount'] as int? ?? 0,
      createdAt: _parseTripDate(json['createdAt']),
      updatedAt: _parseTripDate(json['updatedAt']),
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
    required super.status,
    required super.createdAt,
    required super.updatedAt,
    super.description,
    super.tripDestination,
    super.tripStartDate,
    super.tripEndDate,
  });

  factory BidModel.fromJson(Map<String, dynamic> json) {
    return BidModel(
      id: json['id'] as String? ?? '',
      tripRequestId: json['tripRequestId'] as String? ?? '',
      agencyId: json['agencyId'] as String? ?? '',
      agencyName: json['agencyName'] as String? ?? 'Agency',
      price: (json['price'] as num?)?.toDouble() ?? 0,
      description: json['description'] as String?,
      status: json['status'] as String? ?? 'PENDING',
      createdAt: _parseTripDate(json['createdAt']),
      updatedAt: _parseTripDate(json['updatedAt']),
      tripDestination: json['tripDestination'] as String?,
      tripStartDate: json['tripStartDate'] == null
          ? null
          : _parseTripDate(json['tripStartDate']),
      tripEndDate: json['tripEndDate'] == null
          ? null
          : _parseTripDate(json['tripEndDate']),
    );
  }
}
