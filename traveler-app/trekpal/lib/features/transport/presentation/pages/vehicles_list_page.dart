import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

import '../../../../core/theme/app_colors.dart';
import '../providers/transport_provider.dart';
import '../../domain/entities/vehicle_entities.dart';

class VehiclesListPage extends StatefulWidget {
  const VehiclesListPage({super.key});

  @override
  State<VehiclesListPage> createState() => _VehiclesListPageState();
}

class _VehiclesListPageState extends State<VehiclesListPage> {
  final TextEditingController _searchController = TextEditingController();
  String _activeType = 'All';

  final List<String> _vehicleTypes = [
    'All',
    'SUV',
    'Sedan',
    'Van',
    '4x4 Jeep',
    'Coaster',
  ];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<TransportProvider>().fetchVehicles().catchError((_) {});
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _triggerSearch() {
    final query = _searchController.text.trim();
    final typeFilter = _activeType == 'All' ? null : _activeType;
    context.read<TransportProvider>().fetchVehicles(search: query, type: typeFilter).catchError((_) {});
  }

  @override
  Widget build(BuildContext context) {
    final ThemeData theme = Theme.of(context);
    final bool dark = theme.brightness == Brightness.dark;
    final TransportProvider transportProvider = context.watch<TransportProvider>();

    return Scaffold(
      backgroundColor: dark ? const Color(0xFF111415) : Colors.grey[50],
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new, color: dark ? Colors.white : Colors.black87, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Transport & Vehicles',
          style: GoogleFonts.montserrat(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: dark ? Colors.white : AppColors.primaryStrong,
          ),
        ),
        centerTitle: true,
      ),
      body: Column(
        children: [
          // Search Header
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              decoration: BoxDecoration(
                color: dark ? AppColors.paperRaised : Colors.white,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: dark ? 0.2 : 0.05),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: TextField(
                controller: _searchController,
                onChanged: (_) => setState(() {}),
                onSubmitted: (_) => _triggerSearch(),
                decoration: InputDecoration(
                  hintText: 'Search SUV, Prado, Corolla...',
                  hintStyle: TextStyle(color: dark ? AppColors.inkMuted : Colors.grey[400]),
                  prefixIcon: Icon(Icons.search, color: AppColors.secondary),
                  suffixIcon: _searchController.text.isNotEmpty
                      ? IconButton(
                          icon: const Icon(Icons.clear, size: 18),
                          onPressed: () {
                            _searchController.clear();
                            _triggerSearch();
                          },
                        )
                      : null,
                  border: InputBorder.none,
                  enabledBorder: InputBorder.none,
                  focusedBorder: InputBorder.none,
                  fillColor: Colors.transparent,
                  contentPadding: const EdgeInsets.symmetric(vertical: 14),
                ),
              ),
            ),
          ),

