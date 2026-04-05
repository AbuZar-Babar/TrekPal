import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../../core/utils/formatters.dart';
import '../../../../core/widgets/error_widget.dart';
import '../../../../core/widgets/loading_widget.dart';
import '../../../auth/presentation/pages/traveler_kyc_page.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
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
  late final TripRequestsProvider _tripRequestsProvider;

  @override
  void initState() {
    super.initState();
    _tripRequestsProvider = context.read<TripRequestsProvider>();
    _tripRequestsProvider.setActiveBidThread(widget.bidId);
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      try {
        await _tripRequestsProvider.fetchBidThread(widget.bidId);
      } catch (_) {}
    });
  }

  @override
  void dispose() {
    _tripRequestsProvider.setActiveBidThread(null);
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
    if (!context.read<AuthProvider>().canUseTravelerMarketplace) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Complete traveler KYC before negotiating offers'),
        ),
      );
      return;
    }

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
    if (!context.read<AuthProvider>().canUseTravelerMarketplace) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Complete traveler KYC before accepting an offer'),
        ),
      );
      return;
    }

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
        const SnackBar(
          content: Text('Offer accepted and added to your Trips'),
        ),
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
    final ThemeData theme = Theme.of(context);
    final ColorScheme colorScheme = theme.colorScheme;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: colorScheme.surfaceContainerHighest.withValues(
          alpha: theme.brightness == Brightness.dark ? 0.4 : 0.5,
        ),
        borderRadius: BorderRadius.circular(24),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Row(
            children: <Widget>[
              Icon(
                included ? Icons.check_circle : Icons.remove_circle_outline,
                color: included ? colorScheme.tertiary : colorScheme.secondary,
              ),
              const SizedBox(width: 10),
              Text(title, style: theme.textTheme.titleSmall),
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
    final ThemeData theme = Theme.of(context);
    final ColorScheme colorScheme = theme.colorScheme;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: agencyAuthored
            ? colorScheme.surfaceContainerHighest.withValues(
                alpha: theme.brightness == Brightness.dark ? 0.42 : 0.48,
              )
            : colorScheme.tertiaryContainer.withValues(alpha: 0.45),
        border: Border.all(
          color: agencyAuthored
              ? colorScheme.outlineVariant
              : colorScheme.tertiary.withValues(alpha: 0.22),
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
                      ? colorScheme.secondaryContainer.withValues(alpha: 0.85)
                      : colorScheme.tertiaryContainer.withValues(alpha: 0.8),
                  borderRadius: BorderRadius.circular(999),
                ),
                child: Text(
                  agencyAuthored ? 'Agency update' : 'Your counteroffer',
                  style: theme.textTheme.labelMedium?.copyWith(
                    color: colorScheme.onSurface,
                  ),
                ),
              ),
              const Spacer(),
              Text(
                AppFormatters.dateTime(revision.createdAt),
                style: theme.textTheme.bodySmall?.copyWith(
                  color: colorScheme.onSurfaceVariant,
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Text(
            AppFormatters.currency(revision.price),
            style: theme.textTheme.headlineSmall?.copyWith(
              color: colorScheme.primary,
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
    final AuthProvider authProvider = context.watch<AuthProvider>();
    final BidEntity? bid = _findKnownBid(provider);

    if (bid != null) {
      _seedForm(bid);
    }

    final bool showLoading = provider.isBidThreadLoading && bid == null;
    final bool travelerTurn =
        bid?.awaitingActionBy == 'TRAVELER' && bid?.status == 'PENDING';
    final bool agencyTurn =
        bid?.awaitingActionBy == 'AGENCY' && bid?.status == 'PENDING';
    final ThemeData theme = Theme.of(context);
    final ColorScheme colorScheme = theme.colorScheme;

    return Scaffold(
      appBar: AppBar(),
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
            padding: const EdgeInsets.fromLTRB(20, 8, 20, 120),
            children: <Widget>[
              Text(
                'Offer and Negotiation',
                style: theme.textTheme.displayMedium,
              ),
              const SizedBox(height: 10),
              Text(
                'Follow the full revision history, counter with structure, or accept the latest agency proposal.',
                style: theme.textTheme.bodyLarge?.copyWith(
                  color: colorScheme.onSurfaceVariant,
                ),
              ),
              const SizedBox(height: 18),
              Container(
                padding: const EdgeInsets.all(22),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: <Color>[
                      colorScheme.primary,
                      colorScheme.primaryContainer,
                    ],
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
                    color: colorScheme.surfaceContainerHighest.withValues(
                      alpha: theme.brightness == Brightness.dark ? 0.42 : 0.48,
                    ),
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
                    color: colorScheme.secondaryContainer.withValues(
                      alpha: 0.74,
                    ),
                    borderRadius: BorderRadius.circular(22),
                  ),
                  child: Text(
                    'Your latest counteroffer is with the agency. They need to respond before you can revise or accept again.',
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: colorScheme.onSecondaryContainer,
                    ),
                  ),
                )
              else if (bid.status == 'ACCEPTED')
                Container(
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    color: colorScheme.tertiaryContainer.withValues(
                      alpha: 0.72,
                    ),
                    borderRadius: BorderRadius.circular(22),
                  ),
                  child: Text(
                    'This offer has already been accepted and converted into a booking.',
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: colorScheme.onTertiaryContainer,
                    ),
                  ),
                )
              else if (bid.status == 'REJECTED')
                Container(
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    color: colorScheme.errorContainer.withValues(alpha: 0.78),
                    borderRadius: BorderRadius.circular(22),
                  ),
                  child: Text(
                    'This negotiation thread is closed because another offer was chosen.',
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: colorScheme.onErrorContainer,
                    ),
                  ),
                )
              else
                Container(
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    color: colorScheme.surfaceContainerHighest.withValues(
                      alpha: theme.brightness == Brightness.dark ? 0.42 : 0.48,
                    ),
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
                                      !travelerTurn ||
                                      !authProvider.canUseTravelerMarketplace
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
                                      !travelerTurn ||
                                      !authProvider.canUseTravelerMarketplace
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
                      if (!authProvider.canUseTravelerMarketplace) ...<Widget>[
                        const SizedBox(height: 16),
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: colorScheme.secondaryContainer.withValues(
                              alpha: 0.74,
                            ),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: <Widget>[
                              const Text(
                                'Traveler KYC required',
                                style: TextStyle(fontWeight: FontWeight.w800),
                              ),
                              const SizedBox(height: 8),
                              const Text(
                                'Complete traveler verification before you send counteroffers or accept this agency offer.',
                              ),
                              const SizedBox(height: 12),
                              OutlinedButton.icon(
                                onPressed: () {
                                  Navigator.of(context).push(
                                    MaterialPageRoute<bool>(
                                      builder: (_) => const TravelerKycPage(),
                                    ),
                                  );
                                },
                                icon: const Icon(Icons.badge_outlined),
                                label: const Text('Complete traveler KYC'),
                              ),
                            ],
                          ),
                        ),
                      ],
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
    final ThemeData theme = Theme.of(context);
    final ColorScheme colorScheme = theme.colorScheme;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: dark
            ? Colors.white.withValues(alpha: 0.16)
            : colorScheme.surfaceContainerHighest.withValues(
                alpha: theme.brightness == Brightness.dark ? 0.36 : 0.54,
              ),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style: theme.textTheme.labelMedium?.copyWith(
          color: dark ? Colors.white : colorScheme.onSurface,
        ),
      ),
    );
  }
}
