import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../../core/constants/api_constants.dart';
import '../../../../core/constants/app_constants.dart';
import '../../domain/entities/auth_entities.dart';
import '../providers/auth_provider.dart';
import '../widgets/auth_form_widget.dart';

class RegisterPage extends StatelessWidget {
  const RegisterPage({super.key});

  Future<void> _submit(BuildContext context, AuthFormValues values) async {
    final ScaffoldMessengerState messenger = ScaffoldMessenger.of(context);
    final AuthProvider authProvider = context.read<AuthProvider>();
    try {
      await authProvider.registerTraveler(
        input: TravelerRegistrationInput(
          name: values.name ?? '',
          email: values.email,
          password: values.password,
          phone: values.phone ?? '',
          dateOfBirth: values.dateOfBirth!,
          gender: values.gender ?? 'Male',
          address: values.address ?? '',
        ),
      );
      if (!context.mounted) {
        return;
      }
      Navigator.of(context).pop();
    } catch (_) {
      if (!context.mounted) {
        return;
      }
      messenger.showSnackBar(
        SnackBar(
          content: Text(authProvider.errorMessage ?? 'Registration failed'),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final ThemeData theme = Theme.of(context);
    final ColorScheme colorScheme = theme.colorScheme;
    final AuthProvider authProvider = context.watch<AuthProvider>();

    return Scaffold(
      appBar: AppBar(),
      body: SafeArea(
        top: false,
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(24, 8, 24, 32),
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 500),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Text(
                    AppConstants.appName,
                    style: theme.textTheme.headlineSmall?.copyWith(
                      color: colorScheme.primary,
                    ),
                  ),
                  const SizedBox(height: 18),
                  Text(
                    'Create traveler account',
                    style: theme.textTheme.displayMedium,
                  ),
                  const SizedBox(height: 10),
                  Text(
                    'Start with your basic profile. KYC still unlocks the restricted parts of the app later.',
                    style: theme.textTheme.bodyLarge?.copyWith(
                      color: colorScheme.onSurfaceVariant,
                    ),
                  ),
                  const SizedBox(height: 22),
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: <Widget>[
                          AuthFormWidget(
                            isRegister: true,
                            isLoading: authProvider.isLoading,
                            onSubmit: (AuthFormValues values) =>
                                _submit(context, values),
                          ),
                          if (authProvider.errorMessage != null) ...<Widget>[
                            const SizedBox(height: 14),
                            Text(
                              authProvider.errorMessage!,
                              style: theme.textTheme.bodyMedium?.copyWith(
                                color: colorScheme.error,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 18),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(18),
                    decoration: BoxDecoration(
                      color: colorScheme.surfaceContainerHighest.withValues(
                        alpha: theme.brightness == Brightness.dark
                            ? 0.48
                            : 0.54,
                      ),
                      borderRadius: BorderRadius.circular(24),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: <Widget>[
                        Text(
                          'Current backend target',
                          style: theme.textTheme.titleSmall,
                        ),
                        const SizedBox(height: 8),
                        SelectableText(
                          ApiConstants.baseUrl,
                          style: theme.textTheme.bodyMedium,
                        ),
                        const SizedBox(height: 8),
                        Text(
                          ApiConstants.connectionHint,
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: colorScheme.onSurfaceVariant,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  Center(
                    child: Text(
                      'By joining, you agree to our Terms of Service and Privacy Policy.',
                      textAlign: TextAlign.center,
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: colorScheme.onSurfaceVariant,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
