import { PrismaClient } from '@prisma/client';

import {
  APPROVAL_STATUS,
  BID_AWAITING_ACTION,
  BID_STATUS,
  BOOKING_STATUS,
  ROLES,
  TRAVELER_GENDERS,
  TRAVELER_KYC_STATUS,
} from '../src/config/constants';
import { getSupabaseAdminClient } from '../src/config/supabase';

const prisma = new PrismaClient();

const ADMIN_EMAIL = process.env.FRONTEND_ADMIN_EMAIL || 'admin@trekpal.com';
const ADMIN_NAME = process.env.FRONTEND_ADMIN_NAME || 'Admin User';
const ADMIN_PASSWORD = process.env.FRONTEND_ADMIN_PASSWORD || 'password123';
const TRAVELER_PASSWORD = process.env.SEED_TRAVELER_PASSWORD || 'Traveler123!';
const AGENCY_PASSWORD = process.env.SEED_AGENCY_PASSWORD || 'Agency123!';

type AuthUser = {
  id: string;
  email?: string;
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
};

const travelerSeed = [
  {
    email: 'ali.raza@trekpal.demo',
    name: 'Ali Raza',
    phone: '+923001110001',
    gender: TRAVELER_GENDERS.MALE,
    dateOfBirth: new Date('1998-06-14'),
    residentialAddress: 'House 24, Street 8, F-10, Islamabad',
    city: 'Islamabad',
    cnic: '4210111111111',
    travelerKycStatus: TRAVELER_KYC_STATUS.VERIFIED,
    cnicVerified: true,
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    cnicFrontImageUrl:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80',
    selfieImageUrl:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1200&q=80',
    kycSubmittedAt: new Date('2026-03-01T09:00:00Z'),
    kycVerifiedAt: new Date('2026-03-03T14:00:00Z'),
    emergencyContactName: 'Raza Family',
    emergencyContactPhone: '+923331110001',
  },
  {
    email: 'sara.khan@trekpal.demo',
    name: 'Sara Khan',
    phone: '+923001110002',
    gender: TRAVELER_GENDERS.FEMALE,
    dateOfBirth: new Date('1999-11-03'),
    residentialAddress: 'Apartment 11, Gulberg III, Lahore',
    city: 'Lahore',
    cnic: '4210111111112',
    travelerKycStatus: TRAVELER_KYC_STATUS.VERIFIED,
    cnicVerified: true,
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    cnicFrontImageUrl:
      'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=1200&q=80',
    selfieImageUrl:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1200&q=80',
    kycSubmittedAt: new Date('2026-03-02T09:00:00Z'),
    kycVerifiedAt: new Date('2026-03-04T12:00:00Z'),
    emergencyContactName: 'Nadia Khan',
    emergencyContactPhone: '+923331110002',
  },
  {
    email: 'hamza.iqbal@trekpal.demo',
    name: 'Hamza Iqbal',
    phone: '+923001110003',
    gender: TRAVELER_GENDERS.MALE,
    dateOfBirth: new Date('2001-01-26'),
    residentialAddress: 'Block 5, Clifton, Karachi',
    city: 'Karachi',
    cnic: '4210111111113',
    travelerKycStatus: TRAVELER_KYC_STATUS.PENDING,
    cnicVerified: false,
    avatar:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
    cnicFrontImageUrl:
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=1200&q=80',
    selfieImageUrl:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1200&q=80',
    kycSubmittedAt: new Date('2026-03-25T10:30:00Z'),
    kycVerifiedAt: null,
    emergencyContactName: 'Iqbal House',
    emergencyContactPhone: '+923331110003',
  },
  {
    email: 'ayesha.noor@trekpal.demo',
    name: 'Ayesha Noor',
    phone: '+923001110004',
    gender: TRAVELER_GENDERS.FEMALE,
    dateOfBirth: new Date('2000-09-17'),
    residentialAddress: 'Street 14, Saddar, Peshawar',
    city: 'Peshawar',
    cnic: null,
    travelerKycStatus: TRAVELER_KYC_STATUS.NOT_SUBMITTED,
    cnicVerified: false,
    avatar:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80',
    cnicFrontImageUrl: null,
    selfieImageUrl: null,
    kycSubmittedAt: null,
    kycVerifiedAt: null,
    emergencyContactName: 'Noor Family',
    emergencyContactPhone: '+923331110004',
  },
  {
    email: 'bilal.ahmed@trekpal.demo',
    name: 'Bilal Ahmed',
    phone: '+923001110005',
    gender: TRAVELER_GENDERS.MALE,
    dateOfBirth: new Date('1996-04-09'),
    residentialAddress: 'Model Town C Block, Multan',
    city: 'Multan',
    cnic: '4210111111115',
    travelerKycStatus: TRAVELER_KYC_STATUS.VERIFIED,
    cnicVerified: true,
    avatar:
      'https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=400&q=80',
    cnicFrontImageUrl:
      'https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=1200&q=80',
    selfieImageUrl:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1200&q=80',
    kycSubmittedAt: new Date('2026-02-10T11:00:00Z'),
    kycVerifiedAt: new Date('2026-02-12T15:30:00Z'),
    emergencyContactName: 'Ahmed Family',
    emergencyContactPhone: '+923331110005',
  },
  {
    email: 'zainab.shah@trekpal.demo',
    name: 'Zainab Shah',
    phone: '+923001110006',
    gender: TRAVELER_GENDERS.FEMALE,
    dateOfBirth: new Date('1997-12-21'),
    residentialAddress: 'Satellite Town, Rawalpindi',
    city: 'Rawalpindi',
    cnic: '4210111111116',
    travelerKycStatus: TRAVELER_KYC_STATUS.VERIFIED,
    cnicVerified: true,
    avatar:
      'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=400&q=80',
    cnicFrontImageUrl:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80',
    selfieImageUrl:
      'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=1200&q=80',
    kycSubmittedAt: new Date('2026-02-18T09:00:00Z'),
    kycVerifiedAt: new Date('2026-02-20T09:00:00Z'),
    emergencyContactName: 'Shah Family',
    emergencyContactPhone: '+923331110006',
  },
  {
    email: 'umair.kayani@trekpal.demo',
    name: 'Umair Kayani',
    phone: '+923001110007',
    gender: TRAVELER_GENDERS.MALE,
    dateOfBirth: new Date('1995-08-12'),
    residentialAddress: 'Askari 10, Lahore',
    city: 'Lahore',
    cnic: '4210111111117',
    travelerKycStatus: TRAVELER_KYC_STATUS.VERIFIED,
    cnicVerified: true,
    avatar:
      'https://images.unsplash.com/photo-1504257432389-52343af06ae3?auto=format&fit=crop&w=400&q=80',
    cnicFrontImageUrl:
      'https://images.unsplash.com/photo-1504257432389-52343af06ae3?auto=format&fit=crop&w=1200&q=80',
    selfieImageUrl:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1200&q=80',
    kycSubmittedAt: new Date('2026-01-18T09:00:00Z'),
    kycVerifiedAt: new Date('2026-01-20T11:00:00Z'),
    emergencyContactName: 'Kayani House',
    emergencyContactPhone: '+923331110007',
  },
  {
    email: 'hina.yousaf@trekpal.demo',
    name: 'Hina Yousaf',
    phone: '+923001110008',
    gender: TRAVELER_GENDERS.FEMALE,
    dateOfBirth: new Date('2002-03-05'),
    residentialAddress: 'University Town, Peshawar',
    city: 'Peshawar',
    cnic: '4210111111118',
    travelerKycStatus: TRAVELER_KYC_STATUS.VERIFIED,
    cnicVerified: true,
    avatar:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    cnicFrontImageUrl:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1200&q=80',
    selfieImageUrl:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1200&q=80',
    kycSubmittedAt: new Date('2026-03-11T09:00:00Z'),
    kycVerifiedAt: new Date('2026-03-12T14:00:00Z'),
    emergencyContactName: 'Yousaf Family',
    emergencyContactPhone: '+923331110008',
  },
  {
    email: 'daniyal.malik@trekpal.demo',
    name: 'Daniyal Malik',
    phone: '+923001110009',
    gender: TRAVELER_GENDERS.MALE,
    dateOfBirth: new Date('2003-05-30'),
    residentialAddress: 'Cantt Area, Sialkot',
    city: 'Sialkot',
    cnic: null,
    travelerKycStatus: TRAVELER_KYC_STATUS.NOT_SUBMITTED,
    cnicVerified: false,
    avatar:
      'https://images.unsplash.com/photo-1502767089025-6572583495b0?auto=format&fit=crop&w=400&q=80',
    cnicFrontImageUrl: null,
    selfieImageUrl: null,
    kycSubmittedAt: null,
    kycVerifiedAt: null,
    emergencyContactName: 'Malik Family',
    emergencyContactPhone: '+923331110009',
  },
] as const;

