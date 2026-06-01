import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../../core/widgets/error_widget.dart';
import '../../../../core/widgets/loading_widget.dart';
import '../../../auth/presentation/pages/traveler_kyc_page.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../../../auth/presentation/widgets/traveler_kyc_gate_card.dart';
import '../../../booking/presentation/widgets/booking_card.dart';
import '../../domain/entities/booking_entities.dart';
import '../providers/bookings_provider.dart';
import 'booking_details_page.dart';

class BookingsListPage extends StatefulWidget {
  const BookingsListPage({super.key});

  @override
  State<BookingsListPage> createState() => _BookingsListPageState();
}

class _BookingsListPageState extends State<BookingsListPage> {
  bool _hasRequestedInitialLoad = false;

  void _ensureLoaded() {
    if (_hasRequestedInitialLoad) return;
    _hasRequestedInitialLoad = true;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<BookingsProvider>().fetchBookings().catchError((_) {});
    });
  }

  @override
  Widget build(BuildContext context) {
    final ThemeData theme = Theme.of(context);
    final ColorScheme cs = theme.colorScheme;
    final bool dark = theme.brightness == Brightness.dark;

    final AuthProvider auth = context.watch<AuthProvider>();
    final String kycStatus =
        auth.currentUser?.travelerKycStatus ?? 'NOT_SUBMITTED';
    final BookingsProvider provider = context.watch<BookingsProvider>();

    final List<BookingEntity> bookings = provider.bookings
        .where((b) => b.status == 'CONFIRMED' || b.status == 'COMPLETED')
        .toList();

    if (auth.canUseTravelerMarketplace) {
      _ensureLoaded();
    } else {
      _hasRequestedInitialLoad = false;
    }

    final int active =
        bookings.where((b) => b.status != 'COMPLETED').length;
    final int completed =
        bookings.where((b) => b.status == 'COMPLETED').length;
    final int group =
        bookings.where((b) => (b.packageTravelerCount ?? 0) > 1).length;

    return Scaffold(
      body: SafeArea(
        child: auth.canUseTravelerMarketplace
            ? RefreshIndicator(
                onRefresh: () => provider.fetchBookings(force: true),
                child: Builder(
                  builder: (BuildContext context) {
                    if (provider.isLoading && bookings.isEmpty) {
                      return const TrekpalLoadingWidget(
                          message: 'Loading your trips...');
                    }
                    if (provider.errorMessage != null && bookings.isEmpty) {
                      return TrekpalErrorState(
                        message: provider.errorMessage!,
                        onRetry: () => provider.fetchBookings(force: true),
                      );
                    }

                    return ListView(
                      physics: const AlwaysScrollableScrollPhysics(),
                      padding: const EdgeInsets.fromLTRB(20, 20, 20, 120),
                      children: <Widget>[
                        // ── Header ────────────────────────────
                        _PageHeader(
                          eyebrow: 'My trips',
                          title: 'Your journeys',
                          subtitle: 'Confirmed offers and current departures.',
                        ),
                        const SizedBox(height: 20),

                        // ── Stats ─────────────────────────────
                        Row(
                          children: <Widget>[
                            Expanded(
                              child: _StatCard(
                                icon: Icons.confirmation_num_outlined,
                                label: 'Bookings',
                                value: '${bookings.length}',
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: _StatCard(
                                icon: Icons.flight_takeoff_outlined,
                                label: 'Active',
                                value: '$active',
                                highlight: true,
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: _StatCard(
                                icon: Icons.groups_2_outlined,
                                label: 'Group',
                                value: '$group',
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 20),

                        // ── List ──────────────────────────────
                        if (bookings.isEmpty)
                          _EmptyState(
                            icon: Icons.luggage_outlined,
                            title: 'No trips yet',
                            subtitle:
                                'Confirmed agency trips will appear here after approval.',
                          )
                        else
                          ...bookings.map(
                            (BookingEntity b) => Padding(
                              padding: const EdgeInsets.only(bottom: 12),
                              child: BookingCard(
                                booking: b,
                                onTap: () {
                                  Navigator.of(context).push(
                                    MaterialPageRoute<void>(
                                      builder: (_) => BookingDetailsPage(
                                        bookingId: b.id,
                                        initialBooking: b,
                                      ),
                                    ),
                                  );
                                },
                              ),
                            ),
                          ),
                      ],
                    );
                  },
                ),
              )
            : ListView(
                padding: const EdgeInsets.fromLTRB(20, 20, 20, 120),
                children: <Widget>[
                  _PageHeader(
                    eyebrow: 'My trips',
                    title: kycStatus == 'PENDING'
                        ? 'KYC in review'
                        : kycStatus == 'REJECTED'
                            ? 'KYC needs update'
                            : 'Trips are locked',
                    subtitle: kycStatus == 'PENDING'
                        ? 'Bookings unlock after admin approval.'
                        : kycStatus == 'REJECTED'
                            ? 'Update your KYC to use offers again.'
                            : 'Complete traveler KYC before joining an offer.',
                  ),
                  const SizedBox(height: 24),
                  TravelerKycGateCard(
                    title: kycStatus == 'PENDING'
                        ? 'KYC under review'
                        : kycStatus == 'REJECTED'
                            ? 'KYC needs update'
                            : 'Bookings are locked',
                    message: kycStatus == 'PENDING'
                        ? 'You already submitted your KYC. Check it while you wait.'
                        : kycStatus == 'REJECTED'
                            ? 'Open KYC, fix the details, and resubmit.'
                            : 'Finish KYC first, then this screen will track your trips.',
                    actionLabel: kycStatus == 'PENDING'
                        ? 'View KYC'
                        : kycStatus == 'REJECTED'
                            ? 'Update KYC'
                            : 'Complete KYC',
                    onPressed: () => Navigator.of(context).push(
                      MaterialPageRoute<bool>(
                          builder: (_) => const TravelerKycPage()),
                    ),
                  ),
                ],
              ),
      ),
    );
  }
}

// ── Shared components ─────────────────────────────────────────────────────────

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
          style: theme.textTheme.bodyLarge
              ?.copyWith(color: cs.onSurfaceVariant),
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
                alpha: dark ? 0.35 : 0.55),
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
            style: theme.textTheme.bodySmall?.copyWith(
              color: cs.onSurfaceVariant,
              fontSize: 11,
            ),
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
  });
  final IconData icon;
  final String title;
  final String subtitle;

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
        ],
      ),
    );
  }
}
