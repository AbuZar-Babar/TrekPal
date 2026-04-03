import 'dart:async';

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../../core/utils/formatters.dart';
import '../../../../core/widgets/error_widget.dart';
import '../../../../core/widgets/loading_widget.dart';
import '../../../../core/widgets/user_avatar.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../../domain/entities/chat_entities.dart';
import '../providers/chat_provider.dart';

class ChatRoomPage extends StatefulWidget {
  const ChatRoomPage({
    super.key,
    this.packageId,
    this.roomId,
    this.fallbackTitle,
  }) : assert(packageId != null || roomId != null);

  final String? packageId;
  final String? roomId;
  final String? fallbackTitle;

  @override
  State<ChatRoomPage> createState() => _ChatRoomPageState();
}

class _ChatRoomPageState extends State<ChatRoomPage> {
  final TextEditingController _controller = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  late final ChatProvider _chatProvider;
  bool _requestedLoad = false;

  @override
  void initState() {
    super.initState();
    _chatProvider = context.read<ChatProvider>();
  }

  @override
  void dispose() {
    _controller.dispose();
    _scrollController.dispose();
    unawaited(_chatProvider.leaveSelectedRoom());
    super.dispose();
  }

  void _ensureLoaded() {
    if (_requestedLoad) {
      return;
    }

    _requestedLoad = true;
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      try {
        if (widget.packageId != null) {
          await _chatProvider.openRoomByPackageId(widget.packageId!);
        } else {
          await _chatProvider.openRoomById(widget.roomId!);
        }
        _scrollToBottom();
      } catch (_) {}
    });
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!_scrollController.hasClients) {
        return;
      }

      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent,
        duration: const Duration(milliseconds: 220),
        curve: Curves.easeOut,
      );
    });
  }

  Future<void> _handleSend() async {
    final String content = _controller.text.trim();
    if (content.isEmpty) {
      return;
    }

    final ScaffoldMessengerState messenger = ScaffoldMessenger.of(context);

    try {
      await _chatProvider.sendMessage(content);
      _controller.clear();
      _scrollToBottom();
    } catch (_) {
      if (!mounted) {
        return;
      }
      messenger.showSnackBar(
        SnackBar(
          content: Text(
            _chatProvider.errorMessage ?? 'Failed to send message',
          ),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    _ensureLoaded();

    final ThemeData theme = Theme.of(context);
    final ColorScheme colorScheme = theme.colorScheme;
    final ChatProvider provider = context.watch<ChatProvider>();
    final String? currentTravelerId = context.watch<AuthProvider>().currentUser?.id;
    final ChatRoomEntity? room = provider.selectedRoom;
    final List<ChatMessageEntity> messages = provider.messages;

    if (provider.errorMessage != null &&
        !provider.isLoadingRoom &&
        room == null &&
        messages.isEmpty) {
      return Scaffold(
        appBar: AppBar(title: Text(widget.fallbackTitle ?? 'Trip chat')),
        body: TrekpalErrorState(
          message: provider.errorMessage!,
          onRetry: () async {
            if (widget.packageId != null) {
              await _chatProvider.openRoomByPackageId(widget.packageId!);
            } else {
              await _chatProvider.openRoomById(widget.roomId!);
            }
          },
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: Text(room?.title ?? widget.fallbackTitle ?? 'Trip chat'),
      ),
      body: provider.isLoadingRoom && room == null
          ? const TrekpalLoadingWidget(message: 'Opening offer chat...')
          : Column(
              children: <Widget>[
                if (room != null)
                  Container(
                    margin: const EdgeInsets.fromLTRB(20, 8, 20, 0),
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: colorScheme.surfaceContainerHighest.withValues(
                        alpha: theme.brightness == Brightness.dark ? 0.3 : 0.58,
                      ),
                      borderRadius: BorderRadius.circular(22),
                    ),
                    child: Row(
                      children: <Widget>[
                        UserAvatar(label: room.agencyName, radius: 22),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: <Widget>[
                              Text(
                                room.agencyName,
                                style: theme.textTheme.titleSmall,
                              ),
                              const SizedBox(height: 2),
                              Text(
                                '${room.participantCount} traveler${room.participantCount == 1 ? '' : 's'} in this chat',
                                style: theme.textTheme.bodySmall?.copyWith(
                                  color: colorScheme.onSurfaceVariant,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                Expanded(
                  child: messages.isEmpty && provider.isLoadingRoom
                      ? const TrekpalLoadingWidget(message: 'Loading messages...')
                      : messages.isEmpty
                      ? Center(
                          child: Padding(
                            padding: const EdgeInsets.all(24),
                            child: Column(
                              mainAxisSize: MainAxisSize.min,
                              children: <Widget>[
                                Icon(
                                  Icons.sms_outlined,
                                  size: 48,
                                  color: colorScheme.primary,
                                ),
                                const SizedBox(height: 16),
                                Text(
                                  'Start the conversation',
                                  style: theme.textTheme.headlineSmall,
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  'Ask the agency or other travelers about the trip.',
                                  textAlign: TextAlign.center,
                                  style: theme.textTheme.bodyMedium?.copyWith(
                                    color: colorScheme.onSurfaceVariant,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        )
                      : ListView.builder(
                          controller: _scrollController,
                          padding: const EdgeInsets.fromLTRB(20, 20, 20, 12),
                          itemCount: messages.length,
                          itemBuilder: (BuildContext context, int index) {
                            final ChatMessageEntity message = messages[index];
                            final bool isMine =
                                message.senderType == 'TRAVELER' &&
                                message.senderId == currentTravelerId;

                            return Align(
                              alignment: isMine
                                  ? Alignment.centerRight
                                  : Alignment.centerLeft,
                              child: Container(
                                margin: const EdgeInsets.only(bottom: 12),
                                padding: const EdgeInsets.all(14),
                                constraints: const BoxConstraints(maxWidth: 320),
                                decoration: BoxDecoration(
                                  color: isMine
                                      ? colorScheme.primary
                                      : colorScheme.surfaceContainerHighest,
                                  borderRadius: BorderRadius.circular(20),
                                ),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: <Widget>[
                                    Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: <Widget>[
                                        UserAvatar(
                                          label: message.senderName,
                                          imageUrl: message.senderAvatar,
                                          radius: 12,
                                        ),
                                        const SizedBox(width: 8),
                                        Flexible(
                                          child: Text(
                                            isMine ? 'You' : message.senderName,
                                            style: theme.textTheme.labelMedium
                                                ?.copyWith(
                                                  color: isMine
                                                      ? colorScheme.onPrimary
                                                      : colorScheme.primary,
                                                ),
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 8),
                                    Text(
                                      message.content,
                                      style: theme.textTheme.bodyMedium
                                          ?.copyWith(
                                            color: isMine
                                                ? colorScheme.onPrimary
                                                : colorScheme.onSurface,
                                          ),
                                    ),
                                    const SizedBox(height: 8),
                                    Text(
                                      AppFormatters.dateTime(message.createdAt),
                                      style: theme.textTheme.bodySmall?.copyWith(
                                        color: isMine
                                            ? colorScheme.onPrimary.withValues(
                                                alpha: 0.82,
                                              )
                                            : colorScheme.onSurfaceVariant,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            );
                          },
                        ),
                ),
                SafeArea(
                  top: false,
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
                    child: Row(
                      children: <Widget>[
                        Expanded(
                          child: TextField(
                            controller: _controller,
                            minLines: 1,
                            maxLines: 4,
                            decoration: const InputDecoration(
                              hintText: 'Write a message',
                            ),
                            onSubmitted: (_) => _handleSend(),
                          ),
                        ),
                        const SizedBox(width: 12),
                        FilledButton(
                          onPressed: provider.isSending ? null : _handleSend,
                          child: provider.isSending
                              ? const SizedBox(
                                  width: 20,
                                  height: 20,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                  ),
                                )
                              : const Icon(Icons.send_rounded),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
    );
  }
}
