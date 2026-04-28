import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../../core/utils/formatters.dart';
import '../../../../core/widgets/error_widget.dart';
import '../../../../core/widgets/loading_widget.dart';
import '../../../../core/widgets/participant_roster.dart';
import '../../../auth/presentation/pages/traveler_kyc_page.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../../../bookings/domain/entities/booking_entities.dart';
import '../../../bookings/presentation/pages/booking_details_page.dart';
import '../../../bookings/presentation/providers/bookings_provider.dart';
import '../../domain/entities/package_offer_entity.dart';
import '../providers/packages_provider.dart';

class PackageOfferDetailsPage extends StatefulWidget {
  const PackageOfferDetailsPage({
    super.key,
    required this.offer,
  });

  final PackageOfferEntity offer;

  @override
  State<PackageOfferDetailsPage> createState() => _PackageOfferDetailsPageState();
}

class _PackageOfferDetailsPageState extends State<PackageOfferDetailsPage> {
  bool _requestedInitialLoad = false;
  late final PackagesProvider _packagesProvider;
  late final BookingsProvider _bookingsProvider;

  @override
  void initState() {
    super.initState();
    _packagesProvider = context.read<PackagesProvider>();
    _bookingsProvider = context.read<BookingsProvider>();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) {
        return;
      }

