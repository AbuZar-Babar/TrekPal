import 'package:flutter/material.dart';

import '../../../../core/utils/validators.dart';

class AuthFormValues {
  const AuthFormValues({
    required this.email,
    required this.password,
    this.name,
    this.phone,
  });

  final String email;
  final String password;
  final String? name;
  final String? phone;
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
  bool _obscurePassword = true;

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    await widget.onSubmit(
      AuthFormValues(
        name: widget.isRegister ? _nameController.text.trim() : null,
        email: _emailController.text.trim(),
        phone: widget.isRegister ? _phoneController.text.trim() : null,
        password: _passwordController.text.trim(),
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
                labelText: 'LEGAL NAME',
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
              labelText: 'EMAIL ADDRESS',
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
                labelText: 'PHONE NUMBER',
                hintText: '+92 300 1234567',
              ),
            ),
            const SizedBox(height: 14),
          ],
          TextFormField(
            controller: _passwordController,
            obscureText: _obscurePassword,
            decoration: InputDecoration(
              labelText: widget.isRegister ? 'SECURE PASSWORD' : 'PASSWORD',
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
                        (widget.isRegister
                            ? 'Proceed to Verification'
                            : 'Sign in'),
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
