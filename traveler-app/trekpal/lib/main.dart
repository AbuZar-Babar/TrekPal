import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'core/constants/app_constants.dart';
import 'core/network/api_client.dart';
import 'core/theme/app_theme.dart';
import 'core/theme/theme_controller.dart';
import 'core/widgets/loading_widget.dart';
import 'features/auth/data/datasources/auth_local_datasource.dart';
import 'features/auth/data/datasources/auth_remote_datasource.dart';
import 'features/auth/data/repositories/auth_repository_impl.dart';
import 'features/auth/domain/usecases/login_usecase.dart';
import 'features/auth/domain/usecases/register_usecase.dart';
import 'features/auth/presentation/pages/login_page.dart';
import 'features/auth/presentation/providers/auth_provider.dart';
import 'features/bookings/data/datasources/bookings_remote_datasource.dart';
import 'features/bookings/data/repositories/bookings_repository_impl.dart';
import 'features/bookings/domain/usecases/accept_bid_usecase.dart';
import 'features/bookings/domain/usecases/get_bookings_usecase.dart';
import 'features/bookings/presentation/providers/bookings_provider.dart';
import 'features/home/presentation/pages/home_page.dart';
import 'features/trip_requests/data/datasources/trip_requests_remote_datasource.dart';
import 'features/trip_requests/data/repositories/trip_requests_repository_impl.dart';
import 'features/trip_requests/domain/usecases/create_trip_request_usecase.dart';
import 'features/trip_requests/domain/usecases/get_bid_thread_usecase.dart';
import 'features/trip_requests/domain/usecases/get_trip_requests_usecase.dart';
import 'features/trip_requests/domain/usecases/submit_counter_offer_usecase.dart';
import 'features/trip_requests/domain/usecases/view_bids_usecase.dart';
import 'features/trip_requests/presentation/providers/trip_requests_provider.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  final AuthLocalDataSource authLocalDataSource = AuthLocalDataSource();
  final ApiClient apiClient = ApiClient(
    tokenProvider: authLocalDataSource.getToken,
  );
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
    required this.themeController,
  });

  final AuthProvider authProvider;
  final TripRequestsProvider tripRequestsProvider;
  final BookingsProvider bookingsProvider;
  final ThemeController themeController;

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider<AuthProvider>.value(value: authProvider),
        ChangeNotifierProvider<TripRequestsProvider>.value(
          value: tripRequestsProvider,
        ),
        ChangeNotifierProvider<BookingsProvider>.value(value: bookingsProvider),
        ChangeNotifierProvider<ThemeController>.value(value: themeController),
      ],
      child: Consumer<ThemeController>(
        builder: (BuildContext context, ThemeController themeController, _) {
          return MaterialApp(
            title: AppConstants.appName,
            debugShowCheckedModeBanner: false,
            theme: AppTheme.lightTheme,
            darkTheme: AppTheme.darkTheme,
            themeMode: themeController.themeMode,
            home: const _AppRoot(),
          );
        },
      ),
    );
  }
}

class _AppRoot extends StatelessWidget {
  const _AppRoot();

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
          return const HomePage();
        }

        return const LoginPage();
      },
    );
  }
}
