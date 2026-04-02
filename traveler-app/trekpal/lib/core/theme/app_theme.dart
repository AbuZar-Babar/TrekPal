import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import 'app_colors.dart';

class AppTheme {
  static final ThemeData lightTheme = _buildTheme(_lightScheme);
  static final ThemeData darkTheme = _buildTheme(_darkScheme);

  static const ColorScheme _lightScheme = ColorScheme(
    brightness: Brightness.light,
    primary: AppColors.primary,
    onPrimary: Colors.white,
    primaryContainer: Color(0xFF4776B7),
    onPrimaryContainer: Colors.white,
    secondary: AppColors.secondary,
    onSecondary: Colors.white,
    secondaryContainer: AppColors.sand,
    onSecondaryContainer: AppColors.ink,
    tertiary: AppColors.forest,
    onTertiary: Colors.white,
    tertiaryContainer: Color(0xFFDDEBDD),
    onTertiaryContainer: AppColors.ink,
    error: AppColors.danger,
    onError: Colors.white,
    errorContainer: Color(0xFFFFDAD3),
    onErrorContainer: AppColors.ink,
    surface: AppColors.paper,
    onSurface: AppColors.ink,
    surfaceContainerHighest: Color(0xFFE9E3DA),
    onSurfaceVariant: AppColors.inkMuted,
    outline: Color(0xFFC9C1B5),
    outlineVariant: Color(0xFFE7E0D5),
    shadow: Color(0x14000000),
    scrim: Color(0x66000000),
    inverseSurface: Color(0xFF31302D),
    onInverseSurface: Color(0xFFF3F0EB),
    inversePrimary: AppColors.primarySoft,
    surfaceTint: AppColors.primary,
  );

  static const ColorScheme _darkScheme = ColorScheme(
    brightness: Brightness.dark,
    primary: Color(0xFF8FB8F5),
    onPrimary: Color(0xFF082548),
    primaryContainer: Color(0xFF1E4C81),
    onPrimaryContainer: Color(0xFFE8F1FF),
    secondary: Color(0xFFD9C4AF),
    onSecondary: Color(0xFF2D2319),
    secondaryContainer: Color(0xFF4F4438),
    onSecondaryContainer: Color(0xFFF6E8D6),
    tertiary: Color(0xFF86CFAF),
    onTertiary: Color(0xFF0E3A2A),
    tertiaryContainer: Color(0xFF234A3B),
    onTertiaryContainer: Color(0xFFD9F3E6),
    error: Color(0xFFFFB4A8),
    onError: Color(0xFF690005),
    errorContainer: Color(0xFF8E1614),
    onErrorContainer: Color(0xFFFFDAD4),
    surface: AppColors.night,
    onSurface: AppColors.nightText,
    surfaceContainerHighest: AppColors.nightCard,
    onSurfaceVariant: Color(0xFFD0C7BD),
    outline: AppColors.nightOutline,
    outlineVariant: Color(0xFF313845),
    shadow: Colors.black,
    scrim: Colors.black,
    inverseSurface: AppColors.paper,
    onInverseSurface: AppColors.ink,
    inversePrimary: AppColors.primaryStrong,
    surfaceTint: Color(0xFF8FB8F5),
  );

