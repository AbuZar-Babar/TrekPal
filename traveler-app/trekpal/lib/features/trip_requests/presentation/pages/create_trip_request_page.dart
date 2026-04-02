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
  final TextEditingController _budgetController = TextEditingController();
  final TextEditingController _descriptionController = TextEditingController();
  final TextEditingController _specialRequirementsController =
      TextEditingController();

  int _currentStep = 0;
  int _travelers = 2;
  int _roomCount = 1;
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
    _budgetController.dispose();
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
        if (_travelers < 1 || _travelers > 100) {
          _showValidation('Travelers must be between 1 and 100');
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
        if (_roomCount < 1) {
          _showValidation('Add at least 1 room');
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
      roomCount: _roomCount,
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
        travelers: _travelers,
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
            provider.errorMessage ?? 'Unable to publish trip request',
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
    required List<_VisualOption> options,
    required ValueChanged<String> onChanged,
  }) {
    final ThemeData theme = Theme.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        Text(
          title,
          style: theme.textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w800,
          ),
        ),
        const SizedBox(height: 12),
        Wrap(
          spacing: 10,
          runSpacing: 10,
          children: options.map((_VisualOption option) {
            final bool selected = value == option.value;
            final ColorScheme colorScheme = theme.colorScheme;

            return InkWell(
              borderRadius: BorderRadius.circular(22),
              onTap: () => onChanged(option.value),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 180),
                padding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 14,
                ),
                decoration: BoxDecoration(
                  color: selected
                      ? colorScheme.primary.withValues(alpha: 0.12)
                      : colorScheme.surfaceContainerHighest.withValues(
                          alpha: theme.brightness == Brightness.dark
                              ? 0.34
                              : 0.56,
                        ),
                  borderRadius: BorderRadius.circular(22),
                  border: Border.all(
                    color: selected
                        ? colorScheme.primary
                        : colorScheme.outlineVariant,
                  ),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: <Widget>[
                    Icon(
                      option.icon,
                      size: 18,
                      color: selected
                          ? colorScheme.primary
                          : colorScheme.onSurfaceVariant,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      option.label,
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: selected
                            ? colorScheme.primary
                            : colorScheme.onSurface,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ],
                ),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }

  Widget _buildOverviewItem({
    required IconData icon,
    required String label,
    required String value,
  }) {
    final ThemeData theme = Theme.of(context);
    final ColorScheme colorScheme = theme.colorScheme;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: colorScheme.surfaceContainerHighest.withValues(
          alpha: theme.brightness == Brightness.dark ? 0.36 : 0.56,
        ),
        borderRadius: BorderRadius.circular(22),
      ),
      child: Row(
        children: <Widget>[
          CircleAvatar(
            backgroundColor: colorScheme.primary.withValues(alpha: 0.12),
            foregroundColor: colorScheme.primary,
            child: Icon(icon, size: 18),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(
                  label,
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: colorScheme.onSurfaceVariant,
                  ),
                ),
                const SizedBox(height: 4),
                Text(value, style: theme.textTheme.titleSmall),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStepContent() {
    switch (_currentStep) {
      case 0:
        return Column(
          key: const ValueKey<int>(0),
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            TextField(
              controller: _destinationController,
              decoration: const InputDecoration(
                labelText: 'Destination',
                hintText: 'Hunza, Skardu, Swat, Murree...',
                prefixIcon: Icon(Icons.place_outlined),
              ),
            ),
            const SizedBox(height: 18),
            Row(
              children: <Widget>[
                Expanded(
                  child: _DateField(
                    icon: Icons.calendar_month_outlined,
                    label: 'Start date',
                    value: _startDate?.toDisplayDate(),
                    onTap: _pickStartDate,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _DateField(
                    icon: Icons.event_outlined,
                    label: 'End date',
                    value: _endDate?.toDisplayDate(),
                    onTap: _pickEndDate,
                  ),
                ),
              ],
            ),
          ],
        );
      case 1:
        return Column(
          key: const ValueKey<int>(1),
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            _CounterSelector(
              icon: Icons.people_alt_outlined,
              title: 'People going',
              subtitle: 'Choose the group size',
              value: _travelers,
              onChanged: (int value) {
                setState(() {
                  _travelers = value.clamp(1, 100);
                });
              },
            ),
            const SizedBox(height: 18),
            TextField(
              controller: _budgetController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                labelText: 'Budget',
                hintText: 'Optional total budget in PKR',
                prefixIcon: Icon(Icons.payments_outlined),
              ),
            ),
          ],
        );
      case 2:
        return Column(
          key: const ValueKey<int>(2),
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            _buildChoiceGroup(
              title: 'Stay',
              value: _stayType,
              options: const <_VisualOption>[
                _VisualOption('ANY', 'Any', Icons.grid_view_outlined),
                _VisualOption('HOTEL', 'Hotel', Icons.hotel_outlined),
                _VisualOption('RESORT', 'Resort', Icons.pool_outlined),
                _VisualOption(
                  'GUEST_HOUSE',
                  'Guest house',
                  Icons.house_outlined,
                ),
              ],
              onChanged: (String value) {
                setState(() {
                  _stayType = value;
                });
              },
            ),
            const SizedBox(height: 20),
            _CounterSelector(
              icon: Icons.bed_outlined,
              title: 'Rooms',
              subtitle: 'How many rooms should agencies plan for?',
              value: _roomCount,
              onChanged: (int value) {
                setState(() {
                  _roomCount = value.clamp(1, 20);
                });
              },
            ),
            const SizedBox(height: 20),
            _buildChoiceGroup(
              title: 'Room type',
              value: _roomPreference,
              options: const <_VisualOption>[
                _VisualOption('ANY', 'Any', Icons.grid_view_outlined),
                _VisualOption('SINGLE', 'Single', Icons.person_outline),
                _VisualOption('DOUBLE', 'Double', Icons.people_outline),
                _VisualOption(
                  'FAMILY',
                  'Family',
                  Icons.family_restroom_outlined,
                ),
              ],
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
              title: const Text('Transport needed'),
              subtitle: const Text(
                'Turn off if you only want stay and meal quotes',
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
            if (_transportRequired) ...<Widget>[
              const SizedBox(height: 8),
              _buildChoiceGroup(
                title: 'Vehicle',
                value: _transportType,
                options: const <_VisualOption>[
                  _VisualOption('ANY', 'Any', Icons.alt_route_outlined),
                  _VisualOption(
                    'CAR',
                    'Car',
                    Icons.directions_car_filled_outlined,
                  ),
                  _VisualOption('SUV', 'SUV', Icons.airport_shuttle_outlined),
                  _VisualOption('VAN', 'Van', Icons.airport_shuttle_outlined),
                  _VisualOption(
                    'BUS',
                    'Bus',
                    Icons.directions_bus_filled_outlined,
                  ),
                ],
                onChanged: (String value) {
                  setState(() {
                    _transportType = value;
                  });
                },
              ),
            ],
            const SizedBox(height: 20),
            _buildChoiceGroup(
              title: 'Meals',
              value: _mealPlan,
              options: const <_VisualOption>[
                _VisualOption('ANY', 'Any', Icons.restaurant_outlined),
                _VisualOption(
                  'BREAKFAST_ONLY',
                  'Breakfast',
                  Icons.free_breakfast_outlined,
                ),
                _VisualOption(
                  'HALF_BOARD',
                  'Half board',
                  Icons.lunch_dining_outlined,
                ),
                _VisualOption(
                  'FULL_BOARD',
                  'Full board',
                  Icons.dinner_dining_outlined,
                ),
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
          key: const ValueKey<int>(3),
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            TextField(
              controller: _descriptionController,
              maxLines: 4,
              decoration: const InputDecoration(
                labelText: 'Trip notes',
                hintText: 'Trip style, pace, or expectations',
                prefixIcon: Icon(Icons.notes_outlined),
              ),
            ),
            const SizedBox(height: 18),
            TextField(
              controller: _specialRequirementsController,
              maxLines: 3,
              decoration: const InputDecoration(
                labelText: 'Special requirements',
                hintText:
                    'Kids, elderly travelers, luggage, food restrictions...',
                prefixIcon: Icon(Icons.info_outline),
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
            Wrap(
              spacing: 12,
              runSpacing: 12,
              children: <Widget>[
                SizedBox(
                  width: double.infinity,
                  child: _buildOverviewItem(
                    icon: Icons.place_outlined,
                    label: 'Destination',
                    value: _destinationController.text.trim().isEmpty
                        ? 'Not set'
                        : _destinationController.text.trim(),
                  ),
                ),
                SizedBox(
                  width: double.infinity,
                  child: _buildOverviewItem(
                    icon: Icons.calendar_today_outlined,
                    label: 'Dates',
                    value: _startDate == null || _endDate == null
                        ? 'Not set'
                        : AppFormatters.dateRange(_startDate!, _endDate!),
                  ),
                ),
                SizedBox(
                  width: double.infinity,
                  child: _buildOverviewItem(
                    icon: Icons.people_alt_outlined,
                    label: 'People',
                    value: '$_travelers traveler${_travelers == 1 ? '' : 's'}',
                  ),
                ),
                SizedBox(
                  width: double.infinity,
                  child: _buildOverviewItem(
                    icon: Icons.payments_outlined,
                    label: 'Budget',
                    value: _budgetController.text.trim().isEmpty
                        ? 'Flexible'
                        : AppFormatters.currency(
                            num.tryParse(_budgetController.text.trim()),
                          ),
                  ),
                ),
                SizedBox(
                  width: double.infinity,
                  child: _buildOverviewItem(
                    icon: Icons.hotel_outlined,
                    label: 'Stay',
                    value:
                        '${_prettyLabel(_stayType)} / $_roomCount ${_prettyLabel(_roomPreference)}',
                  ),
                ),
                SizedBox(
                  width: double.infinity,
                  child: _buildOverviewItem(
                    icon: Icons.directions_car_filled_outlined,
                    label: 'Transport',
                    value: _transportRequired
                        ? _prettyLabel(_transportType)
                        : 'Not needed',
                  ),
                ),
                SizedBox(
                  width: double.infinity,
                  child: _buildOverviewItem(
                    icon: Icons.restaurant_outlined,
                    label: 'Meals',
                    value: _prettyLabel(_mealPlan),
                  ),
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
      'Where',
      'People',
      'Services',
      'Review',
    ];
    const List<String> prompts = <String>[
      'Where are you going?',
      'Who is going?',
      'What should be included?',
      'Review your request',
    ];
    const List<String> descriptions = <String>[
      'Choose the destination and travel dates.',
      'Set the people count and an optional budget.',
      'Pick stay, rooms, transport, and meal plan.',
      'Check the request before agencies see it.',
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
                  const SizedBox(height: 8),
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
                      child: AnimatedSwitcher(
                        duration: const Duration(milliseconds: 220),
                        switchInCurve: Curves.easeOut,
                        switchOutCurve: Curves.easeIn,
                        transitionBuilder:
                            (Widget child, Animation<double> animation) {
                              return FadeTransition(
                                opacity: animation,
                                child: SlideTransition(
                                  position: Tween<Offset>(
                                    begin: const Offset(0.08, 0),
                                    end: Offset.zero,
                                  ).animate(animation),
                                  child: child,
                                ),
                              );
                            },
                        child: _buildStepContent(),
                      ),
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
                              ? 'Publish request'
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
    required this.icon,
    required this.label,
    required this.value,
    required this.onTap,
  });

  final IconData icon;
  final String label;
  final String? value;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: InputDecorator(
        decoration: InputDecoration(labelText: label, prefixIcon: Icon(icon)),
        child: Text(value ?? 'Select'),
      ),
    );
  }
}

class _CounterSelector extends StatelessWidget {
  const _CounterSelector({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.value,
    required this.onChanged,
  });

  final IconData icon;
  final String title;
  final String subtitle;
  final int value;
  final ValueChanged<int> onChanged;

  @override
  Widget build(BuildContext context) {
    final ThemeData theme = Theme.of(context);
    final ColorScheme colorScheme = theme.colorScheme;

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: colorScheme.surfaceContainerHighest.withValues(
          alpha: theme.brightness == Brightness.dark ? 0.32 : 0.58,
        ),
        borderRadius: BorderRadius.circular(24),
      ),
      child: Row(
        children: <Widget>[
          CircleAvatar(
            backgroundColor: colorScheme.primary.withValues(alpha: 0.12),
            foregroundColor: colorScheme.primary,
            child: Icon(icon),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(title, style: theme.textTheme.titleMedium),
                const SizedBox(height: 4),
                Text(
                  subtitle,
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: colorScheme.onSurfaceVariant,
                  ),
                ),
              ],
            ),
          ),
          IconButton.filledTonal(
            onPressed: value > 1 ? () => onChanged(value - 1) : null,
            icon: const Icon(Icons.remove_rounded),
          ),
          SizedBox(
            width: 44,
            child: Center(
              child: Text('$value', style: theme.textTheme.titleLarge),
            ),
          ),
          IconButton.filled(
            onPressed: () => onChanged(value + 1),
            icon: const Icon(Icons.add_rounded),
          ),
        ],
      ),
    );
  }
}

class _VisualOption {
  const _VisualOption(this.value, this.label, this.icon);

  final String value;
  final String label;
  final IconData icon;
}
