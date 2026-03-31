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

class BidThreadPage extends StatefulWidget {
  const BidThreadPage({
    super.key,
    required this.tripRequestId,
    required this.bidId,
  });

  final String tripRequestId;
  final String bidId;

  @override
  State<BidThreadPage> createState() => _BidThreadPageState();
}

class _BidThreadPageState extends State<BidThreadPage> {
  final TextEditingController _priceController = TextEditingController();
  final TextEditingController _descriptionController = TextEditingController();
  final TextEditingController _stayDetailsController = TextEditingController();
  final TextEditingController _transportDetailsController =
      TextEditingController();
  final TextEditingController _mealDetailsController = TextEditingController();
  final TextEditingController _extrasController = TextEditingController();

  bool _stayIncluded = false;
  bool _transportIncluded = false;
  bool _mealsIncluded = false;
  String? _seedSignature;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      try {
        await context.read<TripRequestsProvider>().fetchBidThread(widget.bidId);
      } catch (_) {}
    });
  }

  @override
  void dispose() {
    _priceController.dispose();
    _descriptionController.dispose();
    _stayDetailsController.dispose();
    _transportDetailsController.dispose();
    _mealDetailsController.dispose();
    _extrasController.dispose();
    super.dispose();
  }

  BidEntity? _findKnownBid(TripRequestsProvider provider) {
    if (provider.selectedBidThread?.id == widget.bidId) {
      return provider.selectedBidThread;
    }

    for (final BidEntity bid in provider.currentBids) {
      if (bid.id == widget.bidId) {
        return bid;
      }
    }

    return null;
  }

  void _seedForm(BidEntity bid) {
    final String signature =
        '${bid.id}:${bid.updatedAt.toIso8601String()}:${bid.revisionCount}';
    if (_seedSignature == signature) {
      return;
    }

    _seedSignature = signature;
    _priceController.text = bid.price.toStringAsFixed(0);
    _descriptionController.text = bid.description ?? '';
    _stayIncluded = bid.offerDetails.stayIncluded;
    _transportIncluded = bid.offerDetails.transportIncluded;
    _mealsIncluded = bid.offerDetails.mealsIncluded;
    _stayDetailsController.text = bid.offerDetails.stayDetails;
    _transportDetailsController.text = bid.offerDetails.transportDetails;
    _mealDetailsController.text = bid.offerDetails.mealDetails;
    _extrasController.text = bid.offerDetails.extras;
  }

  Future<void> _submitCounterOffer(BidEntity bid) async {
    final num? price = num.tryParse(_priceController.text.trim());
    if (price == null || price <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Enter a valid counteroffer price')),
      );
      return;
    }

    final TripRequestsProvider provider = context.read<TripRequestsProvider>();

    try {
      await provider.submitCounterOffer(
        bidId: bid.id,
        price: price,
        description: _descriptionController.text.trim(),
        offerDetails: OfferDetailsEntity(
          stayIncluded: _stayIncluded,
          stayDetails: _stayDetailsController.text.trim(),
          transportIncluded: _transportIncluded,
          transportDetails: _transportDetailsController.text.trim(),
          mealsIncluded: _mealsIncluded,
          mealDetails: _mealDetailsController.text.trim(),
          extras: _extrasController.text.trim(),
        ),
      );

      if (!mounted) {
        return;
      }

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Counteroffer sent to the agency')),
      );
    } catch (_) {
      if (!mounted) {
        return;
      }

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            provider.errorMessage ?? 'Unable to submit counteroffer',
          ),
        ),
      );
    }
  }

  Future<void> _acceptBid(BidEntity bid) async {
    final BookingsProvider bookingsProvider = context.read<BookingsProvider>();
    final TripRequestsProvider tripRequestsProvider = context
        .read<TripRequestsProvider>();

    try {
      final String bookingId = await bookingsProvider.acceptBid(bid.id);
      if (!mounted) {
        return;
      }

      tripRequestsProvider.syncTripRequestStatus(
        widget.tripRequestId,
        'ACCEPTED',
        acceptedBidId: bid.id,
      );

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Offer accepted and booking created')),
      );

      Navigator.of(context).pushReplacement(
        MaterialPageRoute<void>(
          builder: (_) => BookingDetailsPage(bookingId: bookingId),
        ),
      );
    } catch (_) {
      if (!mounted) {
        return;
      }

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            bookingsProvider.errorMessage ?? 'Unable to accept offer',
          ),
        ),
      );
    }
  }

  Widget _buildOfferLine({
    required String title,
    required bool included,
    required String details,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.mist,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Row(
            children: <Widget>[
              Icon(
                included ? Icons.check_circle : Icons.remove_circle_outline,
                color: included ? AppColors.forest : AppColors.clay,
              ),
              const SizedBox(width: 10),
              Text(title, style: const TextStyle(fontWeight: FontWeight.w800)),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            details.trim().isEmpty
                ? included
                      ? 'Included, details not provided yet.'
                      : 'Not included in this offer.'
                : details,
          ),
        ],
      ),
    );
  }

  Widget _buildRevisionTile(BidRevisionEntity revision) {
    final bool agencyAuthored = revision.actorRole == 'AGENCY';

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: agencyAuthored ? Colors.white : const Color(0xFFF5FBF7),
        border: Border.all(
          color: agencyAuthored
              ? const Color(0xFFE5DED2)
              : const Color(0xFFD6EBDD),
        ),
        borderRadius: BorderRadius.circular(22),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Row(
            children: <Widget>[
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 6,
                ),
                decoration: BoxDecoration(
                  color: agencyAuthored
                      ? const Color(0xFFFFF1DA)
                      : const Color(0xFFEAF3EE),
                  borderRadius: BorderRadius.circular(999),
                ),
                child: Text(
                  agencyAuthored ? 'Agency update' : 'Your counteroffer',
                  style: const TextStyle(
                    fontWeight: FontWeight.w700,
                    color: AppColors.ink,
                  ),
                ),
              ),
              const Spacer(),
              Text(
                AppFormatters.dateTime(revision.createdAt),
                style: const TextStyle(color: AppColors.clay),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Text(
            AppFormatters.currency(revision.price),
            style: const TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w900,
              color: AppColors.forest,
            ),
          ),
          if (revision.description != null &&
              revision.description!.trim().isNotEmpty) ...<Widget>[
            const SizedBox(height: 10),
            Text(revision.description!),
          ],
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: <Widget>[
              _OfferChip(
                label: revision.offerDetails.stayIncluded
                    ? 'Stay included'
                    : 'No stay',
              ),
              _OfferChip(
                label: revision.offerDetails.transportIncluded
                    ? 'Transport included'
                    : 'No transport',
              ),
              _OfferChip(
                label: revision.offerDetails.mealsIncluded
                    ? 'Meals included'
                    : 'No meals',
              ),
            ],
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final TripRequestsProvider provider = context.watch<TripRequestsProvider>();
    final BookingsProvider bookingsProvider = context.watch<BookingsProvider>();
    final BidEntity? bid = _findKnownBid(provider);

    if (bid != null) {
      _seedForm(bid);
    }

    final bool showLoading = provider.isBidThreadLoading && bid == null;
    final bool travelerTurn =
        bid?.awaitingActionBy == 'TRAVELER' && bid?.status == 'PENDING';
    final bool agencyTurn =
        bid?.awaitingActionBy == 'AGENCY' && bid?.status == 'PENDING';

    return Scaffold(
      appBar: AppBar(title: const Text('Offer thread')),
      body: Builder(
        builder: (BuildContext context) {
          if (showLoading) {
            return const TrekpalLoadingWidget(
              message: 'Opening negotiation thread...',
            );
          }

          if (provider.errorMessage != null && bid == null) {
            return TrekpalErrorState(
              message: provider.errorMessage!,
              onRetry: () => provider.fetchBidThread(widget.bidId),
            );
          }

          if (bid == null) {
            return const TrekpalErrorState(message: 'Offer thread not found');
          }

          return ListView(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 120),
            children: <Widget>[
              Container(
                padding: const EdgeInsets.all(22),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: <Color>[AppColors.forest, AppColors.moss],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(28),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Text(
                      bid.agencyName,
                      style: Theme.of(context).textTheme.headlineSmall
                          ?.copyWith(
                            color: Colors.white,
                            fontWeight: FontWeight.w900,
                          ),
                    ),
                    const SizedBox(height: 10),
                    Text(
                      AppFormatters.currency(bid.price),
                      style: Theme.of(context).textTheme.headlineMedium
                          ?.copyWith(
                            color: Colors.white,
                            fontWeight: FontWeight.w900,
                          ),
                    ),
                    const SizedBox(height: 10),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: <Widget>[
                        _OfferChip(
                          label: agencyTurn
                              ? 'Awaiting agency'
                              : travelerTurn
                              ? 'Awaiting your response'
                              : bid.status,
                          dark: true,
                        ),
                        _OfferChip(
                          label: '${bid.revisionCount} revisions',
                          dark: true,
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              if (bid.description != null &&
                  bid.description!.trim().isNotEmpty) ...<Widget>[
                const SizedBox(height: 14),
                Container(
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    border: Border.all(color: const Color(0xFFE5DED2)),
                    borderRadius: BorderRadius.circular(22),
                  ),
                  child: Text(bid.description!),
                ),
              ],
              const SizedBox(height: 16),
              _buildOfferLine(
                title: 'Stay',
                included: bid.offerDetails.stayIncluded,
                details: bid.offerDetails.stayDetails,
              ),
              const SizedBox(height: 12),
              _buildOfferLine(
                title: 'Transport',
                included: bid.offerDetails.transportIncluded,
                details: bid.offerDetails.transportDetails,
              ),
              const SizedBox(height: 12),
              _buildOfferLine(
                title: 'Meals',
                included: bid.offerDetails.mealsIncluded,
                details: bid.offerDetails.mealDetails,
              ),
              if (bid.offerDetails.extras.trim().isNotEmpty) ...<Widget>[
                const SizedBox(height: 12),
                _buildOfferLine(
                  title: 'Extras',
                  included: true,
                  details: bid.offerDetails.extras,
                ),
              ],
              const SizedBox(height: 22),
              Text(
                'Negotiation history',
                style: Theme.of(
                  context,
                ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800),
              ),
              const SizedBox(height: 12),
              if (bid.revisions.isEmpty)
                const TrekpalErrorState(
                  message: 'No negotiation history has been recorded yet.',
                )
              else
                ...bid.revisions.map(_buildRevisionTile),
              const SizedBox(height: 24),
              if (agencyTurn)
                Container(
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFFF4DF),
                    borderRadius: BorderRadius.circular(22),
                  ),
                  child: const Text(
                    'Your latest counteroffer is with the agency. They need to respond before you can revise or accept again.',
                  ),
                )
              else if (bid.status == 'ACCEPTED')
                Container(
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    color: const Color(0xFFEAF3EE),
                    borderRadius: BorderRadius.circular(22),
                  ),
                  child: const Text(
                    'This offer has already been accepted and converted into a booking.',
                  ),
                )
              else if (bid.status == 'REJECTED')
                Container(
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFFECE7),
                    borderRadius: BorderRadius.circular(22),
                  ),
                  child: const Text(
                    'This negotiation thread is closed because another offer was chosen.',
                  ),
                )
              else
                Container(
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    border: Border.all(color: const Color(0xFFE5DED2)),
                    borderRadius: BorderRadius.circular(24),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      Text(
                        'Counteroffer',
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      const SizedBox(height: 16),
                      TextField(
                        controller: _priceController,
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(
                          labelText: 'Your total price (PKR)',
                        ),
                      ),
                      const SizedBox(height: 12),
                      TextField(
                        controller: _descriptionController,
                        maxLines: 3,
                        decoration: const InputDecoration(
                          labelText: 'Negotiation note',
                          hintText:
                              'Explain what you want adjusted in the offer.',
                        ),
                      ),
                      const SizedBox(height: 18),
                      SwitchListTile.adaptive(
                        value: _stayIncluded,
                        title: const Text('Stay included'),
                        contentPadding: EdgeInsets.zero,
                        onChanged: (bool value) {
                          setState(() {
                            _stayIncluded = value;
                          });
                        },
                      ),
                      TextField(
                        controller: _stayDetailsController,
                        maxLines: 2,
                        decoration: const InputDecoration(
                          labelText: 'Stay details',
                        ),
                      ),
                      const SizedBox(height: 12),
                      SwitchListTile.adaptive(
                        value: _transportIncluded,
                        title: const Text('Transport included'),
                        contentPadding: EdgeInsets.zero,
                        onChanged: (bool value) {
                          setState(() {
                            _transportIncluded = value;
                          });
                        },
                      ),
                      TextField(
                        controller: _transportDetailsController,
                        maxLines: 2,
                        decoration: const InputDecoration(
                          labelText: 'Transport details',
                        ),
                      ),
                      const SizedBox(height: 12),
                      SwitchListTile.adaptive(
                        value: _mealsIncluded,
                        title: const Text('Meals included'),
                        contentPadding: EdgeInsets.zero,
                        onChanged: (bool value) {
                          setState(() {
                            _mealsIncluded = value;
                          });
                        },
                      ),
                      TextField(
                        controller: _mealDetailsController,
                        maxLines: 2,
                        decoration: const InputDecoration(
                          labelText: 'Meal details',
                        ),
                      ),
                      const SizedBox(height: 12),
                      TextField(
                        controller: _extrasController,
                        maxLines: 2,
                        decoration: const InputDecoration(labelText: 'Extras'),
                      ),
                      const SizedBox(height: 18),
                      Row(
                        children: <Widget>[
                          Expanded(
                            child: OutlinedButton(
                              onPressed:
                                  provider.isNegotiating ||
                                      bookingsProvider.isLoading ||
                                      !travelerTurn
                                  ? null
                                  : () => _submitCounterOffer(bid),
                              child: Text(
                                provider.isNegotiating
                                    ? 'Sending...'
                                    : 'Send counteroffer',
                              ),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: ElevatedButton(
                              onPressed:
                                  provider.isNegotiating ||
                                      bookingsProvider.isLoading ||
                                      !travelerTurn
                                  ? null
                                  : () => _acceptBid(bid),
                              child: Text(
                                bookingsProvider.isLoading
                                    ? 'Accepting...'
                                    : 'Accept offer',
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
            ],
          );
        },
      ),
    );
  }
}

class _OfferChip extends StatelessWidget {
  const _OfferChip({required this.label, this.dark = false});

  final String label;
  final bool dark;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: dark
            ? Colors.white.withValues(alpha: 0.16)
            : const Color(0xFFF3E9D9),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        dark ? label : label,
        style: TextStyle(
          color: dark ? Colors.white : AppColors.ink,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }
}
