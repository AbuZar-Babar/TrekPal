import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/utils/formatters.dart';
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

  Widget _summaryPill(IconData icon, String label) {
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
    final TripRequestsProvider provider = context.watch<TripRequestsProvider>();
    final TripRequestEntity? request = provider.findTripRequestById(
      widget.tripRequestId,
    );
    final List<BidEntity> bids = provider.currentBids;

    return Scaffold(
      appBar: AppBar(title: const Text('Agency offers')),
      body: RefreshIndicator(
        onRefresh: () => provider.fetchBids(widget.tripRequestId),
        child: ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 120),
          children: <Widget>[
            if (request != null)
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
                    Text(
                      request.destination,
                      style: Theme.of(context).textTheme.headlineSmall
                          ?.copyWith(
                            color: Colors.white,
                            fontWeight: FontWeight.w900,
                          ),
                    ),
                    const SizedBox(height: 10),
                    Text(
                      AppFormatters.dateRange(
                        request.startDate,
                        request.endDate,
                      ),
                      style: const TextStyle(color: Color(0xFFE6F3EC)),
                    ),
                    const SizedBox(height: 12),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: <Widget>[
                        _summaryPill(
                          Icons.people_alt_outlined,
                          '${request.travelers} travelers',
                        ),
                        _summaryPill(
                          Icons.payments_outlined,
                          AppFormatters.currency(request.budget),
                        ),
                        _summaryPill(
                          Icons.handshake_outlined,
                          '${request.bidsCount} offer threads',
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            const SizedBox(height: 16),
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
                  padding: const EdgeInsets.only(bottom: 12),
                  child: Card(
                    child: Padding(
                      padding: const EdgeInsets.all(20),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: <Widget>[
                          Row(
                            children: <Widget>[
                              Expanded(
                                child: Text(
                                  bid.agencyName,
                                  style: Theme.of(context).textTheme.titleLarge
                                      ?.copyWith(fontWeight: FontWeight.w800),
                                ),
                              ),
                              Text(
                                AppFormatters.currency(bid.price),
                                style: Theme.of(context).textTheme.titleMedium
                                    ?.copyWith(
                                      fontWeight: FontWeight.w900,
                                      color: AppColors.forest,
                                    ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 10),
                          Wrap(
                            spacing: 8,
                            runSpacing: 8,
                            children: <Widget>[
                              _summaryPill(
                                Icons.hotel_outlined,
                                bid.offerDetails.stayIncluded
                                    ? 'Stay included'
                                    : 'No stay',
                              ),
                              _summaryPill(
                                Icons.directions_car_outlined,
                                bid.offerDetails.transportIncluded
                                    ? 'Transport included'
                                    : 'No transport',
                              ),
                              _summaryPill(
                                Icons.restaurant_outlined,
                                bid.offerDetails.mealsIncluded
                                    ? 'Meals included'
                                    : 'No meals',
                              ),
                              _summaryPill(
                                Icons.timeline_outlined,
                                _nextActionLabel(bid),
                              ),
                            ],
                          ),
                          if (bid.description != null &&
                              bid.description!.trim().isNotEmpty) ...<Widget>[
                            const SizedBox(height: 12),
                            Text(bid.description!),
                          ],
                          const SizedBox(height: 16),
                          Row(
                            children: <Widget>[
                              Expanded(
                                child: Text(
                                  'Updated ${AppFormatters.dateTime(bid.updatedAt)}',
                                  style: const TextStyle(color: AppColors.clay),
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
