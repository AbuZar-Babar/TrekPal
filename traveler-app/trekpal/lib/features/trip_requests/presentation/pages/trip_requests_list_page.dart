import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../../core/widgets/error_widget.dart';
import '../../../../core/widgets/loading_widget.dart';
import '../../domain/entities/trip_request_entities.dart';
import '../providers/trip_requests_provider.dart';
import '../widgets/trip_request_card.dart';
import 'bids_view_page.dart';
import 'create_trip_request_page.dart';

class TripRequestsListPage extends StatefulWidget {
  const TripRequestsListPage({super.key});

  @override
  State<TripRequestsListPage> createState() => _TripRequestsListPageState();
}

class _TripRequestsListPageState extends State<TripRequestsListPage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<TripRequestsProvider>().fetchTripRequests().catchError(
        (_) {},
      );
    });
  }

  Future<void> _openCreatePage() async {
    final bool? created = await Navigator.of(context).push<bool>(
      MaterialPageRoute<bool>(builder: (_) => const CreateTripRequestPage()),
    );

    if (created == true && mounted) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Trip request created')));
    }
  }

  @override
  Widget build(BuildContext context) {
    final TripRequestsProvider provider = context.watch<TripRequestsProvider>();
    final List<TripRequestEntity> requests = provider.tripRequests;

    return Scaffold(
      appBar: AppBar(title: const Text('Trip requests')),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _openCreatePage,
        icon: const Icon(Icons.add_rounded),
        label: const Text('New request'),
      ),
      body: RefreshIndicator(
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

            if (requests.isEmpty) {
              return ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(24),
                children: const <Widget>[
                  SizedBox(height: 160),
                  TrekpalErrorState(
                    message:
                        'No trip requests yet. Create your first request to start collecting bids.',
                  ),
                ],
              );
            }

            final int pendingCount = requests
                .where((TripRequestEntity item) => item.status == 'PENDING')
                .length;

            return ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.fromLTRB(20, 12, 20, 120),
              children: <Widget>[
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(20),
                    child: Row(
                      children: <Widget>[
                        Expanded(
                          child: _StatItem(
                            value: '${requests.length}',
                            label: 'Total requests',
                          ),
                        ),
                        Expanded(
                          child: _StatItem(
                            value: '$pendingCount',
                            label: 'Pending bids',
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                ...requests.map(
                  (TripRequestEntity request) => Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: TripRequestCard(
                      tripRequest: request,
                      onViewBids: () {
                        Navigator.of(context).push(
                          MaterialPageRoute<void>(
                            builder: (_) => BidsViewPage(tripRequest: request),
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
      ),
    );
  }
}

class _StatItem extends StatelessWidget {
  const _StatItem({required this.value, required this.label});

  final String value;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: <Widget>[
        Text(
          value,
          style: Theme.of(
            context,
          ).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.w800),
        ),
        const SizedBox(height: 6),
        Text(label),
      ],
    );
  }
}
