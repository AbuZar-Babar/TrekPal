class ChatParticipantEntity {
  const ChatParticipantEntity({
    required this.id,
    required this.name,
    required this.avatar,
  });

  final String id;
  final String name;
  final String? avatar;
}

class ChatRoomEntity {
  const ChatRoomEntity({
    required this.id,
    required this.packageId,
    required this.title,
    required this.agencyId,
    required this.agencyName,
    required this.participantCount,
    required this.participants,
    required this.latestMessagePreview,
    required this.latestMessageAt,
  });

  final String id;
  final String packageId;
  final String title;
  final String agencyId;
  final String agencyName;
  final int participantCount;
  final List<ChatParticipantEntity> participants;
  final String? latestMessagePreview;
  final DateTime? latestMessageAt;
}

class ChatMessageEntity {
  const ChatMessageEntity({
    required this.id,
    required this.roomId,
    required this.senderType,
    required this.senderId,
    required this.senderName,
    required this.senderAvatar,
    required this.content,
    required this.createdAt,
  });

  final String id;
  final String roomId;
  final String senderType;
  final String senderId;
  final String senderName;
  final String? senderAvatar;
  final String content;
  final DateTime createdAt;
}
