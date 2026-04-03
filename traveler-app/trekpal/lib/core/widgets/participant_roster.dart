import 'package:flutter/material.dart';

import '../models/participant_preview.dart';
import 'avatar_group.dart';
import 'user_avatar.dart';

class ParticipantRoster extends StatelessWidget {
  const ParticipantRoster({
    super.key,
    required this.participants,
    required this.title,
    required this.countLabel,
    this.maxRows = 3,
  });

  final List<ParticipantPreview> participants;
  final String title;
  final String countLabel;
  final int maxRows;

  @override
  Widget build(BuildContext context) {
    final ThemeData theme = Theme.of(context);
    final ColorScheme colorScheme = theme.colorScheme;
    final List<ParticipantPreview> visibleParticipants = participants
        .take(maxRows)
        .toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        Row(
          children: <Widget>[
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Text(title, style: theme.textTheme.titleSmall),
                  const SizedBox(height: 4),
                  Text(
                    countLabel,
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: colorScheme.onSurfaceVariant,
                    ),
                  ),
                ],
              ),
            ),
            if (participants.isNotEmpty)
              AvatarGroup(participants: participants)
            else
              Icon(Icons.groups_outlined, color: colorScheme.primary),
          ],
        ),
        if (visibleParticipants.isNotEmpty) ...<Widget>[
          const SizedBox(height: 14),
          ...visibleParticipants.map(
            (ParticipantPreview participant) => Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: Row(
                children: <Widget>[
                  UserAvatar(
                    label: participant.travelerName,
                    imageUrl: participant.avatar,
                    radius: 18,
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: <Widget>[
                        Text(
                          participant.travelerName,
                          style: theme.textTheme.titleSmall,
                        ),
                        const SizedBox(height: 2),
                        Text(
                          participant.details,
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
          ),
        ],
      ],
    );
  }
}
