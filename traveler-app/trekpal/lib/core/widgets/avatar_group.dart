import 'package:flutter/material.dart';

import '../models/participant_preview.dart';
import 'user_avatar.dart';

class AvatarGroup extends StatelessWidget {
  const AvatarGroup({
    super.key,
    required this.participants,
    this.maxVisible = 4,
    this.avatarRadius = 16,
  });

  final List<ParticipantPreview> participants;
  final int maxVisible;
  final double avatarRadius;

  @override
  Widget build(BuildContext context) {
    final ThemeData theme = Theme.of(context);
    final ColorScheme colorScheme = theme.colorScheme;
    final List<ParticipantPreview> visible = participants
        .take(maxVisible)
        .toList();
    final int remaining = participants.length - visible.length;
    final int bubbleCount = visible.length + (remaining > 0 ? 1 : 0);
    final double overlapSpacing = avatarRadius + 10;
    final double stackWidth = bubbleCount == 0
        ? avatarRadius * 2
        : avatarRadius * 2 + (bubbleCount - 1) * overlapSpacing;

    return SizedBox(
      width: stackWidth,
      height: avatarRadius * 2,
      child: Stack(
        children: <Widget>[
          for (int index = 0; index < visible.length; index++)
            Positioned(
              left: index * (avatarRadius + 10),
              child: Tooltip(
                message:
                    '${visible[index].travelerName}${visible[index].details == '-' ? '' : '\n${visible[index].details}'}',
                child: UserAvatar(
                  label: visible[index].travelerName,
                  imageUrl: visible[index].avatar,
                  radius: avatarRadius,
                ),
              ),
            ),
          if (remaining > 0)
            Positioned(
              left: visible.length * (avatarRadius + 10),
              child: CircleAvatar(
                radius: avatarRadius,
                backgroundColor: colorScheme.surfaceContainerHighest,
                foregroundColor: colorScheme.onSurfaceVariant,
                child: Text(
                  '+$remaining',
                  style: theme.textTheme.labelSmall?.copyWith(
                    color: colorScheme.onSurfaceVariant,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
