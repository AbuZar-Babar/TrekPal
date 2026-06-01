import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../../core/theme/app_colors.dart';
import '../providers/reviews_provider.dart';

class ReviewFormPage extends StatefulWidget {
  const ReviewFormPage({
    super.key,
    required this.bookingId,
    required this.destination,
  });

  final String bookingId;
  final String destination;

  @override
  State<ReviewFormPage> createState() => _ReviewFormPageState();
}

class _ReviewFormPageState extends State<ReviewFormPage> {
  final TextEditingController _commentController = TextEditingController();
  int _rating = 0; // 0 = not yet selected

  static const List<String> _labels = <String>[
    '',
    'Terrible',
    'Poor',
    'Okay',
    'Good',
    'Amazing!',
  ];

  static const List<Color> _ratingColors = <Color>[
    Colors.transparent,
    Color(0xFFD32F2F), // 1 - red
    Color(0xFFF57C00), // 2 - orange
    Color(0xFFF9A825), // 3 - amber
    Color(0xFF388E3C), // 4 - green
    Color(0xFF1B5E20), // 5 - deep green
  ];

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_rating == 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a rating before submitting')),
      );
      return;
    }

    final ReviewsProvider provider = context.read<ReviewsProvider>();

    try {
      await provider.submitReview(
        bookingId: widget.bookingId,
        rating: _rating,
        comment: _commentController.text.trim().isEmpty
            ? null
            : _commentController.text.trim(),
      );

      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Thank you for your review!')),
      );
      Navigator.of(context).pop(true); // pop with success
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(provider.errorMessage ?? 'Failed to submit review'),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final ThemeData theme = Theme.of(context);
    final ColorScheme cs = theme.colorScheme;
    final bool dark = theme.brightness == Brightness.dark;
    final ReviewsProvider provider = context.watch<ReviewsProvider>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Rate your trip'),
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(24, 16, 24, 48),
        children: <Widget>[
          // Destination hero
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: <Color>[
                  dark ? AppColors.night : Color.lerp(AppColors.primary, AppColors.paper, 0.88)!,
                  dark ? AppColors.nightRaised : AppColors.paper,
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(28),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: cs.primary.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: Icon(Icons.explore_outlined, color: cs.primary),
                ),
                const SizedBox(height: 14),
                Text(
                  widget.destination,
                  style: theme.textTheme.headlineSmall,
                ),
                const SizedBox(height: 4),
                Text(
                  'How was your experience?',
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: cs.onSurfaceVariant,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 32),

          // Star rating section
          Column(
            children: <Widget>[
              Text(
                _rating == 0 ? 'Tap a star to rate' : _labels[_rating],
                style: theme.textTheme.titleLarge?.copyWith(
                  color: _rating == 0 ? cs.onSurfaceVariant : _ratingColors[_rating],
                  fontWeight: FontWeight.w800,
                ),
              ),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List<Widget>.generate(5, (int i) {
                  final int value = i + 1;
                  final bool filled = value <= _rating;
                  return GestureDetector(
                    onTap: () => setState(() => _rating = value),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 150),
                      margin: const EdgeInsets.symmetric(horizontal: 6),
                      child: Icon(
                        filled ? Icons.star_rounded : Icons.star_outline_rounded,
                        size: 48,
                        color: filled
                            ? Colors.amber.shade600
                            : cs.outlineVariant,
                      ),
                    ),
                  );
                }),
              ),
            ],
          ),
          const SizedBox(height: 32),

          // Comment field
          Text(
            'Tell us about your trip',
            style: theme.textTheme.titleSmall?.copyWith(
              color: cs.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 10),
          TextFormField(
            controller: _commentController,
            maxLines: 5,
            maxLength: 2000,
            decoration: const InputDecoration(
              hintText:
                  'What made your journey special? Any highlights or suggestions?',
              alignLabelWithHint: true,
            ),
          ),
          const SizedBox(height: 28),

          // Submit button
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: provider.isSubmitting ? null : _submit,
              icon: provider.isSubmitting
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(
                          strokeWidth: 2.5, color: Colors.white),
                    )
                  : const Icon(Icons.rate_review_outlined),
              label: Text(
                provider.isSubmitting ? 'Submitting…' : 'Submit review',
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ── Read-only review card (shown on booking details after submission) ─────────
class ReviewCard extends StatelessWidget {
  const ReviewCard({
    super.key,
    required this.rating,
    this.comment,
    this.createdAt,
  });

  final int rating;
  final String? comment;
  final DateTime? createdAt;

  @override
  Widget build(BuildContext context) {
    final ThemeData theme = Theme.of(context);
    final ColorScheme cs = theme.colorScheme;
    final bool dark = theme.brightness == Brightness.dark;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: cs.surfaceContainerHighest.withValues(alpha: dark ? 0.32 : 0.5),
        borderRadius: BorderRadius.circular(22),
        border: Border.all(
          color: Colors.amber.withValues(alpha: 0.3),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Row(
            children: <Widget>[
              const Icon(Icons.star_rounded, color: Colors.amber, size: 18),
              const SizedBox(width: 6),
              Text(
                'Your review',
                style: theme.textTheme.titleSmall?.copyWith(
                  color: cs.onSurface,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const Spacer(),
              // Stars
              Row(
                mainAxisSize: MainAxisSize.min,
                children: List<Widget>.generate(5, (int i) {
                  return Icon(
                    i < rating ? Icons.star_rounded : Icons.star_outline_rounded,
                    size: 16,
                    color: i < rating ? Colors.amber.shade600 : cs.outlineVariant,
                  );
                }),
              ),
            ],
          ),
          if (comment != null && comment!.trim().isNotEmpty) ...<Widget>[
            const SizedBox(height: 10),
            Text(
              comment!,
              style: theme.textTheme.bodyMedium?.copyWith(
                color: cs.onSurfaceVariant,
              ),
            ),
          ],
          if (createdAt != null) ...<Widget>[
            const SizedBox(height: 8),
            Text(
              'Reviewed on ${_formatDate(createdAt!)}',
              style: theme.textTheme.bodySmall?.copyWith(
                color: cs.onSurfaceVariant,
              ),
            ),
          ],
        ],
      ),
    );
  }

  String _formatDate(DateTime dt) {
    const List<String> months = <String>[
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    return '${dt.day} ${months[dt.month - 1]} ${dt.year}';
  }
}
