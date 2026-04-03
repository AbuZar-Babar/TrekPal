import '../../domain/entities/chat_entities.dart';
import '../../domain/repositories/chat_repository.dart';
import '../datasources/chat_remote_datasource.dart';

class ChatRepositoryImpl implements ChatRepository {
  ChatRepositoryImpl(this._remoteDataSource);

  final ChatRemoteDataSource _remoteDataSource;

  @override
  Future<List<ChatRoomEntity>> getRooms() => _remoteDataSource.getRooms();

  @override
  Future<ChatRoomEntity> getRoomByPackageId(String packageId) =>
      _remoteDataSource.getRoomByPackageId(packageId);

  @override
  Future<ChatRoomEntity> getRoomById(String roomId) =>
      _remoteDataSource.getRoomById(roomId);

  @override
  Future<List<ChatMessageEntity>> getMessages(String roomId) =>
      _remoteDataSource.getMessages(roomId);

  @override
  Future<void> joinRoom(
    String roomId, {
    required void Function(ChatMessageEntity message) onMessage,
    required void Function(String message) onError,
  }) {
    return _remoteDataSource.joinRoom(
      roomId,
      onMessage: onMessage,
      onError: onError,
    );
  }

  @override
  Future<void> leaveRoom(String roomId) => _remoteDataSource.leaveRoom(roomId);

  @override
  Future<void> sendMessage({
    required String roomId,
    required String content,
  }) {
    return _remoteDataSource.sendMessage(roomId: roomId, content: content);
  }

  @override
  void dispose() {
    _remoteDataSource.dispose();
  }
}
