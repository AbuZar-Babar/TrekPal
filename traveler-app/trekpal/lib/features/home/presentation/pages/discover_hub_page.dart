import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/user_avatar.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../../../packages/domain/entities/package_offer_entity.dart';
import '../../../packages/presentation/pages/package_offer_details_page.dart';
import '../../../packages/presentation/pages/packages_list_page.dart';
import '../../../packages/presentation/providers/packages_provider.dart';
import 'home_page.dart';

class DiscoverHubPage extends StatefulWidget {
  const DiscoverHubPage({super.key});

  @override
  State<DiscoverHubPage> createState() => _DiscoverHubPageState();
}

class _DiscoverHubPageState extends State<DiscoverHubPage> {
  String _activeCategory = 'Trending';
  final TextEditingController _searchController = TextEditingController();
  double _maxPrice = 200000;
  int _maxDuration = 14;
  bool _hideSoldOut = false;
  String _sortBy = 'price_asc';
  String _searchQuery = '';

  final List<Map<String, dynamic>> _categories = [
    {'name': 'Trending', 'icon': '📈'},
    {'name': 'Trekking', 'icon': '🏔️'},
    {'name': 'Camping', 'icon': '⛺'},
    {'name': 'Road Trips', 'icon': '🏎️'},
    {'name': 'Cultural', 'icon': '🏛️'},
  ];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<PackagesProvider>().fetchPackages().catchError((_) {});
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final ThemeData theme = Theme.of(context);
    final bool dark = theme.brightness == Brightness.dark;
    final AuthProvider auth = context.watch<AuthProvider>();
    final user = auth.currentUser;
    final PackagesProvider packagesProvider = context.watch<PackagesProvider>();
    final List<PackageOfferEntity> offers = packagesProvider.packages;

    final List<PackageOfferEntity> filteredOffers = offers.where((offer) {
      if (_searchQuery.isNotEmpty) {
        final query = _searchQuery.toLowerCase();
        final matchesName = offer.name.toLowerCase().contains(query);
        final matchesAgency = offer.agencyName.toLowerCase().contains(query);
        final matchesDest = offer.destinations.any((d) => d.toLowerCase().contains(query));
        if (!matchesName && !matchesAgency && !matchesDest) {
          return false;
        }
      }

      if (_activeCategory != 'Trending') {
        final categoryLower = _activeCategory.toLowerCase();
        final matchesName = offer.name.toLowerCase().contains(categoryLower);
        final matchesDesc = offer.description?.toLowerCase().contains(categoryLower) ?? false;
        final matchesDest = offer.destinations.any((d) => d.toLowerCase().contains(categoryLower));
        if (!matchesName && !matchesDesc && !matchesDest) {
          return false;
        }
      }

      if (offer.price > _maxPrice) {
        return false;
      }

      if (offer.duration > _maxDuration) {
        return false;
      }

      if (_hideSoldOut && offer.isSoldOut) {
        return false;
      }

      return true;
    }).toList();

