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
    if (_hasRequestedInitialLoad) {
      return;
    }

    _hasRequestedInitialLoad = true;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<BookingsProvider>().fetchBookings().catchError((_) {});
    });
  }

  @override
  Widget build(BuildContext context) {
    final ThemeData theme = Theme.of(context);
    final ColorScheme colorScheme = theme.colorScheme;
    final AuthProvider authProvider = context.watch<AuthProvider>();
    final String travelerKycStatus =
        authProvider.currentUser?.travelerKycStatus ?? 'NOT_SUBMITTED';
    final BookingsProvider provider = context.watch<BookingsProvider>();
    final List<BookingEntity> bookings = provider.bookings
        .where(
          (BookingEntity item) =>
              item.status == 'CONFIRMED' || item.status == 'COMPLETED',
        )
        .toList();

    if (authProvider.canUseTravelerMarketplace) {
      _ensureLoaded();
    } else {
      _hasRequestedInitialLoad = false;
    }

    final int activeTrips = bookings
        .where((BookingEntity item) => item.status != 'COMPLETED')
        .length;
    final int groupTrips = bookings
        .where((BookingEntity item) => (item.packageTravelerCount ?? 0) > 1)
        .length;

    return Scaffold(
      body: SafeArea(
        child: authProvider.canUseTravelerMarketplace
            ? RefreshIndicator(
                onRefresh: () => provider.fetchBookings(force: true),
                child: Builder(
                  builder: (BuildContext context) {
                    if (provider.isLoading && bookings.isEmpty) {
                      return const TrekpalLoadingWidget(
                        message: 'Loading your trips...',
                      );
                    }

                    if (provider.errorMessage != null && bookings.isEmpty) {
                      return TrekpalErrorState(
                        message: provider.errorMessage!,
                        onRetry: () => provider.fetchBookings(force: true),
                      );
                    }

                    return ListView(
                      physics: const AlwaysScrollableScrollPhysics(),
                      padding: const EdgeInsets.fromLTRB(20, 16, 20, 120),
                      children: <Widget>[
                        Text('My trips', style: theme.textTheme.displayMedium),
                        const SizedBox(height: 10),
                        Text(
                          'Accepted offers and current departures.',
                          style: theme.textTheme.bodyLarge?.copyWith(
                            color: colorScheme.onSurfaceVariant,
                          ),
                        ),
                        const SizedBox(height: 18),
                        Row(
                          children: <Widget>[
                            Expanded(
                              child: _MiniStat(
                                icon: Icons.confirmation_num_outlined,
                                label: 'Bookings',
                                value: '${bookings.length}',
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: _MiniStat(
                                icon: Icons.flight_takeoff_outlined,
                                label: 'Active',
                                value: '$activeTrips',
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: _MiniStat(
                                icon: Icons.groups_2_outlined,
                                label: 'Shared',
                                value: '$groupTrips',
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 18),
                        if (bookings.isEmpty)
                          Card(
                            child: Padding(
                              padding: const EdgeInsets.all(26),
                              child: Column(
                                children: <Widget>[
                                  Icon(
                                    Icons.luggage_outlined,
                                    size: 54,
                                    color: colorScheme.primary,
                                  ),
                                  const SizedBox(height: 18),
                                  Text(
                                    'No trips yet',
                                    style: theme.textTheme.headlineSmall,
                                  ),
                                  const SizedBox(height: 10),
                          Text(
                                    'Confirmed agency trips show here after approval.',
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
                          ...bookings.map(
                            (BookingEntity booking) => Padding(
                              padding: const EdgeInsets.only(bottom: 14),
                              child: BookingCard(
                                booking: booking,
                                onTap: () {
                                  Navigator.of(context).push(
                                    MaterialPageRoute<void>(
                                      builder: (_) => BookingDetailsPage(
                                        bookingId: booking.id,
                                        initialBooking: booking,
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
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 120),
                children: <Widget>[
                  Text(
                    travelerKycStatus == 'PENDING'
                        ? 'KYC in review'
                        : travelerKycStatus == 'REJECTED'
                        ? 'KYC needs update'
                        : 'Trips are locked',
                    style: theme.textTheme.displayMedium,
                  ),
                  const SizedBox(height: 10),
                  Text(
                    travelerKycStatus == 'PENDING'
                        ? 'Bookings will unlock after admin approval.'
                        : travelerKycStatus == 'REJECTED'
                        ? 'Update your KYC to use offers and bookings again.'
                        : 'Complete traveler KYC before you can join an offer.',
                    style: theme.textTheme.bodyLarge?.copyWith(
                      color: colorScheme.onSurfaceVariant,
                    ),
                  ),
                  const SizedBox(height: 22),
                  TravelerKycGateCard(
                    title: travelerKycStatus == 'PENDING'
                        ? 'Traveler KYC under review'
                        : travelerKycStatus == 'REJECTED'
                        ? 'Traveler KYC needs update'
                        : 'Bookings are locked',
                    message: travelerKycStatus == 'PENDING'
                        ? 'You already submitted your KYC. Check it while you wait.'
                        : travelerKycStatus == 'REJECTED'
                        ? 'Open KYC, fix the details, and resubmit.'
                        : 'Finish traveler KYC first, then this screen will track your trips.',
                    actionLabel: travelerKycStatus == 'PENDING'
                        ? 'View traveler KYC'
                        : travelerKycStatus == 'REJECTED'
                        ? 'Update traveler KYC'
                        : 'Complete traveler KYC',
                    onPressed: () {
                      Navigator.of(context).push(
                        MaterialPageRoute<bool>(
                          builder: (_) => const TravelerKycPage(),
                        ),
                      );
                    },
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
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Icon(icon, color: colorScheme.primary),
            const SizedBox(height: 10),
            Text(value, style: theme.textTheme.titleLarge),
            const SizedBox(height: 4),
            Text(
              label,
              style: theme.textTheme.bodySmall?.copyWith(
                color: colorScheme.onSurfaceVariant,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
