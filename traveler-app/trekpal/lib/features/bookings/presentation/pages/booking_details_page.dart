import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../../core/widgets/avatar_group.dart';
import '../../../../core/utils/formatters.dart';
import '../../../../core/widgets/destination_artwork.dart';
import '../../../../core/widgets/error_widget.dart';
import '../../../../core/widgets/loading_widget.dart';
import '../../../chat/presentation/pages/chat_room_page.dart';
import '../../../complaints/presentation/pages/complaint_form_page.dart';
import '../../../reviews/presentation/pages/review_form_page.dart';
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

  Widget _detailCard(
    BuildContext context, {
    required IconData icon,
    required String label,
    required String value,
  }) {
    final ThemeData theme = Theme.of(context);
    final ColorScheme colorScheme = theme.colorScheme;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: colorScheme.surfaceContainerHighest.withValues(
          alpha: theme.brightness == Brightness.dark ? 0.38 : 0.52,
        ),
        borderRadius: BorderRadius.circular(22),
      ),
      child: Row(
        children: <Widget>[
          CircleAvatar(
            backgroundColor: colorScheme.primary.withValues(alpha: 0.12),
            foregroundColor: colorScheme.primary,
            child: Icon(icon),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(
                  label,
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: colorScheme.onSurfaceVariant,
                  ),
                ),
                const SizedBox(height: 4),
                Text(value, style: theme.textTheme.titleSmall),
              ],
            ),
          ),
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
              message: 'Loading trip details...',
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
          final List<String> participantNames = booking.packageParticipants
              .map((participant) => participant.travelerName)
              .toList();

          return ListView(
            padding: const EdgeInsets.fromLTRB(20, 8, 20, 32),
            children: <Widget>[
              Text(destination, style: theme.textTheme.displayMedium),
              const SizedBox(height: 10),
              Text(
                'Simple trip summary, travelers, and support tools.',
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
              Column(
                children: <Widget>[
                  _detailCard(
                    context,
                    icon: Icons.apartment_outlined,
                    label: 'Agency',
                    value: booking.agencyName ?? 'Pending',
                  ),
                  const SizedBox(height: 12),
                  _detailCard(
                    context,
                    icon: Icons.calendar_today_outlined,
                    label: 'Dates',
                    value: AppFormatters.dateRange(
                      booking.startDate,
                      booking.endDate,
                    ),
                  ),
                  const SizedBox(height: 12),
                  _detailCard(
                    context,
                    icon: Icons.payments_outlined,
                    label: 'Amount',
                    value: AppFormatters.currency(booking.totalAmount),
                  ),
                  const SizedBox(height: 12),
                  _detailCard(
                    context,
                    icon: Icons.confirmation_num_outlined,
                    label: 'Booking ID',
                    value: booking.id,
                  ),
                ],
              ),
              if (booking.packageParticipants.isNotEmpty) ...<Widget>[
                const SizedBox(height: 18),
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(20),
                    child: Row(
                      children: <Widget>[
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: <Widget>[
                              Text(
                                'Travelers going',
                                style: theme.textTheme.titleLarge,
                              ),
                              const SizedBox(height: 6),
                              Text(
                                '${booking.packageTravelerCount ?? booking.packageParticipants.length} traveler${(booking.packageTravelerCount ?? booking.packageParticipants.length) == 1 ? '' : 's'} in this offer',
                                style: theme.textTheme.bodySmall?.copyWith(
                                  color: colorScheme.onSurfaceVariant,
                                ),
                              ),
                            ],
                          ),
                        ),
                        AvatarGroup(
                          participants: booking.packageParticipants,
                          avatarRadius: 18,
                        ),
                      ],
                    ),
                  ),
                ),
              ],
              const SizedBox(height: 18),
              Text('Tools', style: theme.textTheme.titleLarge),
              const SizedBox(height: 12),
              Wrap(
                spacing: 12,
                runSpacing: 12,
                children: <Widget>[
                  SizedBox(
                    width: 156,
                    child: _ActionCard(
                      icon: Icons.rate_review_outlined,
                      label: 'Review',
                      subtitle: 'Mockup',
                      onTap: () {
                        Navigator.of(context).push(
                          MaterialPageRoute<void>(
                            builder: (_) => ReviewFormPage(
                              bookingId: booking.id,
                              subject: destination,
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                  SizedBox(
                    width: 156,
                    child: _ActionCard(
                      icon: Icons.forum_outlined,
                      label: 'Trip chat',
                      subtitle: 'Mockup',
                      onTap: () {
                        Navigator.of(context).push(
                          MaterialPageRoute<void>(
                            builder: (_) => ChatRoomPage(
                              title: destination,
                              participantNames: participantNames,
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                  SizedBox(
                    width: 156,
                    child: _ActionCard(
                      icon: Icons.report_problem_outlined,
                      label: 'Complaint',
                      subtitle: 'Mockup',
                      onTap: () {
                        Navigator.of(context).push(
                          MaterialPageRoute<void>(
                            builder: (_) => ComplaintFormPage(
                              bookingId: booking.id,
                              subject: destination,
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ),
            ],
          );
        },
      ),
    );
  }
}

class _ActionCard extends StatelessWidget {
  const _ActionCard({
    required this.icon,
    required this.label,
    required this.subtitle,
    required this.onTap,
  });

  final IconData icon;
  final String label;
  final String subtitle;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final ThemeData theme = Theme.of(context);
    final ColorScheme colorScheme = theme.colorScheme;

    return Card(
      child: InkWell(
        borderRadius: BorderRadius.circular(30),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            children: <Widget>[
              CircleAvatar(
                backgroundColor: colorScheme.primary.withValues(alpha: 0.12),
                foregroundColor: colorScheme.primary,
                child: Icon(icon),
              ),
              const SizedBox(height: 12),
              Text(label, style: theme.textTheme.titleSmall),
              const SizedBox(height: 4),
              Text(
                subtitle,
                style: theme.textTheme.bodySmall?.copyWith(
                  color: colorScheme.onSurfaceVariant,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
