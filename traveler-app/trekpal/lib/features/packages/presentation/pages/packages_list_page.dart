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

  Future<void> _refresh({required bool canUseMarketplace}) async {
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
    final AuthProvider auth = context.watch<AuthProvider>();
    final PackagesProvider provider = context.watch<PackagesProvider>();
    final BookingsProvider bookingsProvider = context.watch<BookingsProvider>();

    _ensureLoaded(auth.canUseTravelerMarketplace);

    final List<PackageOfferEntity> offers = provider.packages;
    final int confirmed = offers
        .where((o) =>
            bookingsProvider.bookingForPackage(o.id)?.status == 'CONFIRMED' ||
            bookingsProvider.bookingForPackage(o.id)?.status == 'COMPLETED')
        .length;

    return Scaffold(
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () =>
              _refresh(canUseMarketplace: auth.canUseTravelerMarketplace),
          child: Builder(
            builder: (BuildContext context) {
              if (provider.isLoading && offers.isEmpty) {
                return const TrekpalLoadingWidget(
                    message: 'Loading planned trips...');
              }
              if (provider.errorMessage != null && offers.isEmpty) {
                return TrekpalErrorState(
                  message: provider.errorMessage!,
                  onRetry: () => _refresh(
                      canUseMarketplace: auth.canUseTravelerMarketplace),
                );
              }

              return ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.fromLTRB(20, 20, 20, 120),
                children: <Widget>[
                  // ── Header ────────────────────────────────────
                  _PageHeader(
                    eyebrow: 'Agency offers',
                    title: 'Join a planned trip',
                    subtitle:
                        'Open an offer, review what\'s included, then send a booking request.',
                  ),
                  const SizedBox(height: 20),

                  // ── Stats ─────────────────────────────────────
                  Row(
                    children: <Widget>[
                      Expanded(
                        child: _StatCard(
                          icon: Icons.route_outlined,
                          label: 'Available',
                          value: '${offers.length}',
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: _StatCard(
                          icon: Icons.check_circle_outline_rounded,
                          label: 'Joined',
                          value: '$confirmed',
                          highlight: true,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),

                  // ── KYC gate ──────────────────────────────────
                  if (!auth.canUseTravelerMarketplace) ...<Widget>[
                    TravelerKycGateCard(
                      title: 'Verify to book',
                      message:
                          'You can browse offers now. Booking unlocks after KYC approval.',
                      actionLabel: 'Complete KYC',
                      onPressed: () => Navigator.of(context).push(
                        MaterialPageRoute<bool>(
                            builder: (_) => const TravelerKycPage()),
                      ),
                    ),
                    const SizedBox(height: 20),
                  ],

                  // ── Offers ────────────────────────────────────
                  if (offers.isEmpty)
                    _EmptyState(
                      icon: Icons.map_outlined,
                      title: 'No offers available yet',
                      subtitle:
                          'Check back later or pull to refresh after an agency posts a trip.',
                      action: OutlinedButton.icon(
                        onPressed: () => _refresh(
                            canUseMarketplace: auth.canUseTravelerMarketplace),
                        icon: const Icon(Icons.refresh_rounded),
                        label: const Text('Refresh'),
                      ),
                    )
                  else
                    ...offers.map((PackageOfferEntity offer) {
                      final BookingEntity? booking =
                          bookingsProvider.bookingForPackage(offer.id);
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 14),
                        child: _OfferCard(
                          offer: offer,
                          bookingStatus: booking?.status,
                          onTap: () => Navigator.of(context).push(
                            MaterialPageRoute<void>(
                              builder: (_) =>
                                  PackageOfferDetailsPage(offer: offer),
                            ),
                          ),
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

// ── Offer card ────────────────────────────────────────────────────────────────
class _OfferCard extends StatelessWidget {
  const _OfferCard({
    required this.offer,
    required this.bookingStatus,
    required this.onTap,
  });

  final PackageOfferEntity offer;
  final String? bookingStatus;
  final VoidCallback onTap;

  Color _statusBg(ColorScheme cs, bool dark) {
    if (bookingStatus == 'CONFIRMED' || bookingStatus == 'COMPLETED') {
      return Colors.green.withValues(alpha: dark ? 0.22 : 0.12);
    }
    if (bookingStatus == 'PENDING') {
      return cs.tertiary.withValues(alpha: 0.14);
    }
    if (offer.isSoldOut) {
      return cs.error.withValues(alpha: 0.12);
    }
    return cs.primary.withValues(alpha: dark ? 0.18 : 0.1);
  }

  Color _statusFg(ColorScheme cs) {
    if (bookingStatus == 'CONFIRMED' || bookingStatus == 'COMPLETED') {
      return Colors.green.shade700;
    }
    if (bookingStatus == 'PENDING') return cs.tertiary;
    if (offer.isSoldOut) return cs.error;
    return cs.primary;
  }

  String _statusLabel() {
    if (bookingStatus == 'CONFIRMED' || bookingStatus == 'COMPLETED') {
      return 'Joined';
    }
    if (bookingStatus == 'PENDING') return 'Pending';
    if (offer.isSoldOut) return 'Sold out';
    return 'Open';
  }

  @override
  Widget build(BuildContext context) {
    final ThemeData theme = Theme.of(context);
    final ColorScheme cs = theme.colorScheme;
    final bool dark = theme.brightness == Brightness.dark;

    final DateTime? start = offer.startDate;
    final DateTime? end =
        start?.add(Duration(days: offer.duration <= 1 ? 0 : offer.duration - 1));

    return Material(
      color: cs.surfaceContainerHighest.withValues(alpha: dark ? 0.32 : 0.5),
      borderRadius: BorderRadius.circular(24),
      child: InkWell(
        borderRadius: BorderRadius.circular(24),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(18),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              // Row: name + status
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: <Widget>[
                        Text(
                          offer.name,
                          style: theme.textTheme.titleLarge,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 4),
                        Text(
                          offer.agencyName,
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: cs.onSurfaceVariant,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 12),
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                      color: _statusBg(cs, dark),
                      borderRadius: BorderRadius.circular(999),
                    ),
                    child: Text(
                      _statusLabel(),
                      style: theme.textTheme.labelSmall?.copyWith(
                        color: _statusFg(cs),
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 14),

              // Destinations
              if (offer.destinations.isNotEmpty)
                Wrap(
                  spacing: 6,
                  runSpacing: 6,
                  children: offer.destinations
                      .map(
                        (d) => Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 10, vertical: 5),
                          decoration: BoxDecoration(
                            color: cs.primary.withValues(
                                alpha: dark ? 0.14 : 0.08),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            d,
                            style: theme.textTheme.labelSmall?.copyWith(
                              color: cs.primary,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                      )
                      .toList(),
                ),

              const SizedBox(height: 12),
              const Divider(height: 1),
              const SizedBox(height: 12),

              // Meta chips — Wrap handles any length gracefully
              Wrap(
                spacing: 12,
                runSpacing: 6,
                children: <Widget>[
                  _MetaChip(
                    icon: Icons.payments_outlined,
                    label: AppFormatters.currency(offer.price),
                  ),
                  _MetaChip(
                    icon: Icons.today_outlined,
                    label: '${offer.duration} day${offer.duration == 1 ? '' : 's'}',
                  ),
                  if (start != null && end != null)
                    _MetaChip(
                      icon: Icons.event_outlined,
                      label: AppFormatters.dateRange(start, end),
                    ),
                  _MetaChip(
                    icon: Icons.groups_2_outlined,
                    label: offer.isSoldOut
                        ? 'Sold out'
                        : '${offer.remainingSeats} seat${offer.remainingSeats == 1 ? '' : 's'} left',
                  ),
                ],
              ),
              const SizedBox(height: 10),
              Align(
                alignment: Alignment.centerRight,
                child: Text(
                  'View details →',
                  style: theme.textTheme.labelMedium?.copyWith(
                    color: cs.primary,
                  ),
                ),
              ),

              if ((offer.description ?? '').trim().isNotEmpty) ...<Widget>[
                const SizedBox(height: 10),
                Text(
                  offer.description!,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: cs.onSurfaceVariant,
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

class _MetaChip extends StatelessWidget {
  const _MetaChip({required this.icon, required this.label});
  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    final ThemeData theme = Theme.of(context);
    final ColorScheme cs = theme.colorScheme;
    final bool dark = theme.brightness == Brightness.dark;
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: <Widget>[
        Icon(icon, size: 13, color: cs.onSurfaceVariant),
        const SizedBox(width: 4),
        Flexible(
          child: Text(
            label,
            overflow: TextOverflow.ellipsis,
            style: theme.textTheme.bodySmall?.copyWith(
              color: dark ? cs.onSurface : cs.onSurfaceVariant,
              fontSize: 11,
            ),
          ),
        ),
      ],
    );
  }
}

// ── Shared ────────────────────────────────────────────────────────────────────
class _PageHeader extends StatelessWidget {
  const _PageHeader({
    required this.eyebrow,
    required this.title,
    required this.subtitle,
  });
  final String eyebrow;
  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    final ThemeData theme = Theme.of(context);
    final ColorScheme cs = theme.colorScheme;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        Text(
          eyebrow.toUpperCase(),
          style: theme.textTheme.labelSmall?.copyWith(
            color: cs.primary,
            letterSpacing: 1.4,
            fontWeight: FontWeight.w800,
          ),
        ),
        const SizedBox(height: 6),
        Text(title, style: theme.textTheme.headlineMedium),
        const SizedBox(height: 6),
        Text(
          subtitle,
          style: theme.textTheme.bodyLarge?.copyWith(
            color: cs.onSurfaceVariant,
          ),
        ),
      ],
    );
  }
}

class _StatCard extends StatelessWidget {
  const _StatCard({
    required this.icon,
    required this.label,
    required this.value,
    this.highlight = false,
  });
  final IconData icon;
  final String label;
  final String value;
  final bool highlight;

  @override
  Widget build(BuildContext context) {
    final ThemeData theme = Theme.of(context);
    final ColorScheme cs = theme.colorScheme;
    final bool dark = theme.brightness == Brightness.dark;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
      decoration: BoxDecoration(
        color: highlight
            ? cs.primary.withValues(alpha: dark ? 0.18 : 0.08)
            : cs.surfaceContainerHighest.withValues(
                alpha: dark ? 0.35 : 0.55,
              ),
        borderRadius: BorderRadius.circular(18),
        border: highlight
            ? Border.all(color: cs.primary.withValues(alpha: 0.22))
            : null,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Icon(icon,
              size: 18,
              color: highlight ? cs.primary : cs.onSurfaceVariant),
          const SizedBox(height: 10),
          Text(
            value,
            style: theme.textTheme.titleLarge?.copyWith(
              color: highlight ? cs.primary : cs.onSurface,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: theme.textTheme.bodySmall
                ?.copyWith(color: cs.onSurfaceVariant, fontSize: 11),
          ),
        ],
      ),
    );
  }
}

class _EmptyState extends StatelessWidget {
  const _EmptyState({
    required this.icon,
    required this.title,
    required this.subtitle,
    this.action,
  });
  final IconData icon;
  final String title;
  final String subtitle;
  final Widget? action;

  @override
  Widget build(BuildContext context) {
    final ThemeData theme = Theme.of(context);
    final ColorScheme cs = theme.colorScheme;
    final bool dark = theme.brightness == Brightness.dark;
    return Container(
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: cs.surfaceContainerHighest.withValues(
            alpha: dark ? 0.25 : 0.45),
        borderRadius: BorderRadius.circular(28),
      ),
      child: Column(
        children: <Widget>[
          Container(
            width: 64,
            height: 64,
            decoration: BoxDecoration(
              color: cs.primary.withValues(alpha: dark ? 0.18 : 0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: cs.primary, size: 30),
          ),
          const SizedBox(height: 18),
          Text(title,
              textAlign: TextAlign.center,
              style: theme.textTheme.titleLarge),
          const SizedBox(height: 8),
          Text(subtitle,
              textAlign: TextAlign.center,
              style: theme.textTheme.bodyMedium
                  ?.copyWith(color: cs.onSurfaceVariant)),
          if (action != null) ...<Widget>[
            const SizedBox(height: 18),
            action!,
          ],
        ],
      ),
    );
  }
}