      _packagesProvider.setActivePackage(widget.offer.id);
    });
  }

  @override
  void dispose() {
    _packagesProvider.setActivePackage(null);
    super.dispose();
  }

  void _ensureLoaded() {
    if (_requestedInitialLoad) {
      return;
    }

    _requestedInitialLoad = true;
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      await _refreshData(force: true);
    });
  }

  Future<void> _refreshData({bool force = false}) async {
    await Future.wait(<Future<void>>[
      _packagesProvider.fetchPackageById(widget.offer.id, force: force),
      _bookingsProvider.fetchBookings(force: force),
    ]);
  }

  Future<void> _handleConfirmBooking(PackageOfferEntity offer) async {
    final AuthProvider authProvider = context.read<AuthProvider>();
    final PackagesProvider packagesProvider = context.read<PackagesProvider>();
    final BookingsProvider bookingsProvider = context.read<BookingsProvider>();
    final ScaffoldMessengerState messenger = ScaffoldMessenger.of(context);

    if (!authProvider.canUseTravelerMarketplace) {
      await Navigator.of(
        context,
      ).push(MaterialPageRoute<bool>(builder: (_) => const TravelerKycPage()));
      return;
    }

    try {
      await packagesProvider.applyToPackage(
        packageId: offer.id,
      );
      await Future.wait(<Future<void>>[
        packagesProvider.fetchPackages(force: true),
        packagesProvider.fetchPackageById(offer.id, force: true),
        bookingsProvider.fetchBookings(force: true),
      ]);
      if (!mounted) {
        return;
      }
      messenger.showSnackBar(
        SnackBar(
          content: Text(
            '${offer.name} request sent. Waiting for agency confirmation.',
          ),
        ),
      );
    } catch (_) {
      if (!mounted) {
        return;
      }
      messenger.showSnackBar(
        SnackBar(
          content: Text(
            packagesProvider.errorMessage ??
                'Failed to send booking request.',
          ),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    _ensureLoaded();

    final ThemeData theme = Theme.of(context);
    final ColorScheme colorScheme = theme.colorScheme;
    final PackagesProvider packagesProvider = context.watch<PackagesProvider>();
    final BookingsProvider bookingsProvider = context.watch<BookingsProvider>();
    final PackageOfferEntity offer =
        packagesProvider.selectedPackage?.id == widget.offer.id
            ? packagesProvider.selectedPackage!
            : widget.offer;
    final BookingEntity? packageBooking =
        bookingsProvider.bookingForPackage(offer.id);
    final bool isConfirmed = packageBooking?.status == 'CONFIRMED' ||
        packageBooking?.status == 'COMPLETED';
    final bool isPending = packageBooking?.status == 'PENDING';
    final bool isApplying = packagesProvider.applyingPackageId == offer.id;
    final DateTime? startDate = offer.startDate;
    final DateTime? endDate = startDate?.add(
      Duration(days: offer.duration <= 1 ? 0 : offer.duration - 1),
    );

    VoidCallback? primaryAction;
    String primaryLabel;
    String helperText;

    if (isConfirmed) {
      primaryLabel = 'Open trip';
      helperText = 'Agency confirmed this trip. You can now see it in Trips.';
      primaryAction = () {
        if (packageBooking == null) {
          return;
        }

        Navigator.of(context).push(
          MaterialPageRoute<void>(
            builder: (_) => BookingDetailsPage(
              bookingId: packageBooking.id,
              initialBooking: packageBooking,
            ),
          ),
        );
      };
    } else if (isPending) {
      primaryLabel = 'Waiting for agency';
      helperText =
          'Your request is sent. The trip moves to Trips after agency confirmation.';
      primaryAction = null;
    } else if (offer.isSoldOut) {
      primaryLabel = 'Sold out';
      helperText = 'No seats left in this trip offer.';
      primaryAction = null;
    } else if (isApplying) {
      primaryLabel = 'Sending request...';
      helperText = 'Submitting your booking request.';
      primaryAction = null;
    } else {
      primaryLabel = 'Confirm booking';
      helperText =
          'This sends a booking request. Agency confirmation unlocks Trips and chat.';
      primaryAction = () => _handleConfirmBooking(offer);
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Offer details'),
      ),
      bottomNavigationBar: SafeArea(
        minimum: const EdgeInsets.fromLTRB(20, 12, 20, 20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: <Widget>[
            ElevatedButton(
              onPressed: primaryAction,
              child: Text(primaryLabel),
            ),
            const SizedBox(height: 10),
            Text(
              helperText,
              textAlign: TextAlign.center,
              style: theme.textTheme.bodySmall?.copyWith(
                color: colorScheme.onSurfaceVariant,
              ),
            ),
          ],
        ),
      ),
      body: RefreshIndicator(
        onRefresh: () => _refreshData(force: true),
        child: Builder(
          builder: (BuildContext context) {
            if (packagesProvider.isLoading &&
                packagesProvider.selectedPackage == null) {
              return const TrekpalLoadingWidget(
                message: 'Loading offer details...',
              );
            }

            if (packagesProvider.errorMessage != null &&
                packagesProvider.selectedPackage == null) {
              return TrekpalErrorState(
                message: packagesProvider.errorMessage!,
                onRetry: () => _refreshData(force: true),
              );
            }

            return ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.fromLTRB(20, 12, 20, 140),
              children: <Widget>[
                Text(offer.name, style: theme.textTheme.displaySmall),
                const SizedBox(height: 8),
                Text(
                  offer.agencyName,
                  style: theme.textTheme.titleMedium?.copyWith(
                    color: colorScheme.onSurfaceVariant,
                  ),
                ),
                const SizedBox(height: 18),
                _ImageGallery(
                  title: 'Trip preview',
                  images: offer.images,
                  placeholderIcon: Icons.photo_library_outlined,
                  placeholderLabel: offer.name,
                ),
                const SizedBox(height: 18),
                Wrap(
                  spacing: 10,
                  runSpacing: 10,
                  children: <Widget>[
                    _InfoChip(
                      icon: Icons.payments_outlined,
                      label: AppFormatters.currency(offer.price),
                    ),
                    _InfoChip(
                      icon: Icons.event_outlined,
                      label: startDate == null || endDate == null
                          ? 'Date TBA'
                          : AppFormatters.dateRange(startDate, endDate),
                    ),
                    _InfoChip(
                      icon: Icons.today_outlined,
                      label:
                          '${offer.duration} day${offer.duration == 1 ? '' : 's'}',
                    ),
                    _InfoChip(
                      icon: Icons.groups_2_outlined,
                      label: offer.isSoldOut
                          ? 'Sold out'
                          : '${offer.remainingSeats} seat${offer.remainingSeats == 1 ? '' : 's'} left',
                    ),
                    ...offer.destinations.map(
                      (String destination) => _InfoChip(
                        icon: Icons.place_outlined,
                        label: destination,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 18),
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: <Widget>[
                        Text(
                          'What you will get',
                          style: theme.textTheme.titleLarge,
                        ),
                        const SizedBox(height: 10),
                        Text(
                          (offer.description ?? '').trim().isNotEmpty
                              ? offer.description!.trim()
                              : 'This offer includes the package shared by the agency. You will see the full trip in Trips after the agency confirms your request.',
                          style: theme.textTheme.bodyLarge?.copyWith(
                            color: colorScheme.onSurfaceVariant,
                            height: 1.45,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                if (offer.hotel != null) ...<Widget>[
                  const SizedBox(height: 18),
                  _InventorySection(
                    title: 'Stay',
                    subtitle:
                        '${offer.hotel!.name} · ${offer.hotel!.city}, ${offer.hotel!.country}',
                    details: offer.hotel!.rating != null
                        ? '${offer.hotel!.rating!.toStringAsFixed(1)} star hotel'
                        : 'Hotel stay included',
                    images: offer.hotel!.images,
                    fallbackImage: offer.hotel!.image,
                    placeholderIcon: Icons.hotel_outlined,
                  ),
                ],
                if (offer.vehicle != null) ...<Widget>[
                  const SizedBox(height: 18),
                  _InventorySection(
                    title: 'Vehicle',
                    subtitle:
                        '${offer.vehicle!.make} ${offer.vehicle!.model} · ${offer.vehicle!.type}',
                    details: '${offer.vehicle!.capacity} seats',
                    images: offer.vehicle!.images,
                    fallbackImage: offer.vehicle!.image,
                    placeholderIcon: Icons.directions_car_filled_outlined,
                  ),
                ],
                const SizedBox(height: 18),
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(20),
                    child: ParticipantRoster(
                      participants: offer.participants,
                      title: 'Who is going',
                      countLabel: offer.participantCount == 0
                          ? 'No confirmed travelers yet'
                          : '${offer.participantCount} traveler${offer.participantCount == 1 ? '' : 's'} confirmed',
                    ),
                  ),
                ),
                if (isPending) ...<Widget>[
                  const SizedBox(height: 18),
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(18),
                      child: Row(
                        children: <Widget>[
                          Icon(
                            Icons.hourglass_top_rounded,
                            color: colorScheme.primary,
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              'Your booking request is pending. Trips and group chat unlock after the agency confirms it.',
                              style: theme.textTheme.bodyMedium?.copyWith(
                                color: colorScheme.onSurfaceVariant,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ],
            );
          },
        ),
      ),
    );
  }
}

class _InventorySection extends StatelessWidget {
  const _InventorySection({
    required this.title,
    required this.subtitle,
    required this.details,
    required this.images,
    required this.fallbackImage,
    required this.placeholderIcon,
  });

  final String title;
  final String subtitle;
  final String details;
  final List<String> images;
  final String? fallbackImage;
  final IconData placeholderIcon;

  @override
  Widget build(BuildContext context) {
    final ThemeData theme = Theme.of(context);
    final List<String> gallery = images.isNotEmpty
        ? images
        : <String>[
            if ((fallbackImage ?? '').trim().isNotEmpty) fallbackImage!,
          ];

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Text(title, style: theme.textTheme.titleLarge),
            const SizedBox(height: 6),
            Text(subtitle, style: theme.textTheme.titleSmall),
            const SizedBox(height: 6),
            Text(details, style: theme.textTheme.bodyMedium),
            const SizedBox(height: 14),
            _ImageGallery(
              title: title,
              images: gallery,
              placeholderIcon: placeholderIcon,
              placeholderLabel: title,
            ),
          ],
        ),
      ),
    );
  }
}

class _ImageGallery extends StatefulWidget {
  const _ImageGallery({
    required this.title,
    required this.images,
    required this.placeholderIcon,
    required this.placeholderLabel,
  });

  final String title;
  final List<String> images;
  final IconData placeholderIcon;
  final String placeholderLabel;

  @override
  State<_ImageGallery> createState() => _ImageGalleryState();
}

class _ImageGalleryState extends State<_ImageGallery> {
  late final PageController _controller;
  int _currentIndex = 0;

  @override
  void initState() {
    super.initState();
    _controller = PageController();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final ThemeData theme = Theme.of(context);
    final ColorScheme colorScheme = theme.colorScheme;
    final List<String> images = widget.images
        .where((String item) => item.trim().isNotEmpty)
        .toList();

    if (images.isEmpty) {
      return Container(
        height: 220,
        decoration: BoxDecoration(
          color: colorScheme.surfaceContainerHighest.withValues(
            alpha: theme.brightness == Brightness.dark ? 0.26 : 0.5,
          ),
          borderRadius: BorderRadius.circular(28),
        ),
        alignment: Alignment.center,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            Icon(widget.placeholderIcon, size: 40, color: colorScheme.primary),
            const SizedBox(height: 12),
            Text(widget.placeholderLabel, style: theme.textTheme.titleMedium),
          ],
        ),
      );
    }

    return Column(
      children: <Widget>[
        SizedBox(
          height: 220,
          child: ClipRRect(
            borderRadius: BorderRadius.circular(28),
            child: PageView.builder(
              controller: _controller,
              itemCount: images.length,
              onPageChanged: (int index) {
                setState(() {
                  _currentIndex = index;
                });
              },
              itemBuilder: (BuildContext context, int index) {
                return Image.network(
                  images[index],
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) => Container(
                    color: colorScheme.surfaceContainerHighest,
                    alignment: Alignment.center,
                    child: Icon(
                      widget.placeholderIcon,
                      color: colorScheme.primary,
                      size: 36,
                    ),
                  ),
                );
              },
            ),
          ),
        ),
        if (images.length > 1) ...<Widget>[
          const SizedBox(height: 10),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List<Widget>.generate(images.length, (int index) {
              final bool active = index == _currentIndex;
              return AnimatedContainer(
                duration: const Duration(milliseconds: 180),
                margin: const EdgeInsets.symmetric(horizontal: 3),
                width: active ? 18 : 8,
                height: 8,
                decoration: BoxDecoration(
                  color: active
                      ? colorScheme.primary
                      : colorScheme.primary.withValues(alpha: 0.26),
                  borderRadius: BorderRadius.circular(999),
                ),
              );
            }),
          ),
        ],
      ],
    );
  }
}

class _InfoChip extends StatelessWidget {
  const _InfoChip({required this.icon, required this.label});

  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    final ThemeData theme = Theme.of(context);
    final ColorScheme colorScheme = theme.colorScheme;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: colorScheme.surfaceContainerHighest.withValues(
          alpha: theme.brightness == Brightness.dark ? 0.26 : 0.5,
        ),
        borderRadius: BorderRadius.circular(18),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          Icon(icon, size: 16, color: colorScheme.primary),
          const SizedBox(width: 6),
          Text(label, style: theme.textTheme.bodySmall),
        ],
      ),
    );
  }
}
