import 'package:socket_io_client/socket_io_client.dart' as io;

import '../../../../core/constants/api_constants.dart';
import '../../../../core/network/api_client.dart';
import '../models/chat_model.dart';

typedef ChatMessageListener = void Function(ChatMessageModel message);
typedef ChatErrorListener = void Function(String message);

class ChatRemoteDataSource {
  ChatRemoteDataSource(
    this._apiClient, {
    required Future<String?> Function() tokenProvider,
  }) : _tokenProvider = tokenProvider;

  final ApiClient _apiClient;
  final Future<String?> Function() _tokenProvider;

  io.Socket? _socket;
  ChatErrorListener? _errorListener;

  Future<List<ChatRoomModel>> getRooms() async {
    final dynamic data = await _apiClient.get(ApiConstants.chatRooms);
    final List<dynamic> items = data as List<dynamic>? ?? <dynamic>[];
    return items
        .map(
          (dynamic item) => ChatRoomModel.fromJson(item as Map<String, dynamic>),
        )
        .toList();
  }

  Future<ChatRoomModel> getRoomByPackageId(String packageId) async {
    final dynamic data = await _apiClient.get(
      ApiConstants.chatRoomByPackage(packageId),
    );
    return ChatRoomModel.fromJson(data as Map<String, dynamic>);
  }

  Future<ChatRoomModel> getRoomById(String roomId) async {
    final dynamic data = await _apiClient.get(ApiConstants.chatRoomById(roomId));
    return ChatRoomModel.fromJson(data as Map<String, dynamic>);
  }

  Future<List<ChatMessageModel>> getMessages(String roomId) async {
    final dynamic data = await _apiClient.get(
      ApiConstants.chatRoomMessages(roomId),
    );
    final List<dynamic> items = data as List<dynamic>? ?? <dynamic>[];
    return items
        .map(
          (dynamic item) =>
              ChatMessageModel.fromJson(item as Map<String, dynamic>),
        )
        .toList();
  }

  Future<void> joinRoom(
    String roomId, {
    required ChatMessageListener onMessage,
    required ChatErrorListener onError,
  }) async {
    final io.Socket socket = await _ensureSocket(onError);
    _errorListener = onError;

    socket.off('chat:new-message');
    socket.off('chat:error');
    socket.off('connect_error');

    socket.on('chat:new-message', (dynamic payload) {
      if (payload is Map) {
        onMessage(
          ChatMessageModel.fromJson(Map<String, dynamic>.from(payload)),
        );
      }
    });
    socket.on('chat:error', (dynamic payload) {
      final String message = payload is Map
          ? (payload['message'] as String? ?? 'Chat request failed')
          : 'Chat request failed';
      onError(message);
    });
    socket.on('connect_error', (dynamic error) {
      final String message = error?.toString() ?? 'Chat connection failed';
      onError(message.replaceFirst('Exception: ', ''));
    });

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit('chat:join-room', roomId);
  }

  Future<void> leaveRoom(String roomId) async {
    final io.Socket? socket = _socket;
    if (socket == null) {
      return;
    }

    socket.emit('chat:leave-room', roomId);
  }

  Future<void> sendMessage({
    required String roomId,
    required String content,
  }) async {
    final io.Socket socket = await _ensureSocket((String message) {
      _errorListener?.call(message);
    });

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit('chat:send-message', <String, dynamic>{
      'roomId': roomId,
      'content': content,
    });
  }

  Future<io.Socket> _ensureSocket(ChatErrorListener onError) async {
    if (_socket != null) {
      return _socket!;
    }

    final String? token = await _tokenProvider();
    if (token == null || token.isEmpty) {
      throw Exception('Sign in again to use traveler chat');
    }

    final io.Socket socket = io.io(
      ApiConstants.socketUrl,
      io.OptionBuilder()
          .setTransports(<String>['websocket'])
          .disableAutoConnect()
          .setAuth(<String, dynamic>{'token': token})
          .build(),
    );

    socket.on('chat:error', (dynamic payload) {
      final String message = payload is Map
          ? (payload['message'] as String? ?? 'Chat request failed')
          : 'Chat request failed';
      onError(message);
    });

    _socket = socket;
    return socket;
  }

  void dispose() {
    _socket?.dispose();
    _socket = null;
    _errorListener = null;
  }
}
