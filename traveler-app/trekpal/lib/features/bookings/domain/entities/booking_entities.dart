import '../../../../core/models/participant_preview.dart';

class BookingEntity {
  const BookingEntity({
    required this.id,
    required this.userId,
    required this.status,
    required this.totalAmount,
    required this.startDate,
    required this.endDate,
    required this.createdAt,
    required this.updatedAt,
    this.packageTravelerCount,
    this.packageParticipants = const <ParticipantPreview>[],
    this.userName,
    this.agencyId,
    this.agencyName,
    this.tripRequestId,
    this.bidId,
    this.hotelId,
    this.roomId,
    this.vehicleId,
    this.packageId,
    this.destination,
  });

  final String id;
  final String userId;
  final String? userName;
  final String? agencyId;
  final String? agencyName;
  final String? tripRequestId;
  final String? bidId;
  final String? hotelId;
  final String? roomId;
  final String? vehicleId;
  final String? packageId;
  final String status;
  final num totalAmount;
  final DateTime startDate;
  final DateTime endDate;
  final DateTime createdAt;
  final DateTime updatedAt;
  final int? packageTravelerCount;
  final List<ParticipantPreview> packageParticipants;
  final String? destination;
}
