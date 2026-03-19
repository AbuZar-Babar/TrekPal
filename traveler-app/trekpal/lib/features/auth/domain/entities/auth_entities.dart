class AuthUser {
  const AuthUser({
    required this.id,
    required this.authUid,
    required this.email,
    required this.name,
    required this.role,
  });

  final String id;
  final String authUid;
  final String email;
  final String name;
  final String role;
}

class AuthSession {
  const AuthSession({required this.user, required this.token});

  final AuthUser user;
  final String token;
}
