import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../../core/utils/formatters.dart';
import '../../../../core/widgets/destination_artwork.dart';
import '../../../../core/widgets/error_widget.dart';
import '../../../../core/widgets/loading_widget.dart';
import '../../domain/entities/booking_entities.dart';
import '../providers/bookings_provider.dart';

class BookingDetailsPage extends StatefulWidget {
  const BookingDetailsPage({
    super.key,
    required this.bookingId,
    this.initialBooking,
  });

  final String bookingId;
  final BookingEntity? initialBooking;

  @override
  State<BookingDetailsPage> createState() => _BookingDetailsPageState();
}

class _BookingDetailsPageState extends State<BookingDetailsPage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      try {
        await context.read<BookingsProvider>().fetchBookingById(
          widget.bookingId,
        );
      } catch (_) {}
    });
  }

  Widget _detailRow(BuildContext context, String label, String value) {
    final ThemeData theme = Theme.of(context);
    final ColorScheme colorScheme = theme.colorScheme;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: colorScheme.surfaceContainerHighest.withValues(
          alpha: theme.brightness == Brightness.dark ? 0.42 : 0.52,
        ),
        borderRadius: BorderRadius.circular(22),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          SizedBox(
            width: 94,
            child: Text(
              label,
              style: theme.textTheme.bodySmall?.copyWith(
                color: colorScheme.onSurfaceVariant,
              ),
            ),
          ),
          Expanded(child: Text(value, style: theme.textTheme.titleSmall)),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final ThemeData theme = Theme.of(context);
    final ColorScheme colorScheme = theme.colorScheme;
    final BookingsProvider provider = context.watch<BookingsProvider>();
    final BookingEntity? booking =
        provider.selectedBooking?.id == widget.bookingId
        ? provider.selectedBooking
        : widget.initialBooking;

    return Scaffold(
      appBar: AppBar(),
      body: Builder(
        builder: (BuildContext context) {
          if (provider.isLoading && booking == null) {
            return const TrekpalLoadingWidget(
              message: 'Loading booking details...',
            );
          }

          if (provider.errorMessage != null && booking == null) {
            return TrekpalErrorState(
              message: provider.errorMessage!,
              onRetry: () => provider.fetchBookingById(widget.bookingId),
            );
          }

          if (booking == null) {
            return const TrekpalErrorState(message: 'Booking not found');
          }

          final String destination = booking.destination ?? 'Trip booking';

          return ListView(
            padding: const EdgeInsets.fromLTRB(20, 8, 20, 32),
            children: <Widget>[
              Text('Booking Details', style: theme.textTheme.displayMedium),
              const SizedBox(height: 10),
              Text(
                'A confirmed record of the agency offer you accepted from the marketplace.',
                style: theme.textTheme.bodyLarge?.copyWith(
                  color: colorScheme.onSurfaceVariant,
                ),
              ),
              const SizedBox(height: 20),
              TrekpalDestinationArtwork(
                destination: destination,
                caption: booking.agencyName ?? 'Verified agency',
                badge: booking.status,
                height: 220,
              ),
              const SizedBox(height: 18),
              _detailRow(context, 'Agency', booking.agencyName ?? 'Pending'),
              _detailRow(
                context,
                'Dates',
                AppFormatters.dateRange(booking.startDate, booking.endDate),
              ),
              _detailRow(
                context,
                'Amount',
                AppFormatters.currency(booking.totalAmount),
              ),
              _detailRow(context, 'Status', booking.status),
              _detailRow(context, 'Booking ID', booking.id),
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: colorScheme.secondaryContainer.withValues(alpha: 0.74),
                  borderRadius: BorderRadius.circular(24),
                ),
                child: Text(
                  'The accepted agency now manages the operational lifecycle of this booking from their portal. TrekPal keeps this traveler view focused on status visibility and confidence.',
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: colorScheme.onSecondaryContainer,
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}