          // Horizontal Vehicle Type Filter
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 10),
            child: SizedBox(
              height: 38,
              child: ListView.builder(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                scrollDirection: Axis.horizontal,
                itemCount: _vehicleTypes.length,
                itemBuilder: (context, index) {
                  final type = _vehicleTypes[index];
                  final isSelected = _activeType == type;

                  return Container(
                    margin: const EdgeInsets.only(right: 10),
                    child: ChoiceChip(
                      label: Text(
                        type,
                        style: TextStyle(
                          color: isSelected
                              ? Colors.black
                              : (dark ? Colors.white70 : Colors.black87),
                          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                          fontSize: 13,
                        ),
                      ),
                      selected: isSelected,
                      selectedColor: AppColors.secondary,
                      backgroundColor: dark ? AppColors.paperRaised : Colors.grey[200],
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                        side: const BorderSide(color: Colors.transparent),
                      ),
                      showCheckmark: false,
                      onSelected: (bool selected) {
                        if (selected) {
                          setState(() {
                            _activeType = type;
                          });
                          _triggerSearch();
                        }
                      },
                    ),
                  );
                },
              ),
            ),
          ),
          const SizedBox(height: 10),

          // Loading & Results
          Expanded(
            child: transportProvider.isLoading
                ? const Center(child: CircularProgressIndicator())
                : transportProvider.errorMessage != null
                    ? Center(
                        child: Padding(
                          padding: const EdgeInsets.all(24.0),
                          child: Text(
                            'Error: ${transportProvider.errorMessage}',
                            textAlign: TextAlign.center,
                            style: const TextStyle(color: Colors.redAccent),
                          ),
                        ),
                      )
                    : transportProvider.vehicles.isEmpty
                        ? Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.directions_car_outlined, size: 64, color: AppColors.inkMuted),
                                const SizedBox(height: 16),
                                Text(
                                  'No vehicles found',
                                  style: TextStyle(
                                    fontSize: 16,
                                    color: AppColors.inkMuted,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                          )
                        : ListView.builder(
                            padding: const EdgeInsets.symmetric(horizontal: 20),
                            itemCount: transportProvider.vehicles.length,
                            itemBuilder: (context, index) {
                              final vehicle = transportProvider.vehicles[index];
                              return _buildVehicleCard(vehicle, dark, theme);
                            },
                          ),
          ),
        ],
      ),
    );
  }

  Widget _buildVehicleCard(VehicleEntity vehicle, bool dark, ThemeData theme) {
    final String imageUrl = vehicle.images.isNotEmpty
        ? vehicle.images[0]
        : 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80';

    return Container(
      margin: const EdgeInsets.only(bottom: 20),
      decoration: BoxDecoration(
        color: dark ? AppColors.paperRaised : Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: dark ? 0.3 : 0.05),
            blurRadius: 12,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Vehicle Image
            Container(
              height: 160,
              width: double.infinity,
              decoration: BoxDecoration(
                image: DecorationImage(
                  image: NetworkImage(imageUrl),
                  fit: BoxFit.cover,
                ),
              ),
              child: Stack(
                children: [
                  Positioned.fill(
                    child: Container(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          colors: [
                            Colors.black.withValues(alpha: 0.1),
                            Colors.black.withValues(alpha: 0.5),
                          ],
                        ),
                      ),
                    ),
                  ),
                  // Capacity badge
                  Positioned(
                    top: 16,
                    left: 16,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(
                        color: Colors.black.withValues(alpha: 0.7),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.people_outline, color: Colors.white, size: 14),
                          const SizedBox(width: 4),
                          Text(
                            '${vehicle.capacity} Seats',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  // Type badge
                  Positioned(
                    top: 16,
                    right: 16,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(
                        color: AppColors.secondary.withValues(alpha: 0.8),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Text(
                        vehicle.type,
                        style: const TextStyle(
                          color: Colors.black,
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            // Content
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '${vehicle.make} ${vehicle.model} (${vehicle.year})',
                    style: GoogleFonts.montserrat(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: dark ? Colors.white : AppColors.primaryStrong,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      Icon(Icons.business, color: AppColors.secondary, size: 16),
                      const SizedBox(width: 6),
                      Expanded(
                        child: Text(
                          'Provided by: ${vehicle.agencyName}',
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            color: dark ? AppColors.inkMuted : Colors.grey[600],
                            fontSize: 14,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          'PKR ${vehicle.pricePerDay.toStringAsFixed(0)} / day',
                          style: GoogleFonts.montserrat(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: AppColors.secondary,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const SizedBox(width: 8),
                      ElevatedButton(
                        onPressed: () => _showBookingPrompt(context, vehicle),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.secondary,
                          foregroundColor: Colors.black,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          elevation: 0,
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        ),
                        child: const Text(
                          'Select Vehicle',
                          style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showBookingPrompt(BuildContext context, VehicleEntity vehicle) {
    showDialog<void>(
      context: context,
      builder: (context) {
        return AlertDialog(
          backgroundColor: Theme.of(context).cardColor,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: Text(
            'Book ${vehicle.make} ${vehicle.model}',
            style: GoogleFonts.montserrat(fontWeight: FontWeight.bold),
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Agency: ${vehicle.agencyName}'),
              const SizedBox(height: 8),
              Text('Price: PKR ${vehicle.pricePerDay.toStringAsFixed(0)} per day'),
              const SizedBox(height: 16),
              const Text('Would you like to initiate booking negotiations with the agency?'),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel', style: TextStyle(color: Colors.grey)),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('Negotiation request sent to ${vehicle.agencyName}!'),
                    backgroundColor: AppColors.secondary,
                  ),
                );
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.secondary,
                foregroundColor: Colors.black,
              ),
              child: const Text('Initiate Booking'),
            ),
          ],
        );
      },
    );
  }
}
