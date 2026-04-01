import 'package:flutter/material.dart';

import '../../../../core/utils/extensions.dart';
import '../../../../core/utils/formatters.dart';
import '../../../../core/widgets/destination_artwork.dart';
import '../../domain/entities/trip_request_entities.dart';

class TripRequestCard extends StatelessWidget {
  const TripRequestCard({super.key, required this.tripRequest, this.onOpen});

  final TripRequestEntity tripRequest;
  final VoidCallback? onOpen;

  String _prettyLabel(String value) {
    return value
        .split('_')
        .map((String segment) => segment.sentenceCase)
        .join(' ');
  }

  String _marketplaceState() {
    if (tripRequest.status == 'ACCEPTED') {
      return 'Booked';
    }

    if (tripRequest.status == 'CANCELLED') {
      return 'Cancelled';
    }

    if (tripRequest.bidsCount > 0) {
      return 'Offers';
    }

    return 'Published';
  }

  Widget _metaChip(BuildContext context, IconData icon, String label) {
    final ThemeData theme = Theme.of(context);
    final ColorScheme colorScheme = theme.colorScheme;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: colorScheme.surfaceContainerHighest.withValues(
          alpha: theme.brightness == Brightness.dark ? 0.36 : 0.54,
        ),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          Icon(icon, size: 16, color: colorScheme.primary),
          const SizedBox(width: 8),
          Text(label, style: theme.textTheme.bodySmall),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final ThemeData theme = Theme.of(context);
    final ColorScheme colorScheme = theme.colorScheme;

    return Card(
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onOpen,
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              TrekpalDestinationArtwork(
                destination: tripRequest.destination,
                caption: AppFormatters.dateRange(
                  tripRequest.startDate,
                  tripRequest.endDate,
                ),
                badge: _marketplaceState(),
              ),
              const SizedBox(height: 18),
              Text(
                tripRequest.destination,
                style: theme.textTheme.headlineSmall,
              ),
              const SizedBox(height: 10),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: <Widget>[
                  _metaChip(
                    context,
                    Icons.people_alt_outlined,
                    '${tripRequest.travelers} travelers',
                  ),
                  _metaChip(
                    context,
                    Icons.payments_outlined,
                    AppFormatters.currency(tripRequest.budget),
                  ),
                  _metaChip(
                    context,
                    Icons.hotel_outlined,
                    '${_prettyLabel(tripRequest.tripSpecs.stayType)} / ${tripRequest.tripSpecs.roomCount} rooms',
                  ),
                  _metaChip(
                    context,
                    Icons.handshake_outlined,
                    '${tripRequest.bidsCount} offers',
                  ),
                ],
              ),
              if (tripRequest.description != null &&
                  tripRequest.description!.trim().isNotEmpty) ...<Widget>[
                const SizedBox(height: 14),
                Text(
                  tripRequest.description!,
                  maxLines: 3,
                  overflow: TextOverflow.ellipsis,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: colorScheme.onSurfaceVariant,
                  ),
                ),
              ],
              const SizedBox(height: 16),
              Row(
                children: <Widget>[
                  Expanded(
                    child: Text(
                      'Meal plan: ${_prettyLabel(tripRequest.tripSpecs.mealPlan)}',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: colorScheme.onSurfaceVariant,
                      ),
                    ),
                  ),
                  if (onOpen != null)
                    FilledButton.tonalIcon(
                      onPressed: onOpen,
                      icon: const Icon(Icons.arrow_outward_rounded),
                      label: const Text('Open brief'),
                    ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
