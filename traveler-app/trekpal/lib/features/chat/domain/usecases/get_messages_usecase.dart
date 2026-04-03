import '../entities/chat_entities.dart';
import '../repositories/chat_repository.dart';

class GetMessagesUseCase {
  const GetMessagesUseCase(this._repository);

  final ChatRepository _repository;

  Future<List<ChatMessageEntity>> call(String roomId) {
    return _repository.getMessages(roomId);
  }
}
