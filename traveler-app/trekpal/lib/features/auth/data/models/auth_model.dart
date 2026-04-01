import '../../domain/entities/auth_entities.dart';

DateTime? _readDate(dynamic value) {
  if (value is! String || value.trim().isEmpty) {
    return null;
  }

  return DateTime.tryParse(value);
}

class AuthUserModel extends AuthUser {
  const AuthUserModel({
    required super.id,
    required super.authUid,
    required super.email,
    required super.name,
    required super.role,
    super.phone,
    super.cnic,
    super.cnicVerified,
    super.travelerKycStatus,
    super.dateOfBirth,
    super.city,
    super.residentialAddress,
    super.emergencyContactName,
    super.emergencyContactPhone,
    super.kycSubmittedAt,
    super.kycVerifiedAt,
  });

  factory AuthUserModel.fromEntity(AuthUser user) {
    return AuthUserModel(
      id: user.id,
      authUid: user.authUid,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      cnic: user.cnic,
      cnicVerified: user.cnicVerified,
      travelerKycStatus: user.travelerKycStatus,
      dateOfBirth: user.dateOfBirth,
      city: user.city,
      residentialAddress: user.residentialAddress,
      emergencyContactName: user.emergencyContactName,
      emergencyContactPhone: user.emergencyContactPhone,
      kycSubmittedAt: user.kycSubmittedAt,
      kycVerifiedAt: user.kycVerifiedAt,
    );
  }

  factory AuthUserModel.fromJson(Map<String, dynamic> json) {
    return AuthUserModel(
      id: json['id'] as String? ?? '',
      authUid: json['authUid'] as String? ?? '',
      email: json['email'] as String? ?? '',
      name: (json['name'] as String?)?.trim().isNotEmpty == true
          ? json['name'] as String
          : 'Traveler',
      role: json['role'] as String? ?? 'TRAVELER',
      phone: (json['phone'] as String?)?.trim().isNotEmpty == true
          ? json['phone'] as String
          : null,
      cnic: (json['cnic'] as String?)?.trim().isNotEmpty == true
          ? json['cnic'] as String
          : null,
      cnicVerified: json['cnicVerified'] as bool? ?? false,
      travelerKycStatus:
          json['travelerKycStatus'] as String? ?? 'NOT_SUBMITTED',
      dateOfBirth: _readDate(json['dateOfBirth']),
      city: (json['city'] as String?)?.trim().isNotEmpty == true
          ? json['city'] as String
          : null,
      residentialAddress:
          (json['residentialAddress'] as String?)?.trim().isNotEmpty == true
          ? json['residentialAddress'] as String
          : null,
      emergencyContactName:
          (json['emergencyContactName'] as String?)?.trim().isNotEmpty == true
          ? json['emergencyContactName'] as String
          : null,
      emergencyContactPhone:
          (json['emergencyContactPhone'] as String?)?.trim().isNotEmpty == true
          ? json['emergencyContactPhone'] as String
          : null,
      kycSubmittedAt: _readDate(json['kycSubmittedAt']),
      kycVerifiedAt: _readDate(json['kycVerifiedAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'id': id,
      'authUid': authUid,
      'email': email,
      'name': name,
      'role': role,
      'phone': phone,
      'cnic': cnic,
      'cnicVerified': cnicVerified,
      'travelerKycStatus': travelerKycStatus,
      'dateOfBirth': dateOfBirth?.toIso8601String(),
      'city': city,
      'residentialAddress': residentialAddress,
      'emergencyContactName': emergencyContactName,
      'emergencyContactPhone': emergencyContactPhone,
      'kycSubmittedAt': kycSubmittedAt?.toIso8601String(),
      'kycVerifiedAt': kycVerifiedAt?.toIso8601String(),
    };
  }
}

class AuthSessionModel extends AuthSession {
  const AuthSessionModel({required super.user, required super.token});

  factory AuthSessionModel.fromEntity(AuthSession session) {
    return AuthSessionModel(user: session.user, token: session.token);
  }

  factory AuthSessionModel.fromJson(Map<String, dynamic> json) {
    return AuthSessionModel(
      user: AuthUserModel.fromJson(json['user'] as Map<String, dynamic>),
      token: json['token'] as String? ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'user': AuthUserModel.fromEntity(user).toJson(),
      'token': token,
    };
  }
}
