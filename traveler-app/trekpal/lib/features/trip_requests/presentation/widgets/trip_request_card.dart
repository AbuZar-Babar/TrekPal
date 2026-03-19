import 'package:flutter/material.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/utils/formatters.dart';
import '../../domain/entities/trip_request_entities.dart';

class TripRequestCard extends StatelessWidget {
  const TripRequestCard({
    super.key,
    required this.tripRequest,
    this.onViewBids,
  });

  final TripRequestEntity tripRequest;
  final VoidCallback? onViewBids;

  @override
  Widget build(BuildContext context) {
    return Card(
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
                      fontWeight: FontWeight.w800,
                      color: AppColors.ink,
                    ),
                  ),
                ),
                _StatusChip(status: tripRequest.status),
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
                  icon: Icons.handshake_outlined,
                  label: '${tripRequest.bidsCount} bids',
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
            if (onViewBids != null) ...<Widget>[
              const SizedBox(height: 18),
              Align(
                alignment: Alignment.centerRight,
                child: FilledButton.tonalIcon(
                  onPressed: onViewBids,
                  icon: const Icon(Icons.visibility_outlined),
                  label: const Text('View bids'),
                ),
              ),
            ],
          ],
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
    switch (status) {
      case 'ACCEPTED':
        background = const Color(0xFFDDEBDD);
        break;
      case 'CANCELLED':
        background = const Color(0xFFF5DAD2);
        break;
      default:
        background = const Color(0xFFF3E9D9);
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: background,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(status, style: const TextStyle(fontWeight: FontWeight.w700)),
    );
  }
}
