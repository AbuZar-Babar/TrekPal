import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/utils/formatters.dart';
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

  @override
  Widget build(BuildContext context) {
    final BookingsProvider provider = context.watch<BookingsProvider>();
    final BookingEntity? booking =
        provider.selectedBooking?.id == widget.bookingId
        ? provider.selectedBooking
        : widget.initialBooking;

    return Scaffold(
      appBar: AppBar(title: const Text('Booking details')),
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

          return ListView(
            padding: const EdgeInsets.all(20),
            children: <Widget>[
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(22),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      Text(
                        booking.destination ?? 'Trip booking',
                        style: Theme.of(context).textTheme.headlineSmall
                            ?.copyWith(
                              fontWeight: FontWeight.w800,
                              color: AppColors.pine,
                            ),
                      ),
                      const SizedBox(height: 10),
                      Text(
                        AppFormatters.dateRange(
                          booking.startDate,
                          booking.endDate,
                        ),
                      ),
                      const SizedBox(height: 18),
                      _DetailRow(
                        label: 'Agency',
                        value: booking.agencyName ?? 'Pending assignment',
                      ),
                      _DetailRow(label: 'Status', value: booking.status),
                      _DetailRow(
                        label: 'Amount',
                        value: AppFormatters.currency(booking.totalAmount),
                      ),
                      _DetailRow(label: 'Booking ID', value: booking.id),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 12),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(22),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      Text(
                        'What happens next',
                        style: Theme.of(context).textTheme.titleMedium
                            ?.copyWith(fontWeight: FontWeight.w800),
                      ),
                      const SizedBox(height: 10),
                      const Text(
                        'The accepted agency can now confirm, manage, and complete this booking from their portal. This traveler app currently focuses on visibility of the booking lifecycle rather than traveler-side status actions.',
                      ),
                    ],
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

class _DetailRow extends StatelessWidget {
  const _DetailRow({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          SizedBox(
            width: 110,
            child: Text(
              label,
              style: const TextStyle(fontWeight: FontWeight.w700),
            ),
          ),
          Expanded(child: Text(value)),
        ],
      ),
    );
  }
}
