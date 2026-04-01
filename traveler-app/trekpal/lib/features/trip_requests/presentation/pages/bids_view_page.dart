import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../../core/utils/formatters.dart';
import '../../../../core/widgets/destination_artwork.dart';
import '../../../../core/widgets/error_widget.dart';
import '../../../../core/widgets/loading_widget.dart';
import '../../domain/entities/trip_request_entities.dart';
import '../providers/trip_requests_provider.dart';
import 'bid_thread_page.dart';

class BidsViewPage extends StatefulWidget {
  const BidsViewPage({super.key, required this.tripRequestId});

  final String tripRequestId;

  @override
  State<BidsViewPage> createState() => _BidsViewPageState();
}

class _BidsViewPageState extends State<BidsViewPage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      try {
        await context.read<TripRequestsProvider>().fetchBids(
          widget.tripRequestId,
        );
      } catch (_) {}
    });
  }

  Widget _summaryPill(BuildContext context, IconData icon, String label) {
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

  String _nextActionLabel(BidEntity bid) {
    if (bid.status == 'ACCEPTED') {
      return 'Booked';
    }

    if (bid.status == 'REJECTED') {
      return 'Closed';
    }

    if (bid.awaitingActionBy == 'TRAVELER') {
      return 'Awaiting your response';
    }

    if (bid.awaitingActionBy == 'AGENCY') {
      return 'Awaiting agency';
    }

    return 'Open';
  }

  @override
  Widget build(BuildContext context) {
    final ThemeData theme = Theme.of(context);
    final ColorScheme colorScheme = theme.colorScheme;
    final TripRequestsProvider provider = context.watch<TripRequestsProvider>();
    final TripRequestEntity? request = provider.findTripRequestById(
      widget.tripRequestId,
    );
    final List<BidEntity> bids = provider.currentBids;

    return Scaffold(
      appBar: AppBar(),
      body: RefreshIndicator(
        onRefresh: () => provider.fetchBids(widget.tripRequestId),
        child: ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.fromLTRB(20, 8, 20, 120),
          children: <Widget>[
            Text('Compare Agency Offers', style: theme.textTheme.displayMedium),
            const SizedBox(height: 10),
            Text(
              'Review the latest quotes, compare inclusions, and open a negotiation thread when you want to revise the deal.',
              style: theme.textTheme.bodyLarge?.copyWith(
                color: colorScheme.onSurfaceVariant,
              ),
            ),
            const SizedBox(height: 20),
            if (request != null) ...<Widget>[
              TrekpalDestinationArtwork(
                destination: request.destination,
                caption: AppFormatters.dateRange(
                  request.startDate,
                  request.endDate,
                ),
                badge: '${request.bidsCount} offers',
                height: 210,
              ),
              const SizedBox(height: 18),
            ],
            if (provider.isBidsLoading && bids.isEmpty)
              const TrekpalLoadingWidget(message: 'Loading agency offers...')
            else if (provider.errorMessage != null && bids.isEmpty)
              TrekpalErrorState(
                message: provider.errorMessage!,
                onRetry: () => provider.fetchBids(widget.tripRequestId),
              )
            else if (bids.isEmpty)
              const TrekpalErrorState(
                message:
                    'No offers yet. Approved agencies will appear here when they respond.',
              )
            else
              ...bids.map(
                (BidEntity bid) => Padding(
                  padding: const EdgeInsets.only(bottom: 14),
                  child: Card(
                    child: Padding(
                      padding: const EdgeInsets.all(18),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: <Widget>[
                          Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: <Widget>[
                              Container(
                                width: 48,
                                height: 48,
                                decoration: BoxDecoration(
                                  color: colorScheme.primary.withValues(
                                    alpha: 0.12,
                                  ),
                                  borderRadius: BorderRadius.circular(16),
                                ),
                                child: Icon(
                                  Icons.apartment_outlined,
                                  color: colorScheme.primary,
                                ),
                              ),
                              const SizedBox(width: 14),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: <Widget>[
                                    Text(
                                      bid.agencyName,
                                      style: theme.textTheme.titleLarge,
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      _nextActionLabel(bid),
                                      style: theme.textTheme.bodySmall
                                          ?.copyWith(
                                            color: colorScheme.onSurfaceVariant,
                                          ),
                                    ),
                                  ],
                                ),
                              ),
                              Text(
                                AppFormatters.currency(bid.price),
                                style: theme.textTheme.headlineSmall?.copyWith(
                                  color: colorScheme.primary,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 14),
                          Wrap(
                            spacing: 8,
                            runSpacing: 8,
                            children: <Widget>[
                              _summaryPill(
                                context,
                                Icons.hotel_outlined,
                                bid.offerDetails.stayIncluded
                                    ? 'Stay included'
                                    : 'No stay',
                              ),
                              _summaryPill(
                                context,
                                Icons.directions_car_outlined,
                                bid.offerDetails.transportIncluded
                                    ? 'Transport included'
                                    : 'No transport',
                              ),
                              _summaryPill(
                                context,
                                Icons.restaurant_outlined,
                                bid.offerDetails.mealsIncluded
                                    ? 'Meals included'
                                    : 'No meals',
                              ),
                              _summaryPill(
                                context,
                                Icons.timeline_outlined,
                                '${bid.revisionCount} revisions',
                              ),
                            ],
                          ),
                          if (bid.description != null &&
                              bid.description!.trim().isNotEmpty) ...<Widget>[
                            const SizedBox(height: 12),
                            Text(
                              bid.description!,
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
                                  'Updated ${AppFormatters.dateTime(bid.updatedAt)}',
                                  style: theme.textTheme.bodySmall?.copyWith(
                                    color: colorScheme.onSurfaceVariant,
                                  ),
                                ),
                              ),
                              FilledButton.tonalIcon(
                                onPressed: () {
                                  Navigator.of(context).push(
                                    MaterialPageRoute<void>(
                                      builder: (_) => BidThreadPage(
                                        tripRequestId: widget.tripRequestId,
                                        bidId: bid.id,
                                      ),
                                    ),
                                  );
                                },
                                icon: const Icon(Icons.forum_outlined),
                                label: const Text('Open thread'),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
