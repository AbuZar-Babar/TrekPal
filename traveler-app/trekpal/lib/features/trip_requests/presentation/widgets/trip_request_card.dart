import 'package:flutter/material.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/utils/extensions.dart';
import '../../../../core/utils/formatters.dart';
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
      return 'Offers received';
    }

    return 'Published';
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      child: InkWell(
        onTap: onOpen,
        borderRadius: BorderRadius.circular(28),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Row(
                children: <Widget>[
                  Expanded(
                    child: Text(
                      tripRequest.destination,
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.w900,
                        color: AppColors.ink,
                      ),
                    ),
                  ),
                  _StatusChip(status: _marketplaceState()),
                ],
              ),
              const SizedBox(height: 10),
              Text(
                AppFormatters.dateRange(
                  tripRequest.startDate,
                  tripRequest.endDate,
                ),
              ),
              const SizedBox(height: 12),
              Wrap(
                spacing: 10,
                runSpacing: 10,
                children: <Widget>[
                  _InfoPill(
                    icon: Icons.people_alt_outlined,
                    label: '${tripRequest.travelers} travelers',
                  ),
                  _InfoPill(
                    icon: Icons.payments_outlined,
                    label: AppFormatters.currency(tripRequest.budget),
                  ),
                  _InfoPill(
                    icon: Icons.hotel_outlined,
                    label:
                        '${_prettyLabel(tripRequest.tripSpecs.stayType)} • ${tripRequest.tripSpecs.roomCount} rooms',
                  ),
                  _InfoPill(
                    icon: Icons.handshake_outlined,
                    label: '${tripRequest.bidsCount} offers',
                  ),
                ],
              ),
              if (tripRequest.description != null &&
                  tripRequest.description!.trim().isNotEmpty) ...<Widget>[
                const SizedBox(height: 14),
                Text(
                  tripRequest.description!,
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
              ],
              const SizedBox(height: 16),
              Row(
                children: <Widget>[
                  Expanded(
                    child: Text(
                      'Meal plan: ${_prettyLabel(tripRequest.tripSpecs.mealPlan)}',
                      style: const TextStyle(color: AppColors.clay),
                    ),
                  ),
                  if (onOpen != null)
                    FilledButton.tonalIcon(
                      onPressed: onOpen,
                      icon: const Icon(Icons.visibility_outlined),
                      label: const Text('Open'),
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

class _InfoPill extends StatelessWidget {
  const _InfoPill({required this.icon, required this.label});

  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: const Color(0xFFF3E9D9),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          Icon(icon, size: 16, color: AppColors.clay),
          const SizedBox(width: 8),
          Text(label),
        ],
      ),
    );
  }
}

class _StatusChip extends StatelessWidget {
  const _StatusChip({required this.status});

  final String status;

  @override
  Widget build(BuildContext context) {
    Color background;
    Color foreground;
    switch (status) {
      case 'Booked':
        background = const Color(0xFFDDEBDD);
        foreground = AppColors.forest;
        break;
      case 'Cancelled':
        background = const Color(0xFFFFECE7);
        foreground = AppColors.danger;
        break;
      case 'Offers received':
        background = const Color(0xFFEAF3EE);
        foreground = AppColors.forest;
        break;
      default:
        background = const Color(0xFFFFF4DF);
        foreground = AppColors.clay;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: background,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        status,
        style: TextStyle(fontWeight: FontWeight.w700, color: foreground),
      ),
    );
  }
}
