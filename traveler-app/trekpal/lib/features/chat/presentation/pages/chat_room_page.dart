import 'package:flutter/material.dart';

class ChatRoomPage extends StatefulWidget {
  const ChatRoomPage({
    super.key,
    required this.title,
    this.participantNames = const <String>[],
  });

  final String title;
  final List<String> participantNames;

  @override
  State<ChatRoomPage> createState() => _ChatRoomPageState();
}

class _ChatRoomPageState extends State<ChatRoomPage> {
  final TextEditingController _controller = TextEditingController();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final ThemeData theme = Theme.of(context);
    final ColorScheme colorScheme = theme.colorScheme;
    final List<_MockMessage> messages = <_MockMessage>[
      const _MockMessage(
        author: 'TrekPal',
        content: 'Mock group chat preview. Real-time chat can be wired later.',
        isMine: false,
      ),
      _MockMessage(
        author: widget.participantNames.isNotEmpty
            ? widget.participantNames.first
            : 'Traveler',
        content: 'Looking forward to this trip.',
        isMine: false,
      ),
      const _MockMessage(
        author: 'You',
        content: 'Same here. This screen is a demo for the FYP.',
        isMine: true,
      ),
    ];

    return Scaffold(
      appBar: AppBar(title: Text(widget.title)),
      body: Column(
        children: <Widget>[
          Container(
            margin: const EdgeInsets.fromLTRB(20, 8, 20, 0),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: colorScheme.secondaryContainer.withValues(alpha: 0.72),
              borderRadius: BorderRadius.circular(22),
            ),
            child: Row(
              children: <Widget>[
                Icon(Icons.forum_outlined, color: colorScheme.primary),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    'Chat is in mock mode for now. The UI is ready for real messages later.',
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: colorScheme.onSecondaryContainer,
                    ),
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 12),
              itemCount: messages.length,
              itemBuilder: (BuildContext context, int index) {
                final _MockMessage message = messages[index];
                return Align(
                  alignment: message.isMine
                      ? Alignment.centerRight
                      : Alignment.centerLeft,
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.all(14),
                    constraints: const BoxConstraints(maxWidth: 320),
                    decoration: BoxDecoration(
                      color: message.isMine
                          ? colorScheme.primary
                          : colorScheme.surfaceContainerHighest,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: <Widget>[
                        Text(
                          message.author,
                          style: theme.textTheme.labelMedium?.copyWith(
                            color: message.isMine
                                ? colorScheme.onPrimary
                                : colorScheme.primary,
                          ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          message.content,
                          style: theme.textTheme.bodyMedium?.copyWith(
                            color: message.isMine
                                ? colorScheme.onPrimary
                                : colorScheme.onSurface,
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
                      readOnly: true,
                      decoration: const InputDecoration(
                        hintText: 'Messaging is in progress',
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  FilledButton(
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Chat is a mockup in this build'),
                        ),
                      );
                    },
                    child: const Icon(Icons.send_rounded),
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

class _MockMessage {
  const _MockMessage({
    required this.author,
    required this.content,
    required this.isMine,
  });

  final String author;
  final String content;
  final bool isMine;
}
