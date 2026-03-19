// TODO: Implement network info checker
// Check internet connectivity before making API calls

import 'dart:io';

import 'package:flutter/foundation.dart';

class NetworkInfo {
  Future<bool> get isConnected async {
    if (kIsWeb) {
      return true;
    }

    try {
      final List<InternetAddress> result = await InternetAddress.lookup(
        'example.com',
      );
      return result.isNotEmpty && result.first.rawAddress.isNotEmpty;
    } on SocketException {
      return false;
    }
  }
}