const agencySeed = [
  {
    email: 'northpeak@trekpal.demo',
    name: 'North Peak Travels',
    phone: '+923001220001',
    address: 'Office 12, Blue Area, Islamabad',
    officeCity: 'Islamabad',
    jurisdiction: 'ICT',
    legalEntityType: 'COMPANY',
    license: 'TP-NORTH-001',
    ntn: '1000000001',
    ownerName: 'Usman Tariq',
    cnic: '3520211111111',
    status: APPROVAL_STATUS.APPROVED,
    fieldOfOperations: ['Packages', 'Transport', 'Hotels'],
    capitalAvailablePkr: 3500000,
    secpRegistrationNumber: 'SECP-ICT-1001',
    partnershipRegistrationNumber: null,
  },
  {
    email: 'coastalroutes@trekpal.demo',
    name: 'Coastal Routes',
    phone: '+923001220002',
    address: 'Shahrah-e-Faisal, Karachi',
    officeCity: 'Karachi',
    jurisdiction: 'Sindh',
    legalEntityType: 'SOLE_PROPRIETOR',
    license: 'TP-COAST-002',
    ntn: '1000000002',
    ownerName: 'Maham Siddiqui',
    cnic: '3520211111112',
    status: APPROVAL_STATUS.APPROVED,
    fieldOfOperations: ['Packages', 'Beach Tours'],
    capitalAvailablePkr: 1800000,
    secpRegistrationNumber: null,
    partnershipRegistrationNumber: null,
  },
  {
    email: 'cityescape@trekpal.demo',
    name: 'City Escape Tours',
    phone: '+923001220003',
    address: 'MM Alam Road, Lahore',
    officeCity: 'Lahore',
    jurisdiction: 'Punjab',
    legalEntityType: 'PARTNERSHIP',
    license: 'TP-CITY-003',
    ntn: '1000000003',
    ownerName: 'Hassan Zia',
    cnic: '3520211111113',
    status: APPROVAL_STATUS.APPROVED,
    fieldOfOperations: ['Packages', 'Corporate Trips'],
    capitalAvailablePkr: 2200000,
    secpRegistrationNumber: null,
    partnershipRegistrationNumber: 'PR-PB-3001',
  },
  {
    email: 'desertstar@trekpal.demo',
    name: 'Desert Star Holidays',
    phone: '+923001220004',
    address: 'Jinnah Road, Quetta',
    officeCity: 'Quetta',
    jurisdiction: 'Balochistan',
    legalEntityType: 'SOLE_PROPRIETOR',
    license: 'TP-DESERT-004',
    ntn: '1000000004',
    ownerName: 'Saad Baloch',
    cnic: '3520211111114',
    status: APPROVAL_STATUS.PENDING,
    fieldOfOperations: ['Adventure', 'Safari'],
    capitalAvailablePkr: 900000,
    secpRegistrationNumber: null,
    partnershipRegistrationNumber: null,
  },
] as const;

const sharedDocUrls = {
  cnicImageUrl:
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
  ownerPhotoUrl:
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1200&q=80',
  licenseCertificateUrl:
    'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=80',
  ntnCertificateUrl:
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80',
  businessRegistrationProofUrl:
    'https://images.unsplash.com/photo-1521790797524-b2497295b8a0?auto=format&fit=crop&w=1200&q=80',
  officeProofUrl:
    'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80',
  bankCertificateUrl:
    'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80',
  additionalSupportingDocumentUrl:
    'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80',
};

