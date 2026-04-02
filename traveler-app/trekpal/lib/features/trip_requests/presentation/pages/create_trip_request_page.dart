import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../../core/utils/extensions.dart';
import '../../../../core/utils/formatters.dart';
import '../../../../core/utils/validators.dart';
import '../../domain/entities/trip_request_entities.dart';
import '../providers/trip_requests_provider.dart';

class CreateTripRequestPage extends StatefulWidget {
  const CreateTripRequestPage({super.key});

  @override
  State<CreateTripRequestPage> createState() => _CreateTripRequestPageState();
}

class _CreateTripRequestPageState extends State<CreateTripRequestPage> {
  final TextEditingController _destinationController = TextEditingController();
  final TextEditingController _travelersController = TextEditingController(
    text: '2',
  );
  final TextEditingController _budgetController = TextEditingController();
  final TextEditingController _roomCountController = TextEditingController(
    text: '1',
  );
  final TextEditingController _descriptionController = TextEditingController();
  final TextEditingController _specialRequirementsController =
      TextEditingController();

  int _currentStep = 0;
  DateTime? _startDate;
  DateTime? _endDate;
  String _stayType = 'HOTEL';
  String _roomPreference = 'DOUBLE';
  bool _transportRequired = true;
  String _transportType = 'CAR';
  String _mealPlan = 'BREAKFAST_ONLY';

  @override
  void dispose() {
    _destinationController.dispose();
    _travelersController.dispose();
    _budgetController.dispose();
    _roomCountController.dispose();
    _descriptionController.dispose();
    _specialRequirementsController.dispose();
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
      initialDate: _endDate ?? baseDate.add(const Duration(days: 2)),
    );

