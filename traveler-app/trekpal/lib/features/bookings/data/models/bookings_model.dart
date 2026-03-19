import '../../domain/entities/booking_entities.dart';

DateTime _parseBookingDate(dynamic value) {
  if (value is String) {
    return DateTime.tryParse(value)?.toLocal() ?? DateTime.now();
  }

  return DateTime.now();
}

class BookingModel extends BookingEntity {
  const BookingModel({
    required super.id,
    required super.userId,
    required super.status,
    required super.totalAmount,
    required super.startDate,
    required super.endDate,
    required super.createdAt,
    required super.updatedAt,
    super.userName,
    super.agencyId,
    super.agencyName,
    super.tripRequestId,
    super.bidId,
    super.hotelId,
    super.roomId,
    super.vehicleId,
    super.packageId,
    super.destination,
  });

  factory BookingModel.fromJson(Map<String, dynamic> json) {
    return BookingModel(
      id: json['id'] as String? ?? '',
      userId: json['userId'] as String? ?? '',
      userName: json['userName'] as String?,
      agencyId: json['agencyId'] as String?,
      agencyName: json['agencyName'] as String?,
      tripRequestId: json['tripRequestId'] as String?,
      bidId: json['bidId'] as String?,
      hotelId: json['hotelId'] as String?,
      roomId: json['roomId'] as String?,
      vehicleId: json['vehicleId'] as String?,
      packageId: json['packageId'] as String?,
      status: json['status'] as String? ?? 'PENDING',
      totalAmount: (json['totalAmount'] as num?)?.toDouble() ?? 0,
      startDate: _parseBookingDate(json['startDate']),
      endDate: _parseBookingDate(json['endDate']),
      createdAt: _parseBookingDate(json['createdAt']),
      updatedAt: _parseBookingDate(json['updatedAt']),
      destination: json['destination'] as String?,
    );
  }
}