const hotelSeed = [
  {
    agencyEmail: 'northpeak@trekpal.demo',
    name: 'Hunza View Lodge',
    description: 'Mountain lodge with valley views and warm local hospitality.',
    address: 'Karimabad Bazar Road',
    city: 'Hunza',
    country: 'Pakistan',
    latitude: 36.3167,
    longitude: 74.65,
    rating: 4.6,
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1200&q=80',
    ],
    amenities: ['Breakfast', 'WiFi', 'Mountain View', 'Heating', 'Parking'],
  },
  {
    agencyEmail: 'coastalroutes@trekpal.demo',
    name: 'Ormara Sands Resort',
    description: 'Relaxed beachfront stay for weekend coastal escapes.',
    address: 'Marine Drive',
    city: 'Ormara',
    country: 'Pakistan',
    latitude: 25.2088,
    longitude: 64.6355,
    rating: 4.3,
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
    ],
    amenities: ['Sea View', 'Breakfast', 'WiFi', 'Parking'],
  },
  {
    agencyEmail: 'cityescape@trekpal.demo',
    name: 'Swat River Retreat',
    description: 'Boutique stay near the river with guided excursions.',
    address: 'Mingora Bypass',
    city: 'Swat',
    country: 'Pakistan',
    latitude: 35.2227,
    longitude: 72.4258,
    rating: 4.4,
    images: [
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
    ],
    amenities: ['Guided Tours', 'WiFi', 'Bonfire', 'Parking'],
  },
  {
    agencyEmail: 'northpeak@trekpal.demo',
    name: 'Skardu Alpine Stay',
    description: 'Modern alpine hotel with wide mountain views and warm rooms.',
    address: 'Airport Road',
    city: 'Skardu',
    country: 'Pakistan',
    latitude: 35.2971,
    longitude: 75.6337,
    rating: 4.7,
    images: [
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1522798514-97ceb8c4f1c8?auto=format&fit=crop&w=1200&q=80',
    ],
    amenities: ['Breakfast', 'WiFi', 'Heating', 'Airport Pickup', 'Parking'],
  },
  {
    agencyEmail: 'coastalroutes@trekpal.demo',
    name: 'Pasni Cliff Hotel',
    description: 'Clifftop stay with sea breeze and sunset deck.',
    address: 'Cliff View Road',
    city: 'Pasni',
    country: 'Pakistan',
    latitude: 25.2631,
    longitude: 63.4699,
    rating: 4.2,
    images: [
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
    ],
    amenities: ['Sea View', 'Dinner', 'WiFi', 'Parking'],
  },
  {
    agencyEmail: 'cityescape@trekpal.demo',
    name: 'Lahore Heritage House',
    description: 'A restored haveli stay for city and culture tours.',
    address: 'Old City, Lahore',
    city: 'Lahore',
    country: 'Pakistan',
    latitude: 31.582,
    longitude: 74.3294,
    rating: 4.5,
    images: [
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
    ],
    amenities: ['Breakfast', 'Cultural Tour', 'WiFi', 'Parking'],
  },
] as const;

const vehicleSeed = [
  {
    agencyEmail: 'northpeak@trekpal.demo',
    type: 'SUV',
    make: 'Toyota',
    model: 'Prado',
    year: 2023,
    capacity: 7,
    pricePerDay: 18000,
    images: [
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1494976688153-c9c4e577f4c6?auto=format&fit=crop&w=1200&q=80',
    ],
  },
  {
    agencyEmail: 'coastalroutes@trekpal.demo',
    type: 'VAN',
    make: 'Toyota',
    model: 'Hiace',
    year: 2022,
    capacity: 12,
    pricePerDay: 14000,
    images: [
      'https://images.unsplash.com/photo-1549399736-1bb50b6a7f99?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1519643381401-22c77e60520e?auto=format&fit=crop&w=1200&q=80',
    ],
  },
  {
    agencyEmail: 'cityescape@trekpal.demo',
    type: 'CAR',
    make: 'Honda',
    model: 'Civic',
    year: 2024,
    capacity: 4,
    pricePerDay: 8500,
    images: [
      'https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80',
    ],
  },
  {
    agencyEmail: 'northpeak@trekpal.demo',
    type: 'BUS',
    make: 'Toyota',
    model: 'Coaster',
    year: 2021,
    capacity: 22,
    pricePerDay: 26000,
    images: [
      'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1517142089942-ba376ce32a2e?auto=format&fit=crop&w=1200&q=80',
    ],
  },
  {
    agencyEmail: 'coastalroutes@trekpal.demo',
    type: 'SUV',
    make: 'Toyota',
    model: 'Fortuner',
    year: 2023,
    capacity: 7,
    pricePerDay: 17000,
    images: [
      'https://images.unsplash.com/photo-1494976688153-c9c4e577f4c6?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1200&q=80',
    ],
  },
  {
    agencyEmail: 'cityescape@trekpal.demo',
    type: 'SUV',
    make: 'Honda',
    model: 'BR-V',
    year: 2023,
    capacity: 6,
    pricePerDay: 12000,
    images: [
      'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=1200&q=80',
    ],
  },
] as const;

