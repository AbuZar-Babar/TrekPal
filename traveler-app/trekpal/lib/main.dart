import 'dart:async';

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'core/constants/app_constants.dart';
import 'core/live/marketplace_live_service.dart';
import 'core/live/marketplace_updates_coordinator.dart';
import 'core/network/api_client.dart';
import 'core/notifications/notification_service.dart';
import 'core/theme/app_theme.dart';
import 'core/theme/theme_controller.dart';
import 'core/widgets/loading_widget.dart';
import 'features/auth/data/datasources/auth_local_datasource.dart';
import 'features/auth/data/datasources/auth_remote_datasource.dart';
import 'features/auth/data/repositories/auth_repository_impl.dart';
import 'features/auth/domain/usecases/login_usecase.dart';
import 'features/auth/domain/usecases/register_usecase.dart';
import 'features/auth/presentation/pages/login_page.dart';
import 'features/auth/presentation/pages/traveler_kyc_page.dart';
import 'features/auth/presentation/pages/traveler_kyc_pending_page.dart';
import 'features/auth/presentation/providers/auth_provider.dart';
import 'features/bookings/data/datasources/bookings_remote_datasource.dart';
import 'features/bookings/data/repositories/bookings_repository_impl.dart';
import 'features/bookings/domain/usecases/accept_bid_usecase.dart';
import 'features/bookings/domain/usecases/get_bookings_usecase.dart';
import 'features/bookings/presentation/providers/bookings_provider.dart';
import 'features/chat/data/datasources/chat_remote_datasource.dart';
import 'features/chat/data/repositories/chat_repository_impl.dart';
import 'features/chat/presentation/providers/chat_provider.dart';
import 'features/home/presentation/pages/home_page.dart';
import 'features/packages/data/datasources/packages_remote_datasource.dart';
import 'features/packages/data/repositories/packages_repository_impl.dart';
import 'features/packages/domain/usecases/apply_package_usecase.dart';
import 'features/packages/domain/usecases/get_package_by_id_usecase.dart';
import 'features/packages/domain/usecases/get_packages_usecase.dart';
import 'features/packages/presentation/providers/packages_provider.dart';
import 'features/trip_requests/data/datasources/trip_requests_remote_datasource.dart';
import 'features/trip_requests/data/repositories/trip_requests_repository_impl.dart';
import 'features/trip_requests/domain/usecases/create_trip_request_usecase.dart';
import 'features/trip_requests/domain/usecases/get_bid_thread_usecase.dart';
import 'features/trip_requests/domain/usecases/get_trip_requests_usecase.dart';
import 'features/trip_requests/domain/usecases/submit_counter_offer_usecase.dart';
import 'features/trip_requests/domain/usecases/view_bids_usecase.dart';
import 'features/trip_requests/presentation/providers/trip_requests_provider.dart';
import 'features/hotels/data/datasources/hotels_remote_datasource.dart';
import 'features/hotels/data/repositories/hotels_repository_impl.dart';
import 'features/hotels/domain/usecases/get_hotels_usecase.dart';
import 'features/hotels/presentation/providers/hotels_provider.dart';
import 'features/transport/data/datasources/transport_remote_datasource.dart';
import 'features/transport/data/repositories/transport_repository_impl.dart';
import 'features/transport/domain/usecases/get_vehicles_usecase.dart';
import 'features/transport/presentation/providers/transport_provider.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  final AuthLocalDataSource authLocalDataSource = AuthLocalDataSource();
  final ApiClient apiClient = ApiClient(
    tokenProvider: authLocalDataSource.getToken,
  );
  await NotificationService.init();
  final ThemeController themeController = await ThemeController.create();

  final authRepository = AuthRepositoryImpl(
    remoteDataSource: AuthRemoteDataSource(apiClient),
    localDataSource: authLocalDataSource,
  );
  final tripRequestsRepository = TripRequestsRepositoryImpl(
    TripRequestsRemoteDataSource(apiClient),
  );
  final bookingsRepository = BookingsRepositoryImpl(
    BookingsRemoteDataSource(apiClient),
  );
  final chatRepository = ChatRepositoryImpl(
    ChatRemoteDataSource(apiClient, tokenProvider: authLocalDataSource.getToken),
  );
  final marketplaceLiveService = MarketplaceLiveService(
    tokenProvider: authLocalDataSource.getToken,
  );
  final packagesRepository = PackagesRepositoryImpl(
    PackagesRemoteDataSource(apiClient),
  );
  final hotelsRepository = HotelsRepositoryImpl(
    remoteDataSource: HotelsRemoteDataSourceImpl(client: apiClient.client),
  );
  final transportRepository = TransportRepositoryImpl(
    remoteDataSource: TransportRemoteDataSourceImpl(client: apiClient.client),
  );

  runApp(
    TrekPalApp(
      authProvider: AuthProvider(
        loginUseCase: LoginUseCase(authRepository),
        registerUseCase: RegisterUseCase(authRepository),
        authRepository: authRepository,
      ),
      tripRequestsProvider: TripRequestsProvider(
        getTripRequestsUseCase: GetTripRequestsUseCase(tripRequestsRepository),
        createTripRequestUseCase: CreateTripRequestUseCase(
          tripRequestsRepository,
        ),
        viewBidsUseCase: ViewBidsUseCase(tripRequestsRepository),
        getBidThreadUseCase: GetBidThreadUseCase(tripRequestsRepository),
        submitCounterOfferUseCase: SubmitCounterOfferUseCase(
          tripRequestsRepository,
        ),
      ),
      bookingsProvider: BookingsProvider(
        getBookingsUseCase: GetBookingsUseCase(bookingsRepository),
        acceptBidUseCase: AcceptBidUseCase(bookingsRepository),
        bookingsRepository: bookingsRepository,
      ),
      packagesProvider: PackagesProvider(
        getPackagesUseCase: GetPackagesUseCase(packagesRepository),
        getPackageByIdUseCase: GetPackageByIdUseCase(packagesRepository),
        applyPackageUseCase: ApplyPackageUseCase(packagesRepository),
      ),
      chatProvider: ChatProvider(chatRepository: chatRepository),
      hotelsProvider: HotelsProvider(
        getHotelsUseCase: GetHotelsUseCase(hotelsRepository),
      ),
      transportProvider: TransportProvider(
        getVehiclesUseCase: GetVehiclesUseCase(transportRepository),
      ),
      marketplaceLiveService: marketplaceLiveService,
      themeController: themeController,
    ),
  );
}

