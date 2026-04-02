import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../../core/widgets/avatar_group.dart';
import '../../../../core/widgets/error_widget.dart';
import '../../../../core/widgets/loading_widget.dart';
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

    _ensureLoaded();

    final List<PackageOfferEntity> offers = provider.packages;
    final int joinedOffers = offers
        .where((PackageOfferEntity item) => item.participantCount > 0)
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
                              'No trip offers yet',
                              style: theme.textTheme.headlineSmall,
                            ),
                            const SizedBox(height: 10),
                            Text(
                              'Agency offers will appear here after they are posted.',
                              textAlign: TextAlign.center,
                              style: theme.textTheme.bodyLarge?.copyWith(
                                color: colorScheme.onSurfaceVariant,
                              ),
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
    required this.canApply,
    required this.onApply,
  });

  final PackageOfferEntity offer;
  final bool isApplying;
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
              child: Row(
                children: <Widget>[
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: <Widget>[
                        Text('Who is going', style: theme.textTheme.titleSmall),
                        const SizedBox(height: 4),
                        Text(
                          offer.participantCount == 0
                              ? 'Be the first traveler to join'
                              : '${offer.participantCount} traveler${offer.participantCount == 1 ? '' : 's'} joined',
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: colorScheme.onSurfaceVariant,
                          ),
                        ),
                      ],
                    ),
                  ),
                  if (offer.participants.isNotEmpty)
                    AvatarGroup(participants: offer.participants)
                  else
                    Icon(Icons.groups_outlined, color: colorScheme.primary),
                ],
              ),
            ),
            const SizedBox(height: 18),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: isApplying ? null : onApply,
                icon: Icon(
                  canApply
                      ? Icons.event_available_outlined
                      : Icons.lock_outline,
                ),
                label: Text(
                  isApplying
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