const packageSeed = [
  {
    agencyEmail: 'northpeak@trekpal.demo',
    hotelName: 'Hunza View Lodge',
    vehicleModel: 'Prado',
    name: 'Hunza Spring Escape',
    description:
      '4 days in Hunza with scenic transport, hotel stay, guided sightseeing, breakfast, and a bonfire night.',
    price: 68000,
    duration: 4,
    destinations: ['Hunza', 'Altit Fort', 'Attabad Lake'],
    images: [
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1200&q=80',
    ],
  },
  {
    agencyEmail: 'coastalroutes@trekpal.demo',
    hotelName: 'Ormara Sands Resort',
    vehicleModel: 'Hiace',
    name: 'Makran Coast Weekend',
    description:
      '3 days of coastline views, hotel stay, comfortable van transport, meals on the beach, and evening music.',
    price: 42000,
    duration: 3,
    destinations: ['Ormara', 'Kund Malir', 'Makran Coast'],
    images: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1200&q=80',
    ],
  },
  {
    agencyEmail: 'cityescape@trekpal.demo',
    hotelName: 'Swat River Retreat',
    vehicleModel: 'Civic',
    name: 'Swat Valley Getaway',
    description:
      '2 days in Swat with boutique stay, breakfast, local guide support, and private transport from Lahore.',
    price: 36000,
    duration: 2,
    destinations: ['Swat', 'Malam Jabba', 'Mingora'],
    images: [
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80',
    ],
  },
  {
    agencyEmail: 'northpeak@trekpal.demo',
    hotelName: 'Skardu Alpine Stay',
    vehicleModel: 'Coaster',
    name: 'Skardu Explorer Loop',
    description:
      '5 days in Skardu with hotel stay, group coaster transport, breakfast, lake visit, and city exploration.',
    price: 74000,
    duration: 5,
    destinations: ['Skardu', 'Shangrila', 'Upper Kachura Lake'],
    images: [
      'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    ],
  },
  {
    agencyEmail: 'coastalroutes@trekpal.demo',
    hotelName: 'Pasni Cliff Hotel',
    vehicleModel: 'Fortuner',
    name: 'Sunset Coast Escape',
    description:
      '2 nights on the coast with cliff hotel stay, SUV transfer, sunset dinner, and beach stopovers.',
    price: 48500,
    duration: 3,
    destinations: ['Pasni', 'Astola Viewpoint', 'Gwadar'],
    images: [
      'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    ],
  },
  {
    agencyEmail: 'cityescape@trekpal.demo',
    hotelName: 'Lahore Heritage House',
    vehicleModel: 'BR-V',
    name: 'Lahore Heritage Weekend',
    description:
      'A short cultural city package with heritage stay, old city food walk, and private SUV transfer.',
    price: 28500,
    duration: 2,
    destinations: ['Lahore Fort', 'Badshahi Mosque', 'Food Street'],
    images: [
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
    ],
  },
] as const;

const roomTypes = [
  { type: 'SINGLE', price: 9000, capacity: 1 },
  { type: 'DOUBLE', price: 14000, capacity: 2 },
  { type: 'FAMILY', price: 20000, capacity: 4 },
] as const;

const isDuplicateError = (error: unknown): boolean => {
  const message = String((error as { message?: string } | undefined)?.message || '').toLowerCase();
  return (
    message.includes('already') ||
    message.includes('exists') ||
    message.includes('registered') ||
    message.includes('duplicate')
  );
};

async function findAuthUserByEmail(email: string): Promise<AuthUser | null> {
  const supabase = getSupabaseAdminClient();
  let page = 1;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 200,
    });

    if (error) {
      throw error;
    }

    const existing = (data.users as AuthUser[]).find(
      (user) => user.email?.toLowerCase() === email.toLowerCase(),
    );

    if (existing) {
      return existing;
    }

    if (data.users.length < 200) {
      return null;
    }

    page += 1;
  }
}

async function ensureAuthUser(
  email: string,
  password: string,
  role: string,
  name: string,
): Promise<AuthUser> {
  const supabase = getSupabaseAdminClient();
  const existing = await findAuthUserByEmail(email);

  if (existing) {
    const { data, error } = await supabase.auth.admin.updateUserById(existing.id, {
      email,
      password,
      email_confirm: true,
      app_metadata: {
        ...(existing.app_metadata || {}),
        role,
      },
      user_metadata: {
        ...(existing.user_metadata || {}),
        name,
      },
    });

    if (error || !data.user) {
      throw error || new Error(`Failed to update auth user for ${email}`);
    }

    return data.user;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: { role },
    user_metadata: { name },
  });

  if (error || !data.user) {
    if (isDuplicateError(error)) {
      const duplicate = await findAuthUserByEmail(email);
      if (!duplicate) {
        throw error || new Error(`Failed to create auth user for ${email}`);
      }
      return duplicate;
    }
    throw error || new Error(`Failed to create auth user for ${email}`);
  }

  return data.user;
}

async function upsertAdmin() {
  const authUser = await ensureAuthUser(
    ADMIN_EMAIL,
    ADMIN_PASSWORD,
    ROLES.ADMIN,
    ADMIN_NAME,
  );

  return prisma.admin.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      authUid: authUser.id,
      name: ADMIN_NAME,
    },
    create: {
      authUid: authUser.id,
      email: ADMIN_EMAIL,
      name: ADMIN_NAME,
    },
  });
}

async function upsertTravelers() {
  const map = new Map<string, { id: string; email: string; name: string | null }>();

  for (const traveler of travelerSeed) {
    const authUser = await ensureAuthUser(
      traveler.email,
      TRAVELER_PASSWORD,
      ROLES.TRAVELER,
      traveler.name,
    );

    const record = await prisma.user.upsert({
      where: { email: traveler.email },
      update: {
        authUid: authUser.id,
        name: traveler.name,
        phone: traveler.phone,
        gender: traveler.gender,
        dateOfBirth: traveler.dateOfBirth,
        residentialAddress: traveler.residentialAddress,
        city: traveler.city,
        cnic: traveler.cnic,
        cnicVerified: traveler.cnicVerified,
        travelerKycStatus: traveler.travelerKycStatus,
        avatar: traveler.avatar,
        cnicFrontImageUrl: traveler.cnicFrontImageUrl,
        selfieImageUrl: traveler.selfieImageUrl,
        kycSubmittedAt: traveler.kycSubmittedAt,
        kycVerifiedAt: traveler.kycVerifiedAt,
        emergencyContactName: traveler.emergencyContactName,
        emergencyContactPhone: traveler.emergencyContactPhone,
      },
      create: {
        authUid: authUser.id,
        email: traveler.email,
        name: traveler.name,
        phone: traveler.phone,
        gender: traveler.gender,
        dateOfBirth: traveler.dateOfBirth,
        residentialAddress: traveler.residentialAddress,
        city: traveler.city,
        cnic: traveler.cnic,
        cnicVerified: traveler.cnicVerified,
        travelerKycStatus: traveler.travelerKycStatus,
        avatar: traveler.avatar,
        cnicFrontImageUrl: traveler.cnicFrontImageUrl,
        selfieImageUrl: traveler.selfieImageUrl,
        kycSubmittedAt: traveler.kycSubmittedAt,
        kycVerifiedAt: traveler.kycVerifiedAt,
        emergencyContactName: traveler.emergencyContactName,
        emergencyContactPhone: traveler.emergencyContactPhone,
      },
    });

    map.set(traveler.email, record);
  }

  return map;
}

