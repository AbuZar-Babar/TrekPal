import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/utils/formatters.dart';
import '../../../../core/widgets/error_widget.dart';
import '../../../../core/widgets/loading_widget.dart';
import '../../../bookings/presentation/pages/booking_details_page.dart';
import '../../../bookings/presentation/providers/bookings_provider.dart';
import '../../domain/entities/trip_request_entities.dart';
import '../providers/trip_requests_provider.dart';

class BidsViewPage extends StatefulWidget {
  const BidsViewPage({super.key, required this.tripRequest});

  final TripRequestEntity tripRequest;

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
          widget.tripRequest.id,
        );
      } catch (_) {}
    });
  }

  Future<void> _acceptBid(BidEntity bid) async {
    final messenger = ScaffoldMessenger.of(context);
    try {
      final String bookingId = await context.read<BookingsProvider>().acceptBid(
        bid.id,
      );
      if (!mounted) {
        return;
      }

      context.read<TripRequestsProvider>().syncTripRequestStatus(
        widget.tripRequest.id,
        'ACCEPTED',
      );

      messenger.showSnackBar(
        const SnackBar(content: Text('Bid accepted and booking created')),
      );

      Navigator.of(context).pushReplacement(
        MaterialPageRoute<void>(
          builder: (_) => BookingDetailsPage(bookingId: bookingId),
        ),
      );
    } catch (_) {
      messenger.showSnackBar(
        SnackBar(
          content: Text(
            context.read<BookingsProvider>().errorMessage ??
                'Unable to accept bid',
          ),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final TripRequestsProvider provider = context.watch<TripRequestsProvider>();
    final BookingsProvider bookingsProvider = context.watch<BookingsProvider>();
    final List<BidEntity> bids = provider.currentBids;

    return Scaffold(
      appBar: AppBar(title: const Text('Agency bids')),
      body: RefreshIndicator(
        onRefresh: () => provider.fetchBids(widget.tripRequest.id),
        child: ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(20),
          children: <Widget>[
            Card(
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Text(
                      widget.tripRequest.destination,
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      AppFormatters.dateRange(
                        widget.tripRequest.startDate,
                        widget.tripRequest.endDate,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text('${widget.tripRequest.travelers} travelers'),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 12),
            if (provider.isBidsLoading && bids.isEmpty)
              const TrekpalLoadingWidget(message: 'Loading agency offers...')
            else if (provider.errorMessage != null && bids.isEmpty)
              TrekpalErrorState(
                message: provider.errorMessage!,
                onRetry: () => provider.fetchBids(widget.tripRequest.id),
              )
            else if (bids.isEmpty)
              const TrekpalErrorState(
                message:
                    'No bids yet. Approved agencies will appear here when they respond.',
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
                                  style: Theme.of(context).textTheme.titleMedium
                                      ?.copyWith(fontWeight: FontWeight.w800),
                                ),
                              ),
                              Text(
                                AppFormatters.currency(bid.price),
                                style: Theme.of(context).textTheme.titleMedium
                                    ?.copyWith(
                                      fontWeight: FontWeight.w800,
                                      color: AppColors.forest,
                                    ),
                              ),
                            ],
                          ),
                          if (bid.description != null &&
                              bid.description!.trim().isNotEmpty) ...<Widget>[
                            const SizedBox(height: 10),
                            Text(bid.description!),
                          ],
                          const SizedBox(height: 16),
                          SizedBox(
                            width: double.infinity,
                            child: ElevatedButton(
                              onPressed:
                                  widget.tripRequest.status == 'PENDING' &&
                                      !bookingsProvider.isLoading
                                  ? () => _acceptBid(bid)
                                  : null,
                              child: const Text('Accept bid'),
                            ),
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
