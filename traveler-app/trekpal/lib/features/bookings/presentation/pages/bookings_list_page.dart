import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../../core/widgets/error_widget.dart';
import '../../../../core/widgets/loading_widget.dart';
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
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<BookingsProvider>().fetchBookings().catchError((_) {});
    });
  }

  @override
  Widget build(BuildContext context) {
    final BookingsProvider provider = context.watch<BookingsProvider>();
    final List<BookingEntity> bookings = provider.bookings;

    return Scaffold(
      appBar: AppBar(title: const Text('Bookings')),
      body: RefreshIndicator(
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

            if (bookings.isEmpty) {
              return ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(24),
                children: const <Widget>[
                  SizedBox(height: 160),
                  TrekpalErrorState(
                    message:
                        'No bookings yet. Accept an agency bid to create your first booking.',
                  ),
                ],
              );
            }

            return ListView.separated(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.fromLTRB(20, 12, 20, 32),
              itemBuilder: (BuildContext context, int index) {
                final BookingEntity booking = bookings[index];
                return BookingCard(
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
                );
              },
              separatorBuilder: (_, _) => const SizedBox(height: 12),
              itemCount: bookings.length,
            );
          },
        ),
      ),
    );
  }
}
