import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

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
    final String travelerKycStatus =
        authProvider.currentUser?.travelerKycStatus ?? 'NOT_SUBMITTED';
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
              ? Icons.add_rounded
              : travelerKycStatus == 'PENDING'
              ? Icons.hourglass_top_rounded
              : Icons.verified_user_outlined,
        ),
        label: Text(
          authProvider.canUseTravelerMarketplace
              ? 'New request'
              : travelerKycStatus == 'PENDING'
              ? 'Under review'
              : 'Verify now',
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
                        message: 'Loading your trip requests...',
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
                          'Arrange a trip',
                          style: theme.textTheme.displayMedium,
                        ),
                        const SizedBox(height: 10),
                        Text(
                          'Post a brief and compare agency bids.',
                          style: theme.textTheme.bodyLarge?.copyWith(
                            color: colorScheme.onSurfaceVariant,
                          ),
                        ),
                        const SizedBox(height: 18),
                        Row(
                          children: <Widget>[
                            Expanded(
                              child: _MiniStat(
                                icon: Icons.edit_note_outlined,
                                label: 'Requests',
                                value: '${requests.length}',
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: _MiniStat(
                                icon: Icons.mark_email_unread_outlined,
                                label: 'Open',
                                value: '$publishedCount',
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: _MiniStat(
                                icon: Icons.task_alt_outlined,
                                label: 'Booked',
                                value: '$bookedCount',
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 18),
                        if (requests.isEmpty)
                          Card(
                            child: Padding(
                              padding: const EdgeInsets.all(26),
                              child: Column(
                                children: <Widget>[
                                  Icon(
                                    Icons.explore_outlined,
                                    size: 56,
                                    color: colorScheme.primary,
                                  ),
                                  const SizedBox(height: 18),
                                  Text(
                                    'Create your first request',
                                    textAlign: TextAlign.center,
                                    style: theme.textTheme.headlineSmall,
                                  ),
                                  const SizedBox(height: 10),
                                  Text(
                                    'Choose destination, people, stay, and transport. Agencies will bid on it.',
                                    textAlign: TextAlign.center,
                                    style: theme.textTheme.bodyLarge?.copyWith(
                                      color: colorScheme.onSurfaceVariant,
                                    ),
                                  ),
                                ],
                              ),
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
                    travelerKycStatus == 'PENDING'
                        ? 'KYC in review'
                        : travelerKycStatus == 'REJECTED'
                        ? 'KYC needs update'
                        : 'Request flow is locked',
                    style: theme.textTheme.displayMedium,
                  ),
                  const SizedBox(height: 10),
                  Text(
                    travelerKycStatus == 'PENDING'
                        ? 'Your KYC was submitted. Requests unlock after admin approval.'
                        : travelerKycStatus == 'REJECTED'
                        ? 'Update your traveler KYC and submit it again.'
                        : 'Complete traveler KYC before agencies can bid on your request.',
                    style: theme.textTheme.bodyLarge?.copyWith(
                      color: colorScheme.onSurfaceVariant,
                    ),
                  ),
                  const SizedBox(height: 22),
                  TravelerKycGateCard(
                    title: travelerKycStatus == 'PENDING'
                        ? 'Traveler KYC under review'
                        : travelerKycStatus == 'REJECTED'
                        ? 'Traveler KYC needs update'
                        : 'Traveler verification required',
                    message: travelerKycStatus == 'PENDING'
                        ? 'Open KYC if you want to review your submission.'
                        : travelerKycStatus == 'REJECTED'
                        ? 'Open KYC, correct the details, and resubmit.'
                        : 'Your account is active, but request publishing is still locked.',
                    actionLabel: travelerKycStatus == 'PENDING'
                        ? 'View traveler KYC'
                        : travelerKycStatus == 'REJECTED'
                        ? 'Update traveler KYC'
                        : 'Complete traveler KYC',
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

class _MiniStat extends StatelessWidget {
  const _MiniStat({
    required this.icon,
    required this.label,
    required this.value,
  });

  final IconData icon;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    final ThemeData theme = Theme.of(context);
    final ColorScheme colorScheme = theme.colorScheme;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Icon(icon, color: colorScheme.primary),
            const SizedBox(height: 10),
            Text(value, style: theme.textTheme.titleLarge),
            const SizedBox(height: 4),
            Text(
              label,
              style: theme.textTheme.bodySmall?.copyWith(
                color: colorScheme.onSurfaceVariant,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
