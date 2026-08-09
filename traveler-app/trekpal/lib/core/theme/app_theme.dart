import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import 'app_colors.dart';

class AppTheme {
  static final ThemeData lightTheme = _buildTheme(_lightScheme);
  static final ThemeData darkTheme = _buildTheme(_darkScheme);

  static const ColorScheme _lightScheme = ColorScheme(
    brightness: Brightness.light,
    primary: AppColors.primaryStrong, // Deep Forest Jade
    onPrimary: Colors.white,
    primaryContainer: AppColors.primary, // Light Forest Jade
    onPrimaryContainer: AppColors.primaryStrong,
    secondary: AppColors.secondary, // Sunrise Gold
    onSecondary: AppColors.paper,
    secondaryContainer: AppColors.sand,
    onSecondaryContainer: AppColors.clay,
    tertiary: AppColors.forest,
    onTertiary: Colors.white,
    tertiaryContainer: AppColors.primarySoft,
    onTertiaryContainer: AppColors.primaryStrong,
    error: AppColors.danger,
    onError: Colors.white,
    errorContainer: Color(0xFFFFDAD6),
    onErrorContainer: Color(0xFF93000A),
    surface: Color(0xFFF8F9FA), // Clean off-white
    onSurface: AppColors.primaryStrong,
    surfaceContainerHighest: Color(0xFFE9EAE5),
    onSurfaceVariant: Color(0xFF5C605A),
    outline: AppColors.inkMuted,
    outlineVariant: Color(0xFFE0E4DC),
    shadow: Color(0x14000000),
    scrim: Color(0x66000000),
    inverseSurface: AppColors.paper,
    onInverseSurface: AppColors.ink,
    inversePrimary: AppColors.primary,
    surfaceTint: AppColors.primaryStrong,
  );

  static const ColorScheme _darkScheme = ColorScheme(
    brightness: Brightness.dark,
    primary: AppColors.primary, // Light Forest Jade
    onPrimary: AppColors.primaryStrong, // Deep Forest Jade
    primaryContainer: AppColors.primaryStrong,
    onPrimaryContainer: AppColors.inkMuted,
    secondary: AppColors.secondary, // Sunrise Gold
    onSecondary: Color(0xFF432C00),
    secondaryContainer: AppColors.secondary,
    onSecondaryContainer: AppColors.clay,
    tertiary: AppColors.ink,
    onTertiary: AppColors.primaryStrong,
    tertiaryContainer: AppColors.primaryStrong,
    onTertiaryContainer: AppColors.primary,
    error: AppColors.danger,
    onError: Color(0xFF690005),
    errorContainer: Color(0xFF93000a),
    onErrorContainer: Color(0xFFFFDAD6),
    surface: AppColors.paper, // Onyx Slate Base background
    onSurface: AppColors.ink, // Crisp text
    surfaceContainerHighest: AppColors.paperRaised, // Deep Moss Container surface
    onSurfaceVariant: Color(0xFFC2C8C2),
    outline: AppColors.inkMuted,
    outlineVariant: Color(0xFF424844),
    shadow: Colors.black,
    scrim: Colors.black,
    inverseSurface: Color(0xFFF8F9FA),
    onInverseSurface: AppColors.primaryStrong,
    inversePrimary: AppColors.primaryStrong,
    surfaceTint: AppColors.primary,
  );

  static ThemeData _buildTheme(ColorScheme colorScheme) {
    final bool dark = colorScheme.brightness == Brightness.dark;
    final TextTheme baseTextTheme = dark
        ? Typography.whiteMountainView
        : Typography.blackMountainView;
    final TextTheme interTheme = GoogleFonts.interTextTheme(baseTextTheme);
    final TextTheme textTheme = interTheme.copyWith(
      displayLarge: GoogleFonts.montserrat(
        textStyle: interTheme.displayLarge?.copyWith(
          fontSize: 32,
          fontWeight: FontWeight.w700,
          height: 1.2,
          letterSpacing: -0.02,
        ),
      ),
      displayMedium: GoogleFonts.montserrat(
        textStyle: interTheme.displayMedium?.copyWith(
          fontSize: 28,
          fontWeight: FontWeight.w700,
          height: 1.2,
        ),
      ),
      headlineLarge: GoogleFonts.montserrat(
        textStyle: interTheme.headlineLarge?.copyWith(
          fontSize: 24,
          fontWeight: FontWeight.w700,
          height: 1.2,
        ),
      ),
      headlineMedium: GoogleFonts.montserrat(
        textStyle: interTheme.headlineMedium?.copyWith(
          fontSize: 20,
          fontWeight: FontWeight.w600,
          height: 1.2,
        ),
      ),
      headlineSmall: GoogleFonts.montserrat(
        textStyle: interTheme.headlineSmall?.copyWith(
          fontSize: 18,
          fontWeight: FontWeight.w600,
          height: 1.2,
        ),
      ),
      titleLarge: GoogleFonts.montserrat(
        textStyle: interTheme.titleLarge?.copyWith(
          fontSize: 16,
          fontWeight: FontWeight.w600,
        ),
      ),
      titleMedium: interTheme.titleMedium?.copyWith(
        fontWeight: FontWeight.w600,
        letterSpacing: 0.1,
      ),
      titleSmall: interTheme.titleSmall?.copyWith(
        fontWeight: FontWeight.w600,
        letterSpacing: 0.15,
      ),
      labelLarge: interTheme.labelLarge?.copyWith(
        fontWeight: FontWeight.w700,
        letterSpacing: 0.9,
      ),
      labelMedium: interTheme.labelMedium?.copyWith(
        fontWeight: FontWeight.w600,
        letterSpacing: 0.8,
      ),
      bodyLarge: interTheme.bodyLarge?.copyWith(height: 1.45),
      bodyMedium: interTheme.bodyMedium?.copyWith(height: 1.4),
      bodySmall: interTheme.bodySmall?.copyWith(
        color: colorScheme.onSurfaceVariant,
        height: 1.35,
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
