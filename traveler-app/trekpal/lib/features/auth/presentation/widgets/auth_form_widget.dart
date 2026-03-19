import 'package:flutter/material.dart';

import '../../../../core/utils/validators.dart';

class AuthFormValues {
  const AuthFormValues({
    required this.email,
    required this.password,
    this.name,
    this.phone,
    this.cnic,
  });

  final String email;
  final String password;
  final String? name;
  final String? phone;
  final String? cnic;
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
  final TextEditingController _cnicController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _cnicController.dispose();
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
        cnic: widget.isRegister ? _cnicController.text.trim() : null,
        password: _passwordController.text.trim(),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Form(
      key: _formKey,
      child: Column(
        children: <Widget>[
          if (widget.isRegister) ...<Widget>[
            TextFormField(
              controller: _nameController,
              textCapitalization: TextCapitalization.words,
              decoration: const InputDecoration(labelText: 'Full name'),
              validator: (String? value) =>
                  AppValidators.requiredText(value, fieldName: 'Name'),
            ),
            const SizedBox(height: 14),
          ],
          TextFormField(
            controller: _emailController,
            keyboardType: TextInputType.emailAddress,
            decoration: const InputDecoration(labelText: 'Email'),
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
            ),
            const SizedBox(height: 14),
            TextFormField(
              controller: _cnicController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                labelText: 'CNIC',
                hintText: '3520212345671',
              ),
              validator: AppValidators.cnic,
            ),
            const SizedBox(height: 14),
          ],
          TextFormField(
            controller: _passwordController,
            obscureText: true,
            decoration: const InputDecoration(labelText: 'Password'),
            validator: AppValidators.password,
          ),
          const SizedBox(height: 22),
          ElevatedButton(
            onPressed: widget.isLoading ? null : _submit,
            child: Row(
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
        ],
      ),
    );
  }
}