  static ThemeData _buildTheme(ColorScheme colorScheme) {
    final bool dark = colorScheme.brightness == Brightness.dark;
    final TextTheme baseTextTheme = dark
        ? Typography.whiteMountainView
        : Typography.blackMountainView;
    final TextTheme manropeTheme = GoogleFonts.manropeTextTheme(baseTextTheme);
    final TextTheme textTheme = manropeTheme.copyWith(
      displayLarge: GoogleFonts.notoSerif(
        textStyle: manropeTheme.displayLarge?.copyWith(
          fontSize: 42,
          fontWeight: FontWeight.w700,
          height: 1.08,
        ),
      ),
      displayMedium: GoogleFonts.notoSerif(
        textStyle: manropeTheme.displayMedium?.copyWith(
          fontSize: 36,
          fontWeight: FontWeight.w700,
          height: 1.1,
        ),
      ),
      headlineLarge: GoogleFonts.notoSerif(
        textStyle: manropeTheme.headlineLarge?.copyWith(
          fontSize: 32,
          fontWeight: FontWeight.w700,
          height: 1.15,
        ),
      ),
      headlineMedium: GoogleFonts.notoSerif(
        textStyle: manropeTheme.headlineMedium?.copyWith(
          fontSize: 28,
          fontWeight: FontWeight.w700,
          height: 1.16,
        ),
      ),
      headlineSmall: GoogleFonts.notoSerif(
        textStyle: manropeTheme.headlineSmall?.copyWith(
          fontSize: 24,
          fontWeight: FontWeight.w700,
          height: 1.18,
        ),
      ),
      titleLarge: GoogleFonts.notoSerif(
        textStyle: manropeTheme.titleLarge?.copyWith(
          fontSize: 20,
          fontWeight: FontWeight.w700,
        ),
      ),
      titleMedium: manropeTheme.titleMedium?.copyWith(
        fontWeight: FontWeight.w700,
        letterSpacing: 0.1,
      ),
      titleSmall: manropeTheme.titleSmall?.copyWith(
        fontWeight: FontWeight.w700,
        letterSpacing: 0.15,
      ),
      labelLarge: manropeTheme.labelLarge?.copyWith(
        fontWeight: FontWeight.w800,
        letterSpacing: 0.9,
      ),
      labelMedium: manropeTheme.labelMedium?.copyWith(
        fontWeight: FontWeight.w700,
        letterSpacing: 0.8,
      ),
      bodyLarge: manropeTheme.bodyLarge?.copyWith(height: 1.48),
      bodyMedium: manropeTheme.bodyMedium?.copyWith(height: 1.45),
      bodySmall: manropeTheme.bodySmall?.copyWith(
        color: colorScheme.onSurfaceVariant,
        height: 1.4,
      ),
    );

    final Color filledSurface = dark
        ? colorScheme.surfaceContainerHighest.withValues(alpha: 0.72)
        : AppColors.paperRaised;
    final Color subtleSurface = dark
        ? colorScheme.surfaceContainerHighest.withValues(alpha: 0.38)
        : Color.alphaBlend(
            AppColors.primary.withValues(alpha: 0.04),
            colorScheme.surface,
          );

    return ThemeData(
      useMaterial3: true,
      colorScheme: colorScheme,
      brightness: colorScheme.brightness,
      scaffoldBackgroundColor: colorScheme.surface,
      textTheme: textTheme.apply(
        bodyColor: colorScheme.onSurface,
        displayColor: colorScheme.onSurface,
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: Colors.transparent,
        foregroundColor: colorScheme.onSurface,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: false,
        surfaceTintColor: Colors.transparent,
        titleTextStyle: textTheme.titleLarge?.copyWith(
          color: colorScheme.onSurface,
        ),
      ),
      cardTheme: CardThemeData(
        color: filledSurface,
        elevation: 0,
        margin: EdgeInsets.zero,
        shadowColor: dark
            ? Colors.black.withValues(alpha: 0.35)
            : colorScheme.shadow,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
      ),
      floatingActionButtonTheme: FloatingActionButtonThemeData(
        backgroundColor: colorScheme.primary,
        foregroundColor: colorScheme.onPrimary,
        extendedTextStyle: textTheme.labelLarge?.copyWith(
          color: colorScheme.onPrimary,
        ),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: subtleSurface,
        hintStyle: textTheme.bodyMedium?.copyWith(
          color: colorScheme.onSurfaceVariant.withValues(alpha: 0.75),
        ),
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 18,
          vertical: 18,
        ),
        labelStyle: textTheme.labelMedium?.copyWith(
          color: colorScheme.onSurfaceVariant,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(22),
          borderSide: BorderSide(color: colorScheme.outlineVariant),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(22),
          borderSide: BorderSide(color: colorScheme.primary, width: 1.4),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(22),
          borderSide: BorderSide(color: colorScheme.error),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(22),
          borderSide: BorderSide(color: colorScheme.error, width: 1.4),
        ),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(22),
          borderSide: BorderSide(color: colorScheme.outlineVariant),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          minimumSize: const Size(0, 56),
          backgroundColor: colorScheme.primary,
          foregroundColor: colorScheme.onPrimary,
          disabledBackgroundColor: colorScheme.primary.withValues(alpha: 0.38),
          disabledForegroundColor: colorScheme.onPrimary.withValues(
            alpha: 0.72,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(18),
          ),
          textStyle: textTheme.labelLarge?.copyWith(
            color: colorScheme.onPrimary,
          ),
        ),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          minimumSize: const Size(0, 52),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(18),
          ),
          textStyle: textTheme.labelLarge,
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          minimumSize: const Size(0, 52),
          side: BorderSide(color: colorScheme.outlineVariant),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(18),
          ),
          foregroundColor: colorScheme.onSurface,
          textStyle: textTheme.labelLarge,
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: colorScheme.primary,
          textStyle: textTheme.labelLarge?.copyWith(color: colorScheme.primary),
        ),
      ),
      chipTheme: ChipThemeData(
        backgroundColor: subtleSurface,
        selectedColor: colorScheme.primary,
        disabledColor: colorScheme.surfaceContainerHighest,
        secondarySelectedColor: colorScheme.secondaryContainer,
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
        side: BorderSide.none,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
        labelStyle: textTheme.labelMedium?.copyWith(
          color: colorScheme.onSurface,
        ),
        secondaryLabelStyle: textTheme.labelMedium?.copyWith(
          color: colorScheme.onSurface,
        ),
      ),
      dividerTheme: const DividerThemeData(space: 0, thickness: 0),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: dark
            ? colorScheme.surfaceContainerHighest.withValues(alpha: 0.88)
            : Colors.white.withValues(alpha: 0.9),
        indicatorColor: colorScheme.primary.withValues(
          alpha: dark ? 0.34 : 0.16,
        ),
        iconTheme: WidgetStateProperty.resolveWith<IconThemeData>((
          Set<WidgetState> states,
        ) {
          final bool selected = states.contains(WidgetState.selected);
          return IconThemeData(
            color: selected
                ? colorScheme.primary
                : colorScheme.onSurfaceVariant,
          );
        }),
        labelTextStyle: WidgetStateProperty.resolveWith<TextStyle>((
          Set<WidgetState> states,
        ) {
          final bool selected = states.contains(WidgetState.selected);
          return (textTheme.labelMedium ?? const TextStyle()).copyWith(
            color: selected
                ? colorScheme.primary
                : colorScheme.onSurfaceVariant,
          );
        }),
        height: 74,
        elevation: 0,
        labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
      ),
      snackBarTheme: SnackBarThemeData(
        behavior: SnackBarBehavior.floating,
        backgroundColor: dark ? AppColors.nightCard : AppColors.ink,
        contentTextStyle: textTheme.bodyMedium?.copyWith(
          color: dark ? AppColors.nightText : Colors.white,
        ),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
      ),
      switchTheme: SwitchThemeData(
        thumbColor: WidgetStateProperty.resolveWith<Color>((
          Set<WidgetState> states,
        ) {
          if (states.contains(WidgetState.selected)) {
            return colorScheme.onPrimary;
          }
          return colorScheme.surface;
        }),
        trackColor: WidgetStateProperty.resolveWith<Color>((
          Set<WidgetState> states,
        ) {
          if (states.contains(WidgetState.selected)) {
            return colorScheme.primary;
          }
          return colorScheme.outlineVariant;
        }),
      ),
      segmentedButtonTheme: SegmentedButtonThemeData(
        style: ButtonStyle(
          padding: WidgetStateProperty.all(
            const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          ),
          backgroundColor: WidgetStateProperty.resolveWith<Color>((
            Set<WidgetState> states,
          ) {
            if (states.contains(WidgetState.selected)) {
              return colorScheme.primary.withValues(alpha: dark ? 0.36 : 0.12);
            }
            return filledSurface;
          }),
          foregroundColor: WidgetStateProperty.resolveWith<Color>((
            Set<WidgetState> states,
          ) {
            if (states.contains(WidgetState.selected)) {
              return colorScheme.primary;
            }
            return colorScheme.onSurfaceVariant;
          }),
          side: WidgetStateProperty.all(
            BorderSide(color: colorScheme.outlineVariant),
          ),
          shape: WidgetStateProperty.all(
            RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
          ),
        ),
      ),
    );
  }
}
