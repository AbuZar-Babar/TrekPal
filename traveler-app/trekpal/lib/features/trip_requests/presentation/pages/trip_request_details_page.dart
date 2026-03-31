import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/utils/extensions.dart';
import '../../../../core/utils/formatters.dart';
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

  Widget _detailCard({
    required BuildContext context,
    required String title,
    required String value,
    IconData? icon,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.mist,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        children: <Widget>[
          if (icon != null) ...<Widget>[
            Icon(icon, color: AppColors.clay),
            const SizedBox(width: 12),
          ],
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(
                  title,
                  style: const TextStyle(
                    color: AppColors.clay,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  value,
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w800,
                    color: AppColors.ink,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
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

  @override
  Widget build(BuildContext context) {
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
      appBar: AppBar(title: const Text('Trip brief')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 120),
        children: <Widget>[
          Container(
            padding: const EdgeInsets.all(22),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: <Color>[AppColors.pine, AppColors.forest],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(28),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 8,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.16),
                    borderRadius: BorderRadius.circular(999),
                  ),
                  child: Text(
                    _tripState(request),
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
                const SizedBox(height: 18),
                Text(
                  request.destination,
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 10),
                Text(
                  AppFormatters.dateRange(request.startDate, request.endDate),
                  style: const TextStyle(color: Color(0xFFE6F3EC)),
                ),
                const SizedBox(height: 6),
                Text(
                  '${request.travelers} travelers',
                  style: const TextStyle(color: Color(0xFFE6F3EC)),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          _detailCard(
            context: context,
            title: 'Budget',
            value: AppFormatters.currency(request.budget),
            icon: Icons.payments_outlined,
          ),
          const SizedBox(height: 12),
          _detailCard(
            context: context,
            title: 'Stay preference',
            value:
                '${_prettyLabel(request.tripSpecs.stayType)} • ${request.tripSpecs.roomCount} rooms • ${_prettyLabel(request.tripSpecs.roomPreference)}',
            icon: Icons.bed_outlined,
          ),
          const SizedBox(height: 12),
          _detailCard(
            context: context,
            title: 'Transport',
            value: request.tripSpecs.transportRequired
                ? _prettyLabel(request.tripSpecs.transportType)
                : 'Not required',
            icon: Icons.directions_car_outlined,
          ),
          const SizedBox(height: 12),
          _detailCard(
            context: context,
            title: 'Meal plan',
            value: _prettyLabel(request.tripSpecs.mealPlan),
            icon: Icons.restaurant_outlined,
          ),
          if (request.tripSpecs.specialRequirements
              .trim()
              .isNotEmpty) ...<Widget>[
            const SizedBox(height: 12),
            _detailCard(
              context: context,
              title: 'Special requirements',
              value: request.tripSpecs.specialRequirements,
              icon: Icons.star_border_rounded,
            ),
          ],
          if (request.description != null &&
              request.description!.trim().isNotEmpty) ...<Widget>[
            const SizedBox(height: 12),
            _detailCard(
              context: context,
              title: 'Traveler notes',
              value: request.description!,
              icon: Icons.notes_outlined,
            ),
          ],
          const SizedBox(height: 12),
          _detailCard(
            context: context,
            title: 'Marketplace activity',
            value: '${request.bidsCount} active offer threads',
            icon: Icons.handshake_outlined,
          ),
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
              request.bidsCount == 0 ? 'Check for offers' : 'View offers',
            ),
          ),
        ),
      ),
    );
  }
}
