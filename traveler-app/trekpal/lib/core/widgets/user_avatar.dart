import 'package:flutter/material.dart';

class UserAvatar extends StatelessWidget {
  const UserAvatar({
    super.key,
    required this.label,
    this.imageUrl,
    this.radius = 20,
  });

  final String label;
  final String? imageUrl;
  final double radius;

  String get _initials {
    final List<String> parts = label
        .trim()
        .split(RegExp(r'\s+'))
        .where((String part) => part.isNotEmpty)
        .take(2)
        .toList();
    if (parts.isEmpty) {
      return 'TP';
    }

    return parts
        .map((String part) => part.substring(0, 1).toUpperCase())
        .join();
  }

  @override
  Widget build(BuildContext context) {
    final ThemeData theme = Theme.of(context);
    final ColorScheme colorScheme = theme.colorScheme;
    final String? trimmedUrl = imageUrl?.trim();

    return CircleAvatar(
      radius: radius,
      backgroundColor: colorScheme.primary.withValues(alpha: 0.12),
      foregroundColor: colorScheme.primary,
      foregroundImage: trimmedUrl != null && trimmedUrl.isNotEmpty
          ? NetworkImage(trimmedUrl)
          : null,
      child: Text(
        _initials,
        style: theme.textTheme.labelMedium?.copyWith(
          color: colorScheme.primary,
          fontWeight: FontWeight.w800,
        ),
      ),
    );
  }
}
