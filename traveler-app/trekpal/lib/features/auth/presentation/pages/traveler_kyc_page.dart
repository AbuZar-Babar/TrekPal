import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../../../../core/utils/validators.dart';
import '../../domain/entities/auth_entities.dart';
import '../providers/auth_provider.dart';

class TravelerKycPage extends StatefulWidget {
  const TravelerKycPage({super.key});

  @override
  State<TravelerKycPage> createState() => _TravelerKycPageState();
}

class _TravelerKycPageState extends State<TravelerKycPage> {
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();
  final TextEditingController _cnicController = TextEditingController();
  final TextEditingController _cityController = TextEditingController();
  final TextEditingController _addressController = TextEditingController();
  final TextEditingController _emergencyNameController =
      TextEditingController();
  final TextEditingController _emergencyPhoneController =
      TextEditingController();
  final ImagePicker _imagePicker = ImagePicker();

  DateTime? _dateOfBirth;
  XFile? _cnicFrontImage;
  XFile? _selfieImage;
  Uint8List? _cnicFrontPreviewBytes;
  Uint8List? _selfiePreviewBytes;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final AuthUser? user = context.read<AuthProvider>().currentUser;
    if (user == null) {
      return;
    }

    if (_cnicController.text.isEmpty && (user.cnic?.isNotEmpty ?? false)) {
      _cnicController.text = user.cnic!;
    }
    if (_cityController.text.isEmpty && (user.city?.isNotEmpty ?? false)) {
      _cityController.text = user.city!;
    }
    if (_addressController.text.isEmpty &&
        (user.residentialAddress?.isNotEmpty ?? false)) {
      _addressController.text = user.residentialAddress!;
    }
    if (_emergencyNameController.text.isEmpty &&
        (user.emergencyContactName?.isNotEmpty ?? false)) {
      _emergencyNameController.text = user.emergencyContactName!;
    }
    if (_emergencyPhoneController.text.isEmpty &&
        (user.emergencyContactPhone?.isNotEmpty ?? false)) {
      _emergencyPhoneController.text = user.emergencyContactPhone!;
    }
    _dateOfBirth ??= user.dateOfBirth;
  }

  @override
  void dispose() {
    _cnicController.dispose();
    _cityController.dispose();
    _addressController.dispose();
    _emergencyNameController.dispose();
    _emergencyPhoneController.dispose();
    super.dispose();
  }

  Future<void> _pickDateOfBirth() async {
    final DateTime now = DateTime.now();
    final DateTime initialDate =
        _dateOfBirth ?? DateTime(now.year - 25, now.month, now.day);
    final DateTime? picked = await showDatePicker(
      context: context,
      firstDate: DateTime(1950),
      lastDate: now,
      initialDate: initialDate.isAfter(now) ? now : initialDate,
    );

    if (picked == null) {
      return;
    }

    setState(() {
      _dateOfBirth = picked;
    });
  }

  Future<ImageSource?> _pickImageSource() {
    return showModalBottomSheet<ImageSource>(
      context: context,
      builder: (BuildContext context) {
        return SafeArea(
          child: Wrap(
            children: <Widget>[
              ListTile(
                leading: const Icon(Icons.photo_library_outlined),
                title: const Text('Choose from gallery'),
                onTap: () => Navigator.of(context).pop(ImageSource.gallery),
              ),
              ListTile(
                leading: const Icon(Icons.photo_camera_outlined),
                title: const Text('Take a photo'),
                onTap: () => Navigator.of(context).pop(ImageSource.camera),
              ),
            ],
          ),
        );
      },
    );
  }

  Future<void> _pickDocument(bool isCnicFront) async {
    final ImageSource? source = await _pickImageSource();
    if (source == null) {
      return;
    }

    final XFile? picked = await _imagePicker.pickImage(
      source: source,
      imageQuality: 85,
      maxWidth: 1800,
    );

    if (picked == null) {
      return;
    }

    final Uint8List bytes = await picked.readAsBytes();
    setState(() {
      if (isCnicFront) {
        _cnicFrontImage = picked;
        _cnicFrontPreviewBytes = bytes;
      } else {
        _selfieImage = picked;
        _selfiePreviewBytes = bytes;
      }
    });
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    if (_dateOfBirth == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Date of birth is required')),
      );
      return;
    }

    if (_cnicFrontImage == null || _cnicFrontPreviewBytes == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Upload the front image of your CNIC')),
      );
      return;
    }

    if (_selfieImage == null || _selfiePreviewBytes == null) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Upload a clear selfie')));
      return;
    }

    final AuthProvider authProvider = context.read<AuthProvider>();
    final ScaffoldMessengerState messenger = ScaffoldMessenger.of(context);

    try {
      await authProvider.submitTravelerKyc(
        TravelerKycSubmission(
          cnic: _cnicController.text.trim(),
          dateOfBirth: _dateOfBirth!,
          city: _cityController.text.trim(),
          residentialAddress: _addressController.text.trim(),
          emergencyContactName: _emergencyNameController.text.trim(),
          emergencyContactPhone: _emergencyPhoneController.text.trim(),
          cnicFrontImage: KycDocument(
            fieldName: 'cnicFrontImage',
            fileName: _cnicFrontImage!.name,
            bytes: _cnicFrontPreviewBytes!,
          ),
          selfieImage: KycDocument(
            fieldName: 'selfieImage',
            fileName: _selfieImage!.name,
            bytes: _selfiePreviewBytes!,
          ),
        ),
      );

      if (!mounted) {
        return;
      }

      messenger.showSnackBar(
        const SnackBar(
          content: Text('Traveler KYC completed. Marketplace unlocked.'),
        ),
      );
      Navigator.of(context).pop(true);
    } catch (_) {
      if (!mounted) {
        return;
      }

      messenger.showSnackBar(
        SnackBar(
          content: Text(
            authProvider.errorMessage ?? 'Unable to submit traveler KYC',
          ),
        ),
      );
    }
  }

  Widget _buildImagePickerCard({
    required String title,
    required String subtitle,
    required Uint8List? previewBytes,
    required VoidCallback onTap,
  }) {
    final ThemeData theme = Theme.of(context);
    final ColorScheme colorScheme = theme.colorScheme;

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: colorScheme.surfaceContainerHighest.withValues(
          alpha: theme.brightness == Brightness.dark ? 0.42 : 0.52,
        ),
        borderRadius: BorderRadius.circular(26),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(title, style: theme.textTheme.titleLarge),
                const SizedBox(height: 8),
                Text(
                  subtitle,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: colorScheme.onSurfaceVariant,
                  ),
                ),
                const SizedBox(height: 16),
                OutlinedButton.icon(
                  onPressed: onTap,
                  icon: Icon(
                    previewBytes == null
                        ? Icons.add_card_outlined
                        : Icons.refresh_rounded,
                  ),
                  label: Text(
                    previewBytes == null ? 'Select document' : 'Replace image',
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 16),
          ClipRRect(
            borderRadius: BorderRadius.circular(20),
            child: Container(
              width: 118,
              height: 132,
              color: colorScheme.surface.withValues(
                alpha: theme.brightness == Brightness.dark ? 0.46 : 0.92,
              ),
              child: previewBytes == null
                  ? Icon(
                      Icons.document_scanner_outlined,
                      size: 38,
                      color: colorScheme.primary,
                    )
                  : Image.memory(previewBytes, fit: BoxFit.cover),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionCard({
    required String eyebrow,
    required String title,
    required Widget child,
  }) {
    final ThemeData theme = Theme.of(context);
    final ColorScheme colorScheme = theme.colorScheme;

    return Container(
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        color: colorScheme.surfaceContainerHighest.withValues(
          alpha: theme.brightness == Brightness.dark ? 0.42 : 0.5,
        ),
        borderRadius: BorderRadius.circular(28),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Text(
            eyebrow.toUpperCase(),
            style: theme.textTheme.labelMedium?.copyWith(
              color: colorScheme.onSurfaceVariant,
              letterSpacing: 1.0,
            ),
          ),
          const SizedBox(height: 6),
          Text(title, style: theme.textTheme.headlineSmall),
          const SizedBox(height: 18),
          child,
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final AuthProvider authProvider = context.watch<AuthProvider>();
    final DateTime? verifiedAt = authProvider.currentUser?.kycVerifiedAt;
    final ThemeData theme = Theme.of(context);
    final ColorScheme colorScheme = theme.colorScheme;

    return Scaffold(
      appBar: AppBar(),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(20, 8, 20, 32),
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 760),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Text(
                      'Security Step 02 of 02',
                      style: theme.textTheme.labelMedium?.copyWith(
                        color: colorScheme.primary,
                        letterSpacing: 1.0,
                      ),
                    ),
                    const SizedBox(height: 10),
                    Text(
                      'Let\'s verify your identity.',
                      style: theme.textTheme.displayMedium,
                    ),
                    const SizedBox(height: 10),
                    Text(
                      'To unlock premium expedition and secure bookings, verify this traveler account once with CNIC details, a selfie, and emergency information.',
                      style: theme.textTheme.bodyLarge?.copyWith(
                        color: colorScheme.onSurfaceVariant,
                      ),
                    ),
                    if (verifiedAt != null) ...<Widget>[
                      const SizedBox(height: 12),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 14,
                          vertical: 10,
                        ),
                        decoration: BoxDecoration(
                          color: colorScheme.tertiaryContainer,
                          borderRadius: BorderRadius.circular(999),
                        ),
                        child: Text(
                          'Verified on ${DateFormat('dd MMM yyyy').format(verifiedAt.toLocal())}',
                          style: theme.textTheme.labelMedium?.copyWith(
                            color: colorScheme.onTertiaryContainer,
                          ),
                        ),
                      ),
                    ],
                    const SizedBox(height: 24),
                    _buildSectionCard(
                      eyebrow: 'Government ID',
                      title: 'Government ID',
                      child: _buildImagePickerCard(
                        title: 'Upload CNIC front image',
                        subtitle:
                            'Submit a clear image of the front side of your CNIC.',
                        previewBytes: _cnicFrontPreviewBytes,
                        onTap: () => _pickDocument(true),
                      ),
                    ),
                    const SizedBox(height: 16),
                    _buildSectionCard(
                      eyebrow: 'Selfie Check',
                      title: 'Selfie check',
                      child: _buildImagePickerCard(
                        title: 'Upload a recent selfie',
                        subtitle:
                            'Use a well-lit image so TrekPal can match it to the document.',
                        previewBytes: _selfiePreviewBytes,
                        onTap: () => _pickDocument(false),
                      ),
                    ),
                    const SizedBox(height: 16),
                    _buildSectionCard(
                      eyebrow: 'Identity Data',
                      title: 'Personal details',
                      child: Column(
                        children: <Widget>[
                          TextFormField(
                            controller: _cnicController,
                            keyboardType: TextInputType.number,
                            decoration: const InputDecoration(
                              labelText: 'CNIC NUMBER',
                              hintText: '3520212345671',
                            ),
                            validator: AppValidators.cnic,
                          ),
                          const SizedBox(height: 14),
                          InkWell(
                            onTap: _pickDateOfBirth,
                            borderRadius: BorderRadius.circular(22),
                            child: InputDecorator(
                              decoration: const InputDecoration(
                                labelText: 'DATE OF BIRTH',
                              ),
                              child: Text(
                                _dateOfBirth == null
                                    ? 'Select date'
                                    : DateFormat(
                                        'dd MMM yyyy',
                                      ).format(_dateOfBirth!.toLocal()),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),
                    _buildSectionCard(
                      eyebrow: 'Home Address',
                      title: 'Home address',
                      child: Column(
                        children: <Widget>[
                          TextFormField(
                            controller: _cityController,
                            decoration: const InputDecoration(
                              labelText: 'CITY',
                            ),
                            validator: (String? value) =>
                                AppValidators.requiredText(
                                  value,
                                  fieldName: 'City',
                                ),
                          ),
                          const SizedBox(height: 14),
                          TextFormField(
                            controller: _addressController,
                            maxLines: 3,
                            decoration: const InputDecoration(
                              labelText: 'RESIDENTIAL ADDRESS',
                            ),
                            validator: (String? value) =>
                                AppValidators.requiredText(
                                  value,
                                  fieldName: 'Residential address',
                                ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),
                    _buildSectionCard(
                      eyebrow: 'Traveler Safety',
                      title: 'Traveler safety information',
                      child: Column(
                        children: <Widget>[
                          TextFormField(
                            controller: _emergencyNameController,
                            decoration: const InputDecoration(
                              labelText: 'EMERGENCY CONTACT NAME',
                            ),
                            validator: (String? value) =>
                                AppValidators.requiredText(
                                  value,
                                  fieldName: 'Emergency contact name',
                                ),
                          ),
                          const SizedBox(height: 14),
                          TextFormField(
                            controller: _emergencyPhoneController,
                            keyboardType: TextInputType.phone,
                            decoration: const InputDecoration(
                              labelText: 'EMERGENCY CONTACT PHONE',
                              hintText: '+92 300 1234567',
                            ),
                            validator: (String? value) =>
                                AppValidators.requiredText(
                                  value,
                                  fieldName: 'Emergency contact phone',
                                ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),
                    Container(
                      padding: const EdgeInsets.all(18),
                      decoration: BoxDecoration(
                        color: colorScheme.secondaryContainer.withValues(
                          alpha: 0.82,
                        ),
                        borderRadius: BorderRadius.circular(24),
                      ),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: <Widget>[
                          Icon(
                            Icons.info_outline,
                            color: colorScheme.onSecondaryContainer,
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              'Your identity submission is stored so TrekPal can protect agencies and travelers from fraud while unlocking verified marketplace access.',
                              style: theme.textTheme.bodyMedium?.copyWith(
                                color: colorScheme.onSecondaryContainer,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 22),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        onPressed: authProvider.isLoading ? null : _submit,
                        icon: const Icon(Icons.verified_user_outlined),
                        label: Text(
                          authProvider.isLoading
                              ? 'Submitting KYC...'
                              : 'Continue to verification',
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
