import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:trekpal/core/widgets/loading_widget.dart';

void main() {
  testWidgets('loading widget renders message', (WidgetTester tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(
          body: TrekpalLoadingWidget(message: 'Preparing TrekPal...'),
        ),
      ),
    );

    expect(find.text('Preparing TrekPal...'), findsOneWidget);
    expect(find.byType(CircularProgressIndicator), findsOneWidget);
  });
}
