import '../../domain/entities/chat_entities.dart';

DateTime? _parseNullableDate(dynamic value) {
  if (value is! String || value.trim().isEmpty) {
    return null;
  }

  return DateTime.tryParse(value)?.toLocal();
}

DateTime _parseDate(dynamic value) {
  return _parseNullableDate(value) ?? DateTime.now();
}

class ChatParticipantModel extends ChatParticipantEntity {
  const ChatParticipantModel({
    required super.id,
    required super.name,
    required super.avatar,
  });

  factory ChatParticipantModel.fromJson(Map<String, dynamic> json) {
    return ChatParticipantModel(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? 'Traveler',
      avatar: (json['avatar'] as String?)?.trim().isNotEmpty == true
          ? json['avatar'] as String
          : null,
    );
  }
}

class ChatRoomModel extends ChatRoomEntity {
  const ChatRoomModel({
    required super.id,
    required super.packageId,
    required super.title,
    required super.agencyId,
    required super.agencyName,
    required super.participantCount,
    required super.participants,
    required super.latestMessagePreview,
    required super.latestMessageAt,
  });

  factory ChatRoomModel.fromJson(Map<String, dynamic> json) {
    final List<dynamic> participants =
        json['participants'] as List<dynamic>? ?? <dynamic>[];

    return ChatRoomModel(
      id: json['id'] as String? ?? '',
      packageId: json['packageId'] as String? ?? '',
      title: json['title'] as String? ?? 'Trip chat',
      agencyId: json['agencyId'] as String? ?? '',
      agencyName: json['agencyName'] as String? ?? 'Agency',
      participantCount: json['participantCount'] as int? ?? participants.length,
      participants: participants
          .map(
            (dynamic item) =>
                ChatParticipantModel.fromJson(item as Map<String, dynamic>),
          )
          .toList(),
      latestMessagePreview: (json['latestMessagePreview'] as String?)
                  ?.trim()
                  .isNotEmpty ==
              true
          ? json['latestMessagePreview'] as String
          : null,
      latestMessageAt: _parseNullableDate(json['latestMessageAt']),
    );
  }
}

class ChatMessageModel extends ChatMessageEntity {
  const ChatMessageModel({
    required super.id,
    required super.roomId,
    required super.senderType,
    required super.senderId,
    required super.senderName,
    required super.senderAvatar,
    required super.content,
    required super.createdAt,
  });

  factory ChatMessageModel.fromJson(Map<String, dynamic> json) {
    return ChatMessageModel(
      id: json['id'] as String? ?? '',
      roomId: json['roomId'] as String? ?? '',
      senderType: json['senderType'] as String? ?? 'TRAVELER',
      senderId: json['senderId'] as String? ?? '',
      senderName: json['senderName'] as String? ?? 'Traveler',
      senderAvatar: (json['senderAvatar'] as String?)?.trim().isNotEmpty == true
          ? json['senderAvatar'] as String
          : null,
      content: json['content'] as String? ?? '',
      createdAt: _parseDate(json['createdAt']),
    );
  }
}
