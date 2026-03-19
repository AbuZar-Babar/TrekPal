import 'dart:async';

import 'package:flutter/foundation.dart';

import '../../domain/entities/auth_entities.dart';
import '../../domain/repositories/auth_repository.dart';
import '../../domain/usecases/login_usecase.dart';
import '../../domain/usecases/register_usecase.dart';
import '../../domain/usecases/verify_cnic_usecase.dart';

class AuthProvider extends ChangeNotifier {
  AuthProvider({
    required LoginUseCase loginUseCase,
    required RegisterUseCase registerUseCase,
    required VerifyCnicUseCase verifyCnicUseCase,
    required AuthRepository authRepository,
  }) : _loginUseCase = loginUseCase,
       _registerUseCase = registerUseCase,
       _verifyCnicUseCase = verifyCnicUseCase,
       _authRepository = authRepository {
    unawaited(restoreSession());
  }

  final LoginUseCase _loginUseCase;
  final RegisterUseCase _registerUseCase;
  final VerifyCnicUseCase _verifyCnicUseCase;
  final AuthRepository _authRepository;

  AuthSession? _session;
  bool _isLoading = false;
  bool _isInitializing = true;
  String? _errorMessage;

  AuthSession? get session => _session;
  AuthUser? get currentUser => _session?.user;
  bool get isAuthenticated => _session != null;
  bool get isLoading => _isLoading;
  bool get isInitializing => _isInitializing;
  String? get errorMessage => _errorMessage;

  Future<void> restoreSession() async {
    _isInitializing = true;
    notifyListeners();

    try {
      _session = await _authRepository.restoreSession();
      _errorMessage = null;
    } catch (error) {
      _errorMessage = _readableError(error);
    } finally {
      _isInitializing = false;
      notifyListeners();
    }
  }

  Future<void> login({required String email, required String password}) async {
    await _runBusy(() async {
      _session = await _loginUseCase(email: email, password: password);
    });
  }

  Future<void> registerTraveler({
    required String name,
    required String email,
    required String password,
    String? phone,
    String? cnic,
  }) async {
    await _runBusy(() async {
      _session = await _registerUseCase(
        name: name,
        email: email,
        password: password,
        phone: phone,
        cnic: cnic,
      );
    });
  }

  Future<void> verifyCnic({required String cnic, String? cnicImageUrl}) {
    return _runBusy(() {
      return _verifyCnicUseCase(cnic: cnic, cnicImageUrl: cnicImageUrl);
    });
  }

  Future<void> logout() async {
    await _authRepository.logout();
    _session = null;
    _errorMessage = null;
    notifyListeners();
  }

  Future<void> _runBusy(Future<void> Function() action) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      await action();
    } catch (error) {
      _errorMessage = _readableError(error);
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  String _readableError(Object error) {
    final String text = error.toString();
    if (text.startsWith('Exception: ')) {
      return text.substring('Exception: '.length);
    }
    return text;
  }
}
