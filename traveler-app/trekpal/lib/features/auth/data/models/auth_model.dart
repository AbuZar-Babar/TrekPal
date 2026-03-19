import '../../domain/entities/auth_entities.dart';

class AuthUserModel extends AuthUser {
  const AuthUserModel({
    required super.id,
    required super.authUid,
    required super.email,
    required super.name,
    required super.role,
  });

  factory AuthUserModel.fromJson(Map<String, dynamic> json) {
    return AuthUserModel(
      id: json['id'] as String? ?? '',
      authUid: json['authUid'] as String? ?? '',
      email: json['email'] as String? ?? '',
      name: (json['name'] as String?)?.trim().isNotEmpty == true
          ? json['name'] as String
          : 'Traveler',
      role: json['role'] as String? ?? 'TRAVELER',
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'id': id,
      'authUid': authUid,
      'email': email,
      'name': name,
      'role': role,
    };
  }
}

class AuthSessionModel extends AuthSession {
  const AuthSessionModel({required super.user, required super.token});

  factory AuthSessionModel.fromJson(Map<String, dynamic> json) {
    return AuthSessionModel(
      user: AuthUserModel.fromJson(json['user'] as Map<String, dynamic>),
      token: json['token'] as String? ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'user': (user as AuthUserModel).toJson(),
      'token': token,
    };
  }
}
