import 'package:flutter/foundation.dart';

import '../../domain/entities/chat_entities.dart';
import '../../domain/repositories/chat_repository.dart';

class ChatProvider extends ChangeNotifier {
  ChatProvider({required ChatRepository chatRepository})
    : _chatRepository = chatRepository;

  final ChatRepository _chatRepository;

  List<ChatRoomEntity> _rooms = <ChatRoomEntity>[];
  ChatRoomEntity? _selectedRoom;
  List<ChatMessageEntity> _messages = <ChatMessageEntity>[];
  bool _isLoadingRooms = false;
  bool _isLoadingRoom = false;
  bool _isSending = false;
  String? _errorMessage;

  List<ChatRoomEntity> get rooms => _rooms;
  ChatRoomEntity? get selectedRoom => _selectedRoom;
  List<ChatMessageEntity> get messages => _messages;
  bool get isLoadingRooms => _isLoadingRooms;
  bool get isLoadingRoom => _isLoadingRoom;
  bool get isSending => _isSending;
  String? get errorMessage => _errorMessage;

  Future<void> fetchRooms({bool force = false}) async {
    if (_rooms.isNotEmpty && !force) {
      return;
    }

    _isLoadingRooms = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _rooms = await _chatRepository.getRooms();
    } catch (error) {
      _errorMessage = _readableError(error);
      rethrow;
    } finally {
      _isLoadingRooms = false;
      notifyListeners();
    }
  }

  Future<void> openRoomByPackageId(String packageId) async {
    _isLoadingRoom = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final ChatRoomEntity room = await _chatRepository.getRoomByPackageId(
        packageId,
      );
      await _activateRoom(room);
    } catch (error) {
      _errorMessage = _readableError(error);
      rethrow;
    } finally {
      _isLoadingRoom = false;
      notifyListeners();
    }
  }

  Future<void> openRoomById(String roomId) async {
    _isLoadingRoom = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final ChatRoomEntity room = await _chatRepository.getRoomById(roomId);
      await _activateRoom(room);
    } catch (error) {
      _errorMessage = _readableError(error);
      rethrow;
    } finally {
      _isLoadingRoom = false;
      notifyListeners();
    }
  }

  Future<void> _activateRoom(ChatRoomEntity room) async {
    if (_selectedRoom?.id.isNotEmpty == true && _selectedRoom!.id != room.id) {
      await _chatRepository.leaveRoom(_selectedRoom!.id);
    }

    _selectedRoom = room;
    _messages = await _chatRepository.getMessages(room.id);
    _mergeRoom(room);

    await _chatRepository.joinRoom(
      room.id,
      onMessage: _handleIncomingMessage,
      onError: _handleSocketError,
    );
  }

  Future<void> leaveSelectedRoom() async {
    final String? roomId = _selectedRoom?.id;
    if (roomId != null && roomId.isNotEmpty) {
      await _chatRepository.leaveRoom(roomId);
    }

    _selectedRoom = null;
    _messages = <ChatMessageEntity>[];
    notifyListeners();
  }

  Future<void> sendMessage(String content) async {
    final ChatRoomEntity? room = _selectedRoom;
    if (room == null) {
      throw Exception('Open a chat room first');
    }

    final String trimmed = content.trim();
    if (trimmed.isEmpty) {
      return;
    }

    _isSending = true;
    _errorMessage = null;
    notifyListeners();

    try {
      await _chatRepository.sendMessage(roomId: room.id, content: trimmed);
    } catch (error) {
      _errorMessage = _readableError(error);
      rethrow;
    } finally {
      _isSending = false;
      notifyListeners();
    }
  }

  void _handleIncomingMessage(ChatMessageEntity message) {
    if (_selectedRoom?.id != message.roomId) {
      return;
    }

    final int index = _messages.indexWhere((item) => item.id == message.id);
    if (index == -1) {
      _messages = <ChatMessageEntity>[..._messages, message];
    } else {
      final List<ChatMessageEntity> updated = List<ChatMessageEntity>.from(
        _messages,
      );
      updated[index] = message;
      _messages = updated;
    }

    _mergeRoom(
      ChatRoomEntity(
        id: _selectedRoom!.id,
        packageId: _selectedRoom!.packageId,
        title: _selectedRoom!.title,
        agencyId: _selectedRoom!.agencyId,
        agencyName: _selectedRoom!.agencyName,
        participantCount: _selectedRoom!.participantCount,
        participants: _selectedRoom!.participants,
        latestMessagePreview: message.content,
        latestMessageAt: message.createdAt,
      ),
    );

    notifyListeners();
  }

  void _handleSocketError(String message) {
    _errorMessage = message;
    notifyListeners();
  }

  void _mergeRoom(ChatRoomEntity room) {
    final List<ChatRoomEntity> updated = List<ChatRoomEntity>.from(_rooms);
    final int index = updated.indexWhere((item) => item.id == room.id);
    if (index == -1) {
      updated.insert(0, room);
    } else {
      updated[index] = room;
      updated.sort((left, right) {
        final int rightTime = right.latestMessageAt?.millisecondsSinceEpoch ?? 0;
        final int leftTime = left.latestMessageAt?.millisecondsSinceEpoch ?? 0;
        return rightTime.compareTo(leftTime);
      });
    }

    _rooms = updated;
  }

  String _readableError(Object error) {
    final String text = error.toString();
    if (text.startsWith('Exception: ')) {
      return text.substring('Exception: '.length);
    }
    return text;
  }

  @override
  void dispose() {
    _chatRepository.dispose();
    super.dispose();
  }
}
