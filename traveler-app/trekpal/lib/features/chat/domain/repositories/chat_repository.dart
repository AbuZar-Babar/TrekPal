import '../entities/chat_entities.dart';

abstract class ChatRepository {
  Future<List<ChatRoomEntity>> getRooms();
  Future<ChatRoomEntity> getRoomByPackageId(String packageId);
  Future<ChatRoomEntity> getRoomById(String roomId);
  Future<List<ChatMessageEntity>> getMessages(String roomId);
  Future<void> joinRoom(
    String roomId, {
    required void Function(ChatMessageEntity message) onMessage,
    required void Function(String message) onError,
  });
  Future<void> leaveRoom(String roomId);
  Future<void> sendMessage({
    required String roomId,
    required String content,
  });
  void dispose();
}
