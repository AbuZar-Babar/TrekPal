import '../../domain/entities/vehicle_entities.dart';

class VehicleModel extends VehicleEntity {
  const VehicleModel({
    required super.id,
    required super.agencyId,
    required super.agencyName,
    required super.type,
    required super.make,
    required super.model,
    required super.year,
    required super.capacity,
    required super.pricePerDay,
    required super.images,
  });

  factory VehicleModel.fromJson(Map<String, dynamic> json) {
    return VehicleModel(
      id: json['id'] ?? '',
      agencyId: json['agencyId'] ?? '',
      agencyName: json['agencyName'] ?? '',
      type: json['type'] ?? '',
      make: json['make'] ?? '',
      model: json['model'] ?? '',
      year: json['year'] ?? 0,
      capacity: json['capacity'] ?? 0,
      pricePerDay: (json['pricePerDay'] ?? 0.0).toDouble(),
      images: List<String>.from(json['images'] ?? []),
    );
  }
}
