import 'package:flutter/material.dart';

class ReviewFormPage extends StatefulWidget {
  const ReviewFormPage({
    super.key,
    required this.bookingId,
    required this.subject,
  });

  final String bookingId;
  final String subject;

  @override
  State<ReviewFormPage> createState() => _ReviewFormPageState();
}

class _ReviewFormPageState extends State<ReviewFormPage> {
  final TextEditingController _commentController = TextEditingController();
  int _rating = 4;

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final ThemeData theme = Theme.of(context);
    final ColorScheme colorScheme = theme.colorScheme;

    return Scaffold(
      appBar: AppBar(title: const Text('Leave review')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 8, 20, 32),
        children: <Widget>[
          Text(widget.subject, style: theme.textTheme.displaySmall),
          const SizedBox(height: 10),
          Text(
            'Review flow preview. You can explain this as a future post-trip rating module.',
            style: theme.textTheme.bodyMedium?.copyWith(
              color: colorScheme.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 20),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Text('Rating', style: theme.textTheme.titleMedium),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 8,
                    children: List<Widget>.generate(5, (int index) {
                      final int value = index + 1;
                      final bool selected = value <= _rating;
                      return IconButton.filledTonal(
                        onPressed: () {
                          setState(() {
                            _rating = value;
                          });
                        },
                        icon: Icon(
                          selected
                              ? Icons.star_rounded
                              : Icons.star_outline_rounded,
                          color: selected ? Colors.amber.shade700 : null,
                        ),
                      );
                    }),
                  ),
                  const SizedBox(height: 18),
                  TextField(
                    controller: _commentController,
                    maxLines: 5,
                    decoration: const InputDecoration(
                      labelText: 'Comment',
                      hintText: 'What worked well on this trip?',
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 18),
          FilledButton.icon(
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Review saved as a demo preview')),
              );
              Navigator.of(context).pop();
            },
            icon: const Icon(Icons.rate_review_outlined),
            label: const Text('Submit review'),
          ),
        ],
      ),
    );
  }
}
