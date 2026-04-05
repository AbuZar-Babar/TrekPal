import 'package:socket_io_client/socket_io_client.dart' as io;

import '../constants/api_constants.dart';

abstract class MarketplaceLiveEvent {
  const MarketplaceLiveEvent();

  String get notificationKey;
  DateTime get updatedAt;
}

class OfferUpdatedEvent extends MarketplaceLiveEvent {
  const OfferUpdatedEvent({
    required this.eventType,
    required this.packageId,
    required this.agencyId,
    required this.name,
    required this.isActive,
    required this.updatedAt,
  });

  factory OfferUpdatedEvent.fromJson(Map<String, dynamic> json) {
    return OfferUpdatedEvent(
      eventType: json['eventType'] as String? ?? 'UPDATED',
      packageId: json['packageId'] as String? ?? '',
      agencyId: json['agencyId'] as String? ?? '',
      name: json['name'] as String? ?? 'Offer',
      isActive: json['isActive'] as bool? ?? true,
      updatedAt: DateTime.tryParse(json['updatedAt'] as String? ?? '') ??
          DateTime.now(),
    );
  }

  final String eventType;
  final String packageId;
  final String agencyId;
  final String name;
  final bool isActive;
  @override
  final DateTime updatedAt;

  @override
  String get notificationKey =>
      'offer:$eventType:$packageId:${updatedAt.toIso8601String()}';
}

class BidUpdatedEvent extends MarketplaceLiveEvent {
  const BidUpdatedEvent({
    required this.eventType,
    required this.tripRequestId,
    required this.bidId,
    required this.agencyId,
    required this.agencyName,
    required this.status,
    required this.awaitingActionBy,
    required this.updatedAt,
  });

  factory BidUpdatedEvent.fromJson(Map<String, dynamic> json) {
    return BidUpdatedEvent(
      eventType: json['eventType'] as String? ?? 'UPDATED',
      tripRequestId: json['tripRequestId'] as String? ?? '',
      bidId: json['bidId'] as String? ?? '',
      agencyId: json['agencyId'] as String? ?? '',
      agencyName: json['agencyName'] as String? ?? 'Agency',
      status: json['status'] as String? ?? 'PENDING',
      awaitingActionBy: json['awaitingActionBy'] as String? ?? 'NONE',
      updatedAt: DateTime.tryParse(json['updatedAt'] as String? ?? '') ??
          DateTime.now(),
    );
  }

  final String eventType;
  final String tripRequestId;
  final String bidId;
  final String agencyId;
  final String agencyName;
  final String status;
  final String awaitingActionBy;
  @override
  final DateTime updatedAt;

  @override
  String get notificationKey =>
      'bid:$eventType:$bidId:${updatedAt.toIso8601String()}';
}

typedef MarketplaceEventListener = void Function(MarketplaceLiveEvent event);
typedef MarketplaceErrorListener = void Function(String message);

class MarketplaceLiveService {
  MarketplaceLiveService({
    required Future<String?> Function() tokenProvider,
  }) : _tokenProvider = tokenProvider;

  final Future<String?> Function() _tokenProvider;

  io.Socket? _socket;

  Future<void> connect({
    required MarketplaceEventListener onEvent,
    required MarketplaceErrorListener onError,
  }) async {
    final io.Socket socket = await _ensureSocket();

    socket.off('marketplace:offer-updated');
    socket.off('marketplace:bid-updated');
    socket.off('connect_error');

    socket.on('marketplace:offer-updated', (dynamic payload) {
      if (payload is Map) {
        onEvent(
          OfferUpdatedEvent.fromJson(Map<String, dynamic>.from(payload)),
        );
      }
    });

    socket.on('marketplace:bid-updated', (dynamic payload) {
      if (payload is Map) {
        onEvent(BidUpdatedEvent.fromJson(Map<String, dynamic>.from(payload)));
      }
    });

    socket.on('connect_error', (dynamic error) {
      final String message =
          error?.toString().replaceFirst('Exception: ', '') ??
          'Live updates are unavailable';
      onError(message);
    });

    if (!socket.connected) {
      socket.connect();
    }
  }

  Future<void> disconnect() async {
    _socket?.disconnect();
    _socket?.dispose();
    _socket = null;
  }

  Future<io.Socket> _ensureSocket() async {
    if (_socket != null) {
      return _socket!;
    }

    final String? token = await _tokenProvider();
    if (token == null || token.isEmpty) {
      throw Exception('Sign in again to receive live updates');
    }

    final io.Socket socket = io.io(
      ApiConstants.socketUrl,
      io.OptionBuilder()
          .setTransports(<String>['websocket'])
          .disableAutoConnect()
          .enableReconnection()
          .setAuth(<String, dynamic>{'token': token})
          .build(),
    );

    _socket = socket;
    return socket;
  }
}
