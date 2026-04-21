import 'dart:async';

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../features/auth/presentation/providers/auth_provider.dart';
import '../../features/bookings/presentation/providers/bookings_provider.dart';
import '../../features/packages/presentation/providers/packages_provider.dart';
import '../../features/trip_requests/presentation/providers/trip_requests_provider.dart';
import '../notifications/notification_service.dart';
import 'marketplace_live_service.dart';

class MarketplaceUpdatesCoordinator extends StatefulWidget {
  const MarketplaceUpdatesCoordinator({
    super.key,
    required this.child,
    required this.liveService,
    required this.scaffoldMessengerKey,
  });

  final Widget child;
  final MarketplaceLiveService liveService;
  final GlobalKey<ScaffoldMessengerState> scaffoldMessengerKey;

  @override
  State<MarketplaceUpdatesCoordinator> createState() =>
      _MarketplaceUpdatesCoordinatorState();
}

class _MarketplaceUpdatesCoordinatorState
    extends State<MarketplaceUpdatesCoordinator>
    with WidgetsBindingObserver {
  final Map<String, DateTime> _recentNotifications = <String, DateTime>{};
  AuthProvider? _authProvider;
  bool _isResumed = true;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();

    final AuthProvider nextAuthProvider = context.read<AuthProvider>();
    if (!identical(_authProvider, nextAuthProvider)) {
      _authProvider?.removeListener(_handleAuthChanged);
      _authProvider = nextAuthProvider;
      _authProvider?.addListener(_handleAuthChanged);
      unawaited(_syncConnection());
    }
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      _isResumed = true;
      unawaited(_syncConnection());
      return;
    }

    if (state == AppLifecycleState.paused) {
      _isResumed = false;
      return;
    }

    if (state == AppLifecycleState.detached) {
      _isResumed = false;
      unawaited(widget.liveService.disconnect());
    }
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _authProvider?.removeListener(_handleAuthChanged);
    unawaited(widget.liveService.disconnect());
    super.dispose();
  }

  void _handleAuthChanged() {
    unawaited(_syncConnection());
  }

  Future<void> _syncConnection() async {
    final AuthProvider? authProvider = _authProvider;
    if (!mounted || authProvider == null) {
      return;
    }

    final bool shouldConnect =
        authProvider.isAuthenticated && authProvider.currentUser?.role == 'TRAVELER';

    if (!shouldConnect) {
      await widget.liveService.disconnect();
      return;
    }

    try {
      await widget.liveService.connect(
        onEvent: _handleMarketplaceEvent,
        onError: _handleSocketError,
      );
    } catch (error) {
      _handleSocketError(error.toString());
    }
  }

  Future<void> _handleMarketplaceEvent(MarketplaceLiveEvent event) async {
    if (!mounted) {
      return;
    }

    try {
      if (event is OfferUpdatedEvent) {
        await context.read<PackagesProvider>().refreshPackagesFromLiveEvent(
              packageId: event.packageId,
            );
        _showSnackbar(
          key: event.notificationKey,
          message: _offerMessage(event),
        );
        return;
      }

      if (event is BidUpdatedEvent) {
        await context.read<TripRequestsProvider>().refreshFromBidLiveEvent(
              tripRequestId: event.tripRequestId,
              bidId: event.bidId,
            );
        _showSnackbar(
          key: event.notificationKey,
          message: _bidMessage(event),
        );
        return;
      }

      if (event is BookingUpdatedEvent) {
        await context.read<BookingsProvider>().refreshFromBookingLiveEvent(
              bookingId: event.bookingId,
            );
        _showSnackbar(
          key: event.notificationKey,
          message: _bookingMessage(event),
        );
      }
    } catch (error) {
      debugPrint('Marketplace live update failed: $error');
    }
  }

  void _handleSocketError(String message) {
    debugPrint('Marketplace live socket: $message');
  }

  void _showSnackbar({
    required String key,
    required String message,
  }) {
    final DateTime now = DateTime.now();
    final DateTime? previous = _recentNotifications[key];
    if (previous != null && now.difference(previous).inSeconds < 5) {
      return;
    }

    _recentNotifications[key] = now;
    if (_isResumed) {
      widget.scaffoldMessengerKey.currentState?.showSnackBar(
        SnackBar(content: Text(message)),
      );
      return;
    }

    unawaited(
      NotificationService.show(
        title: 'TrekPal update',
        body: message,
        key: key,
      ),
    );
  }

  String _offerMessage(OfferUpdatedEvent event) {
    switch (event.eventType) {
      case 'CREATED':
        return 'New offer available';
      case 'DELETED':
        return 'An offer was removed';
      default:
        return 'Offer updated';
    }
  }

  String _bidMessage(BidUpdatedEvent event) {
    switch (event.eventType) {
      case 'CREATED':
        return 'New agency bid received';
      case 'COUNTEROFFERED':
        return 'Agency updated an offer';
      case 'ACCEPTED':
        return 'Trip request added to Trips';
      case 'REJECTED':
        return 'A bid thread was closed';
      default:
        return 'Your request has an update';
    }
  }

  String _bookingMessage(BookingUpdatedEvent event) {
    switch (event.status) {
      case 'CONFIRMED':
        return 'Booking confirmed';
      case 'CANCELLED':
        return 'Booking cancelled';
      case 'COMPLETED':
        return 'Trip completed';
      default:
        return 'Booking updated';
    }
  }

  @override
  Widget build(BuildContext context) => widget.child;
}
