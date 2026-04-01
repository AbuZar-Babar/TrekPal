class AuthUser {
  const AuthUser({
    required this.id,
    required this.authUid,
    required this.email,
    required this.name,
    required this.role,
    this.phone,
    this.cnic,
    this.cnicVerified = false,
    this.travelerKycStatus = 'NOT_SUBMITTED',
    this.dateOfBirth,
    this.city,
    this.residentialAddress,
    this.emergencyContactName,
    this.emergencyContactPhone,
    this.kycSubmittedAt,
    this.kycVerifiedAt,
  });

  final String id;
  final String authUid;
  final String email;
  final String name;
  final String role;
  final String? phone;
  final String? cnic;
  final bool cnicVerified;
  final String travelerKycStatus;
  final DateTime? dateOfBirth;
  final String? city;
  final String? residentialAddress;
  final String? emergencyContactName;
  final String? emergencyContactPhone;
  final DateTime? kycSubmittedAt;
  final DateTime? kycVerifiedAt;

  bool get isTravelerKycVerified => travelerKycStatus == 'VERIFIED';

  AuthUser copyWith({
    String? id,
    String? authUid,
    String? email,
    String? name,
    String? role,
    String? phone,
    String? cnic,
    bool? cnicVerified,
    String? travelerKycStatus,
    DateTime? dateOfBirth,
    String? city,
    String? residentialAddress,
    String? emergencyContactName,
    String? emergencyContactPhone,
    DateTime? kycSubmittedAt,
    DateTime? kycVerifiedAt,
  }) {
    return AuthUser(
      id: id ?? this.id,
      authUid: authUid ?? this.authUid,
      email: email ?? this.email,
      name: name ?? this.name,
      role: role ?? this.role,
      phone: phone ?? this.phone,
      cnic: cnic ?? this.cnic,
      cnicVerified: cnicVerified ?? this.cnicVerified,
      travelerKycStatus: travelerKycStatus ?? this.travelerKycStatus,
      dateOfBirth: dateOfBirth ?? this.dateOfBirth,
      city: city ?? this.city,
      residentialAddress: residentialAddress ?? this.residentialAddress,
      emergencyContactName: emergencyContactName ?? this.emergencyContactName,
      emergencyContactPhone:
          emergencyContactPhone ?? this.emergencyContactPhone,
      kycSubmittedAt: kycSubmittedAt ?? this.kycSubmittedAt,
      kycVerifiedAt: kycVerifiedAt ?? this.kycVerifiedAt,
    );
  }
}

class AuthSession {
  const AuthSession({required this.user, required this.token});

  final AuthUser user;
  final String token;

  AuthSession copyWith({AuthUser? user, String? token}) {
    return AuthSession(user: user ?? this.user, token: token ?? this.token);
  }
}

class KycDocument {
  const KycDocument({
    required this.fieldName,
    required this.fileName,
    required this.bytes,
  });

  final String fieldName;
  final String fileName;
  final List<int> bytes;
}

class TravelerKycSubmission {
  const TravelerKycSubmission({
    required this.cnic,
    required this.dateOfBirth,
    required this.city,
    required this.residentialAddress,
    required this.emergencyContactName,
    required this.emergencyContactPhone,
    required this.cnicFrontImage,
    required this.selfieImage,
  });

  final String cnic;
  final DateTime dateOfBirth;
  final String city;
  final String residentialAddress;
  final String emergencyContactName;
  final String emergencyContactPhone;
  final KycDocument cnicFrontImage;
  final KycDocument selfieImage;
}