    if (selected != null) {
      setState(() {
        _endDate = selected;
      });
    }
  }

  void _showValidation(String message) {
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(SnackBar(content: Text(message)));
  }

  bool _validateStep(int step) {
    switch (step) {
      case 0:
        final String? destinationError = AppValidators.requiredText(
          _destinationController.text,
          fieldName: 'Destination',
        );
        if (destinationError != null) {
          _showValidation(destinationError);
          return false;
        }
        final String? destinationLengthError = AppValidators.maxLength(
          _destinationController.text,
          max: 120,
          fieldName: 'Destination',
        );
        if (destinationLengthError != null) {
          _showValidation(destinationLengthError);
          return false;
        }
        if (_startDate == null || _endDate == null) {
          _showValidation('Select both travel dates');
          return false;
        }
        if (_endDate!.isBefore(_startDate!)) {
          _showValidation('End date must be after the start date');
          return false;
        }
        return true;
      case 1:
        final String? travelersError = AppValidators.integerLimit(
          _travelersController.text,
          min: 1,
          max: 100,
          fieldName: 'Travelers',
        );
        if (travelersError != null) {
          _showValidation(travelersError);
          return false;
        }
        final String? budgetError = AppValidators.budget(
          _budgetController.text,
        );
        if (budgetError != null) {
          _showValidation(budgetError);
          return false;
        }
        return true;
      case 2:
        final String? roomCountError = AppValidators.positiveInteger(
          _roomCountController.text,
          fieldName: 'Rooms',
        );
        if (roomCountError != null) {
          _showValidation(roomCountError);
          return false;
        }
        return true;
      case 3:
        final String? descriptionError = AppValidators.maxLength(
          _descriptionController.text,
          max: 1000,
          fieldName: 'Trip notes',
        );
        if (descriptionError != null) {
          _showValidation(descriptionError);
          return false;
        }
        final String? specialRequirementsError = AppValidators.maxLength(
          _specialRequirementsController.text,
          max: 500,
          fieldName: 'Special requirements',
        );
        if (specialRequirementsError != null) {
          _showValidation(specialRequirementsError);
          return false;
        }
        return true;
      default:
        return true;
    }
  }

  TripSpecsEntity _buildTripSpecs() {
    return TripSpecsEntity(
      stayType: _stayType,
      roomCount: int.parse(_roomCountController.text.trim()),
      roomPreference: _roomPreference,
      transportRequired: _transportRequired,
      transportType: _transportRequired ? _transportType : 'ANY',
      mealPlan: _mealPlan,
      specialRequirements: _specialRequirementsController.text.trim(),
    );
  }

  Future<void> _submit() async {
    if (!_validateStep(0) || !_validateStep(1) || !_validateStep(2)) {
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
        tripSpecs: _buildTripSpecs(),
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
            provider.errorMessage ?? 'Unable to publish trip brief',
          ),
        ),
      );
    }
  }

  void _continue() {
    if (_currentStep == 3) {
      _submit();
      return;
    }

    if (!_validateStep(_currentStep)) {
      return;
    }

    setState(() {
      _currentStep += 1;
    });
  }

  void _back() {
    if (_currentStep == 0) {
      Navigator.of(context).pop();
      return;
    }

    setState(() {
      _currentStep -= 1;
    });
  }

  String _prettyLabel(String value) {
    return value
        .split('_')
        .map((String segment) => segment.sentenceCase)
        .join(' ');
  }

  Widget _buildChoiceGroup({
    required String title,
    required String value,
    required List<String> options,
    required ValueChanged<String> onChanged,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        Text(
          title,
          style: Theme.of(
            context,
          ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800),
        ),
        const SizedBox(height: 12),
        Wrap(
          spacing: 10,
          runSpacing: 10,
          children: options
              .map(
                (String option) => ChoiceChip(
                  label: Text(_prettyLabel(option)),
                  selected: value == option,
                  onSelected: (_) => onChanged(option),
                ),
              )
              .toList(),
        ),
      ],
    );
  }

  Widget _buildOverviewItem(String label, String value) {
    final ThemeData theme = Theme.of(context);
    final ColorScheme colorScheme = theme.colorScheme;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: colorScheme.surfaceContainerHighest.withValues(
          alpha: theme.brightness == Brightness.dark ? 0.4 : 0.55,
        ),
        borderRadius: BorderRadius.circular(22),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Text(
            label,
            style: theme.textTheme.labelMedium?.copyWith(
              color: colorScheme.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 6),
          Text(value, style: theme.textTheme.titleSmall),
        ],
      ),
    );
  }

  Widget _buildStepContent() {
    switch (_currentStep) {
      case 0:
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            TextField(
              controller: _destinationController,
              decoration: const InputDecoration(
                labelText: 'Destination',
                hintText: 'Hunza, Skardu, Swat, Murree...',
              ),
            ),
            const SizedBox(height: 18),
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
            const SizedBox(height: 18),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFFEAF3EE),
                borderRadius: BorderRadius.circular(20),
              ),
              child: const Text(
                'Publish the destination and dates first so agencies know exactly which travel window they are pricing against.',
              ),
            ),
          ],
        );
      case 1:
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            TextField(
              controller: _travelersController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                labelText: 'Travelers',
                hintText: 'How many people are going?',
              ),
            ),
            const SizedBox(height: 18),
            TextField(
              controller: _budgetController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                labelText: 'Budget',
                hintText: 'Optional total budget in PKR',
              ),
            ),
            const SizedBox(height: 18),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFFFFF4DF),
                borderRadius: BorderRadius.circular(20),
              ),
              child: const Text(
                'A realistic budget helps agencies decide whether to propose a tight, balanced, or premium trip offer.',
              ),
            ),
          ],
        );
      case 2:
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            _buildChoiceGroup(
              title: 'Stay type',
              value: _stayType,
              options: const <String>['ANY', 'HOTEL', 'RESORT', 'GUEST_HOUSE'],
              onChanged: (String value) {
                setState(() {
                  _stayType = value;
                });
              },
            ),
            const SizedBox(height: 20),
            TextField(
              controller: _roomCountController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                labelText: 'Rooms needed',
                hintText: 'Number of rooms agencies should plan for',
              ),
            ),
            const SizedBox(height: 20),
            _buildChoiceGroup(
              title: 'Room preference',
              value: _roomPreference,
              options: const <String>['ANY', 'SINGLE', 'DOUBLE', 'FAMILY'],
              onChanged: (String value) {
                setState(() {
                  _roomPreference = value;
                });
              },
            ),
            const SizedBox(height: 20),
            SwitchListTile.adaptive(
              value: _transportRequired,
              contentPadding: EdgeInsets.zero,
              title: const Text('Transport required'),
              subtitle: const Text(
                'Turn this off if you only want stay and meal quotes.',
              ),
              onChanged: (bool value) {
                setState(() {
                  _transportRequired = value;
                  if (!value) {
                    _transportType = 'ANY';
                  }
                });
              },
            ),
            const SizedBox(height: 8),
            _buildChoiceGroup(
              title: 'Transport type',
              value: _transportType,
              options: const <String>['ANY', 'CAR', 'SUV', 'VAN', 'BUS'],
              onChanged: (String value) {
                setState(() {
                  _transportType = value;
                });
              },
            ),
            const SizedBox(height: 20),
            _buildChoiceGroup(
              title: 'Meal plan',
              value: _mealPlan,
              options: const <String>[
                'ANY',
                'BREAKFAST_ONLY',
                'HALF_BOARD',
                'FULL_BOARD',
              ],
              onChanged: (String value) {
                setState(() {
                  _mealPlan = value;
                });
              },
            ),
          ],
        );
      default:
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            TextField(
              controller: _descriptionController,
              maxLines: 4,
              decoration: const InputDecoration(
                labelText: 'Trip notes',
                hintText:
                    'Tell agencies what kind of experience you want, your pace, or any expectations.',
              ),
            ),
            const SizedBox(height: 18),
            TextField(
              controller: _specialRequirementsController,
              maxLines: 3,
              decoration: const InputDecoration(
                labelText: 'Special requirements',
                hintText:
                    'Accessibility, kids, elderly travelers, luggage, food restrictions, pickup notes...',
              ),
            ),
            const SizedBox(height: 22),
            Text(
              'Review',
              style: Theme.of(
                context,
              ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800),
            ),
            const SizedBox(height: 14),
            GridView.count(
              shrinkWrap: true,
              crossAxisCount: 2,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              physics: const NeverScrollableScrollPhysics(),
              childAspectRatio: 1.4,
              children: <Widget>[
                _buildOverviewItem(
                  'Destination',
                  _destinationController.text.trim().isEmpty
                      ? 'Not set'
                      : _destinationController.text.trim(),
                ),
                _buildOverviewItem(
                  'Dates',
                  _startDate == null || _endDate == null
                      ? 'Not set'
                      : AppFormatters.dateRange(_startDate!, _endDate!),
                ),
                _buildOverviewItem(
                  'Travelers',
                  _travelersController.text.trim().isEmpty
                      ? 'Not set'
                      : '${_travelersController.text.trim()} travelers',
                ),
                _buildOverviewItem(
                  'Budget',
                  _budgetController.text.trim().isEmpty
                      ? 'Flexible'
                      : AppFormatters.currency(
                          num.tryParse(_budgetController.text.trim()),
                        ),
                ),
                _buildOverviewItem('Stay', _prettyLabel(_stayType)),
                _buildOverviewItem(
                  'Transport',
                  _transportRequired
                      ? _prettyLabel(_transportType)
                      : 'Not needed',
                ),
                _buildOverviewItem('Meals', _prettyLabel(_mealPlan)),
                _buildOverviewItem(
                  'Rooms',
                  '${_roomCountController.text.trim().isEmpty ? '1' : _roomCountController.text.trim()} ${_prettyLabel(_roomPreference)}',
                ),
              ],
            ),
          ],
        );
    }
  }

  @override
  Widget build(BuildContext context) {
    final bool isSubmitting = context
        .watch<TripRequestsProvider>()
        .isSubmitting;
    final ThemeData theme = Theme.of(context);
    final ColorScheme colorScheme = theme.colorScheme;
    const List<String> titles = <String>[
      'Where & when',
      'Group & budget',
      'Stay & services',
      'Notes & review',
    ];
    const List<String> prompts = <String>[
      'Where to?',
      'Who is going?',
      'What should agencies include?',
      'Review your brief',
    ];
    const List<String> descriptions = <String>[
      'Start with the destination and the dates agencies should price against.',
      'Set the size of the group and the budget range you want negotiated.',
      'Define stay, transport, and meals so offers come back structured.',
      'Add notes, then review the brief before it is published to agencies.',
    ];

    return Scaffold(
      appBar: AppBar(),
      body: SafeArea(
        child: Column(
          children: <Widget>[
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 8, 20, 6),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Text(
                    'Step ${_currentStep + 1} of ${titles.length}',
                    style: theme.textTheme.labelMedium?.copyWith(
                      color: colorScheme.primary,
                      letterSpacing: 1.0,
                    ),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    prompts[_currentStep],
                    style: theme.textTheme.displayMedium,
                  ),
                  const SizedBox(height: 10),
                  Text(
                    descriptions[_currentStep],
                    style: theme.textTheme.bodyLarge?.copyWith(
                      color: colorScheme.onSurfaceVariant,
                    ),
                  ),
                  const SizedBox(height: 18),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(999),
                    child: LinearProgressIndicator(
                      value: (_currentStep + 1) / titles.length,
                      minHeight: 6,
                      backgroundColor: colorScheme.surfaceContainerHighest,
                    ),
                  ),
                  const SizedBox(height: 18),
                  Wrap(
                    spacing: 10,
                    runSpacing: 10,
                    children: List<Widget>.generate(titles.length, (int index) {
                      final bool isActive = index == _currentStep;
                      final bool isComplete = index < _currentStep;

                      return Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 14,
                          vertical: 10,
                        ),
                        decoration: BoxDecoration(
                          color: isActive
                              ? colorScheme.primary
                              : isComplete
                              ? colorScheme.tertiaryContainer
                              : colorScheme.surfaceContainerHighest.withValues(
                                  alpha: theme.brightness == Brightness.dark
                                      ? 0.46
                                      : 0.6,
                                ),
                          borderRadius: BorderRadius.circular(999),
                        ),
                        child: Text(
                          titles[index],
                          style: theme.textTheme.labelMedium?.copyWith(
                            color: isActive
                                ? colorScheme.onPrimary
                                : isComplete
                                ? colorScheme.onTertiaryContainer
                                : colorScheme.onSurfaceVariant,
                          ),
                        ),
                      );
                    }),
                  ),
                ],
              ),
            ),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
                child: Center(
                  child: ConstrainedBox(
                    constraints: const BoxConstraints(maxWidth: 720),
                    child: Container(
                      padding: const EdgeInsets.all(22),
                      decoration: BoxDecoration(
                        color: colorScheme.surfaceContainerHighest.withValues(
                          alpha: theme.brightness == Brightness.dark
                              ? 0.42
                              : 0.5,
                        ),
                        borderRadius: BorderRadius.circular(30),
                      ),
                      child: _buildStepContent(),
                    ),
                  ),
                ),
              ),
            ),
            Container(
              padding: const EdgeInsets.fromLTRB(20, 12, 20, 20),
              decoration: BoxDecoration(
                color: colorScheme.surface.withValues(
                  alpha: theme.brightness == Brightness.dark ? 0.95 : 0.98,
                ),
              ),
              child: SafeArea(
                top: false,
                child: Row(
                  children: <Widget>[
                    Expanded(
                      child: OutlinedButton(
                        onPressed: isSubmitting ? null : _back,
                        child: Text(_currentStep == 0 ? 'Cancel' : 'Back'),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: ElevatedButton(
                        onPressed: isSubmitting ? null : _continue,
                        child: Text(
                          isSubmitting
                              ? 'Publishing...'
                              : _currentStep == 3
                              ? 'Publish brief'
                              : 'Continue',
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
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
