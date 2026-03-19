import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../../core/utils/validators.dart';
import '../providers/auth_provider.dart';

class CnicVerificationPage extends StatefulWidget {
  const CnicVerificationPage({super.key});

  @override
  State<CnicVerificationPage> createState() => _CnicVerificationPageState();
}

class _CnicVerificationPageState extends State<CnicVerificationPage> {
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();
  final TextEditingController _cnicController = TextEditingController();
  final TextEditingController _imageUrlController = TextEditingController();

  @override
  void dispose() {
    _cnicController.dispose();
    _imageUrlController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    final messenger = ScaffoldMessenger.of(context);

    try {
      await context.read<AuthProvider>().verifyCnic(
        cnic: _cnicController.text.trim(),
        cnicImageUrl: _imageUrlController.text.trim().isEmpty
            ? null
            : _imageUrlController.text.trim(),
      );
      if (!mounted) {
        return;
      }
      messenger.showSnackBar(
        const SnackBar(content: Text('CNIC verification submitted')),
      );
      Navigator.of(context).pop();
    } catch (_) {
      messenger.showSnackBar(
        SnackBar(
          content: Text(
            context.read<AuthProvider>().errorMessage ?? 'Verification failed',
          ),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final bool isLoading = context.watch<AuthProvider>().isLoading;

    return Scaffold(
      appBar: AppBar(title: const Text('Verify CNIC')),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 520),
            child: Form(
              key: _formKey,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: <Widget>[
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
                  TextFormField(
                    controller: _imageUrlController,
                    decoration: const InputDecoration(
                      labelText: 'CNIC image URL',
                      hintText:
                          'Optional if the backend accepts metadata-only review',
                    ),
                  ),
                  const SizedBox(height: 22),
                  ElevatedButton(
                    onPressed: isLoading ? null : _submit,
                    child: const Text('Submit verification'),
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
