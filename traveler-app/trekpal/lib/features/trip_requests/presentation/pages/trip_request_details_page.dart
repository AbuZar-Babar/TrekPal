import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../../core/utils/extensions.dart';
import '../../../../core/utils/formatters.dart';
import '../../../../core/widgets/destination_artwork.dart';
import '../../domain/entities/trip_request_entities.dart';
import '../providers/trip_requests_provider.dart';
import 'bids_view_page.dart';

class TripRequestDetailsPage extends StatelessWidget {
  const TripRequestDetailsPage({super.key, required this.tripRequestId});

  final String tripRequestId;

  String _prettyLabel(String value) {
    return value
        .split('_')
        .map((String segment) => segment.sentenceCase)
        .join(' ');
  }

  String _tripState(TripRequestEntity request) {
    if (request.status == 'ACCEPTED') {
      return 'Booked';
    }

    if (request.bidsCount > 0) {
      return 'Offers received';
    }

    return 'Published';
  }

  Widget _detailCard(
    BuildContext context, {
    required String title,
    required String value,
    required IconData icon,
  }) {
    final ThemeData theme = Theme.of(context);
    final ColorScheme colorScheme = theme.colorScheme;

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: colorScheme.surfaceContainerHighest.withValues(
          alpha: theme.brightness == Brightness.dark ? 0.42 : 0.52,
        ),
        borderRadius: BorderRadius.circular(24),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Container(
            width: 42,
            height: 42,
            decoration: BoxDecoration(
              color: colorScheme.primary.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Icon(icon, color: colorScheme.primary),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(
                  title,
                  style: theme.textTheme.labelMedium?.copyWith(
                    color: colorScheme.onSurfaceVariant,
                  ),
                ),
                const SizedBox(height: 6),
                Text(value, style: theme.textTheme.titleMedium),
              ],
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final ThemeData theme = Theme.of(context);
    final TripRequestsProvider provider = context.watch<TripRequestsProvider>();
    final TripRequestEntity? request = provider.findTripRequestById(
      tripRequestId,
    );

    if (request == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Trip brief')),
        body: const Center(child: Text('Trip brief not found')),
      );
    }

    return Scaffold(
      appBar: AppBar(),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 8, 20, 120),
        children: <Widget>[
          TrekpalDestinationArtwork(
            destination: request.destination,
            caption: AppFormatters.dateRange(
              request.startDate,
              request.endDate,
            ),
            badge: _tripState(request),
            height: 220,
          ),
          const SizedBox(height: 20),
          Text(request.destination, style: theme.textTheme.displayMedium),
          const SizedBox(height: 10),
          Text(
            '${request.travelers} travelers / ${request.bidsCount} offer threads',
            style: theme.textTheme.bodyLarge?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 20),
          _detailCard(
            context,
            title: 'Budget',
            value: AppFormatters.currency(request.budget),
            icon: Icons.payments_outlined,
          ),
          const SizedBox(height: 12),
          _detailCard(
            context,
            title: 'Stay preference',
            value:
                '${_prettyLabel(request.tripSpecs.stayType)} / ${request.tripSpecs.roomCount} rooms / ${_prettyLabel(request.tripSpecs.roomPreference)}',
            icon: Icons.bed_outlined,
          ),
          const SizedBox(height: 12),
          _detailCard(
            context,
            title: 'Transport',
            value: request.tripSpecs.transportRequired
                ? _prettyLabel(request.tripSpecs.transportType)
                : 'Not required',
            icon: Icons.directions_car_outlined,
          ),
          const SizedBox(height: 12),
          _detailCard(
            context,
            title: 'Meal plan',
            value: _prettyLabel(request.tripSpecs.mealPlan),
            icon: Icons.restaurant_outlined,
          ),
          if (request.tripSpecs.specialRequirements
              .trim()
              .isNotEmpty) ...<Widget>[
            const SizedBox(height: 12),
            _detailCard(
              context,
              title: 'Special requirements',
              value: request.tripSpecs.specialRequirements,
              icon: Icons.star_outline_rounded,
            ),
          ],
          if (request.description != null &&
              request.description!.trim().isNotEmpty) ...<Widget>[
            const SizedBox(height: 12),
            _detailCard(
              context,
              title: 'Traveler notes',
              value: request.description!,
              icon: Icons.notes_outlined,
            ),
          ],
        ],
      ),
      bottomNavigationBar: SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 10, 20, 18),
          child: ElevatedButton.icon(
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute<void>(
                  builder: (_) => BidsViewPage(tripRequestId: request.id),
                ),
              );
            },
            icon: const Icon(Icons.local_offer_outlined),
            label: Text(
              request.bidsCount == 0 ? 'Check for offers' : 'Compare offers',
            ),
          ),
        ),
      ),
    );
  }
}
