import 'package:flutter/material.dart';

import '../theme/app_colors.dart';

class TrekpalLoadingWidget extends StatefulWidget {
  const TrekpalLoadingWidget({super.key, this.message = 'Loading...'});

  final String message;

  @override
  State<TrekpalLoadingWidget> createState() => _TrekpalLoadingWidgetState();
}

class _TrekpalLoadingWidgetState extends State<TrekpalLoadingWidget>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1100),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final ThemeData theme = Theme.of(context);
    final ColorScheme colorScheme = theme.colorScheme;

    return AnimatedBuilder(
      animation: _controller,
      builder: (BuildContext context, _) {
        return Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: <Widget>[
              Container(
                width: 110,
                height: 110,
                decoration: BoxDecoration(
                  color: colorScheme.surfaceContainerHighest.withValues(
                    alpha: theme.brightness == Brightness.dark ? 0.46 : 0.68,
                  ),
                  shape: BoxShape.circle,
                ),
                child: Stack(
                  alignment: Alignment.center,
                  children: <Widget>[
                    Transform.rotate(
                      angle: _controller.value * 6.28,
                      child: Container(
                        width: 62,
                        height: 62,
                        decoration: BoxDecoration(
                          border: Border.all(
                            color: AppColors.forest.withValues(alpha: 0.18),
                            width: 6,
                          ),
                          shape: BoxShape.circle,
                        ),
                      ),
                    ),
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: List<Widget>.generate(3, (int index) {
                        final double progress =
                            (_controller.value + index * 0.18) % 1;
                        final double scale = 0.78 + (1 - progress) * 0.38;

                        return Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 4),
                          child: Transform.scale(
                            scale: scale,
                            child: Container(
                              width: 12,
                              height: 12,
                              decoration: BoxDecoration(
                                color: index == 1
                                    ? AppColors.primary
                                    : AppColors.forest,
                                shape: BoxShape.circle,
                              ),
                            ),
                          ),
                        );
                      }),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
              Text(
                widget.message,
                style: theme.textTheme.bodyMedium,
                textAlign: TextAlign.center,
              ),
            ],
          ),
        );
      },
    );
  }
}
