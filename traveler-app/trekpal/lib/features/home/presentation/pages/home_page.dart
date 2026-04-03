import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';

import '../../../../core/constants/app_constants.dart';
import '../../../../core/theme/theme_controller.dart';
import '../../../../core/utils/formatters.dart';
import '../../../../core/widgets/user_avatar.dart';
import '../../../auth/domain/entities/auth_entities.dart';
import '../../../auth/presentation/pages/traveler_kyc_page.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../../../bookings/presentation/pages/bookings_list_page.dart';
import '../../../chat/presentation/pages/chat_list_page.dart';
import '../../../complaints/presentation/pages/complaint_form_page.dart';
import '../../../packages/presentation/pages/packages_list_page.dart';
import '../../../trip_requests/presentation/pages/trip_requests_list_page.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  int _currentIndex = 0;

  @override
  Widget build(BuildContext context) {
    final ThemeData theme = Theme.of(context);
    final ColorScheme colorScheme = theme.colorScheme;

    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: const <Widget>[
          TripRequestsListPage(),
          PackagesListPage(),
          BookingsListPage(),
          _AccountPage(),
        ],
      ),
      bottomNavigationBar: SafeArea(
        minimum: const EdgeInsets.fromLTRB(16, 0, 16, 16),
        child: DecoratedBox(
          decoration: BoxDecoration(
            color: colorScheme.surfaceContainerHighest.withValues(
              alpha: theme.brightness == Brightness.dark ? 0.78 : 0.92,
            ),
            borderRadius: BorderRadius.circular(28),
            border: Border.all(
              color: colorScheme.outlineVariant.withValues(alpha: 0.8),
            ),
            boxShadow: <BoxShadow>[
              BoxShadow(
                color: Colors.black.withValues(
                  alpha: theme.brightness == Brightness.dark ? 0.24 : 0.08,
                ),
                blurRadius: 22,
                offset: const Offset(0, 10),
              ),
            ],
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(28),
            child: NavigationBar(
              selectedIndex: _currentIndex,
              onDestinationSelected: (int index) {
                setState(() {
                  _currentIndex = index;
                });
              },
              destinations: const <NavigationDestination>[
                NavigationDestination(
                  icon: Icon(Icons.edit_note_outlined),
                  selectedIcon: Icon(Icons.edit_note),
                  label: 'Request',
                ),
                NavigationDestination(
                  icon: Icon(Icons.route_outlined),
                  selectedIcon: Icon(Icons.route),
                  label: 'Offers',
                ),
                NavigationDestination(
                  icon: Icon(Icons.luggage_outlined),
                  selectedIcon: Icon(Icons.luggage),
                  label: 'Trips',
                ),
                NavigationDestination(
                  icon: Icon(Icons.account_circle_outlined),
                  selectedIcon: Icon(Icons.account_circle),
                  label: 'You',
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _AccountPage extends StatefulWidget {
  const _AccountPage();

  @override
  State<_AccountPage> createState() => _AccountPageState();
}

class _AccountPageState extends State<_AccountPage> {
  String _kycTitle(AuthProvider authProvider) {
    if (authProvider.isTravelerKycVerified) {
      return 'KYC approved';
    }

    switch (authProvider.currentUser?.travelerKycStatus) {
      case 'PENDING':
        return 'KYC in review';
      case 'REJECTED':
        return 'KYC needs update';
      default:
        return 'KYC required';
    }
  }

  String _kycMessage(AuthProvider authProvider) {
    if (authProvider.isTravelerKycVerified) {
      return 'Requests and bookings are unlocked.';
    }

    switch (authProvider.currentUser?.travelerKycStatus) {
      case 'PENDING':
        return 'Your account is waiting for admin approval.';
      case 'REJECTED':
        return 'Update your details to unlock trips again.';
      default:
        return 'Finish KYC after login to unlock the full app.';
    }
  }

  String _themeModeLabel(ThemeMode themeMode) {
    switch (themeMode) {
      case ThemeMode.light:
        return 'Light';
      case ThemeMode.dark:
        return 'Dark';
      case ThemeMode.system:
        return 'System';
    }
  }

  Future<void> _pickAvatar() async {
    final AuthProvider authProvider = context.read<AuthProvider>();
    final ScaffoldMessengerState messenger = ScaffoldMessenger.of(context);
    final XFile? file = await ImagePicker().pickImage(
      source: ImageSource.gallery,
      maxWidth: 1600,
      imageQuality: 85,
    );

    if (file == null) {
      return;
    }

    final List<int> bytes = await file.readAsBytes();
    final String lowerName = file.name.toLowerCase();
    final String mimeType = lowerName.endsWith('.png')
        ? 'image/png'
        : lowerName.endsWith('.webp')
        ? 'image/webp'
        : 'image/jpeg';

    try {
      await authProvider.uploadTravelerAvatar(
        ProfileImageUpload(
          fileName: file.name,
          bytes: bytes,
          mimeType: mimeType,
        ),
      );
      if (!mounted) {
        return;
      }
      messenger.showSnackBar(
        const SnackBar(content: Text('Profile picture updated')),
      );
    } catch (_) {
      if (!mounted) {
        return;
      }
      messenger.showSnackBar(
        SnackBar(
          content: Text(
            authProvider.errorMessage ?? 'Failed to update profile picture',
          ),
        ),
      );
    }
  }

  String _profileValue(String? value) {
    if (value == null || value.trim().isEmpty) {
      return '-';
    }

    return value.trim();
  }

  @override
  Widget build(BuildContext context) {
    final ThemeData theme = Theme.of(context);
    final ColorScheme colorScheme = theme.colorScheme;
    final AuthProvider authProvider = context.watch<AuthProvider>();
    final ThemeController themeController = context.watch<ThemeController>();
    final user = authProvider.currentUser;
    final bool unlocked = authProvider.canUseTravelerMarketplace;

    return Scaffold(
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 120),
          children: <Widget>[
            Row(
              children: <Widget>[
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      Text(
                        AppConstants.appName,
                        style: theme.textTheme.titleMedium?.copyWith(
                          color: colorScheme.primary,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Profile and access',
                        style: theme.textTheme.bodyMedium?.copyWith(
                          color: colorScheme.onSurfaceVariant,
                        ),
                      ),
                    ],
                  ),
                ),
                UserAvatar(
                  label: user?.name ?? 'Traveler',
                  imageUrl: user?.avatar,
                  radius: 24,
                ),
              ],
            ),
            const SizedBox(height: 24),
            Text(user?.name ?? 'Traveler', style: theme.textTheme.displaySmall),
            const SizedBox(height: 10),
            Text(
              'Keep your profile ready before you join the next trip.',
              style: theme.textTheme.bodyLarge?.copyWith(
                color: colorScheme.onSurfaceVariant,
              ),
            ),
            if (authProvider.isTravelerKycVerified) ...<Widget>[
              const SizedBox(height: 14),
              Align(
                alignment: Alignment.centerLeft,
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 8,
                  ),
                  decoration: BoxDecoration(
                    color: colorScheme.tertiary.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(999),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: <Widget>[
                      Icon(
                        Icons.verified_rounded,
                        size: 16,
                        color: colorScheme.tertiary,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        'Account approved',
                        style: theme.textTheme.labelLarge?.copyWith(
                          color: colorScheme.tertiary,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
            const SizedBox(height: 18),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Row(
                  children: <Widget>[
                    UserAvatar(
                      label: user?.name ?? 'Traveler',
                      imageUrl: user?.avatar,
                      radius: 34,
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: <Widget>[
                          Text(
                            'Profile picture',
                            style: theme.textTheme.titleMedium,
                          ),
                        ],
                      ),
                    ),
                    FilledButton.tonalIcon(
                      onPressed: authProvider.isLoading ? null : _pickAvatar,
                      icon: const Icon(Icons.photo_camera_outlined),
                      label: Text(user?.avatar != null ? 'Change' : 'Add'),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 18),
            if (!authProvider.isTravelerKycVerified) ...<Widget>[
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      Row(
                        children: <Widget>[
                          Expanded(
                            child: Text(
                              _kycTitle(authProvider),
                              style: theme.textTheme.headlineSmall,
                            ),
                          ),
                          _StatusPill(
                            label: unlocked ? 'Open' : 'Locked',
                            color: unlocked
                                ? colorScheme.tertiary
                                : colorScheme.secondary,
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      Text(
                        _kycMessage(authProvider),
                        style: theme.textTheme.bodyMedium?.copyWith(
                          color: colorScheme.onSurfaceVariant,
                        ),
                      ),
                      const SizedBox(height: 18),
                      Row(
                        children: <Widget>[
                          Expanded(
                            child: _MetricTile(
                              icon: unlocked
                                  ? Icons.lock_open_rounded
                                  : Icons.lock_outline_rounded,
                              label: 'Trips',
                              value: unlocked ? 'Active' : 'Restricted',
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: _MetricTile(
                              icon: Icons.palette_outlined,
                              label: 'Theme',
                              value: _themeModeLabel(themeController.themeMode),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 18),
                      FilledButton.icon(
                        onPressed: () {
                          Navigator.of(context).push(
                            MaterialPageRoute<bool>(
                              builder: (_) => const TravelerKycPage(),
                            ),
                          );
                        },
                        icon: const Icon(Icons.badge_outlined),
                        label: Text(
                          authProvider.currentUser?.travelerKycStatus ==
                                  'REJECTED'
                              ? 'Update KYC'
                              : 'Complete KYC',
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 18),
            ],
            Row(
              children: <Widget>[
                Expanded(
                  child: _QuickActionCard(
                    icon: Icons.forum_outlined,
                    title: 'Traveler chat',
                    subtitle: 'Joined offers',
                    onTap: () {
                      Navigator.of(context).push(
                        MaterialPageRoute<void>(
                          builder: (_) => const ChatListPage(),
                        ),
                      );
                    },
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _QuickActionCard(
                    icon: Icons.report_problem_outlined,
                    title: 'Complaint',
                    subtitle: 'Mockup',
                    onTap: () {
                      Navigator.of(context).push(
                        MaterialPageRoute<void>(
                          builder: (_) => const ComplaintFormPage(
                            subject: 'General support',
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
            const SizedBox(height: 18),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Text('Profile', style: theme.textTheme.titleLarge),
                    const SizedBox(height: 14),
                    _InfoRow(label: 'Email', value: user?.email ?? '-'),
                    _InfoRow(label: 'Phone', value: _profileValue(user?.phone)),
                    _InfoRow(
                      label: 'Gender',
                      value: _profileValue(user?.gender),
                    ),
                    _InfoRow(
                      label: 'DOB',
                      value: user?.dateOfBirth != null
                          ? AppFormatters.date(user!.dateOfBirth!)
                          : '-',
                    ),
                    _InfoRow(
                      label: 'Address',
                      value: _profileValue(user?.residentialAddress),
                    ),
                    _InfoRow(label: 'City', value: _profileValue(user?.city)),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 18),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Text('Theme', style: theme.textTheme.titleLarge),
                    const SizedBox(height: 14),
                    SegmentedButton<ThemeMode>(
                      showSelectedIcon: false,
                      segments: const <ButtonSegment<ThemeMode>>[
                        ButtonSegment<ThemeMode>(
                          value: ThemeMode.light,
                          icon: Icon(Icons.wb_sunny_outlined),
                          label: Text('Light'),
                        ),
                        ButtonSegment<ThemeMode>(
                          value: ThemeMode.system,
                          icon: Icon(Icons.phone_android_outlined),
                          label: Text('System'),
                        ),
                        ButtonSegment<ThemeMode>(
                          value: ThemeMode.dark,
                          icon: Icon(Icons.nightlight_outlined),
                          label: Text('Dark'),
                        ),
                      ],
                      selected: <ThemeMode>{themeController.themeMode},
                      onSelectionChanged: (Set<ThemeMode> modes) {
                        themeController.setThemeMode(modes.first);
                      },
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),
            OutlinedButton.icon(
              onPressed: authProvider.isLoading
                  ? null
                  : () => context.read<AuthProvider>().logout(),
              icon: const Icon(Icons.logout_rounded),
              label: const Text('Sign out'),
            ),
          ],
        ),
      ),
    );
  }
}

class _StatusPill extends StatelessWidget {
  const _StatusPill({required this.label, required this.color});

  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style: Theme.of(context).textTheme.labelMedium?.copyWith(color: color),
      ),
    );
  }
}

class _MetricTile extends StatelessWidget {
  const _MetricTile({
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

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: colorScheme.surfaceContainerHighest.withValues(
          alpha: theme.brightness == Brightness.dark ? 0.3 : 0.6,
        ),
        borderRadius: BorderRadius.circular(22),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Icon(icon, color: colorScheme.primary),
          const SizedBox(height: 10),
          Text(value, style: theme.textTheme.titleMedium),
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

class _QuickActionCard extends StatelessWidget {
  const _QuickActionCard({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final ThemeData theme = Theme.of(context);
    final ColorScheme colorScheme = theme.colorScheme;

    return Card(
      child: InkWell(
        borderRadius: BorderRadius.circular(30),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(18),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Icon(icon, color: colorScheme.primary),
              const SizedBox(height: 14),
              Text(title, style: theme.textTheme.titleMedium),
              const SizedBox(height: 4),
              Text(
                subtitle,
                style: theme.textTheme.bodySmall?.copyWith(
                  color: colorScheme.onSurfaceVariant,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  const _InfoRow({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    final ThemeData theme = Theme.of(context);
    final ColorScheme colorScheme = theme.colorScheme;

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        children: <Widget>[
          SizedBox(
            width: 72,
            child: Text(
              label,
              style: theme.textTheme.bodySmall?.copyWith(
                color: colorScheme.onSurfaceVariant,
              ),
            ),
          ),
          Expanded(child: Text(value, style: theme.textTheme.titleSmall)),
        ],
      ),
    );
  }
}
