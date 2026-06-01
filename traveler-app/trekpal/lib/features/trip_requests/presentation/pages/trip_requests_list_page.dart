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
    if (_hasRequestedInitialLoad) return;
    _hasRequestedInitialLoad = true;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<TripRequestsProvider>().fetchTripRequests().catchError((_) {});
    });
  }

  Future<void> _openCreatePage() async {
    final AuthProvider auth = context.read<AuthProvider>();
    if (!auth.canUseTravelerMarketplace) {
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
    final AuthProvider auth = context.watch<AuthProvider>();
    final String kycStatus = auth.currentUser?.travelerKycStatus ?? 'NOT_SUBMITTED';
    final TripRequestsProvider provider = context.watch<TripRequestsProvider>();
    final List<TripRequestEntity> requests = provider.tripRequests;

    if (auth.canUseTravelerMarketplace) {
      _ensureLoaded();
    } else {
      _hasRequestedInitialLoad = false;
    }

    final int open = requests.where((r) => r.status == 'PENDING').length;
    final int booked = requests.where((r) => r.status == 'ACCEPTED').length;

    return Scaffold(
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _openCreatePage,
        icon: Icon(
          auth.canUseTravelerMarketplace
              ? Icons.add_rounded
              : kycStatus == 'PENDING'
                  ? Icons.hourglass_top_rounded
                  : Icons.verified_user_outlined,
        ),
        label: Text(
          auth.canUseTravelerMarketplace
              ? 'New request'
              : kycStatus == 'PENDING'
                  ? 'Under review'
                  : 'Verify now',
        ),
      ),
      body: SafeArea(
        child: auth.canUseTravelerMarketplace
            ? RefreshIndicator(
                onRefresh: () => provider.fetchTripRequests(force: true),
                child: Builder(
                  builder: (BuildContext context) {
                    if (provider.isLoading && requests.isEmpty) {
                      return const TrekpalLoadingWidget(
                          message: 'Loading your trip requests...');
                    }
                    if (provider.errorMessage != null && requests.isEmpty) {
                      return TrekpalErrorState(
                        message: provider.errorMessage!,
                        onRetry: () => provider.fetchTripRequests(force: true),
                      );
                    }

                    return ListView(
                      physics: const AlwaysScrollableScrollPhysics(),
                      padding: const EdgeInsets.fromLTRB(20, 20, 20, 120),
                      children: <Widget>[
                        // ── Page header ────────────────────────────
                        _PageHeader(
                          eyebrow: 'Trip requests',
                          title: 'Arrange a trip',
                          subtitle: 'Post a brief and compare agency bids.',
                        ),
                        const SizedBox(height: 20),

                        // ── Stats ──────────────────────────────────
                        _StatsRow(stats: <_StatItem>[
                          _StatItem(
                            icon: Icons.edit_note_outlined,
                            label: 'Total',
                            value: '${requests.length}',
                          ),
                          _StatItem(
                            icon: Icons.inbox_outlined,
                            label: 'Open',
                            value: '$open',
                            highlight: true,
                          ),
                          _StatItem(
                            icon: Icons.task_alt_outlined,
                            label: 'Booked',
                            value: '$booked',
                          ),
                        ]),
                        const SizedBox(height: 20),

                        // ── List ───────────────────────────────────
                        if (requests.isEmpty)
                          _EmptyState(
                            icon: Icons.explore_outlined,
                            title: 'Create your first request',
                            subtitle:
                                'Choose destination, people, stay, and transport — agencies will bid on it.',
                          )
                        else
                          ...requests.map(
                            (TripRequestEntity r) => Padding(
                              padding: const EdgeInsets.only(bottom: 12),
                              child: TripRequestCard(
                                tripRequest: r,
                                onOpen: () {
                                  Navigator.of(context).push(
                                    MaterialPageRoute<void>(
                                      builder: (_) => TripRequestDetailsPage(
                                          tripRequestId: r.id),
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
                padding: const EdgeInsets.fromLTRB(20, 20, 20, 120),
                children: <Widget>[
                  _PageHeader(
                    eyebrow: 'Trip requests',
                    title: kycStatus == 'PENDING'
                        ? 'KYC in review'
                        : kycStatus == 'REJECTED'
                            ? 'KYC needs update'
                            : 'Verification required',
                    subtitle: kycStatus == 'PENDING'
                        ? 'Your KYC was submitted. Requests unlock after admin approval.'
                        : kycStatus == 'REJECTED'
                            ? 'Update your traveler KYC and submit it again.'
                            : 'Complete traveler KYC before agencies can bid on your request.',
                  ),
                  const SizedBox(height: 24),
                  TravelerKycGateCard(
                    title: kycStatus == 'PENDING'
                        ? 'KYC under review'
                        : kycStatus == 'REJECTED'
                            ? 'KYC needs update'
                            : 'Verification required',
                    message: kycStatus == 'PENDING'
                        ? 'Open KYC to review your submission.'
                        : kycStatus == 'REJECTED'
                            ? 'Open KYC, correct the details, and resubmit.'
                            : 'Your account is active, but request publishing is still locked.',
                    actionLabel: kycStatus == 'PENDING'
                        ? 'View KYC'
                        : kycStatus == 'REJECTED'
                            ? 'Update KYC'
                            : 'Complete KYC',
                    onPressed: () => Navigator.of(context).push(
                      MaterialPageRoute<bool>(
                          builder: (_) => const TravelerKycPage()),
                    ),
                  ),
                ],
              ),
      ),
    );
  }
}

// ── Shared widgets ────────────────────────────────────────────────────────────

class _PageHeader extends StatelessWidget {
  const _PageHeader({
    required this.eyebrow,
    required this.title,
    required this.subtitle,
  });

  final String eyebrow;
  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    final ThemeData theme = Theme.of(context);
    final ColorScheme cs = theme.colorScheme;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        Text(
          eyebrow.toUpperCase(),
          style: theme.textTheme.labelSmall?.copyWith(
            color: cs.primary,
            letterSpacing: 1.4,
            fontWeight: FontWeight.w800,
          ),
        ),
        const SizedBox(height: 6),
        Text(title, style: theme.textTheme.headlineMedium),
        const SizedBox(height: 6),
        Text(
          subtitle,
          style: theme.textTheme.bodyLarge?.copyWith(
            color: cs.onSurfaceVariant,
          ),
        ),
      ],
    );
  }
}

class _StatItem {
  const _StatItem({
    required this.icon,
    required this.label,
    required this.value,
    this.highlight = false,
  });

  final IconData icon;
  final String label;
  final String value;
  final bool highlight;
}

class _StatsRow extends StatelessWidget {
  const _StatsRow({required this.stats});
  final List<_StatItem> stats;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: stats
          .expand(
            (s) => <Widget>[
              if (s != stats.first) const SizedBox(width: 10),
              Expanded(child: _StatCard(item: s)),
            ],
          )
          .toList(),
    );
  }
}

class _StatCard extends StatelessWidget {
  const _StatCard({required this.item});
  final _StatItem item;

  @override
  Widget build(BuildContext context) {
    final ThemeData theme = Theme.of(context);
    final ColorScheme cs = theme.colorScheme;
    final bool dark = theme.brightness == Brightness.dark;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
      decoration: BoxDecoration(
        color: item.highlight
            ? cs.primary.withValues(alpha: dark ? 0.18 : 0.08)
            : cs.surfaceContainerHighest.withValues(
                alpha: dark ? 0.35 : 0.55,
              ),
        borderRadius: BorderRadius.circular(18),
        border: item.highlight
            ? Border.all(
                color: cs.primary.withValues(alpha: 0.22),
              )
            : null,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Icon(
            item.icon,
            size: 18,
            color: item.highlight ? cs.primary : cs.onSurfaceVariant,
          ),
          const SizedBox(height: 10),
          Text(
            item.value,
            style: theme.textTheme.titleLarge?.copyWith(
              color: item.highlight ? cs.primary : cs.onSurface,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            item.label,
            style: theme.textTheme.bodySmall?.copyWith(
              color: cs.onSurfaceVariant,
              fontSize: 11,
            ),
          ),
        ],
      ),
    );
  }
}

class _EmptyState extends StatelessWidget {
  const _EmptyState({
    required this.icon,
    required this.title,
    required this.subtitle,
  });

  final IconData icon;
  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    final ThemeData theme = Theme.of(context);
    final ColorScheme cs = theme.colorScheme;
    final bool dark = theme.brightness == Brightness.dark;

    return Container(
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: cs.surfaceContainerHighest.withValues(
          alpha: dark ? 0.25 : 0.45,
        ),
        borderRadius: BorderRadius.circular(28),
      ),
      child: Column(
        children: <Widget>[
          Container(
            width: 64,
            height: 64,
            decoration: BoxDecoration(
              color: cs.primary.withValues(alpha: dark ? 0.18 : 0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: cs.primary, size: 30),
          ),
          const SizedBox(height: 18),
          Text(
            title,
            textAlign: TextAlign.center,
            style: theme.textTheme.titleLarge,
          ),
          const SizedBox(height: 8),
          Text(
            subtitle,
            textAlign: TextAlign.center,
            style: theme.textTheme.bodyMedium?.copyWith(
              color: cs.onSurfaceVariant,
            ),
          ),
        ],
      ),
    );
  }
}
