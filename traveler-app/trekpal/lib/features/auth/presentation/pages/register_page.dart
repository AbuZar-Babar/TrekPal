import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../../../../core/constants/app_constants.dart';
import '../../../../core/utils/validators.dart';
import '../../domain/entities/auth_entities.dart';
import '../providers/auth_provider.dart';

class RegisterPage extends StatefulWidget {
  const RegisterPage({super.key});

  @override
  State<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends State<RegisterPage> {
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _phoneController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  final TextEditingController _addressController = TextEditingController();

  bool _obscurePassword = true;
  bool _submitted = false;
  DateTime? _dateOfBirth;
  String _gender = 'Male';

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _passwordController.dispose();
    _addressController.dispose();
    super.dispose();
  }

  Future<void> _pickDob() async {
    final DateTime now = DateTime.now();
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: _dateOfBirth ?? DateTime(now.year - 24, now.month, now.day),
      firstDate: DateTime(1940),
      lastDate: now,
      helpText: 'Date of birth',
    );
    if (picked != null) setState(() => _dateOfBirth = picked);
  }

  Future<void> _submit() async {
    setState(() => _submitted = true);
    if (!_formKey.currentState!.validate()) return;
    if (AppValidators.dateOfBirth(_dateOfBirth) != null) return;

    final ScaffoldMessengerState messenger = ScaffoldMessenger.of(context);
    final AuthProvider auth = context.read<AuthProvider>();

    try {
      await auth.registerTraveler(
        input: TravelerRegistrationInput(
          name: _nameController.text.trim(),
          email: _emailController.text.trim(),
          password: _passwordController.text,
          phone: _phoneController.text.trim(),
          dateOfBirth: _dateOfBirth!,
          gender: _gender,
          address: _addressController.text.trim(),
        ),
      );
      if (!context.mounted) return;
      Navigator.of(context).pop();
    } catch (_) {
      if (!context.mounted) return;
      messenger.showSnackBar(
        SnackBar(content: Text(auth.errorMessage ?? 'Registration failed')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final ThemeData theme = Theme.of(context);
    final ColorScheme cs = theme.colorScheme;
    final AuthProvider auth = context.watch<AuthProvider>();

    return Scaffold(
      appBar: AppBar(
        title: Text(
          AppConstants.appName,
          style: theme.textTheme.titleMedium?.copyWith(color: cs.primary),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(24, 8, 24, 48),
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 500),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                // Heading
                Text(
                  'Create your account',
                  style: theme.textTheme.headlineMedium,
                ),
                const SizedBox(height: 8),
                Text(
                  'Fill in your profile details. KYC verification unlocks booking features later.',
                  style: theme.textTheme.bodyLarge?.copyWith(
                    color: cs.onSurfaceVariant,
                  ),
                ),
                const SizedBox(height: 32),

                Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      // ── Section: Personal ─────────────────────────
                      _SectionLabel(label: 'Personal information'),
                      const SizedBox(height: 14),

                      TextFormField(
                        controller: _nameController,
                        textCapitalization: TextCapitalization.words,
                        textInputAction: TextInputAction.next,
                        decoration: const InputDecoration(
                          labelText: 'Full name',
                          hintText: 'As on your ID',
                          prefixIcon: Icon(Icons.person_outline_rounded),
                        ),
                        validator: (String? v) =>
                            AppValidators.requiredText(v, fieldName: 'Name'),
                      ),
                      const SizedBox(height: 14),

                      // Date of birth
                      InkWell(
                        borderRadius: BorderRadius.circular(22),
                        onTap: _pickDob,
                        child: InputDecorator(
                          decoration: const InputDecoration(
                            labelText: 'Date of birth',
                            prefixIcon:
                                Icon(Icons.cake_outlined),
                            suffixIcon:
                                Icon(Icons.calendar_today_outlined, size: 18),
                          ),
                          child: Text(
                            _dateOfBirth == null
                                ? 'Select date'
                                : DateFormat('dd MMM yyyy')
                                    .format(_dateOfBirth!),
                            style: theme.textTheme.bodyLarge?.copyWith(
                              color: _dateOfBirth == null
                                  ? cs.onSurfaceVariant
                                  : cs.onSurface,
                            ),
                          ),
                        ),
                      ),
                      if (_submitted &&
                          AppValidators.dateOfBirth(_dateOfBirth) != null)
                        Padding(
                          padding:
                              const EdgeInsets.only(top: 6, left: 16),
                          child: Text(
                            AppValidators.dateOfBirth(_dateOfBirth)!,
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: cs.error,
                            ),
                          ),
                        ),
                      const SizedBox(height: 14),

                      // Gender
                      Text(
                        'Gender',
                        style: theme.textTheme.labelLarge?.copyWith(
                          color: cs.onSurfaceVariant,
                        ),
                      ),
                      const SizedBox(height: 10),
                      SegmentedButton<String>(
                        showSelectedIcon: false,
                        segments: const <ButtonSegment<String>>[
                          ButtonSegment<String>(
                            value: 'Male',
                            icon: Icon(Icons.man_outlined),
                            label: Text('Male'),
                          ),
                          ButtonSegment<String>(
                            value: 'Female',
                            icon: Icon(Icons.woman_2_outlined),
                            label: Text('Female'),
                          ),
                        ],
                        selected: <String>{_gender},
                        onSelectionChanged: (Set<String> s) =>
                            setState(() => _gender = s.first),
                      ),
                      const SizedBox(height: 28),

                      // ── Section: Contact ──────────────────────────
                      _SectionLabel(label: 'Contact details'),
                      const SizedBox(height: 14),

                      TextFormField(
                        controller: _emailController,
                        keyboardType: TextInputType.emailAddress,
                        textInputAction: TextInputAction.next,
                        decoration: const InputDecoration(
                          labelText: 'Email address',
                          hintText: 'name@example.com',
                          prefixIcon: Icon(Icons.mail_outline_rounded),
                        ),
                        validator: AppValidators.email,
                      ),
                      const SizedBox(height: 14),

                      TextFormField(
                        controller: _phoneController,
                        keyboardType: TextInputType.phone,
                        textInputAction: TextInputAction.next,
                        decoration: const InputDecoration(
                          labelText: 'Phone number',
                          hintText: '+92 300 1234567',
                          prefixIcon: Icon(Icons.phone_outlined),
                        ),
                        validator: AppValidators.phone,
                      ),
                      const SizedBox(height: 14),

                      TextFormField(
                        controller: _addressController,
                        maxLines: 2,
                        textCapitalization: TextCapitalization.sentences,
                        textInputAction: TextInputAction.next,
                        decoration: const InputDecoration(
                          labelText: 'Address',
                          hintText: 'House, street, city',
                          prefixIcon: Icon(Icons.location_on_outlined),
                          alignLabelWithHint: true,
                        ),
                        validator: (String? v) => AppValidators.minLength(
                          v,
                          min: 10,
                          fieldName: 'Address',
                        ),
                      ),
                      const SizedBox(height: 28),

                      // ── Section: Security ─────────────────────────
                      _SectionLabel(label: 'Set your password'),
                      const SizedBox(height: 14),

                      TextFormField(
                        controller: _passwordController,
                        obscureText: _obscurePassword,
                        textInputAction: TextInputAction.done,
                        onFieldSubmitted: (_) =>
                            auth.isLoading ? null : _submit(),
                        decoration: InputDecoration(
                          labelText: 'Password',
                          hintText: 'Minimum 6 characters',
                          prefixIcon:
                              const Icon(Icons.lock_outline_rounded),
                          suffixIcon: IconButton(
                            onPressed: () => setState(() {
                              _obscurePassword = !_obscurePassword;
                            }),
                            icon: Icon(
                              _obscurePassword
                                  ? Icons.visibility_outlined
                                  : Icons.visibility_off_outlined,
                            ),
                          ),
                        ),
                        validator: AppValidators.password,
                      ),
                      const SizedBox(height: 32),

                      // Submit button
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: auth.isLoading ? null : _submit,
                          child: auth.isLoading
                              ? const SizedBox(
                                  width: 22,
                                  height: 22,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2.5,
                                    color: Colors.white,
                                  ),
                                )
                              : const Text('Create account'),
                        ),
                      ),
                      const SizedBox(height: 20),

                      // Terms
                      Center(
                        child: Text(
                          'By creating an account, you agree to our Terms of Service and Privacy Policy.',
                          textAlign: TextAlign.center,
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: cs.onSurfaceVariant,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// ── Section label ─────────────────────────────────────────────────────────────
class _SectionLabel extends StatelessWidget {
  const _SectionLabel({required this.label});
  final String label;

  @override
  Widget build(BuildContext context) {
    final ThemeData theme = Theme.of(context);
    final ColorScheme cs = theme.colorScheme;
    return Row(
      children: <Widget>[
        Container(
          width: 3,
          height: 16,
          decoration: BoxDecoration(
            color: cs.primary,
            borderRadius: BorderRadius.circular(2),
          ),
        ),
        const SizedBox(width: 10),
        Text(
          label.toUpperCase(),
          style: theme.textTheme.labelSmall?.copyWith(
            color: cs.primary,
            letterSpacing: 1.2,
            fontWeight: FontWeight.w800,
          ),
        ),
      ],
    );
  }
}