class TrekPalApp extends StatelessWidget {
  const TrekPalApp({
    super.key,
    required this.authProvider,
    required this.tripRequestsProvider,
    required this.bookingsProvider,
    required this.packagesProvider,
    required this.chatProvider,
    required this.hotelsProvider,
    required this.transportProvider,
    required this.marketplaceLiveService,
    required this.themeController,
  });

  final AuthProvider authProvider;
  final TripRequestsProvider tripRequestsProvider;
  final BookingsProvider bookingsProvider;
  final PackagesProvider packagesProvider;
  final ChatProvider chatProvider;
  final HotelsProvider hotelsProvider;
  final TransportProvider transportProvider;
  final MarketplaceLiveService marketplaceLiveService;
  final ThemeController themeController;
  static final GlobalKey<ScaffoldMessengerState> _scaffoldMessengerKey =
      GlobalKey<ScaffoldMessengerState>();

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider<AuthProvider>.value(value: authProvider),
        ChangeNotifierProvider<TripRequestsProvider>.value(
          value: tripRequestsProvider,
        ),
        ChangeNotifierProvider<BookingsProvider>.value(value: bookingsProvider),
        ChangeNotifierProvider<PackagesProvider>.value(value: packagesProvider),
        ChangeNotifierProvider<ChatProvider>.value(value: chatProvider),
        ChangeNotifierProvider<HotelsProvider>.value(value: hotelsProvider),
        ChangeNotifierProvider<TransportProvider>.value(value: transportProvider),
        ChangeNotifierProvider<ThemeController>.value(value: themeController),
      ],
      child: Consumer<ThemeController>(
        builder: (BuildContext context, ThemeController themeController, _) {
          return MaterialApp(
            title: AppConstants.appName,
            debugShowCheckedModeBanner: false,
            scaffoldMessengerKey: _scaffoldMessengerKey,
            theme: AppTheme.lightTheme,
            darkTheme: AppTheme.darkTheme,
            themeMode: themeController.themeMode,
            home: _AppRoot(
              marketplaceLiveService: marketplaceLiveService,
              scaffoldMessengerKey: _scaffoldMessengerKey,
            ),
          );
        },
      ),
    );
  }
}

