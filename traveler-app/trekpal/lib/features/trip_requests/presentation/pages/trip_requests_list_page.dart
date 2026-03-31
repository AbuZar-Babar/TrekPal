import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/error_widget.dart';
import '../../../../core/widgets/loading_widget.dart';
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
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Trip brief published to agencies')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final TripRequestsProvider provider = context.watch<TripRequestsProvider>();
    final List<TripRequestEntity> requests = provider.tripRequests;

    return Scaffold(
      appBar: AppBar(title: const Text('Trips marketplace')),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _openCreatePage,
        icon: const Icon(Icons.add_rounded),
        label: const Text('New trip brief'),
      ),
      body: RefreshIndicator(
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

            if (requests.isEmpty) {
              return ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(24),
                children: <Widget>[
                  const SizedBox(height: 130),
                  Container(
                    padding: const EdgeInsets.all(28),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(28),
                      boxShadow: const <BoxShadow>[
                        BoxShadow(
                          color: Color(0x14000000),
                          blurRadius: 24,
                          offset: Offset(0, 10),
                        ),
                      ],
                    ),
                    child: const Column(
                      children: <Widget>[
                        Icon(
                          Icons.explore_outlined,
                          size: 56,
                          color: AppColors.forest,
                        ),
                        SizedBox(height: 18),
                        Text(
                          'Create your first trip brief',
                          style: TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.w900,
                            color: AppColors.ink,
                          ),
                          textAlign: TextAlign.center,
                        ),
                        SizedBox(height: 10),
                        Text(
                          'Tell agencies where you want to go, how many people are traveling, what services you need, and the budget you want them to negotiate around.',
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ),
                  ),
                ],
              );
            }

            final int publishedCount = requests
                .where((TripRequestEntity item) => item.status == 'PENDING')
                .length;
            final int bookedCount = requests
                .where((TripRequestEntity item) => item.status == 'ACCEPTED')
                .length;

            return ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 120),
              children: <Widget>[
                Container(
                  padding: const EdgeInsets.all(22),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: <Color>[AppColors.pine, AppColors.forest],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(28),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      Text(
                        'Traveler marketplace',
                        style: Theme.of(context).textTheme.headlineSmall
                            ?.copyWith(
                              color: Colors.white,
                              fontWeight: FontWeight.w900,
                            ),
                      ),
                      const SizedBox(height: 10),
                      const Text(
                        'Publish structured trip briefs, compare agency offers, negotiate details, and lock the right trip.',
                        style: TextStyle(color: Color(0xFFE6F3EC)),
                      ),
                      const SizedBox(height: 18),
                      Row(
                        children: <Widget>[
                          Expanded(
                            child: _StatTile(
                              value: '${requests.length}',
                              label: 'Total briefs',
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: _StatTile(
                              value: '$publishedCount',
                              label: 'Open briefs',
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: _StatTile(
                              value: '$bookedCount',
                              label: 'Booked',
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                ...requests.map(
                  (TripRequestEntity request) => Padding(
                    padding: const EdgeInsets.only(bottom: 12),
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
      ),
    );
  }
}

class _StatTile extends StatelessWidget {
  const _StatTile({required this.value, required this.label});

  final String value;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.14),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        children: <Widget>[
          Text(
            value,
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
              color: Colors.white,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            label,
            textAlign: TextAlign.center,
            style: const TextStyle(color: Color(0xFFE6F3EC)),
          ),
        ],
      ),
    );
  }
}
