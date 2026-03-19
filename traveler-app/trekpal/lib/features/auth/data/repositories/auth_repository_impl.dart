import '../../domain/entities/auth_entities.dart';
import '../../domain/repositories/auth_repository.dart';
import '../datasources/auth_local_datasource.dart';
import '../datasources/auth_remote_datasource.dart';

class AuthRepositoryImpl implements AuthRepository {
  const AuthRepositoryImpl({
    required AuthRemoteDataSource remoteDataSource,
    required AuthLocalDataSource localDataSource,
  }) : _remoteDataSource = remoteDataSource,
       _localDataSource = localDataSource;

  final AuthRemoteDataSource _remoteDataSource;
  final AuthLocalDataSource _localDataSource;

  @override
  Future<AuthSession> login({
    required String email,
    required String password,
  }) async {
    final session = await _remoteDataSource.login(
      email: email,
      password: password,
    );
    await _localDataSource.saveSession(session);
    return session;
  }

  @override
  Future<AuthSession> registerTraveler({
    required String name,
    required String email,
    required String password,
    String? phone,
    String? cnic,
  }) async {
    final session = await _remoteDataSource.registerTraveler(
      name: name,
      email: email,
      password: password,
      phone: phone,
      cnic: cnic,
    );
    await _localDataSource.saveSession(session);
    return session;
  }

  @override
  Future<void> verifyCnic({required String cnic, String? cnicImageUrl}) {
    return _remoteDataSource.verifyCnic(cnic: cnic, cnicImageUrl: cnicImageUrl);
  }

  @override
  Future<AuthSession?> restoreSession() => _localDataSource.getSession();

  @override
  Future<void> logout() => _localDataSource.clearSession();
}
