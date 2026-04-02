import 'package:flutter/material.dart';

class ComplaintFormPage extends StatefulWidget {
  const ComplaintFormPage({super.key, this.bookingId, required this.subject});

  final String? bookingId;
  final String subject;

  @override
  State<ComplaintFormPage> createState() => _ComplaintFormPageState();
}

class _ComplaintFormPageState extends State<ComplaintFormPage> {
  final TextEditingController _detailsController = TextEditingController();
  String _category = 'Support';

  @override
  void dispose() {
    _detailsController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final ThemeData theme = Theme.of(context);
    final ColorScheme colorScheme = theme.colorScheme;
    const List<String> categories = <String>[
      'Support',
      'Agency issue',
      'Billing',
      'Safety',
    ];

    return Scaffold(
      appBar: AppBar(title: const Text('Report issue')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 8, 20, 32),
        children: <Widget>[
          Text(widget.subject, style: theme.textTheme.displaySmall),
          const SizedBox(height: 10),
          Text(
            'Complaint flow preview. It stores no backend data yet, but the UX is ready.',
            style: theme.textTheme.bodyMedium?.copyWith(
              color: colorScheme.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 20),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Text('Category', style: theme.textTheme.titleMedium),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: categories.map((String category) {
                      return ChoiceChip(
                        label: Text(category),
                        selected: _category == category,
                        onSelected: (_) {
                          setState(() {
                            _category = category;
                          });
                        },
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 18),
                  TextField(
                    controller: _detailsController,
                    maxLines: 5,
                    decoration: const InputDecoration(
                      labelText: 'Details',
                      hintText: 'Describe the issue briefly',
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 18),
          FilledButton.icon(
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Complaint saved as a demo preview'),
                ),
              );
              Navigator.of(context).pop();
            },
            icon: const Icon(Icons.report_problem_outlined),
            label: const Text('Submit complaint'),
          ),
        ],
      ),
    );
  }
}