async function upsertAgencies() {
  const map = new Map<string, { id: string; email: string; name: string }>();

  for (const agency of agencySeed) {
    const authUser = await ensureAuthUser(
      agency.email,
      AGENCY_PASSWORD,
      ROLES.AGENCY,
      agency.name,
    );

    const record = await prisma.agency.upsert({
      where: { email: agency.email },
      update: {
        authUid: authUser.id,
        name: agency.name,
        phone: agency.phone,
        address: agency.address,
        officeCity: agency.officeCity,
        jurisdiction: agency.jurisdiction,
        legalEntityType: agency.legalEntityType,
        license: agency.license,
        ntn: agency.ntn,
        ownerName: agency.ownerName,
        cnic: agency.cnic,
        status: agency.status,
        fieldOfOperations: [...agency.fieldOfOperations],
        capitalAvailablePkr: agency.capitalAvailablePkr,
        secpRegistrationNumber: agency.secpRegistrationNumber,
        partnershipRegistrationNumber: agency.partnershipRegistrationNumber,
        applicationSubmittedAt: new Date('2026-03-01T10:00:00Z'),
        ...sharedDocUrls,
      },
      create: {
        authUid: authUser.id,
        email: agency.email,
        name: agency.name,
        phone: agency.phone,
        address: agency.address,
        officeCity: agency.officeCity,
        jurisdiction: agency.jurisdiction,
        legalEntityType: agency.legalEntityType,
        license: agency.license,
        ntn: agency.ntn,
        ownerName: agency.ownerName,
        cnic: agency.cnic,
        status: agency.status,
        fieldOfOperations: [...agency.fieldOfOperations],
        capitalAvailablePkr: agency.capitalAvailablePkr,
        secpRegistrationNumber: agency.secpRegistrationNumber,
        partnershipRegistrationNumber: agency.partnershipRegistrationNumber,
        applicationSubmittedAt: new Date('2026-03-01T10:00:00Z'),
        ...sharedDocUrls,
      },
    });

    map.set(agency.email, record);
  }

  return map;
}

async function upsertHotels(agencies: Map<string, { id: string }>) {
  const map = new Map<string, { id: string; agencyId: string; name: string }>();

  for (const hotel of hotelSeed) {
    const agency = agencies.get(hotel.agencyEmail);
    if (!agency) {
      throw new Error(`Agency not found for hotel ${hotel.name}`);
    }

    const existing = await prisma.hotel.findFirst({
      where: {
        agencyId: agency.id,
        name: hotel.name,
      },
    });

    const record = existing
      ? await prisma.hotel.update({
          where: { id: existing.id },
          data: {
            description: hotel.description,
            address: hotel.address,
            city: hotel.city,
            country: hotel.country,
            latitude: hotel.latitude,
            longitude: hotel.longitude,
            rating: hotel.rating,
            status: APPROVAL_STATUS.APPROVED,
            images: [...hotel.images],
            amenities: [...hotel.amenities],
          },
        })
      : await prisma.hotel.create({
          data: {
            agencyId: agency.id,
            name: hotel.name,
            description: hotel.description,
            address: hotel.address,
            city: hotel.city,
            country: hotel.country,
            latitude: hotel.latitude,
            longitude: hotel.longitude,
            rating: hotel.rating,
            status: APPROVAL_STATUS.APPROVED,
            images: [...hotel.images],
            amenities: [...hotel.amenities],
          },
        });

    for (const roomType of roomTypes) {
      const existingRoom = await prisma.room.findFirst({
        where: {
          hotelId: record.id,
          type: roomType.type,
        },
      });

      if (existingRoom) {
        await prisma.room.update({
          where: { id: existingRoom.id },
          data: {
            price: roomType.price,
            capacity: roomType.capacity,
            amenities: ['WiFi', 'Breakfast', 'Attached Bath'],
            images: [...hotel.images],
            isAvailable: true,
          },
        });
      } else {
        await prisma.room.create({
          data: {
            hotelId: record.id,
            type: roomType.type,
            price: roomType.price,
            capacity: roomType.capacity,
            amenities: ['WiFi', 'Breakfast', 'Attached Bath'],
            images: [...hotel.images],
            isAvailable: true,
          },
        });
      }
    }

    map.set(hotel.name, record);
  }

  return map;
}

async function upsertVehicles(agencies: Map<string, { id: string }>) {
  const map = new Map<string, { id: string; agencyId: string; model: string }>();

  for (const vehicle of vehicleSeed) {
    const agency = agencies.get(vehicle.agencyEmail);
    if (!agency) {
      throw new Error(`Agency not found for vehicle ${vehicle.make} ${vehicle.model}`);
    }

    const existing = await prisma.vehicle.findFirst({
      where: {
        agencyId: agency.id,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
      },
    });

    const record = existing
      ? await prisma.vehicle.update({
          where: { id: existing.id },
          data: {
            type: vehicle.type,
            capacity: vehicle.capacity,
            pricePerDay: vehicle.pricePerDay,
            images: [...vehicle.images],
            status: APPROVAL_STATUS.APPROVED,
            isAvailable: true,
          },
        })
      : await prisma.vehicle.create({
          data: {
            agencyId: agency.id,
            type: vehicle.type,
            make: vehicle.make,
            model: vehicle.model,
            year: vehicle.year,
            capacity: vehicle.capacity,
            pricePerDay: vehicle.pricePerDay,
            images: [...vehicle.images],
            status: APPROVAL_STATUS.APPROVED,
            isAvailable: true,
          },
        });

    map.set(vehicle.model, record);
  }

  return map;
}

