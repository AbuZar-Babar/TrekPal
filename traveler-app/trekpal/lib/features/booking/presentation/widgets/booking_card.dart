import 'package:flutter/material.dart';

import '../../../../core/utils/formatters.dart';
import '../../../../core/widgets/destination_artwork.dart';
import '../../../bookings/domain/entities/booking_entities.dart';

class BookingCard extends StatelessWidget {
  const BookingCard({super.key, required this.booking, this.onTap});

  final BookingEntity booking;
  final VoidCallback? onTap;

  Widget _metaChip(BuildContext context, IconData icon, String label) {
    final ThemeData theme = Theme.of(context);
    final ColorScheme colorScheme = theme.colorScheme;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: colorScheme.surfaceContainerHighest.withValues(
          alpha: theme.brightness == Brightness.dark ? 0.36 : 0.54,
        ),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          Icon(icon, size: 16, color: colorScheme.primary),
          const SizedBox(width: 8),
          Text(label, style: theme.textTheme.bodySmall),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final ThemeData theme = Theme.of(context);
    final String destination = booking.destination ?? 'Trip booking';

    return Card(
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              TrekpalDestinationArtwork(
                destination: destination,
                caption: booking.agencyName ?? 'Verified agency assignment',
                badge: booking.status,
                height: 164,
              ),
              const SizedBox(height: 18),
              Text(destination, style: theme.textTheme.headlineSmall),
              const SizedBox(height: 10),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: <Widget>[
                  _metaChip(
                    context,
                    Icons.calendar_today_outlined,
                    AppFormatters.dateRange(booking.startDate, booking.endDate),
                  ),
                  _metaChip(
                    context,
                    Icons.apartment_outlined,
                    booking.agencyName ?? 'Assigned agency',
                  ),
                  _metaChip(
                    context,
                    Icons.payments_outlined,
                    AppFormatters.currency(booking.totalAmount),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Row(
                children: <Widget>[
                  Expanded(
                    child: Text(
                      'Booking ID ${booking.id.substring(0, booking.id.length > 8 ? 8 : booking.id.length)}',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: theme.colorScheme.onSurfaceVariant,
                      ),
                    ),
                  ),
                  if (onTap != null)
                    FilledButton.tonalIcon(
                      onPressed: onTap,
                      icon: const Icon(Icons.receipt_long_outlined),
                      label: const Text('View booking'),
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