class _AppRoot extends StatefulWidget {
  const _AppRoot({
    required this.marketplaceLiveService,
    required this.scaffoldMessengerKey,
  });

  final MarketplaceLiveService marketplaceLiveService;
  final GlobalKey<ScaffoldMessengerState> scaffoldMessengerKey;

  @override
  State<_AppRoot> createState() => _AppRootState();
}

class _AppRootState extends State<_AppRoot> with WidgetsBindingObserver {
  AuthProvider? _authProvider;
  bool _hasSeenAuthenticatedTraveler = false;
  String? _lastTravelerKycStatus;
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
      _primeAuthSnapshot(nextAuthProvider);
    }
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _authProvider?.removeListener(_handleAuthChanged);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    _isResumed = state == AppLifecycleState.resumed;
  }

  void _primeAuthSnapshot(AuthProvider authProvider) {
    if (!authProvider.isAuthenticated || !authProvider.isTraveler) {
      _hasSeenAuthenticatedTraveler = false;
      _lastTravelerKycStatus = null;
      return;
    }

    _hasSeenAuthenticatedTraveler = true;
    _lastTravelerKycStatus = authProvider.currentUser?.travelerKycStatus;
  }

  void _handleAuthChanged() {
    final AuthProvider? authProvider = _authProvider;
    if (!mounted || authProvider == null) {
      return;
    }

    if (!authProvider.isAuthenticated || !authProvider.isTraveler) {
      _hasSeenAuthenticatedTraveler = false;
      _lastTravelerKycStatus = null;
      return;
    }

    final String? nextStatus = authProvider.currentUser?.travelerKycStatus;
    if (!_hasSeenAuthenticatedTraveler) {
      _hasSeenAuthenticatedTraveler = true;
      _lastTravelerKycStatus = nextStatus;
      return;
    }

    final String? previousStatus = _lastTravelerKycStatus;
    if (nextStatus == null || nextStatus == previousStatus) {
      return;
    }

    _lastTravelerKycStatus = nextStatus;

    if (nextStatus == 'VERIFIED') {
      if (_isResumed) {
        widget.scaffoldMessengerKey.currentState?.showSnackBar(
          const SnackBar(content: Text('KYC approved. Marketplace unlocked.')),
        );
      } else {
        unawaited(
          NotificationService.show(
            title: 'KYC approved',
            body: 'Marketplace unlocked. You can now book offers.',
            key: 'kyc:VERIFIED',
          ),
        );
      }
      return;
    }

    if (nextStatus == 'REJECTED') {
      if (_isResumed) {
        widget.scaffoldMessengerKey.currentState?.showSnackBar(
          const SnackBar(
            content: Text('KYC needs an update. Please review and resubmit.'),
          ),
        );
      } else {
        unawaited(
          NotificationService.show(
            title: 'KYC needs update',
            body: 'Review your submission and resubmit to unlock booking.',
            key: 'kyc:REJECTED',
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (BuildContext context, AuthProvider authProvider, _) {
        if (authProvider.isInitializing) {
          return const Scaffold(
            body: TrekpalLoadingWidget(message: 'Preparing TrekPal...'),
          );
        }

        if (authProvider.isAuthenticated) {
          if (authProvider.isTraveler) {
            final String kycStatus =
                authProvider.currentUser!.travelerKycStatus;

            if (kycStatus == 'PENDING') {
              return const TravelerKycPendingPage();
            } else if (kycStatus != 'VERIFIED') {
              return const TravelerKycPage();
            }
          }

          return MarketplaceUpdatesCoordinator(
            liveService: widget.marketplaceLiveService,
            scaffoldMessengerKey: widget.scaffoldMessengerKey,
            child: const HomePage(),
          );
        }

        return const LoginPage();
      },
    );
  }
}
