import '../../domain/entities/hotel_entities.dart';

class HotelModel extends HotelEntity {
  const HotelModel({
    required super.id,
    required super.name,
    required super.description,
    required super.address,
    required super.city,
    required super.rating,
    required super.images,
    required super.rooms,
    required super.services,
  });

  factory HotelModel.fromJson(Map<String, dynamic> json) {
    return HotelModel(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      address: json['address'] ?? '',
      city: json['city'] ?? '',
      rating: (json['rating'] ?? 0.0).toDouble(),
      images: List<String>.from(json['images'] ?? []),
      rooms: (json['rooms'] as List? ?? [])
          .map((r) => RoomModel.fromJson(r))
          .toList(),
      services: (json['services'] as List? ?? [])
          .map((s) => HotelServiceModel.fromJson(s))
          .toList(),
    );
  }
}

class RoomModel extends RoomEntity {
  const RoomModel({
    required super.id,
    required super.type,
    required super.description,
    required super.pricePerNight,
    required super.totalRooms,
    required super.images,
    required super.amenities,
  });

  factory RoomModel.fromJson(Map<String, dynamic> json) {
    return RoomModel(
      id: json['id'] ?? '',
      type: json['type'] ?? '',
      description: json['description'] ?? '',
      pricePerNight: (json['pricePerNight'] ?? 0.0).toDouble(),
      totalRooms: json['totalRooms'] ?? 0,
      images: List<String>.from(json['images'] ?? []),
      amenities: List<String>.from(json['amenities'] ?? []),
    );
  }
}

class HotelServiceModel extends HotelServiceEntity {
  const HotelServiceModel({
    required super.id,
    required super.name,
    required super.description,
    required super.price,
  });

  factory HotelServiceModel.fromJson(Map<String, dynamic> json) {
    return HotelServiceModel(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      price: (json['price'] ?? 0.0).toDouble(),
    );
  }
}
