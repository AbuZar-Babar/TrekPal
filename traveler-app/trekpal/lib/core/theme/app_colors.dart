import 'package:flutter/material.dart';

class AppColors {
  static const Color primary = Color(0xFFAECEBC); // Light Forest Jade
  static const Color primaryStrong = Color(0xFF0E2B1F); // Deep Forest Jade
  static const Color primarySoft = Color(0xFFC9EAD7);

  static const Color sand = Color(0xFFFFD799); // Light Gold/Sand
  static const Color sandSoft = Color(0xFFFFDEAC);
  static const Color paper = Color(0xFF111415); // Onyx Slate Base background
  static const Color paperRaised = Color(0xFF1D2021); // Deep Moss Container surface

  static const Color secondary = Color(0xFFFEBA38); // Sunrise Gold highlight
  static const Color clay = Color(0xFF6A4800);

  static const Color ink = Color(0xFFE1E3E4); // Light Text
  static const Color inkMuted = Color(0xFF8C928D); // Muted Sage Text

  static const Color forest = Color(0xFF0E2B1F);
  static const Color moss = Color(0xFF1D2021);
  static const Color amber = Color(0xFFFEB300); // Accent Gold
  static const Color danger = Color(0xFFFFB4AB); // Error color

  static const Color night = Color(0xFF111415);
  static const Color nightRaised = Color(0xFF1D2021);
  static const Color nightCard = Color(0xFF282A2B);
  static const Color nightOutline = Color(0xFF424844);
  static const Color nightText = Color(0xFFE1E3E4);

  static const Color pine = primaryStrong;
  static const Color mist = paper;
  static const Color card = paperRaised;

  static const List<List<Color>> destinationPalettes = <List<Color>>[
    <Color>[Color(0xFF0F4C81), Color(0xFF2E86C1), Color(0xFF8CC9F7)],
    <Color>[Color(0xFF355C4F), Color(0xFF5F8B67), Color(0xFFC9D9A1)],
    <Color>[Color(0xFF704F3B), Color(0xFFB47A55), Color(0xFFF3D7A6)],
    <Color>[Color(0xFF283D70), Color(0xFF5968B5), Color(0xFFC7D2F6)],
    <Color>[Color(0xFF445A23), Color(0xFF7E9F38), Color(0xFFE4F2B5)],
    <Color>[Color(0xFF843442), Color(0xFFD05B65), Color(0xFFF5B9AF)],
  ];

  static List<Color> paletteForSeed(String seed, {required bool dark}) {
    final int hash = seed.runes.fold<int>(0, (int value, int rune) {
      return value + rune;
    });
    final List<Color> palette =
        destinationPalettes[hash % destinationPalettes.length];

    if (!dark) {
      return palette;
    }

    return palette
        .map((Color color) => Color.lerp(color, Colors.black, 0.38) ?? color)
        .toList(growable: false);
  }
}
