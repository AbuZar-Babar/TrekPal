import 'package:equatable/equatable.dart';

class HotelEntity extends Equatable {
  final String id;
  final String name;
  final String description;
  final String address;
  final String city;
  final double rating;
  final List<String> images;
  final List<RoomEntity> rooms;
  final List<HotelServiceEntity> services;

  const HotelEntity({
    required this.id,
    required this.name,
    required this.description,
    required this.address,
    required this.city,
    required this.rating,
    required this.images,
    required this.rooms,
    required this.services,
  });

  @override
  List<Object?> get props => [id, name, description, address, city, rating, images, rooms, services];
}

class RoomEntity extends Equatable {
  final String id;
  final String type;
  final String description;
  final double pricePerNight;
  final int totalRooms;
  final List<String> images;
  final List<String> amenities;

  const RoomEntity({
    required this.id,
    required this.type,
    required this.description,
    required this.pricePerNight,
    required this.totalRooms,
    required this.images,
    required this.amenities,
  });

  @override
  List<Object?> get props => [id, type, description, pricePerNight, totalRooms, images, amenities];
}

class HotelServiceEntity extends Equatable {
  final String id;
  final String name;
  final String description;
  final double price;

  const HotelServiceEntity({
    required this.id,
    required this.name,
    required this.description,
    required this.price,
  });

  @override
  List<Object?> get props => [id, name, description, price];
}