async function upsertPackages(
  agencies: Map<string, { id: string }>,
  hotels: Map<string, { id: string }>,
  vehicles: Map<string, { id: string }>,
) {
  const map = new Map<string, { id: string; agencyId: string; name: string }>();

  for (const tripPackage of packageSeed) {
    const agency = agencies.get(tripPackage.agencyEmail);
    const hotel = hotels.get(tripPackage.hotelName);
    const vehicle = vehicles.get(tripPackage.vehicleModel);

    if (!agency) {
      throw new Error(`Agency not found for package ${tripPackage.name}`);
    }

    const existing = await prisma.package.findFirst({
      where: {
        agencyId: agency.id,
        name: tripPackage.name,
      },
    });

    const data = {
      hotelId: hotel?.id ?? null,
      vehicleId: vehicle?.id ?? null,
      description: tripPackage.description,
      price: tripPackage.price,
      duration: tripPackage.duration,
      destinations: [...tripPackage.destinations],
      images: [...tripPackage.images],
      isActive: true,
    };

    const record = existing
      ? await prisma.package.update({
          where: { id: existing.id },
          data,
        })
      : await prisma.package.create({
          data: {
            agencyId: agency.id,
            name: tripPackage.name,
            ...data,
          },
        });

    map.set(tripPackage.name, record);
  }

  return map;
}

async function upsertTripRequests(
  travelers: Map<string, { id: string }>,
) {
  const requests = [
    {
      travelerEmail: 'ayesha.noor@trekpal.demo',
      destination: 'Naran',
      startDate: new Date('2026-05-20'),
      endDate: new Date('2026-05-24'),
      budget: 65000,
      travelers: 3,
      description: '[seed] Family trip to Naran with hotel and transport',
      status: 'PENDING',
    },
    {
      travelerEmail: 'hamza.iqbal@trekpal.demo',
      destination: 'Skardu',
      startDate: new Date('2026-06-05'),
      endDate: new Date('2026-06-10'),
      budget: 95000,
      travelers: 4,
      description: '[seed] Friends trip to Skardu with SUV',
      status: 'PENDING',
    },
    {
      travelerEmail: 'zainab.shah@trekpal.demo',
      destination: 'Neelum Valley',
      startDate: new Date('2026-06-18'),
      endDate: new Date('2026-06-22'),
      budget: 78000,
      travelers: 2,
      description: '[seed] Couple trip to Neelum with scenic hotel',
      status: 'PENDING',
    },
    {
      travelerEmail: 'daniyal.malik@trekpal.demo',
      destination: 'Murree',
      startDate: new Date('2026-05-28'),
      endDate: new Date('2026-05-30'),
      budget: 32000,
      travelers: 2,
      description: '[seed] Weekend Murree plan with private car',
      status: 'PENDING',
    },
    {
      travelerEmail: 'hina.yousaf@trekpal.demo',
      destination: 'Fairy Meadows',
      startDate: new Date('2026-07-08'),
      endDate: new Date('2026-07-13'),
      budget: 110000,
      travelers: 4,
      description: '[seed] Group request for Fairy Meadows adventure',
      status: 'PENDING',
    },
  ] as const;

  const map = new Map<string, { id: string; destination: string }>();

  for (const request of requests) {
    const traveler = travelers.get(request.travelerEmail);
    if (!traveler) {
      throw new Error(`Traveler not found for request to ${request.destination}`);
    }

    const existing = await prisma.tripRequest.findFirst({
      where: {
        userId: traveler.id,
        destination: request.destination,
        description: request.description,
      },
    });

    const record = existing
      ? await prisma.tripRequest.update({
          where: { id: existing.id },
          data: {
            startDate: request.startDate,
            endDate: request.endDate,
            budget: request.budget,
            travelers: request.travelers,
            status: request.status,
          },
        })
      : await prisma.tripRequest.create({
          data: {
            userId: traveler.id,
            destination: request.destination,
            startDate: request.startDate,
            endDate: request.endDate,
            budget: request.budget,
            travelers: request.travelers,
            description: request.description,
            status: request.status,
          },
        });

    map.set(request.destination, record);
  }

  return map;
}

async function upsertBids(
  agencies: Map<string, { id: string }>,
  tripRequests: Map<string, { id: string }>,
) {
  const bids = [
    {
      agencyEmail: 'northpeak@trekpal.demo',
      destination: 'Naran',
      price: 62000,
      description: 'Private coaster, riverside hotel, and daily breakfast included.',
      status: BID_STATUS.PENDING,
      awaitingActionBy: BID_AWAITING_ACTION.TRAVELER,
    },
    {
      agencyEmail: 'cityescape@trekpal.demo',
      destination: 'Skardu',
      price: 91000,
      description: 'Airport pickup, 4x4 transport, and boutique stay in Skardu.',
      status: BID_STATUS.PENDING,
      awaitingActionBy: BID_AWAITING_ACTION.TRAVELER,
    },
    {
      agencyEmail: 'coastalroutes@trekpal.demo',
      destination: 'Neelum Valley',
      price: 76000,
      description: 'Boutique stay, breakfast, and private SUV for two travelers.',
      status: BID_STATUS.PENDING,
      awaitingActionBy: BID_AWAITING_ACTION.TRAVELER,
    },
    {
      agencyEmail: 'cityescape@trekpal.demo',
      destination: 'Murree',
      price: 30000,
      description: 'Private BR-V transfer and central hotel stay for the weekend.',
      status: BID_STATUS.PENDING,
      awaitingActionBy: BID_AWAITING_ACTION.TRAVELER,
    },
    {
      agencyEmail: 'northpeak@trekpal.demo',
      destination: 'Fairy Meadows',
      price: 106000,
      description: 'Mountain transport, guided route support, and lodge reservations.',
      status: BID_STATUS.PENDING,
      awaitingActionBy: BID_AWAITING_ACTION.TRAVELER,
    },
  ] as const;

  for (const bid of bids) {
    const agency = agencies.get(bid.agencyEmail);
    const tripRequest = tripRequests.get(bid.destination);

    if (!agency || !tripRequest) {
      throw new Error(`Unable to create bid for ${bid.destination}`);
    }

    const existing = await prisma.bid.findFirst({
      where: {
        agencyId: agency.id,
        tripRequestId: tripRequest.id,
      },
    });

    if (existing) {
      await prisma.bid.update({
        where: { id: existing.id },
        data: {
          price: bid.price,
          description: bid.description,
          status: bid.status,
          awaitingActionBy: bid.awaitingActionBy,
        },
      });
    } else {
      await prisma.bid.create({
        data: {
          agencyId: agency.id,
          tripRequestId: tripRequest.id,
          price: bid.price,
          description: bid.description,
          status: bid.status,
          awaitingActionBy: bid.awaitingActionBy,
        },
      });
    }
  }
}

