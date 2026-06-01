import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';

import '../../../../core/constants/app_constants.dart';
import '../../../../core/theme/app_colors.dart';
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
    final ColorScheme cs = theme.colorScheme;
    final bool dark = theme.brightness == Brightness.dark;

    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: const <Widget>[
          TripRequestsListPage(),
          PackagesListPage(),
          BookingsListPage(),
          _AccountTab(),
        ],
      ),
      bottomNavigationBar: SafeArea(
        minimum: const EdgeInsets.fromLTRB(16, 0, 16, 14),
        child: DecoratedBox(
          decoration: BoxDecoration(
            color: dark
                ? cs.surfaceContainerHighest.withValues(alpha: 0.82)
                : Colors.white.withValues(alpha: 0.94),
            borderRadius: BorderRadius.circular(28),
            border: Border.all(
              color: cs.outlineVariant.withValues(alpha: 0.7),
            ),
            boxShadow: <BoxShadow>[
              BoxShadow(
                color: Colors.black
                    .withValues(alpha: dark ? 0.22 : 0.07),
                blurRadius: 24,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(28),
            child: NavigationBar(
              selectedIndex: _currentIndex,
              onDestinationSelected: (int i) =>
                  setState(() => _currentIndex = i),
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

// ── Account tab ───────────────────────────────────────────────────────────────
class _AccountTab extends StatefulWidget {
  const _AccountTab();

  @override
  State<_AccountTab> createState() => _AccountTabState();
}

class _AccountTabState extends State<_AccountTab> {
  Future<void> _pickAvatar() async {
    final AuthProvider auth = context.read<AuthProvider>();
    final ScaffoldMessengerState messenger = ScaffoldMessenger.of(context);
    final XFile? file = await ImagePicker().pickImage(
      source: ImageSource.gallery,
      maxWidth: 1600,
      imageQuality: 85,
    );
    if (file == null) return;
    final List<int> bytes = await file.readAsBytes();
    final String name = file.name.toLowerCase();
    final String mime = name.endsWith('.png')
        ? 'image/png'
        : name.endsWith('.webp')
            ? 'image/webp'
            : 'image/jpeg';
    try {
      await auth.uploadTravelerAvatar(
        ProfileImageUpload(fileName: file.name, bytes: bytes, mimeType: mime),
      );
      if (!mounted) return;
      messenger.showSnackBar(
        const SnackBar(content: Text('Profile picture updated')),
      );
    } catch (_) {
      if (!mounted) return;
      messenger.showSnackBar(
        SnackBar(
          content: Text(auth.errorMessage ?? 'Failed to update picture'),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final ThemeData theme = Theme.of(context);
    final ColorScheme cs = theme.colorScheme;
    final bool dark = theme.brightness == Brightness.dark;

    final AuthProvider auth = context.watch<AuthProvider>();
    final ThemeController themeCtrl = context.watch<ThemeController>();
    final user = auth.currentUser;
    final bool verified = auth.isTravelerKycVerified;
    final String kycStatus = user?.travelerKycStatus ?? 'NOT_SUBMITTED';

    return Scaffold(
      body: ListView(
        padding: const EdgeInsets.fromLTRB(0, 0, 0, 120),
        children: <Widget>[
          // ── Profile hero ──────────────────────────────────────
          _ProfileHero(
            user: user,
            verified: verified,
            isLoading: auth.isLoading,
            onPickAvatar: _pickAvatar,
            dark: dark,
            cs: cs,
            theme: theme,
          ),

          const SizedBox(height: 20),

          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                // ── KYC banner ────────────────────────────────
                if (!verified) ...<Widget>[
                  _KycBanner(
                    kycStatus: kycStatus,
                    theme: theme,
                    cs: cs,
                    dark: dark,
                    onTap: () => Navigator.of(context).push(
                      MaterialPageRoute<bool>(
                          builder: (_) => const TravelerKycPage()),
                    ),
                  ),
                  const SizedBox(height: 16),
                ],

                // ── Quick actions ─────────────────────────────
                Row(
                  children: <Widget>[
                    Expanded(
                      child: _ActionTile(
                        icon: Icons.forum_outlined,
                        title: 'Chat',
                        subtitle: 'Joined offers',
                        onTap: () => Navigator.of(context).push(
                          MaterialPageRoute<void>(
                              builder: (_) => const ChatListPage()),
                        ),
                        cs: cs,
                        theme: theme,
                        dark: dark,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: _ActionTile(
                        icon: Icons.report_problem_outlined,
                        title: 'Support',
                        subtitle: 'File a complaint',
                        onTap: () => Navigator.of(context).push(
                          MaterialPageRoute<void>(
                            builder: (_) => const ComplaintFormPage(
                                subject: 'General support'),
                          ),
                        ),
                        cs: cs,
                        theme: theme,
                        dark: dark,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                // ── Profile info ──────────────────────────────
                _SectionCard(
                  title: 'Profile',
                  theme: theme,
                  cs: cs,
                  dark: dark,
                  child: Column(
                    children: <Widget>[
                      _InfoRow(
                          label: 'Email',
                          value: user?.email ?? '—',
                          theme: theme,
                          cs: cs),
                      _InfoRow(
                          label: 'Phone',
                          value: _val(user?.phone),
                          theme: theme,
                          cs: cs),
                      _InfoRow(
                          label: 'Gender',
                          value: _val(user?.gender),
                          theme: theme,
                          cs: cs),
                      _InfoRow(
                          label: 'Date of birth',
                          value: user?.dateOfBirth != null
                              ? AppFormatters.date(user!.dateOfBirth!)
                              : '—',
                          theme: theme,
                          cs: cs),
                      _InfoRow(
                          label: 'Address',
                          value: _val(user?.residentialAddress),
                          theme: theme,
                          cs: cs),
                      _InfoRow(
                          label: 'City',
                          value: _val(user?.city),
                          theme: theme,
                          cs: cs,
                          last: true),
                    ],
                  ),
                ),
                const SizedBox(height: 16),

                // ── Theme ─────────────────────────────────────
                _SectionCard(
                  title: 'Appearance',
                  theme: theme,
                  cs: cs,
                  dark: dark,
                  child: SegmentedButton<ThemeMode>(
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
                    selected: <ThemeMode>{themeCtrl.themeMode},
                    onSelectionChanged: (Set<ThemeMode> modes) =>
                        themeCtrl.setThemeMode(modes.first),
                  ),
                ),
                const SizedBox(height: 20),

                // ── Sign out ──────────────────────────────────
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton.icon(
                    onPressed: auth.isLoading
                        ? null
                        : () => context.read<AuthProvider>().logout(),
                    icon: const Icon(Icons.logout_rounded),
                    label: const Text('Sign out'),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _val(String? v) =>
      (v == null || v.trim().isEmpty) ? '—' : v.trim();
}

// ── Profile hero ──────────────────────────────────────────────────────────────
class _ProfileHero extends StatelessWidget {
  const _ProfileHero({
    required this.user,
    required this.verified,
    required this.isLoading,
    required this.onPickAvatar,
    required this.dark,
    required this.cs,
    required this.theme,
  });

  final dynamic user;
  final bool verified;
  final bool isLoading;
  final VoidCallback onPickAvatar;
  final bool dark;
  final ColorScheme cs;
  final ThemeData theme;

  @override
  Widget build(BuildContext context) {
    final Color bgTop = dark
        ? AppColors.night
        : Color.lerp(AppColors.primary, AppColors.paper, 0.88)!;
    final Color bgBottom =
        dark ? AppColors.nightRaised : AppColors.paper;

    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: <Color>[bgTop, bgBottom],
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
        ),
      ),
      child: SafeArea(
        bottom: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 20, 20, 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              // Top row: app name
              Text(
                AppConstants.appName,
                style: theme.textTheme.labelLarge?.copyWith(
                  color: cs.primary,
                  letterSpacing: 0.8,
                ),
              ),
              const SizedBox(height: 20),

              // Avatar row
              Row(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: <Widget>[
                  // Avatar + edit button
                  Stack(
                    children: <Widget>[
                      UserAvatar(
                        label: user?.name ?? 'Traveler',
                        imageUrl: user?.avatar,
                        radius: 38,
                      ),
                      Positioned(
                        right: 0,
                        bottom: 0,
                        child: GestureDetector(
                          onTap: isLoading ? null : onPickAvatar,
                          child: Container(
                            width: 26,
                            height: 26,
                            decoration: BoxDecoration(
                              color: cs.primary,
                              shape: BoxShape.circle,
                              border: Border.all(
                                  color: bgBottom, width: 2),
                            ),
                            child: Icon(Icons.camera_alt_rounded,
                                size: 13, color: cs.onPrimary),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(width: 16),

                  // Name + badge
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: <Widget>[
                        Text(
                          user?.name ?? 'Traveler',
                          style: theme.textTheme.headlineSmall,
                        ),
                        const SizedBox(height: 4),
                        if (verified)
                          Row(
                            mainAxisSize: MainAxisSize.min,
                            children: <Widget>[
                              Icon(Icons.verified_rounded,
                                  size: 14, color: cs.tertiary),
                              const SizedBox(width: 5),
                              Text(
                                'Verified traveler',
                                style: theme.textTheme.labelSmall?.copyWith(
                                  color: cs.tertiary,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ],
                          )
                        else
                          Text(
                            user?.email ?? '',
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: cs.onSurfaceVariant,
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                      ],
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ── KYC banner ────────────────────────────────────────────────────────────────
class _KycBanner extends StatelessWidget {
  const _KycBanner({
    required this.kycStatus,
    required this.theme,
    required this.cs,
    required this.dark,
    required this.onTap,
  });

  final String kycStatus;
  final ThemeData theme;
  final ColorScheme cs;
  final bool dark;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final bool pending = kycStatus == 'PENDING';
    final bool rejected = kycStatus == 'REJECTED';

    final Color color = pending
        ? cs.tertiary
        : rejected
            ? cs.error
            : cs.primary;
    final IconData icon = pending
        ? Icons.hourglass_top_rounded
        : rejected
            ? Icons.warning_amber_rounded
            : Icons.badge_outlined;
    final String title = pending
        ? 'KYC under review'
        : rejected
            ? 'KYC needs update'
            : 'Complete KYC';
    final String sub = pending
        ? 'Your account is pending admin approval.'
        : rejected
            ? 'Your details were rejected. Please update them.'
            : 'Verify your identity to unlock trips and bookings.';
    final String btn = pending
        ? 'View submission'
        : rejected
            ? 'Update KYC'
            : 'Start KYC';

    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: color.withValues(alpha: dark ? 0.14 : 0.08),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: color.withValues(alpha: 0.22)),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Container(
              width: 38,
              height: 38,
              decoration: BoxDecoration(
                color: color.withValues(alpha: dark ? 0.22 : 0.12),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, size: 20, color: color),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Text(
                    title,
                    style: theme.textTheme.titleSmall?.copyWith(color: color),
                  ),
                  const SizedBox(height: 3),
                  Text(
                    sub,
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: cs.onSurfaceVariant,
                    ),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    '$btn →',
                    style: theme.textTheme.labelMedium?.copyWith(
                      color: color,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Action tile ───────────────────────────────────────────────────────────────
class _ActionTile extends StatelessWidget {
  const _ActionTile({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
    required this.cs,
    required this.theme,
    required this.dark,
  });

  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;
  final ColorScheme cs;
  final ThemeData theme;
  final bool dark;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: cs.surfaceContainerHighest.withValues(alpha: dark ? 0.32 : 0.5),
      borderRadius: BorderRadius.circular(20),
      child: InkWell(
        borderRadius: BorderRadius.circular(20),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Icon(icon, color: cs.primary, size: 22),
              const SizedBox(height: 12),
              Text(title, style: theme.textTheme.titleSmall),
              const SizedBox(height: 3),
              Text(
                subtitle,
                style: theme.textTheme.bodySmall?.copyWith(
                  color: cs.onSurfaceVariant,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ── Section card ──────────────────────────────────────────────────────────────
class _SectionCard extends StatelessWidget {
  const _SectionCard({
    required this.title,
    required this.child,
    required this.theme,
    required this.cs,
    required this.dark,
  });

  final String title;
  final Widget child;
  final ThemeData theme;
  final ColorScheme cs;
  final bool dark;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: cs.surfaceContainerHighest.withValues(alpha: dark ? 0.32 : 0.5),
        borderRadius: BorderRadius.circular(22),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Padding(
            padding: const EdgeInsets.fromLTRB(18, 16, 18, 12),
            child: Text(
              title,
              style: theme.textTheme.labelLarge?.copyWith(
                color: cs.onSurfaceVariant,
                letterSpacing: 0.6,
              ),
            ),
          ),
          const Divider(height: 1, indent: 18, endIndent: 18),
          Padding(
            padding: const EdgeInsets.fromLTRB(18, 12, 18, 16),
            child: child,
          ),
        ],
      ),
    );
  }
}

// ── Info row ──────────────────────────────────────────────────────────────────
class _InfoRow extends StatelessWidget {
  const _InfoRow({
    required this.label,
    required this.value,
    required this.theme,
    required this.cs,
    this.last = false,
  });

  final String label;
  final String value;
  final ThemeData theme;
  final ColorScheme cs;
  final bool last;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(bottom: last ? 0 : 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          SizedBox(
            width: 88,
            child: Text(
              label,
              style: theme.textTheme.bodySmall?.copyWith(
                color: cs.onSurfaceVariant,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: theme.textTheme.bodyMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
