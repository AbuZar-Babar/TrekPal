import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../../core/utils/validators.dart';

class AuthFormValues {
  const AuthFormValues({
    required this.email,
    required this.password,
    this.name,
    this.phone,
    this.dateOfBirth,
    this.gender,
    this.address,
  });

  final String email;
  final String password;
  final String? name;
  final String? phone;
  final DateTime? dateOfBirth;
  final String? gender;
  final String? address;
}

class AuthFormWidget extends StatefulWidget {
  const AuthFormWidget({
    super.key,
    required this.isRegister,
    required this.isLoading,
    required this.onSubmit,
    this.submitLabel,
  });

  final bool isRegister;
  final bool isLoading;
  final Future<void> Function(AuthFormValues values) onSubmit;
  final String? submitLabel;

  @override
  State<AuthFormWidget> createState() => _AuthFormWidgetState();
}

class _AuthFormWidgetState extends State<AuthFormWidget> {
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _phoneController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  final TextEditingController _addressController = TextEditingController();
  bool _obscurePassword = true;
  bool _submitted = false;
  DateTime? _dateOfBirth;
  String _selectedGender = 'Male';

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _passwordController.dispose();
    _addressController.dispose();
    super.dispose();
  }

  Future<void> _pickDateOfBirth() async {
    final DateTime now = DateTime.now();
    final DateTime initialDate =
        _dateOfBirth ?? DateTime(now.year - 24, now.month, now.day);
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: initialDate,
      firstDate: DateTime(1940),
      lastDate: now,
      helpText: 'Select date of birth',
    );

    if (picked == null) {
      return;
    }

    setState(() {
      _dateOfBirth = picked;
    });
  }

  Future<void> _submit() async {
    setState(() {
      _submitted = true;
    });

    if (!_formKey.currentState!.validate()) {
      return;
    }

    if (widget.isRegister && AppValidators.dateOfBirth(_dateOfBirth) != null) {
      return;
    }

    await widget.onSubmit(
      AuthFormValues(
        name: widget.isRegister ? _nameController.text.trim() : null,
        email: _emailController.text.trim(),
        phone: widget.isRegister ? _phoneController.text.trim() : null,
        password: _passwordController.text.trim(),
        dateOfBirth: widget.isRegister ? _dateOfBirth : null,
        gender: widget.isRegister ? _selectedGender : null,
        address: widget.isRegister ? _addressController.text.trim() : null,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final ThemeData theme = Theme.of(context);
    final ColorScheme colorScheme = theme.colorScheme;

    return Form(
      key: _formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          if (widget.isRegister) ...<Widget>[
            TextFormField(
              controller: _nameController,
              textCapitalization: TextCapitalization.words,
              decoration: const InputDecoration(
                labelText: 'Full name',
                hintText: 'Enter your full name',
              ),
              validator: (String? value) =>
                  AppValidators.requiredText(value, fieldName: 'Name'),
            ),
            const SizedBox(height: 14),
          ],
          TextFormField(
            controller: _emailController,
            keyboardType: TextInputType.emailAddress,
            decoration: const InputDecoration(
              labelText: 'Email address',
              hintText: 'name@example.com',
            ),
            validator: AppValidators.email,
          ),
          const SizedBox(height: 14),
          if (widget.isRegister) ...<Widget>[
            TextFormField(
              controller: _phoneController,
              keyboardType: TextInputType.phone,
              decoration: const InputDecoration(
                labelText: 'Phone number',
                hintText: '+92 300 1234567',
              ),
              validator: AppValidators.phone,
            ),
            const SizedBox(height: 14),
            InkWell(
              borderRadius: BorderRadius.circular(16),
              onTap: _pickDateOfBirth,
              child: InputDecorator(
                decoration: const InputDecoration(
                  labelText: 'Date of birth',
                  suffixIcon: Icon(Icons.calendar_today_outlined),
                ),
                child: Text(
                  _dateOfBirth == null
                      ? 'Select your date of birth'
                      : DateFormat('dd MMM yyyy').format(_dateOfBirth!),
                  style: theme.textTheme.bodyLarge?.copyWith(
                    color: _dateOfBirth == null
                        ? colorScheme.onSurfaceVariant
                        : colorScheme.onSurface,
                  ),
                ),
              ),
            ),
            Builder(
              builder: (BuildContext context) {
                final String? dobError = _submitted
                    ? AppValidators.dateOfBirth(_dateOfBirth)
                    : null;
                if (dobError == null) {
                  return const SizedBox.shrink();
                }

                return Padding(
                  padding: const EdgeInsets.only(top: 6, left: 12),
                  child: Text(
                    dobError,
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: colorScheme.error,
                    ),
                  ),
                );
              },
            ),
            const SizedBox(height: 14),
            Text(
              'Gender',
              style: theme.textTheme.labelLarge?.copyWith(
                color: colorScheme.onSurfaceVariant,
              ),
            ),
            const SizedBox(height: 8),
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
              selected: <String>{_selectedGender},
              onSelectionChanged: (Set<String> selection) {
                setState(() {
                  _selectedGender = selection.first;
                });
              },
            ),
            const SizedBox(height: 14),
            TextFormField(
              controller: _addressController,
              maxLines: 2,
              textCapitalization: TextCapitalization.sentences,
              decoration: const InputDecoration(
                labelText: 'Address',
                hintText: 'House, street, city',
              ),
              validator: (String? value) =>
                  AppValidators.minLength(value, min: 10, fieldName: 'Address'),
            ),
            const SizedBox(height: 14),
          ],
          TextFormField(
            controller: _passwordController,
            obscureText: _obscurePassword,
            decoration: InputDecoration(
              labelText: widget.isRegister ? 'Password' : 'Password',
              suffixIcon: IconButton(
                onPressed: () {
                  setState(() {
                    _obscurePassword = !_obscurePassword;
                  });
                },
                icon: Icon(
                  _obscurePassword
                      ? Icons.visibility_outlined
                      : Icons.visibility_off_outlined,
                ),
              ),
            ),
            validator: AppValidators.password,
          ),
          const SizedBox(height: 22),
          if (!widget.isRegister)
            Padding(
              padding: const EdgeInsets.only(bottom: 18),
              child: Row(
                children: <Widget>[
                  Icon(
                    Icons.check_box_outline_blank_rounded,
                    size: 18,
                    color: colorScheme.onSurfaceVariant,
                  ),
                  const SizedBox(width: 10),
                  Text(
                    'Remember this session',
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: colorScheme.onSurfaceVariant,
                    ),
                  ),
                  const Spacer(),
                  Text(
                    'Forgot?',
                    style: theme.textTheme.labelMedium?.copyWith(
                      color: colorScheme.primary,
                    ),
                  ),
                ],
              ),
            ),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: widget.isLoading ? null : _submit,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                mainAxisSize: MainAxisSize.min,
                children: <Widget>[
                  if (widget.isLoading) ...<Widget>[
                    const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(
                        strokeWidth: 2.2,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(width: 12),
                  ],
                  Text(
                    widget.submitLabel ??
                        (widget.isRegister ? 'Create account' : 'Sign in'),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
