import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../../core/utils/extensions.dart';
import '../../../../core/utils/validators.dart';
import '../providers/trip_requests_provider.dart';

class CreateTripRequestPage extends StatefulWidget {
  const CreateTripRequestPage({super.key});

  @override
  State<CreateTripRequestPage> createState() => _CreateTripRequestPageState();
}

class _CreateTripRequestPageState extends State<CreateTripRequestPage> {
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();
  final TextEditingController _destinationController = TextEditingController();
  final TextEditingController _travelersController = TextEditingController(
    text: '1',
  );
  final TextEditingController _budgetController = TextEditingController();
  final TextEditingController _descriptionController = TextEditingController();

  DateTime? _startDate;
  DateTime? _endDate;

  @override
  void dispose() {
    _destinationController.dispose();
    _travelersController.dispose();
    _budgetController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  Future<void> _pickStartDate() async {
    final DateTime now = DateTime.now();
    final DateTime? selected = await showDatePicker(
      context: context,
      firstDate: now,
      lastDate: DateTime(now.year + 3),
      initialDate: _startDate ?? now,
    );

    if (selected != null) {
      setState(() {
        _startDate = selected;
        if (_endDate != null && _endDate!.isBefore(selected)) {
          _endDate = selected.add(const Duration(days: 1));
        }
      });
    }
  }

  Future<void> _pickEndDate() async {
    final DateTime baseDate = _startDate ?? DateTime.now();
    final DateTime? selected = await showDatePicker(
      context: context,
      firstDate: baseDate,
      lastDate: DateTime(baseDate.year + 3),
      initialDate: _endDate ?? baseDate,
    );

    if (selected != null) {
      setState(() {
        _endDate = selected;
      });
    }
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    if (_startDate == null || _endDate == null) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Select both travel dates')));
      return;
    }

    final NavigatorState navigator = Navigator.of(context);
    final ScaffoldMessengerState messenger = ScaffoldMessenger.of(context);
    final TripRequestsProvider provider = context.read<TripRequestsProvider>();

    try {
      await provider.createTripRequest(
        destination: _destinationController.text.trim(),
        startDate: _startDate!,
        endDate: _endDate!,
        travelers: int.parse(_travelersController.text.trim()),
        budget: _budgetController.text.trim().isEmpty
            ? null
            : num.tryParse(_budgetController.text.trim()),
        description: _descriptionController.text.trim(),
      );
      if (!mounted) {
        return;
      }
      navigator.pop(true);
    } catch (_) {
      if (!mounted) {
        return;
      }
      messenger.showSnackBar(
        SnackBar(
          content: Text(
            provider.errorMessage ?? 'Unable to create trip request',
          ),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final bool isSubmitting = context
        .watch<TripRequestsProvider>()
        .isSubmitting;

    return Scaffold(
      appBar: AppBar(title: const Text('Create trip request')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 560),
            child: Form(
              key: _formKey,
              child: Column(
                children: <Widget>[
                  TextFormField(
                    controller: _destinationController,
                    decoration: const InputDecoration(
                      labelText: 'Destination',
                      hintText: 'Hunza, Skardu, Murree...',
                    ),
                    validator: (String? value) => AppValidators.requiredText(
                      value,
                      fieldName: 'Destination',
                    ),
                  ),
                  const SizedBox(height: 14),
                  Row(
                    children: <Widget>[
                      Expanded(
                        child: _DateField(
                          label: 'Start date',
                          value: _startDate?.toDisplayDate(),
                          onTap: _pickStartDate,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: _DateField(
                          label: 'End date',
                          value: _endDate?.toDisplayDate(),
                          onTap: _pickEndDate,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  TextFormField(
                    controller: _travelersController,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(labelText: 'Travelers'),
                    validator: (String? value) => AppValidators.positiveInteger(
                      value,
                      fieldName: 'Travelers',
                    ),
                  ),
                  const SizedBox(height: 14),
                  TextFormField(
                    controller: _budgetController,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(
                      labelText: 'Budget',
                      hintText: 'Optional',
                    ),
                    validator: AppValidators.budget,
                  ),
                  const SizedBox(height: 14),
                  TextFormField(
                    controller: _descriptionController,
                    maxLines: 4,
                    decoration: const InputDecoration(
                      labelText: 'Description',
                      hintText: 'What kind of trip are you planning?',
                    ),
                  ),
                  const SizedBox(height: 22),
                  ElevatedButton(
                    onPressed: isSubmitting ? null : _submit,
                    child: const Text('Publish request'),
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

class _DateField extends StatelessWidget {
  const _DateField({
    required this.label,
    required this.value,
    required this.onTap,
  });

  final String label;
  final String? value;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: InputDecorator(
        decoration: InputDecoration(labelText: label),
        child: Text(value ?? 'Select'),
      ),
    );
  }
}
