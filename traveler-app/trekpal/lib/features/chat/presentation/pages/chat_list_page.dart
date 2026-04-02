import 'package:flutter/material.dart';

import 'chat_room_page.dart';

class ChatListPage extends StatelessWidget {
  const ChatListPage({super.key});

  @override
  Widget build(BuildContext context) {
    final ThemeData theme = Theme.of(context);
    final ColorScheme colorScheme = theme.colorScheme;
    final List<_MockChatThread> threads = const <_MockChatThread>[
      _MockChatThread(
        title: 'Hunza Explorer Group',
        subtitle: '4 travelers joined',
        icon: Icons.landscape_outlined,
        participants: <String>['Areeba', 'Hamza', 'Sana'],
      ),
      _MockChatThread(
        title: 'Skardu Weekend Riders',
        subtitle: 'Agency offer chat',
        icon: Icons.directions_car_filled_outlined,
        participants: <String>['Bilal', 'Ayesha'],
      ),
      _MockChatThread(
        title: 'TrekPal Community',
        subtitle: 'Demo traveler lounge',
        icon: Icons.groups_2_outlined,
        participants: <String>['Zara', 'Ali', 'Umer'],
      ),
    ];

    return Scaffold(
      appBar: AppBar(title: const Text('Traveler chat')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 8, 20, 32),
        children: <Widget>[
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: colorScheme.surfaceContainerHighest.withValues(
                alpha: theme.brightness == Brightness.dark ? 0.46 : 0.58,
              ),
              borderRadius: BorderRadius.circular(24),
            ),
            child: Row(
              children: <Widget>[
                Icon(Icons.pending_outlined, color: colorScheme.primary),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    'Community chat is a mockup for now. Use it to show the future flow in your FYP.',
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: colorScheme.onSurfaceVariant,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 18),
          ...threads.map(
            (_MockChatThread thread) => Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: Card(
                child: ListTile(
                  contentPadding: const EdgeInsets.all(16),
                  leading: CircleAvatar(
                    backgroundColor: colorScheme.primary.withValues(
                      alpha: 0.12,
                    ),
                    foregroundColor: colorScheme.primary,
                    child: Icon(thread.icon),
                  ),
                  title: Text(thread.title),
                  subtitle: Text(thread.subtitle),
                  trailing: const Icon(
                    Icons.arrow_forward_ios_rounded,
                    size: 16,
                  ),
                  onTap: () {
                    Navigator.of(context).push(
                      MaterialPageRoute<void>(
                        builder: (_) => ChatRoomPage(
                          title: thread.title,
                          participantNames: thread.participants,
                        ),
                      ),
                    );
                  },
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _MockChatThread {
  const _MockChatThread({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.participants,
  });

  final String title;
  final String subtitle;
  final IconData icon;
  final List<String> participants;
}
