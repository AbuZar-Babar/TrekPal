import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../../core/utils/formatters.dart';
import '../../../../core/widgets/error_widget.dart';
import '../../../../core/widgets/loading_widget.dart';
import '../../../../core/widgets/user_avatar.dart';
import '../../domain/entities/chat_entities.dart';
import '../providers/chat_provider.dart';
import 'chat_room_page.dart';

class ChatListPage extends StatefulWidget {
  const ChatListPage({super.key});

  @override
  State<ChatListPage> createState() => _ChatListPageState();
}

class _ChatListPageState extends State<ChatListPage> {
  bool _requestedLoad = false;

  void _ensureLoaded() {
    if (_requestedLoad) {
      return;
    }

    _requestedLoad = true;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ChatProvider>().fetchRooms().catchError((_) {});
    });
  }

  @override
  Widget build(BuildContext context) {
    _ensureLoaded();

    final ThemeData theme = Theme.of(context);
    final ColorScheme colorScheme = theme.colorScheme;
    final ChatProvider provider = context.watch<ChatProvider>();
    final List<ChatRoomEntity> rooms = provider.rooms;

    return Scaffold(
      appBar: AppBar(title: const Text('Offer chat')),
      body: RefreshIndicator(
        onRefresh: () => provider.fetchRooms(force: true),
        child: Builder(
          builder: (BuildContext context) {
            if (provider.isLoadingRooms && rooms.isEmpty) {
              return const TrekpalLoadingWidget(
                message: 'Loading joined offer chats...',
              );
            }

            if (provider.errorMessage != null && rooms.isEmpty) {
              return TrekpalErrorState(
                message: provider.errorMessage!,
                onRetry: () => provider.fetchRooms(force: true),
              );
            }

            return ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.fromLTRB(20, 12, 20, 32),
              children: <Widget>[
                Text('Chats', style: theme.textTheme.displaySmall),
                const SizedBox(height: 8),
                Text(
                  'Talk to the agency and other travelers after you join an offer.',
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: colorScheme.onSurfaceVariant,
                  ),
                ),
                const SizedBox(height: 18),
                if (rooms.isEmpty)
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        children: <Widget>[
                          Icon(
                            Icons.forum_outlined,
                            size: 52,
                            color: colorScheme.primary,
                          ),
                          const SizedBox(height: 16),
                          Text(
                            'No chats yet',
                            style: theme.textTheme.headlineSmall,
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'Join an agency offer first. Your chat room appears here after booking.',
                            textAlign: TextAlign.center,
                            style: theme.textTheme.bodyMedium?.copyWith(
                              color: colorScheme.onSurfaceVariant,
                            ),
                          ),
                        ],
                      ),
                    ),
                  )
                else
                  ...rooms.map(
                    (ChatRoomEntity room) => Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: Card(
                        child: ListTile(
                          contentPadding: const EdgeInsets.all(16),
                          leading: UserAvatar(
                            label: room.agencyName,
                            radius: 22,
                          ),
                          title: Text(room.title),
                          subtitle: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: <Widget>[
                              const SizedBox(height: 4),
                              Text(
                                room.latestMessagePreview ??
                                    '${room.participantCount} traveler${room.participantCount == 1 ? '' : 's'} joined',
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                              ),
                              const SizedBox(height: 6),
                              Text(
                                room.latestMessageAt != null
                                    ? AppFormatters.dateTime(room.latestMessageAt!)
                                    : '${room.participantCount} traveler${room.participantCount == 1 ? '' : 's'} ready',
                                style: theme.textTheme.bodySmall?.copyWith(
                                  color: colorScheme.onSurfaceVariant,
                                ),
                              ),
                            ],
                          ),
                          trailing: const Icon(
                            Icons.arrow_forward_ios_rounded,
                            size: 16,
                          ),
                          onTap: () {
                            Navigator.of(context).push(
                              MaterialPageRoute<void>(
                                builder: (_) => ChatRoomPage(
                                  roomId: room.id,
                                  fallbackTitle: room.title,
                                ),
                              ),
                            );
                          },
                        ),
                      ),
                    ),
                  ),
              ],
            );
          },
        ),
      ),
    );
  }
}
