import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../../core/constants/app_constants.dart';
import '../../../../core/widgets/error_widget.dart';
import '../../../../core/widgets/loading_widget.dart';
import '../../../auth/presentation/pages/traveler_kyc_page.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../../../auth/presentation/widgets/traveler_kyc_gate_card.dart';
import '../../domain/entities/trip_request_entities.dart';
import '../providers/trip_requests_provider.dart';
import '../widgets/trip_request_card.dart';
import 'create_trip_request_page.dart';
import 'trip_request_details_page.dart';

class TripRequestsListPage extends StatefulWidget {
  const TripRequestsListPage({super.key});

  @override
  State<TripRequestsListPage> createState() => _TripRequestsListPageState();
}

class _TripRequestsListPageState extends State<TripRequestsListPage> {
  bool _hasRequestedInitialLoad = false;

  void _ensureLoaded() {
    if (_hasRequestedInitialLoad) {
      return;
    }

    _hasRequestedInitialLoad = true;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<TripRequestsProvider>().fetchTripRequests().catchError(
        (_) {},
      );
    });
  }

  Future<void> _openCreatePage() async {
    final AuthProvider authProvider = context.read<AuthProvider>();
    if (!authProvider.canUseTravelerMarketplace) {
      await Navigator.of(context).push<bool>(
        MaterialPageRoute<bool>(builder: (_) => const TravelerKycPage()),
      );
      return;
    }

    final bool? created = await Navigator.of(context).push<bool>(
      MaterialPageRoute<bool>(builder: (_) => const CreateTripRequestPage()),
    );

    if (created == true && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Trip brief published to agencies')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final ThemeData theme = Theme.of(context);
    final ColorScheme colorScheme = theme.colorScheme;
    final AuthProvider authProvider = context.watch<AuthProvider>();
    final TripRequestsProvider provider = context.watch<TripRequestsProvider>();
    final List<TripRequestEntity> requests = provider.tripRequests;

    if (authProvider.canUseTravelerMarketplace) {
      _ensureLoaded();
    } else {
      _hasRequestedInitialLoad = false;
    }

    final int publishedCount = requests
        .where((TripRequestEntity item) => item.status == 'PENDING')
        .length;
    final int bookedCount = requests
        .where((TripRequestEntity item) => item.status == 'ACCEPTED')
        .length;

    return Scaffold(
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _openCreatePage,
        icon: Icon(
          authProvider.canUseTravelerMarketplace
              ? Icons.edit_outlined
              : Icons.verified_user_outlined,
        ),
        label: Text(
          authProvider.canUseTravelerMarketplace ? 'New brief' : 'Verify now',
        ),
      ),
      body: SafeArea(
        child: authProvider.canUseTravelerMarketplace
            ? RefreshIndicator(
                onRefresh: () => provider.fetchTripRequests(force: true),
                child: Builder(
                  builder: (BuildContext context) {
                    if (provider.isLoading && requests.isEmpty) {
                      return const TrekpalLoadingWidget(
                        message: 'Loading your traveler marketplace...',
                      );
                    }

                    if (provider.errorMessage != null && requests.isEmpty) {
                      return TrekpalErrorState(
                        message: provider.errorMessage!,
                        onRetry: () => provider.fetchTripRequests(force: true),
                      );
                    }

                    return ListView(
                      physics: const AlwaysScrollableScrollPhysics(),
                      padding: const EdgeInsets.fromLTRB(20, 16, 20, 120),
                      children: <Widget>[
                        Text(
                          AppConstants.appName,
                          style: theme.textTheme.titleMedium?.copyWith(
                            color: colorScheme.primary,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Curated Escapes',
                          style: theme.textTheme.displayMedium,
                        ),
                        const SizedBox(height: 10),
                        Text(
                          'Publish structured trip briefs, compare agency offers, and lock the right journey without leaving the marketplace.',
                          style: theme.textTheme.bodyLarge?.copyWith(
                            color: colorScheme.onSurfaceVariant,
                          ),
                        ),
                        const SizedBox(height: 20),
                        Container(
                          padding: const EdgeInsets.all(22),
                          decoration: BoxDecoration(
                            color: colorScheme.surfaceContainerHighest
                                .withValues(
                                  alpha: theme.brightness == Brightness.dark
                                      ? 0.42
                                      : 0.5,
                                ),
                            borderRadius: BorderRadius.circular(30),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: <Widget>[
                              Text(
                                'Marketplace overview',
                                style: theme.textTheme.headlineSmall,
                              ),
                              const SizedBox(height: 16),
                              Row(
                                children: <Widget>[
                                  Expanded(
                                    child: _StatTile(
                                      label: 'Total',
                                      value: '${requests.length}',
                                    ),
                                  ),
                                  const SizedBox(width: 10),
                                  Expanded(
                                    child: _StatTile(
                                      label: 'Open',
                                      value: '$publishedCount',
                                    ),
                                  ),
                                  const SizedBox(width: 10),
                                  Expanded(
                                    child: _StatTile(
                                      label: 'Booked',
                                      value: '$bookedCount',
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 18),
                        if (requests.isEmpty)
                          Container(
                            padding: const EdgeInsets.all(26),
                            decoration: BoxDecoration(
                              color: colorScheme.surfaceContainerHighest
                                  .withValues(
                                    alpha: theme.brightness == Brightness.dark
                                        ? 0.42
                                        : 0.5,
                                  ),
                              borderRadius: BorderRadius.circular(30),
                            ),
                            child: Column(
                              children: <Widget>[
                                Icon(
                                  Icons.explore_outlined,
                                  size: 56,
                                  color: colorScheme.primary,
                                ),
                                const SizedBox(height: 18),
                                Text(
                                  'Create your first trip brief',
                                  textAlign: TextAlign.center,
                                  style: theme.textTheme.headlineSmall,
                                ),
                                const SizedBox(height: 10),
                                Text(
                                  'Tell agencies where you want to go, how many people are traveling, and what services you want quoted.',
                                  textAlign: TextAlign.center,
                                  style: theme.textTheme.bodyLarge?.copyWith(
                                    color: colorScheme.onSurfaceVariant,
                                  ),
                                ),
                              ],
                            ),
                          )
                        else
                          ...requests.map(
                            (TripRequestEntity request) => Padding(
                              padding: const EdgeInsets.only(bottom: 14),
                              child: TripRequestCard(
                                tripRequest: request,
                                onOpen: () {
                                  Navigator.of(context).push(
                                    MaterialPageRoute<void>(
                                      builder: (_) => TripRequestDetailsPage(
                                        tripRequestId: request.id,
                                      ),
                                    ),
                                  );
                                },
                              ),
                            ),
                          ),
                      ],
                    );
                  },
                ),
              )
            : ListView(
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 120),
                children: <Widget>[
                  Text(
                    AppConstants.appName,
                    style: theme.textTheme.titleMedium?.copyWith(
                      color: colorScheme.primary,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Almost ready for departure',
                    style: theme.textTheme.displayMedium,
                  ),
                  const SizedBox(height: 10),
                  Text(
                    'Traveler KYC unlocks trip publishing, offer negotiation, and booking actions.',
                    style: theme.textTheme.bodyLarge?.copyWith(
                      color: colorScheme.onSurfaceVariant,
                    ),
                  ),
                  const SizedBox(height: 22),
                  TravelerKycGateCard(
                    title: 'Traveler verification required',
                    message:
                        'Your account is active, but trip publishing is locked until you submit CNIC details and identity photos.',
                    actionLabel: 'Complete traveler KYC',
                    onPressed: () {
                      Navigator.of(context).push(
                        MaterialPageRoute<bool>(
                          builder: (_) => const TravelerKycPage(),
                        ),
                      );
                    },
                  ),
                ],
              ),
      ),
    );
  }
}

class _StatTile extends StatelessWidget {
  const _StatTile({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    final ThemeData theme = Theme.of(context);
    final ColorScheme colorScheme = theme.colorScheme;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 16),
      decoration: BoxDecoration(
        color: colorScheme.surface.withValues(
          alpha: theme.brightness == Brightness.dark ? 0.28 : 0.9,
        ),
        borderRadius: BorderRadius.circular(22),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Text(value, style: theme.textTheme.headlineSmall),
          const SizedBox(height: 4),
          Text(
            label,
            style: theme.textTheme.bodySmall?.copyWith(
              color: colorScheme.onSurfaceVariant,
            ),
          ),
        ],
      ),
    );
  }
}
