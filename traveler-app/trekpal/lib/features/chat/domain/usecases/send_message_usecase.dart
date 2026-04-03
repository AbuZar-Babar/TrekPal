import '../repositories/chat_repository.dart';

class SendMessageUseCase {
  const SendMessageUseCase(this._repository);

  final ChatRepository _repository;

  Future<void> call({
    required String roomId,
    required String content,
  }) {
    return _repository.sendMessage(roomId: roomId, content: content);
  }
}
