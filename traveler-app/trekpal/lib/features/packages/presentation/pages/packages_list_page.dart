import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../../core/utils/formatters.dart';
import '../../../../core/widgets/error_widget.dart';
import '../../../../core/widgets/loading_widget.dart';
import '../../../auth/presentation/pages/traveler_kyc_page.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../../../auth/presentation/widgets/traveler_kyc_gate_card.dart';
import '../../../bookings/domain/entities/booking_entities.dart';
import '../../../bookings/presentation/providers/bookings_provider.dart';
import '../../domain/entities/package_offer_entity.dart';
import '../providers/packages_provider.dart';
import 'package_offer_details_page.dart';

class PackagesListPage extends StatefulWidget {
  const PackagesListPage({super.key});

  @override
  State<PackagesListPage> createState() => _PackagesListPageState();
}

class _PackagesListPageState extends State<PackagesListPage> {
  bool _hasRequestedPackagesLoad = false;
  bool _hasRequestedBookingsLoad = false;

  void _ensureLoaded(bool canUseMarketplace) {
    if (!_hasRequestedPackagesLoad) {
      _hasRequestedPackagesLoad = true;
      WidgetsBinding.instance.addPostFrameCallback((_) {
        context.read<PackagesProvider>().fetchPackages().catchError((_) {});
      });
    }

    if (canUseMarketplace && !_hasRequestedBookingsLoad) {
      _hasRequestedBookingsLoad = true;
      WidgetsBinding.instance.addPostFrameCallback((_) {
        context.read<BookingsProvider>().fetchBookings().catchError((_) {});
      });
    }
  }

  Future<void> _refresh({
    required bool canUseMarketplace,
  }) async {
    final List<Future<void>> tasks = <Future<void>>[
      context.read<PackagesProvider>().fetchPackages(force: true),
    ];

    if (canUseMarketplace) {
      tasks.add(context.read<BookingsProvider>().fetchBookings(force: true));
    }

    await Future.wait(tasks);
  }

  @override
  Widget build(BuildContext context) {
    final ThemeData theme = Theme.of(context);
    final ColorScheme colorScheme = theme.colorScheme;
    final AuthProvider authProvider = context.watch<AuthProvider>();
    final PackagesProvider provider = context.watch<PackagesProvider>();
    final BookingsProvider bookingsProvider = context.watch<BookingsProvider>();

    _ensureLoaded(authProvider.canUseTravelerMarketplace);

    final List<PackageOfferEntity> offers = provider.packages;
    final int joinedOffers = offers
        .where(
          (PackageOfferEntity item) =>
              bookingsProvider.bookingForPackage(item.id)?.status ==
                  'CONFIRMED' ||
              bookingsProvider.bookingForPackage(item.id)?.status ==
                  'COMPLETED',
        )
        .length;

    return Scaffold(
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () => _refresh(
            canUseMarketplace: authProvider.canUseTravelerMarketplace,
          ),
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
                  onRetry: () => _refresh(
                    canUseMarketplace: authProvider.canUseTravelerMarketplace,
                  ),
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
                    'Open an offer, review what is included, then send a booking request.',
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
                          icon: Icons.check_circle_outline,
                          label: 'Confirmed',
                          value: '$joinedOffers',
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 18),
                  if (!authProvider.canUseTravelerMarketplace) ...<Widget>[
                    TravelerKycGateCard(
                      title: 'Verify to book',
                      message:
                          'You can browse offers now. Booking unlocks after traveler KYC approval.',
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
                              onPressed: () => _refresh(
                                canUseMarketplace:
                                    authProvider.canUseTravelerMarketplace,
                              ),
                              icon: const Icon(Icons.refresh_outlined),
                              label: const Text('Refresh offers'),
                            ),
                          ],
                        ),
                      ),
                    )
                  else
                    ...offers.map((PackageOfferEntity offer) {
                      final BookingEntity? booking = bookingsProvider
                          .bookingForPackage(offer.id);
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 14),
                        child: _OfferPreviewCard(
                          offer: offer,
                          bookingStatus: booking?.status,
                          onTap: () {
                            Navigator.of(context).push(
                              MaterialPageRoute<void>(
                                builder: (_) =>
                                    PackageOfferDetailsPage(offer: offer),
                              ),
                            );
                          },
                        ),
                      );
                    }),
                ],
              );
            },
          ),
        ),
      ),
    );
  }
}

class _OfferPreviewCard extends StatelessWidget {
  const _OfferPreviewCard({
    required this.offer,
    required this.bookingStatus,
    required this.onTap,
  });

  final PackageOfferEntity offer;
  final String? bookingStatus;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final ThemeData theme = Theme.of(context);
    final ColorScheme colorScheme = theme.colorScheme;

    return Card(
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(18),
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
                  _StatusPill(status: bookingStatus),
                ],
              ),
              const SizedBox(height: 14),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: <Widget>[
                  _InfoChip(
                    icon: Icons.payments_outlined,
                    label: AppFormatters.currency(offer.price),
                  ),
                  _InfoChip(
                    icon: Icons.today_outlined,
                    label:
                        '${offer.duration} day${offer.duration == 1 ? '' : 's'}',
                  ),
                  _InfoChip(
                    icon: Icons.groups_2_outlined,
                    label:
                        '${offer.participantCount} confirmed traveler${offer.participantCount == 1 ? '' : 's'}',
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
              Row(
                children: <Widget>[
                  Expanded(
                    child: Text(
                      offer.destinations.join(' | '),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: colorScheme.onSurfaceVariant,
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Text(
                    'View details',
                    style: theme.textTheme.labelLarge?.copyWith(
                      color: colorScheme.primary,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _StatusPill extends StatelessWidget {
  const _StatusPill({required this.status});

  final String? status;

  @override
  Widget build(BuildContext context) {
    final ThemeData theme = Theme.of(context);
    final ColorScheme colorScheme = theme.colorScheme;

    String label = 'Open';
    Color background = colorScheme.primary.withValues(alpha: 0.12);
    Color foreground = colorScheme.primary;

    if (status == 'PENDING') {
      label = 'Waiting';
      background = colorScheme.tertiary.withValues(alpha: 0.16);
      foreground = colorScheme.tertiary;
    } else if (status == 'CONFIRMED' || status == 'COMPLETED') {
      label = 'Trip ready';
      background = Colors.green.withValues(alpha: 0.14);
      foreground = Colors.green.shade700;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: background,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style: theme.textTheme.labelMedium?.copyWith(
          color: foreground,
          fontWeight: FontWeight.w700,
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
        color: colorScheme.surfaceContainerHighest.withValues(
          alpha: theme.brightness == Brightness.dark ? 0.26 : 0.5,
        ),
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
