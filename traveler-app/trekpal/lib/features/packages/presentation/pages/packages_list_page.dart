import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../../core/widgets/error_widget.dart';
import '../../../../core/widgets/loading_widget.dart';
import '../../../../core/widgets/participant_roster.dart';
import '../../../auth/presentation/pages/traveler_kyc_page.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../../../auth/presentation/widgets/traveler_kyc_gate_card.dart';
import '../../../bookings/presentation/providers/bookings_provider.dart';
import '../../domain/entities/package_offer_entity.dart';
import '../providers/packages_provider.dart';

class PackagesListPage extends StatefulWidget {
  const PackagesListPage({super.key});

  @override
  State<PackagesListPage> createState() => _PackagesListPageState();
}

class _PackagesListPageState extends State<PackagesListPage> {
  bool _hasRequestedInitialLoad = false;

  void _ensureLoaded() {
    if (_hasRequestedInitialLoad) {
      return;
    }

    _hasRequestedInitialLoad = true;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<PackagesProvider>().fetchPackages().catchError((_) {});
    });
  }

  Future<void> _handleApply(PackageOfferEntity offer) async {
    final AuthProvider authProvider = context.read<AuthProvider>();
    final PackagesProvider packagesProvider = context.read<PackagesProvider>();
    final BookingsProvider bookingsProvider = context.read<BookingsProvider>();
    final ScaffoldMessengerState messenger = ScaffoldMessenger.of(context);

    if (!authProvider.canUseTravelerMarketplace) {
      await Navigator.of(
        context,
      ).push(MaterialPageRoute<bool>(builder: (_) => const TravelerKycPage()));
      return;
    }

    final DateTime now = DateTime.now();
    final DateTime? selectedDate = await showDatePicker(
      context: context,
      initialDate: now.add(const Duration(days: 1)),
      firstDate: now,
      lastDate: now.add(const Duration(days: 365)),
      helpText: 'Select start date',
    );

    if (selectedDate == null || !mounted) {
      return;
    }

    try {
      await packagesProvider.applyToPackage(
        packageId: offer.id,
        startDate: selectedDate,
      );
      await Future.wait(<Future<void>>[
        packagesProvider.fetchPackages(force: true),
        bookingsProvider.fetchBookings(force: true),
      ]);
      if (!mounted) {
        return;
      }
      messenger.showSnackBar(
        SnackBar(content: Text('${offer.name} booked. Check Trips.')),
      );
    } catch (_) {
      if (!mounted) {
        return;
      }
      messenger.showSnackBar(
        SnackBar(
          content: Text(
            packagesProvider.errorMessage ?? 'Failed to book trip offer.',
          ),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final ThemeData theme = Theme.of(context);
    final ColorScheme colorScheme = theme.colorScheme;
    final AuthProvider authProvider = context.watch<AuthProvider>();
    final PackagesProvider provider = context.watch<PackagesProvider>();
    final String? currentTravelerId = authProvider.currentUser?.id;

    _ensureLoaded();

    final List<PackageOfferEntity> offers = provider.packages;
    final int joinedOffers = offers
        .where(
          (PackageOfferEntity item) =>
              currentTravelerId != null &&
              item.participants.any(
                (participant) => participant.userId == currentTravelerId,
              ),
        )
        .length;

    return Scaffold(
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () => provider.fetchPackages(force: true),
          child: Builder(
            builder: (BuildContext context) {
              if (provider.isLoading && offers.isEmpty) {
                return const TrekpalLoadingWidget(
                  message: 'Loading planned trips...',
                );
              }

              if (provider.errorMessage != null && offers.isEmpty) {
                return TrekpalErrorState(
                  message: provider.errorMessage!,
                  onRetry: () => provider.fetchPackages(force: true),
                );
              }

              return ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 120),
                children: <Widget>[
                  Text(
                    'Join a planned trip',
                    style: theme.textTheme.displayMedium,
                  ),
                  const SizedBox(height: 10),
                  Text(
                    'Pick an agency offer and see who is already in.',
                    style: theme.textTheme.bodyLarge?.copyWith(
                      color: colorScheme.onSurfaceVariant,
                    ),
                  ),
                  const SizedBox(height: 18),
                  Row(
                    children: <Widget>[
                      Expanded(
                        child: _MiniStat(
                          icon: Icons.route_outlined,
                          label: 'Offers',
                          value: '${offers.length}',
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: _MiniStat(
                          icon: Icons.groups_2_outlined,
                          label: 'Joined',
                          value: '$joinedOffers',
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 18),
                  if (!authProvider.canUseTravelerMarketplace) ...<Widget>[
                    TravelerKycGateCard(
                      title: 'Verify to join',
                      message:
                          'Browse now. Booking unlocks after KYC approval.',
                      actionLabel: 'Complete traveler KYC',
                      onPressed: () {
                        Navigator.of(context).push(
                          MaterialPageRoute<bool>(
                            builder: (_) => const TravelerKycPage(),
                          ),
                        );
                      },
                    ),
                    const SizedBox(height: 18),
                  ],
                  if (offers.isEmpty)
                    Card(
                      child: Padding(
                        padding: const EdgeInsets.all(26),
                        child: Column(
                          children: <Widget>[
                            Icon(
                              Icons.map_outlined,
                              size: 54,
                              color: colorScheme.primary,
                            ),
                            const SizedBox(height: 18),
                            Text(
                              'No offers available right now',
                              style: theme.textTheme.headlineSmall,
                            ),
                            const SizedBox(height: 10),
                            Text(
                              'Check back later or pull to refresh after an agency posts a trip offer.',
                              textAlign: TextAlign.center,
                              style: theme.textTheme.bodyLarge?.copyWith(
                                color: colorScheme.onSurfaceVariant,
                              ),
                            ),
                            const SizedBox(height: 18),
                            OutlinedButton.icon(
                              onPressed: () =>
                                  provider.fetchPackages(force: true),
                              icon: const Icon(Icons.refresh_outlined),
                              label: const Text('Refresh offers'),
                            ),
                          ],
                        ),
                      ),
                    )
                  else
                    ...offers.map(
                      (PackageOfferEntity offer) => Padding(
                        padding: const EdgeInsets.only(bottom: 14),
                        child: _OfferCard(
                          offer: offer,
                          isApplying: provider.applyingPackageId == offer.id,
                          isJoined:
                              currentTravelerId != null &&
                              offer.participants.any(
                                (participant) =>
                                    participant.userId == currentTravelerId,
                              ),
                          canApply: authProvider.canUseTravelerMarketplace,
                          onApply: () => _handleApply(offer),
                        ),
                      ),
                    ),
                ],
              );
            },
          ),
        ),
      ),
    );
  }
}

class _OfferCard extends StatelessWidget {
  const _OfferCard({
    required this.offer,
    required this.isApplying,
    required this.isJoined,
    required this.canApply,
    required this.onApply,
  });

  final PackageOfferEntity offer;
  final bool isApplying;
  final bool isJoined;
  final bool canApply;
  final VoidCallback onApply;

  @override
  Widget build(BuildContext context) {
    final ThemeData theme = Theme.of(context);
    final ColorScheme colorScheme = theme.colorScheme;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      Text(offer.name, style: theme.textTheme.headlineSmall),
                      const SizedBox(height: 6),
                      Text(
                        offer.agencyName,
                        style: theme.textTheme.bodyMedium?.copyWith(
                          color: colorScheme.onSurfaceVariant,
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 14,
                    vertical: 10,
                  ),
                  decoration: BoxDecoration(
                    color: colorScheme.primary.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(18),
                  ),
                  child: Text(
                    'PKR ${offer.price.toStringAsFixed(0)}',
                    style: theme.textTheme.titleMedium?.copyWith(
                      color: colorScheme.primary,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ],
            ),
            if ((offer.description ?? '').trim().isNotEmpty) ...<Widget>[
              const SizedBox(height: 12),
              Text(
                offer.description!,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: colorScheme.onSurfaceVariant,
                ),
              ),
            ],
            const SizedBox(height: 14),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: <Widget>[
                _InfoChip(
                  icon: Icons.today_outlined,
                  label:
                      '${offer.duration} day${offer.duration == 1 ? '' : 's'}',
                ),
                ...offer.destinations.map(
                  (String destination) =>
                      _InfoChip(icon: Icons.place_outlined, label: destination),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: colorScheme.surfaceContainerHighest.withValues(
                  alpha: theme.brightness == Brightness.dark ? 0.26 : 0.56,
                ),
                borderRadius: BorderRadius.circular(22),
              ),
              child: ParticipantRoster(
                participants: offer.participants,
                title: 'Who is going',
                countLabel: offer.participantCount == 0
                    ? 'Be the first traveler to join'
                    : '${offer.participantCount} traveler${offer.participantCount == 1 ? '' : 's'} joined',
              ),
            ),
            if (offer.hotel != null || offer.vehicle != null) ...<Widget>[
              const SizedBox(height: 16),
              Column(
                children: <Widget>[
                  if (offer.hotel != null)
                    _InventorySummaryCard(
                      imageUrl: offer.hotel!.image,
                      icon: Icons.hotel_outlined,
                      title: offer.hotel!.name,
                      subtitle:
                          '${offer.hotel!.city}, ${offer.hotel!.country}',
                      details: offer.hotel!.rating != null
                          ? 'Stay · ${offer.hotel!.rating!.toStringAsFixed(1)} stars'
                          : 'Stay',
                    ),
                  if (offer.hotel != null && offer.vehicle != null)
                    const SizedBox(height: 12),
                  if (offer.vehicle != null)
                    _InventorySummaryCard(
                      imageUrl: offer.vehicle!.image,
                      icon: Icons.directions_car_filled_outlined,
                      title:
                          '${offer.vehicle!.make} ${offer.vehicle!.model}',
                      subtitle: offer.vehicle!.type,
                      details: '${offer.vehicle!.capacity} seats',
                    ),
                ],
              ),
            ],
            const SizedBox(height: 18),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: isApplying || isJoined ? null : onApply,
                icon: Icon(
                  isJoined
                      ? Icons.check_circle_outline
                      : canApply
                      ? Icons.event_available_outlined
                      : Icons.lock_outline,
                ),
                label: Text(
                  isJoined
                      ? 'Joined'
                      : isApplying
                      ? 'Joining...'
                      : canApply
                      ? 'Join offer'
                      : 'Verify to join',
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _InventorySummaryCard extends StatelessWidget {
  const _InventorySummaryCard({
    required this.imageUrl,
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.details,
  });

  final String? imageUrl;
  final IconData icon;
  final String title;
  final String subtitle;
  final String details;

  @override
  Widget build(BuildContext context) {
    final ThemeData theme = Theme.of(context);
    final ColorScheme colorScheme = theme.colorScheme;

    return Container(
      decoration: BoxDecoration(
        color: colorScheme.surfaceContainerHighest.withValues(
          alpha: theme.brightness == Brightness.dark ? 0.22 : 0.48,
        ),
        borderRadius: BorderRadius.circular(22),
      ),
      child: Row(
        children: <Widget>[
          ClipRRect(
            borderRadius: const BorderRadius.horizontal(
              left: Radius.circular(22),
            ),
            child: SizedBox(
              width: 96,
              height: 96,
              child: imageUrl != null && imageUrl!.trim().isNotEmpty
                  ? Image.network(imageUrl!, fit: BoxFit.cover)
                  : Container(
                      color: colorScheme.primary.withValues(alpha: 0.12),
                      alignment: Alignment.center,
                      child: Icon(icon, color: colorScheme.primary, size: 30),
                    ),
            ),
          ),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Text(title, style: theme.textTheme.titleMedium),
                  const SizedBox(height: 4),
                  Text(
                    subtitle,
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: colorScheme.onSurfaceVariant,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    details,
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: colorScheme.primary,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _MiniStat extends StatelessWidget {
  const _MiniStat({
    required this.icon,
    required this.label,
    required this.value,
  });

  final IconData icon;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    final ThemeData theme = Theme.of(context);
    final ColorScheme colorScheme = theme.colorScheme;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: <Widget>[
            CircleAvatar(
              backgroundColor: colorScheme.primary.withValues(alpha: 0.12),
              foregroundColor: colorScheme.primary,
              child: Icon(icon),
            ),
            const SizedBox(width: 12),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(value, style: theme.textTheme.titleLarge),
                Text(
                  label,
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: colorScheme.onSurfaceVariant,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _InfoChip extends StatelessWidget {
  const _InfoChip({required this.icon, required this.label});

  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    final ThemeData theme = Theme.of(context);
    final ColorScheme colorScheme = theme.colorScheme;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: colorScheme.surface.withValues(alpha: 0.9),
        borderRadius: BorderRadius.circular(18),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          Icon(icon, size: 16, color: colorScheme.primary),
          const SizedBox(width: 6),
          Text(label, style: theme.textTheme.bodySmall),
        ],
      ),
    );
  }
}
