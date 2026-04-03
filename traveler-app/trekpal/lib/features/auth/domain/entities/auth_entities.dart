class AuthUser {
  const AuthUser({
    required this.id,
    required this.authUid,
    required this.email,
    required this.name,
    required this.role,
    this.phone,
    this.gender,
    this.cnic,
    this.cnicVerified = false,
    this.travelerKycStatus = 'NOT_SUBMITTED',
    this.dateOfBirth,
    this.city,
    this.residentialAddress,
    this.emergencyContactName,
    this.emergencyContactPhone,
    this.avatar,
    this.kycSubmittedAt,
    this.kycVerifiedAt,
  });

  final String id;
  final String authUid;
  final String email;
  final String name;
  final String role;
  final String? phone;
  final String? gender;
  final String? cnic;
  final bool cnicVerified;
  final String travelerKycStatus;
  final DateTime? dateOfBirth;
  final String? city;
  final String? residentialAddress;
  final String? emergencyContactName;
  final String? emergencyContactPhone;
  final String? avatar;
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
    String? gender,
    String? cnic,
    bool? cnicVerified,
    String? travelerKycStatus,
    DateTime? dateOfBirth,
    String? city,
    String? residentialAddress,
    String? emergencyContactName,
    String? emergencyContactPhone,
    String? avatar,
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
      gender: gender ?? this.gender,
      cnic: cnic ?? this.cnic,
      cnicVerified: cnicVerified ?? this.cnicVerified,
      travelerKycStatus: travelerKycStatus ?? this.travelerKycStatus,
      dateOfBirth: dateOfBirth ?? this.dateOfBirth,
      city: city ?? this.city,
      residentialAddress: residentialAddress ?? this.residentialAddress,
      emergencyContactName: emergencyContactName ?? this.emergencyContactName,
      emergencyContactPhone:
          emergencyContactPhone ?? this.emergencyContactPhone,
      avatar: avatar ?? this.avatar,
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
    required this.mimeType,
  });

  final String fieldName;
  final String fileName;
  final List<int> bytes;
  final String mimeType;
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

class TravelerRegistrationInput {
  const TravelerRegistrationInput({
    required this.name,
    required this.email,
    required this.password,
    required this.phone,
    required this.dateOfBirth,
    required this.gender,
    required this.address,
  });

  final String name;
  final String email;
  final String password;
  final String phone;
  final DateTime dateOfBirth;
  final String gender;
  final String address;
}

class TravelerProfileUpdate {
  const TravelerProfileUpdate({this.name, this.phone, this.address});

  final String? name;
  final String? phone;
  final String? address;
}

class ProfileImageUpload {
  const ProfileImageUpload({
    required this.fileName,
    required this.bytes,
    required this.mimeType,
  });

  final String fileName;
  final List<int> bytes;
  final String mimeType;
}