async function upsertPackageBookings(
  travelers: Map<string, { id: string }>,
  packages: Map<string, { id: string; agencyId: string }>,
  hotels: Map<string, { id: string }>,
  vehicles: Map<string, { id: string }>,
) {
  const records = [
    {
      travelerEmail: 'ali.raza@trekpal.demo',
      packageName: 'Hunza Spring Escape',
      hotelName: 'Hunza View Lodge',
      vehicleModel: 'Prado',
      startDate: new Date('2026-05-10'),
      endDate: new Date('2026-05-13'),
      status: BOOKING_STATUS.CONFIRMED,
      totalAmount: 68000,
    },
    {
      travelerEmail: 'sara.khan@trekpal.demo',
      packageName: 'Hunza Spring Escape',
      hotelName: 'Hunza View Lodge',
      vehicleModel: 'Prado',
      startDate: new Date('2026-05-10'),
      endDate: new Date('2026-05-13'),
      status: BOOKING_STATUS.CONFIRMED,
      totalAmount: 68000,
    },
    {
      travelerEmail: 'hamza.iqbal@trekpal.demo',
      packageName: 'Makran Coast Weekend',
      hotelName: 'Ormara Sands Resort',
      vehicleModel: 'Hiace',
      startDate: new Date('2026-05-22'),
      endDate: new Date('2026-05-24'),
      status: BOOKING_STATUS.PENDING,
      totalAmount: 42000,
    },
    {
      travelerEmail: 'bilal.ahmed@trekpal.demo',
      packageName: 'Swat Valley Getaway',
      hotelName: 'Swat River Retreat',
      vehicleModel: 'Civic',
      startDate: new Date('2026-04-10'),
      endDate: new Date('2026-04-11'),
      status: BOOKING_STATUS.COMPLETED,
      totalAmount: 36000,
    },
    {
      travelerEmail: 'zainab.shah@trekpal.demo',
      packageName: 'Makran Coast Weekend',
      hotelName: 'Ormara Sands Resort',
      vehicleModel: 'Hiace',
      startDate: new Date('2026-05-22'),
      endDate: new Date('2026-05-24'),
      status: BOOKING_STATUS.CONFIRMED,
      totalAmount: 42000,
    },
    {
      travelerEmail: 'umair.kayani@trekpal.demo',
      packageName: 'Skardu Explorer Loop',
      hotelName: 'Skardu Alpine Stay',
      vehicleModel: 'Coaster',
      startDate: new Date('2026-06-14'),
      endDate: new Date('2026-06-18'),
      status: BOOKING_STATUS.CONFIRMED,
      totalAmount: 74000,
    },
    {
      travelerEmail: 'hina.yousaf@trekpal.demo',
      packageName: 'Skardu Explorer Loop',
      hotelName: 'Skardu Alpine Stay',
      vehicleModel: 'Coaster',
      startDate: new Date('2026-06-14'),
      endDate: new Date('2026-06-18'),
      status: BOOKING_STATUS.CONFIRMED,
      totalAmount: 74000,
    },
    {
      travelerEmail: 'ali.raza@trekpal.demo',
      packageName: 'Sunset Coast Escape',
      hotelName: 'Pasni Cliff Hotel',
      vehicleModel: 'Fortuner',
      startDate: new Date('2026-06-02'),
      endDate: new Date('2026-06-04'),
      status: BOOKING_STATUS.PENDING,
      totalAmount: 48500,
    },
    {
      travelerEmail: 'sara.khan@trekpal.demo',
      packageName: 'Lahore Heritage Weekend',
      hotelName: 'Lahore Heritage House',
      vehicleModel: 'BR-V',
      startDate: new Date('2026-04-18'),
      endDate: new Date('2026-04-19'),
      status: BOOKING_STATUS.CONFIRMED,
      totalAmount: 28500,
    },
  ] as const;

  const bookingMap = new Map<string, { id: string; hotelId: string | null }>();

  for (const booking of records) {
    const traveler = travelers.get(booking.travelerEmail);
    const tripPackage = packages.get(booking.packageName);
    const hotel = hotels.get(booking.hotelName);
    const vehicle = vehicles.get(booking.vehicleModel);

    if (!traveler || !tripPackage) {
      throw new Error(`Unable to create booking for ${booking.packageName}`);
    }

    const existing = await prisma.booking.findFirst({
      where: {
        userId: traveler.id,
        packageId: tripPackage.id,
        startDate: booking.startDate,
      },
    });

    const record = existing
      ? await prisma.booking.update({
          where: { id: existing.id },
          data: {
            agencyId: tripPackage.agencyId,
            hotelId: hotel?.id ?? null,
            vehicleId: vehicle?.id ?? null,
            status: booking.status,
            totalAmount: booking.totalAmount,
            endDate: booking.endDate,
          },
        })
      : await prisma.booking.create({
          data: {
            userId: traveler.id,
            agencyId: tripPackage.agencyId,
            hotelId: hotel?.id ?? null,
            vehicleId: vehicle?.id ?? null,
            packageId: tripPackage.id,
            status: booking.status,
            totalAmount: booking.totalAmount,
            startDate: booking.startDate,
            endDate: booking.endDate,
          },
        });

    bookingMap.set(`${booking.travelerEmail}:${booking.packageName}`, {
      id: record.id,
      hotelId: record.hotelId,
    });
  }

  return bookingMap;
}

