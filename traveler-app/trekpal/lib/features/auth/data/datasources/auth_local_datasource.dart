import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

import '../models/auth_model.dart';

class AuthLocalDataSource {
  static const String _sessionKey = 'trekpal_auth_session';

  Future<void> saveSession(AuthSessionModel session) async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    await prefs.setString(_sessionKey, jsonEncode(session.toJson()));
  }

  Future<AuthSessionModel?> getSession() async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    final String? rawSession = prefs.getString(_sessionKey);
    if (rawSession == null || rawSession.isEmpty) {
      return null;
    }

    final dynamic decoded = jsonDecode(rawSession);
    if (decoded is! Map<String, dynamic>) {
      return null;
    }

    return AuthSessionModel.fromJson(decoded);
  }

  Future<String?> getToken() async {
    final AuthSessionModel? session = await getSession();
    return session?.token;
  }

  Future<void> clearSession() async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    await prefs.remove(_sessionKey);
  }
}