    if (_sortBy == 'price_asc') {
      filteredOffers.sort((a, b) => a.price.compareTo(b.price));
    } else if (_sortBy == 'price_desc') {
      filteredOffers.sort((a, b) => b.price.compareTo(a.price));
    } else if (_sortBy == 'duration_asc') {
      filteredOffers.sort((a, b) => a.duration.compareTo(b.duration));
    } else if (_sortBy == 'duration_desc') {
      filteredOffers.sort((a, b) => b.duration.compareTo(a.duration));
    }

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'TrekPal',
          style: GoogleFonts.montserrat(
            textStyle: TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.bold,
              color: dark ? AppColors.secondary : AppColors.primaryStrong,
            ),
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_none_outlined),
            onPressed: () {},
          ),
          Padding(
            padding: const EdgeInsets.only(right: 16, left: 8),
            child: GestureDetector(
              onTap: () {
                Navigator.of(context).push(
                  MaterialPageRoute<void>(
                    builder: (_) => const AccountPage(),
                  ),
                );
              },
              child: UserAvatar(
                label: user?.name ?? 'User',
                imageUrl: user?.avatar,
                radius: 16,
              ),
            ),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        children: [
          // Header Location Selector
          Row(
            children: [
              Icon(Icons.location_on_outlined, size: 20, color: AppColors.secondary),
              const SizedBox(width: 6),
              Text(
                'Explore Pakistan 🇵🇰',
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                  color: dark ? Colors.white : AppColors.primaryStrong,
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),

          // Search Bar
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            decoration: BoxDecoration(
              color: dark ? AppColors.paperRaised : Colors.grey[200],
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                if (dark)
                  const BoxShadow(
                    color: Colors.black12,
                    blurRadius: 4,
                    offset: Offset(0, 2),
                  ),
              ],
            ),
            child: TextField(
              controller: _searchController,
              onSubmitted: (value) {
                setState(() {
                  _searchQuery = value.trim();
                });
              },
              decoration: InputDecoration(
                hintText: 'Search tours, agencies...',
                hintStyle: TextStyle(color: dark ? AppColors.inkMuted : Colors.grey[600]),
                prefixIcon: Icon(Icons.search, color: AppColors.secondary),
                suffixIcon: IconButton(
                  icon: Icon(Icons.tune, color: AppColors.secondary),
                  onPressed: () => _showFilterSheet(context),
                ),
                border: InputBorder.none,
                enabledBorder: InputBorder.none,
                focusedBorder: InputBorder.none,
                fillColor: Colors.transparent,
                contentPadding: const EdgeInsets.symmetric(vertical: 14),
              ),
            ),
          ),
          const SizedBox(height: 24),

          // Category Chips
          SizedBox(
            height: 42,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              itemCount: _categories.length,
              itemBuilder: (context, index) {
                final category = _categories[index];
                final bool isSelected = _activeCategory == category['name'];
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: ChoiceChip(
                    label: Text('${category['icon']} ${category['name']}'),
                    selected: isSelected,
                    onSelected: (selected) {
                      setState(() {
                        _activeCategory = category['name'];
                      });
                    },
                    backgroundColor: dark ? AppColors.paperRaised : Colors.grey[200],
                    selectedColor: dark ? AppColors.primaryStrong : AppColors.primary,
                    labelStyle: TextStyle(
                      color: isSelected
                          ? Colors.white
                          : (dark ? AppColors.ink : Colors.black87),
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(20),
                    ),
                    side: BorderSide(
                      color: isSelected
                          ? AppColors.secondary
                          : Colors.transparent,
                    ),
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: 24),

          // Quick Portals (Hotels & Transport)
          Row(
            children: [
              Expanded(
                child: _buildPortalCard(
                  title: 'Hotels',
                  icon: Icons.bed_outlined,
                  imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=300&q=80',
                  dark: dark,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: _buildPortalCard(
                  title: 'Transport',
                  icon: Icons.directions_car_outlined,
                  imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=300&q=80',
                  dark: dark,
                ),
              ),
            ],
          ),
          const SizedBox(height: 32),

          // Featured Expeditions Section Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Featured Expeditions',
                style: theme.textTheme.headlineMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: dark ? Colors.white : AppColors.primaryStrong,
                ),
              ),
              TextButton(
                onPressed: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(builder: (_) => const PackagesListPage()),
                  );
                },
                child: Text(
                  'See All',
                  style: TextStyle(
                    color: AppColors.secondary,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Expeditions List
          if (packagesProvider.isLoading && offers.isEmpty)
            const Center(
              child: Padding(
                padding: EdgeInsets.symmetric(vertical: 32),
                child: CircularProgressIndicator(),
              ),
            )
          else if (filteredOffers.isEmpty)
            const Center(
              child: Padding(
                padding: EdgeInsets.symmetric(vertical: 32),
                child: Text('No planned trips match your filters.'),
              ),
            )
          else
            ...filteredOffers.take(3).map((offer) => _buildExpeditionCard(offer, dark, theme)),
        ],
      ),
    );
  }

  Widget _buildPortalCard({
    required String title,
    required IconData icon,
    required String imageUrl,
    required bool dark,
  }) {
    return Container(
      height: 100,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        image: DecorationImage(
          image: NetworkImage(imageUrl),
          fit: BoxFit.cover,
          colorFilter: ColorFilter.mode(
            Colors.black.withValues(alpha: 0.5),
            BlendMode.darken,
          ),
        ),
      ),
      child: Stack(
        children: [
          Positioned(
            left: 16,
            bottom: 16,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(icon, color: AppColors.secondary, size: 24),
                const SizedBox(height: 4),
                Text(
                  title,
                  style: GoogleFonts.montserrat(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildExpeditionCard(PackageOfferEntity offer, bool dark, ThemeData theme) {
    final String imageUrl = offer.images.isNotEmpty
        ? offer.images[0]
        : 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=600&q=80';
    final double rating = offer.hotel?.rating?.toDouble() ?? 4.8;

    return Container(
      margin: const EdgeInsets.only(bottom: 20),
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
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Image header
          ClipRRect(
            borderRadius: const BorderRadius.only(
              topLeft: Radius.circular(16),
              topRight: Radius.circular(16),
            ),
            child: Container(
              height: 180,
              decoration: BoxDecoration(
                image: DecorationImage(
                  image: NetworkImage(imageUrl),
                  fit: BoxFit.cover,
                ),
              ),
              child: Stack(
                children: [
                  // Rating badge
                  Positioned(
                    top: 12,
                    right: 12,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.black.withValues(alpha: 0.6),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.star, color: AppColors.secondary, size: 14),
                          const SizedBox(width: 4),
                          Text(
                            rating.toString(),
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
                ],
              ),
            ),
          ),
          // Content
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  offer.name,
                  style: GoogleFonts.montserrat(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: dark ? Colors.white : AppColors.primaryStrong,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 6),
                Text(
                  offer.agencyName,
                  style: TextStyle(
                    color: dark ? AppColors.inkMuted : Colors.grey[600],
                    fontSize: 14,
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'PKR ${offer.price} / person',
                      style: GoogleFonts.montserrat(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: AppColors.secondary,
                      ),
                    ),
                    ElevatedButton(
                      onPressed: () {
                        Navigator.of(context).push(
                          MaterialPageRoute<void>(
                            builder: (_) => PackageOfferDetailsPage(offer: offer),
                          ),
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.secondary,
                        foregroundColor: Colors.black,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        minimumSize: const Size(90, 36),
                      ),
                      child: const Text('Book'),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _showFilterSheet(BuildContext context) {
    final ThemeData theme = Theme.of(context);
    final ColorScheme cs = theme.colorScheme;
    final bool dark = theme.brightness == Brightness.dark;

    showModalBottomSheet<void>(
      context: context,
      backgroundColor: dark ? AppColors.paperRaised : Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(28),
          topRight: Radius.circular(28),
        ),
      ),
      builder: (BuildContext context) {
        return StatefulBuilder(
          builder: (BuildContext context, StateSetter setModalState) {
            return Padding(
              padding: const EdgeInsets.fromLTRB(24, 16, 24, 32),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Center(
                    child: Container(
                      width: 48,
                      height: 5,
                      decoration: BoxDecoration(
                        color: cs.outlineVariant.withValues(alpha: 0.5),
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Filters & Sorting',
                        style: theme.textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      TextButton(
                        onPressed: () {
                          setModalState(() {
                            _maxPrice = 200000;
                            _maxDuration = 14;
                            _hideSoldOut = false;
                            _sortBy = 'price_asc';
                          });
                        },
                        child: Text(
                          'Reset All',
                          style: TextStyle(
                            color: AppColors.secondary,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),

                  // Price Slider
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Max Price', style: theme.textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600)),
                      Text(
                        _maxPrice >= 200000
                            ? 'Any Price'
                            : 'PKR ${_maxPrice.toStringAsFixed(0)}',
                        style: TextStyle(
                          color: AppColors.secondary,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Slider(
                    value: _maxPrice,
                    min: 10000,
                    max: 200000,
                    divisions: 19,
                    activeColor: AppColors.secondary,
                    inactiveColor: cs.outlineVariant.withValues(alpha: 0.3),
                    onChanged: (double val) {
                      setModalState(() {
                        _maxPrice = val;
                      });
                    },
                  ),
                  const SizedBox(height: 16),

                  // Duration Slider
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Max Duration', style: theme.textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600)),
                      Text(
                        '$_maxDuration Days',
                        style: TextStyle(
                          color: AppColors.secondary,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Slider(
                    value: _maxDuration.toDouble(),
                    min: 1,
                    max: 14,
                    divisions: 13,
                    activeColor: AppColors.secondary,
                    inactiveColor: cs.outlineVariant.withValues(alpha: 0.3),
                    onChanged: (double val) {
                      setModalState(() {
                        _maxDuration = val.round();
                      });
                    },
                  ),
                  const SizedBox(height: 16),

                  // Hide Sold Out Trips
                  SwitchListTile.adaptive(
                    contentPadding: EdgeInsets.zero,
                    title: Text(
                      'Hide Sold Out Trips',
                      style: theme.textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600),
                    ),
                    activeColor: AppColors.secondary,
                    value: _hideSoldOut,
                    onChanged: (bool val) {
                      setModalState(() {
                        _hideSoldOut = val;
                      });
                    },
                  ),
                  const SizedBox(height: 16),

                  // Sorting Dropdown
                  Text('Sort By', style: theme.textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600)),
                  const SizedBox(height: 8),
                  DropdownButtonFormField<String>(
                    value: _sortBy,
                    dropdownColor: dark ? AppColors.paperRaised : Colors.white,
                    decoration: InputDecoration(
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide(color: cs.outlineVariant),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide(color: cs.outlineVariant),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide(color: AppColors.secondary),
                      ),
                    ),
                    items: const [
                      DropdownMenuItem(
                        value: 'price_asc',
                        child: Text('Price: Low to High'),
                      ),
                      DropdownMenuItem(
                        value: 'price_desc',
                        child: Text('Price: High to Low'),
                      ),
                      DropdownMenuItem(
                        value: 'duration_asc',
                        child: Text('Duration: Short to Long'),
                      ),
                      DropdownMenuItem(
                        value: 'duration_desc',
                        child: Text('Duration: Long to Short'),
                      ),
                    ],
                    onChanged: (String? val) {
                      if (val != null) {
                        setModalState(() {
                          _sortBy = val;
                        });
                      }
                    },
                  ),
                  const SizedBox(height: 32),

                  // Apply button
                  SizedBox(
                    width: double.infinity,
                    height: 52,
                    child: ElevatedButton(
                      onPressed: () {
                        setState(() {}); // Trigger rebuild of DiscoverHubPage
                        Navigator.pop(context);
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.secondary,
                        foregroundColor: Colors.black,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                        elevation: 0,
                      ),
                      child: const Text(
                        'Apply Filters',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }
}
