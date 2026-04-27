import 'package:equatable/equatable.dart';

class VehicleEntity extends Equatable {
  final String id;
  final String agencyId;
  final String agencyName;
  final String type;
  final String make;
  final String model;
  final int year;
  final int capacity;
  final double pricePerDay;
  final List<String> images;

  const VehicleEntity({
    required this.id,
    required this.agencyId,
    required this.agencyName,
    required this.type,
    required this.make,
    required this.model,
    required this.year,
    required this.capacity,
    required this.pricePerDay,
    required this.images,
  });

  @override
  List<Object?> get props => [
        id,
        agencyId,
        agencyName,
        type,
        make,
        model,
        year,
        capacity,
        pricePerDay,
        images,
      ];
}
