import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';

import '../../../../core/utils/formatters.dart';
import '../../../../core/widgets/destination_artwork.dart';
import '../../../../core/widgets/error_widget.dart';
import '../../../../core/widgets/loading_widget.dart';
import '../../../../core/widgets/participant_roster.dart';
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
          final String? agencyPhone = booking.agencyPhone?.trim().isNotEmpty ==
                  true
              ? booking.agencyPhone!.trim()
              : null;
          final bool canCancelStatus =
              booking.status == 'PENDING' || booking.status == 'CONFIRMED';
          final DateTime cancelCutoff = booking.startDate.subtract(
            const Duration(days: 3),
          );
          final DateTime now = DateTime.now();
          final bool canCancelTime = !now.isAfter(cancelCutoff);
          final bool canCancel = canCancelStatus && canCancelTime;
          return ListView(
            padding: const EdgeInsets.fromLTRB(20, 8, 20, 32),
            children: <Widget>[
              if (provider.errorMessage != null) ...<Widget>[
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Row(
                      children: <Widget>[
                        Icon(Icons.info_outline, color: colorScheme.secondary),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            'Showing saved booking details while the latest trip data reloads.',
                            style: theme.textTheme.bodyMedium?.copyWith(
                              color: colorScheme.onSurfaceVariant,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),
              ],
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
                    icon: Icons.phone_in_talk_outlined,
                    label: 'Emergency contact',
                    value: agencyPhone ?? 'Not provided',
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
                    child: ParticipantRoster(
                      participants: booking.packageParticipants,
                      title: 'Travelers going',
                      countLabel:
                          '${booking.packageTravelerCount ?? booking.packageParticipants.length} traveler${(booking.packageTravelerCount ?? booking.packageParticipants.length) == 1 ? '' : 's'} in this offer',
                      maxRows: booking.packageParticipants.length,
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
                  if (canCancelStatus)
                    SizedBox(
                      width: 156,
                      child: _ActionCard(
                        icon: Icons.cancel_outlined,
                        label: 'Cancel trip',
                        subtitle: canCancel
                            ? 'Allowed'
                            : 'Before ${AppFormatters.date(cancelCutoff)}',
                        onTap: () async {
                          final ScaffoldMessengerState messenger =
                              ScaffoldMessenger.of(context);
                          if (!canCancel) {
                            messenger.showSnackBar(
                              SnackBar(
                                content: Text(
                                  'Trips can only be cancelled 3 days before the start date (until ${AppFormatters.date(cancelCutoff)}).',
                                ),
                              ),
                            );
                            return;
                          }

                          final bool? confirmed = await showDialog<bool>(
                            context: context,
                            builder: (BuildContext dialogContext) {
                              return AlertDialog(
                                title: const Text('Cancel this trip?'),
                                content: const Text(
                                  'You will opt out from this trip. This cannot be undone.',
                                ),
                                actions: <Widget>[
                                  TextButton(
                                    onPressed: () => Navigator.of(
                                      dialogContext,
                                    ).pop(false),
                                    child: const Text('Keep booking'),
                                  ),
                                  FilledButton(
                                    onPressed: () => Navigator.of(
                                      dialogContext,
                                    ).pop(true),
                                    child: const Text('Cancel trip'),
                                  ),
                                ],
                              );
                            },
                          );

                          if (confirmed != true || !context.mounted) {
                            return;
                          }

                          try {
                            await context
                                .read<BookingsProvider>()
                                .cancelBooking(booking.id);
                            if (!context.mounted) {
                              return;
                            }
                            messenger.showSnackBar(
                              const SnackBar(
                                content: Text('Trip cancelled successfully'),
                              ),
                            );
                          } catch (_) {
                            if (!context.mounted) {
                              return;
                            }
                            messenger.showSnackBar(
                              SnackBar(
                                content: Text(
                                  context.read<BookingsProvider>().errorMessage ??
                                      'Unable to cancel this trip',
                                ),
                              ),
                            );
                          }
                        },
                      ),
                    ),
                  if (agencyPhone != null)
                    SizedBox(
                      width: 156,
                      child: _ActionCard(
                        icon: Icons.content_copy_outlined,
                        label: 'Copy number',
                        subtitle: 'Emergency',
                        onTap: () async {
                          await Clipboard.setData(
                            ClipboardData(text: agencyPhone),
                          );
                          if (!context.mounted) {
                            return;
                          }
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text('Agency number copied'),
                            ),
                          );
                        },
                      ),
                    ),
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
                      subtitle: booking.packageId != null
                          ? 'Live'
                          : 'Offer only',
                      onTap: () {
                        if (booking.packageId == null) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text(
                                'Trip chat is available for joined offers only.',
                              ),
                            ),
                          );
                          return;
                        }

                        Navigator.of(context).push(
                          MaterialPageRoute<void>(
                            builder: (_) => ChatRoomPage(
                              packageId: booking.packageId,
                              fallbackTitle: destination,
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
