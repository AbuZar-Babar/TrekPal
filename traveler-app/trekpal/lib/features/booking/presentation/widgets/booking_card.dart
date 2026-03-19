import 'package:flutter/material.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/utils/formatters.dart';
import '../../../bookings/domain/entities/booking_entities.dart';

class BookingCard extends StatelessWidget {
  const BookingCard({super.key, required this.booking, this.onTap});

  final BookingEntity booking;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(24),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Row(
                children: <Widget>[
                  Expanded(
                    child: Text(
                      booking.destination ?? 'Trip booking',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
                  _BookingStatusChip(status: booking.status),
                ],
              ),
              const SizedBox(height: 10),
              Text(AppFormatters.dateRange(booking.startDate, booking.endDate)),
              const SizedBox(height: 12),
              Wrap(
                spacing: 10,
                runSpacing: 10,
                children: <Widget>[
                  _BookingInfoPill(
                    icon: Icons.apartment_outlined,
                    label: booking.agencyName ?? 'Assigned agency',
                  ),
                  _BookingInfoPill(
                    icon: Icons.payments_outlined,
                    label: AppFormatters.currency(booking.totalAmount),
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

class _BookingInfoPill extends StatelessWidget {
  const _BookingInfoPill({required this.icon, required this.label});

  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: const Color(0xFFF3E9D9),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          Icon(icon, size: 16, color: AppColors.clay),
          const SizedBox(width: 8),
          Text(label),
        ],
      ),
    );
  }
}

class _BookingStatusChip extends StatelessWidget {
  const _BookingStatusChip({required this.status});

  final String status;

  @override
  Widget build(BuildContext context) {
    Color background;
    switch (status) {
      case 'CONFIRMED':
      case 'COMPLETED':
        background = const Color(0xFFDDEBDD);
        break;
      case 'CANCELLED':
        background = const Color(0xFFF5DAD2);
        break;
      default:
        background = const Color(0xFFF3E9D9);
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: background,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(status, style: const TextStyle(fontWeight: FontWeight.w700)),
    );
  }
}
