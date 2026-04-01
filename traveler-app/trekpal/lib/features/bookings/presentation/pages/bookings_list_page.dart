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
    final BookingsProvider provider = context.watch<BookingsProvider>();
    final List<BookingEntity> bookings = provider.bookings;

    if (authProvider.canUseTravelerMarketplace) {
      _ensureLoaded();
    } else {
      _hasRequestedInitialLoad = false;
    }

    return Scaffold(
      body: SafeArea(
        child: authProvider.canUseTravelerMarketplace
            ? RefreshIndicator(
                onRefresh: () => provider.fetchBookings(force: true),
                child: Builder(
                  builder: (BuildContext context) {
                    if (provider.isLoading && bookings.isEmpty) {
                      return const TrekpalLoadingWidget(
                        message: 'Loading your bookings...',
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
                        Text(
                          'My Bookings',
                          style: theme.textTheme.displayMedium,
                        ),
                        const SizedBox(height: 10),
                        Text(
                          'Track every accepted offer in one place, from confirmed departures to completed journeys.',
                          style: theme.textTheme.bodyLarge?.copyWith(
                            color: colorScheme.onSurfaceVariant,
                          ),
                        ),
                        const SizedBox(height: 22),
                        if (bookings.isEmpty)
                          Container(
                            padding: const EdgeInsets.all(26),
                            decoration: BoxDecoration(
                              color: colorScheme.surfaceContainerHighest
                                  .withValues(
                                    alpha: theme.brightness == Brightness.dark
                                        ? 0.42
                                        : 0.5,
                                  ),
                              borderRadius: BorderRadius.circular(30),
                            ),
                            child: Column(
                              children: <Widget>[
                                Icon(
                                  Icons.luggage_outlined,
                                  size: 54,
                                  color: colorScheme.primary,
                                ),
                                const SizedBox(height: 18),
                                Text(
                                  'No bookings yet',
                                  style: theme.textTheme.headlineSmall,
                                ),
                                const SizedBox(height: 10),
                                Text(
                                  'Accept an agency offer from the marketplace and it will appear here automatically.',
                                  textAlign: TextAlign.center,
                                  style: theme.textTheme.bodyLarge?.copyWith(
                                    color: colorScheme.onSurfaceVariant,
                                  ),
                                ),
                              ],
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
                    'Bookings are locked',
                    style: theme.textTheme.displayMedium,
                  ),
                  const SizedBox(height: 10),
                  Text(
                    'Traveler KYC must be completed before you can accept offers and create bookings.',
                    style: theme.textTheme.bodyLarge?.copyWith(
                      color: colorScheme.onSurfaceVariant,
                    ),
                  ),
                  const SizedBox(height: 22),
                  TravelerKycGateCard(
                    title: 'Bookings are locked',
                    message:
                        'Finish traveler KYC first, then this screen will track every accepted agency offer.',
                    actionLabel: 'Complete traveler KYC',
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