async function upsertCompletedReview(
  travelers: Map<string, { id: string }>,
  bookingMap: Map<string, { id: string; hotelId: string | null }>,
) {
  const booking = bookingMap.get('bilal.ahmed@trekpal.demo:Swat Valley Getaway');
  const traveler = travelers.get('bilal.ahmed@trekpal.demo');

  if (!booking || !traveler) {
    return;
  }

  const existing = await prisma.review.findUnique({
    where: { bookingId: booking.id },
  });

  if (existing) {
    await prisma.review.update({
      where: { id: existing.id },
      data: {
        rating: 5,
        comment: 'Everything was smooth, clean, and easy to explain in a demo.',
        hotelId: booking.hotelId,
      },
    });
    return;
  }

  await prisma.review.create({
    data: {
      userId: traveler.id,
      bookingId: booking.id,
      hotelId: booking.hotelId,
      rating: 5,
      comment: 'Everything was smooth, clean, and easy to explain in a demo.',
    },
  });
}

async function upsertChatData(
  travelers: Map<string, { id: string }>,
  packages: Map<string, { id: string; name: string }>,
  agencies: Map<string, { id: string; name: string }>,
) {
  const roomPlans = [
    {
      packageName: 'Hunza Spring Escape',
      agencyEmail: 'northpeak@trekpal.demo',
      description: 'Confirmed travelers for Hunza Spring Escape',
      memberEmails: ['ali.raza@trekpal.demo', 'sara.khan@trekpal.demo'],
      messages: [
        {
          senderEmail: 'ali.raza@trekpal.demo',
          senderType: ROLES.TRAVELER,
          content: 'Hi everyone, I am arriving in Islamabad a night earlier.',
        },
        {
          senderEmail: 'northpeak@trekpal.demo',
          senderType: ROLES.AGENCY,
          content: 'Noted. Pickup timing and hotel details will be shared one day before departure.',
        },
        {
          senderEmail: 'sara.khan@trekpal.demo',
          senderType: ROLES.TRAVELER,
          content: 'Perfect, thank you. Looking forward to the trip.',
        },
      ],
    },
    {
      packageName: 'Skardu Explorer Loop',
      agencyEmail: 'northpeak@trekpal.demo',
      description: 'Confirmed travelers for Skardu Explorer Loop',
      memberEmails: ['umair.kayani@trekpal.demo', 'hina.yousaf@trekpal.demo'],
      messages: [
        {
          senderEmail: 'umair.kayani@trekpal.demo',
          senderType: ROLES.TRAVELER,
          content: 'Can we get a packing checklist before departure?',
        },
        {
          senderEmail: 'northpeak@trekpal.demo',
          senderType: ROLES.AGENCY,
          content: 'Yes, we will send the checklist and pickup sheet tomorrow evening.',
        },
        {
          senderEmail: 'hina.yousaf@trekpal.demo',
          senderType: ROLES.TRAVELER,
          content: 'Great, I am mainly checking the temperature for Skardu.',
        },
      ],
    },
  ] as const;

  for (const roomPlan of roomPlans) {
    const tripPackage = packages.get(roomPlan.packageName);
    const agency = agencies.get(roomPlan.agencyEmail);
    const members = roomPlan.memberEmails
      .map((email) => travelers.get(email))
      .filter((member): member is { id: string } => member != null);

    if (!tripPackage || !agency || members.length === 0) {
      continue;
    }

    const group = await prisma.tripGroup.upsert({
      where: { packageId: tripPackage.id },
      update: {
        name: tripPackage.name,
        description: roomPlan.description,
      },
      create: {
        packageId: tripPackage.id,
        name: tripPackage.name,
        description: roomPlan.description,
      },
    });

    for (const member of members) {
      const existingMember = await prisma.tripGroupMember.findFirst({
        where: {
          groupId: group.id,
          userId: member.id,
        },
      });

      if (!existingMember) {
        await prisma.tripGroupMember.create({
          data: {
            groupId: group.id,
            userId: member.id,
          },
        });
      }
    }

    const messageCount = await prisma.message.count({
      where: { groupId: group.id },
    });

    if (messageCount > 0) {
      continue;
    }

    await prisma.message.createMany({
      data: roomPlan.messages.map((message) => {
        if (message.senderType === ROLES.AGENCY) {
          return {
            groupId: group.id,
            agencyId: agency.id,
            senderType: ROLES.AGENCY,
            content: message.content,
          };
        }

        const traveler = travelers.get(message.senderEmail);
        if (!traveler) {
          throw new Error(`Traveler not found for chat message in ${roomPlan.packageName}`);
        }

        return {
          groupId: group.id,
          userId: traveler.id,
          senderType: ROLES.TRAVELER,
          content: message.content,
        };
      }),
    });
  }
}

async function main() {
  console.log('Seeding TrekPal demo data...');

  await upsertAdmin();
  const travelers = await upsertTravelers();
  const agencies = await upsertAgencies();
  const hotels = await upsertHotels(agencies);
  const vehicles = await upsertVehicles(agencies);
  const packages = await upsertPackages(agencies, hotels, vehicles);
  const tripRequests = await upsertTripRequests(travelers);
  await upsertBids(agencies, tripRequests);
  const bookingMap = await upsertPackageBookings(
    travelers,
    packages,
    hotels,
    vehicles,
  );
  await upsertCompletedReview(travelers, bookingMap);
  await upsertChatData(travelers, packages, agencies);

  console.log('');
  console.log('Seed completed.');
  console.log(`Admin login: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  console.log(`Traveler login: ${travelerSeed[0].email} / ${TRAVELER_PASSWORD}`);
  console.log(`Agency login: ${agencySeed[0].email} / ${AGENCY_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
