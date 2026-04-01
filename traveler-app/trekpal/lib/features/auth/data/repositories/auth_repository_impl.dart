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
    final AuthSession session = await _remoteDataSource.login(
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
  }) async {
    final AuthSession session = await _remoteDataSource.registerTraveler(
      name: name,
      email: email,
      password: password,
      phone: phone,
    );
    await _localDataSource.saveSession(session);
    return session;
  }

  @override
  Future<AuthUser> fetchProfile() => _remoteDataSource.fetchProfile();

  @override
  Future<void> submitTravelerKyc(TravelerKycSubmission submission) {
    return _remoteDataSource.submitTravelerKyc(submission);
  }

  @override
  Future<AuthSession?> restoreSession() => _localDataSource.getSession();

  @override
  Future<void> saveSession(AuthSession session) {
    return _localDataSource.saveSession(session);
  }

  @override
  Future<void> logout() => _localDataSource.clearSession();
}
