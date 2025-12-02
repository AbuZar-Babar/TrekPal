import { PrismaClient } from '@prisma/client';
import { APPROVAL_STATUS } from '../src/config/constants';

const prisma = new PrismaClient();

/**
 * Seed script to populate database with dummy data
 */
async function main() {
  console.log('🌱 Seeding database...');

  // Create dummy admin
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@trekpal.com' },
    update: {},
    create: {
      firebaseUid: 'admin-firebase-uid-123',
      email: 'admin@trekpal.com',
      name: 'Admin User',
    },
  });
  console.log('✅ Created admin:', admin.email);

  // Create dummy users (travelers)
  const users = [];
  const userNames = [
    'John Doe',
    'Jane Smith',
    'Ahmed Ali',
    'Fatima Khan',
    'Mohammad Hassan',
    'Sara Ahmed',
    'Ali Raza',
    'Ayesha Malik',
  ];

  for (let i = 0; i < userNames.length; i++) {
    const user = await prisma.user.upsert({
      where: { email: `user${i + 1}@example.com` },
      update: {},
      create: {
        firebaseUid: `user-firebase-uid-${i + 1}`,
        email: `user${i + 1}@example.com`,
        name: userNames[i],
        phone: `+92300${1000000 + i}`,
        cnic: `${1234567890000 + i}`,
        cnicVerified: i % 2 === 0, // Alternate verified status
      },
    });
    users.push(user);
  }
  console.log(`✅ Created ${users.length} users`);

  // Create dummy agencies
  const agencies = [];
  const agencyData = [
    {
      name: 'Paradise Travels',
      email: 'paradise@travels.com',
      phone: '+923001234567',
      address: '123 Main Street, Karachi',
      license: 'TA-001',
      status: APPROVAL_STATUS.APPROVED,
    },
    {
      name: 'Mountain View Tours',
      email: 'mountain@tours.com',
      phone: '+923001234568',
      address: '456 Park Avenue, Lahore',
      license: 'TA-002',
      status: APPROVAL_STATUS.APPROVED,
    },
    {
      name: 'Coastal Adventures',
      email: 'coastal@adventures.com',
      phone: '+923001234569',
      address: '789 Beach Road, Islamabad',
      license: 'TA-003',
      status: APPROVAL_STATUS.PENDING,
    },
    {
      name: 'Desert Safari Tours',
      email: 'desert@safari.com',
      phone: '+923001234570',
      address: '321 Desert Lane, Quetta',
      license: 'TA-004',
      status: APPROVAL_STATUS.PENDING,
    },
    {
      name: 'City Explorer',
      email: 'city@explorer.com',
      phone: '+923001234571',
      address: '654 Urban Street, Faisalabad',
      license: 'TA-005',
      status: APPROVAL_STATUS.REJECTED,
    },
  ];

  for (let i = 0; i < agencyData.length; i++) {
    const agency = await prisma.agency.upsert({
      where: { email: agencyData[i].email },
      update: {},
      create: {
        firebaseUid: `agency-firebase-uid-${i + 1}`,
        ...agencyData[i],
      },
    });
    agencies.push(agency);
  }
  console.log(`✅ Created ${agencies.length} agencies`);

  // Create dummy hotels
  const hotels = [];
  const hotelData = [
    {
      name: 'Grand Hotel Karachi',
      description: 'Luxury hotel in the heart of Karachi',
      address: '123 Beach Road',
      city: 'Karachi',
      country: 'Pakistan',
      latitude: 24.8607,
      longitude: 67.0011,
      rating: 4.5,
      status: APPROVAL_STATUS.APPROVED,
      images: [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
        'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
      ],
      amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Parking'],
    },
    {
      name: 'Mountain View Resort',
      description: 'Scenic resort with mountain views',
      address: '456 Hilltop Avenue',
      city: 'Murree',
      country: 'Pakistan',
      latitude: 33.9072,
      longitude: 73.3903,
      rating: 4.2,
      status: APPROVAL_STATUS.APPROVED,
      images: [
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
      ],
      amenities: ['WiFi', 'Restaurant', 'Parking', 'Heating'],
    },
    {
      name: 'Beachside Inn',
      description: 'Cozy inn near the beach',
      address: '789 Coastal Drive',
      city: 'Gwadar',
      country: 'Pakistan',
      latitude: 25.1214,
      longitude: 62.3254,
      rating: 3.8,
      status: APPROVAL_STATUS.PENDING,
      images: [
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
      ],
      amenities: ['WiFi', 'Restaurant', 'Parking'],
    },
    {
      name: 'City Center Hotel',
      description: 'Modern hotel in city center',
      address: '321 Downtown Street',
      city: 'Lahore',
      country: 'Pakistan',
      latitude: 31.5204,
      longitude: 74.3587,
      rating: 4.0,
      status: APPROVAL_STATUS.PENDING,
      images: [
        'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800',
      ],
      amenities: ['WiFi', 'Pool', 'Gym', 'Restaurant', 'Parking'],
    },
    {
      name: 'Heritage Palace',
      description: 'Historic palace converted to hotel',
      address: '654 Heritage Road',
      city: 'Multan',
      country: 'Pakistan',
      latitude: 30.1575,
      longitude: 71.5249,
      rating: 4.7,
      status: APPROVAL_STATUS.APPROVED,
      images: [
        'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
      ],
      amenities: ['WiFi', 'Spa', 'Restaurant', 'Parking', 'Historic Tours'],
    },
  ];

  for (let i = 0; i < hotelData.length; i++) {
    const hotel = await prisma.hotel.create({
      data: {
        agencyId: agencies[i % agencies.length].id,
        ...hotelData[i],
      },
    });
    hotels.push(hotel);

    // Create rooms for each hotel
    const roomTypes = ['SINGLE', 'DOUBLE', 'SUITE'];
    for (let j = 0; j < 3; j++) {
      await prisma.room.create({
        data: {
          hotelId: hotel.id,
          type: roomTypes[j],
          price: (j + 1) * 5000,
          capacity: j + 1,
          amenities: ['WiFi', 'TV', 'AC'],
          images: [
            `https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800`,
          ],
          isAvailable: true,
        },
      });
    }
  }
  console.log(`✅ Created ${hotels.length} hotels with rooms`);

  // Create dummy vehicles
  const vehicles = [];
  const vehicleData = [
    {
      type: 'CAR',
      make: 'Toyota',
      model: 'Corolla',
      year: 2022,
      capacity: 4,
      pricePerDay: 5000,
      status: APPROVAL_STATUS.APPROVED,
      images: [
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800',
      ],
      isAvailable: true,
    },
    {
      type: 'VAN',
      make: 'Hiace',
      model: 'Grand Cabin',
      year: 2021,
      capacity: 12,
      pricePerDay: 12000,
      status: APPROVAL_STATUS.APPROVED,
      images: [
        'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800',
      ],
      isAvailable: true,
    },
    {
      type: 'BUS',
      make: 'Hino',
      model: 'Tourist Bus',
      year: 2020,
      capacity: 45,
      pricePerDay: 25000,
      status: APPROVAL_STATUS.PENDING,
      images: [
        'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800',
      ],
      isAvailable: true,
    },
    {
      type: 'CAR',
      make: 'Honda',
      model: 'Civic',
      year: 2023,
      capacity: 4,
      pricePerDay: 6000,
      status: APPROVAL_STATUS.PENDING,
      images: [
        'https://images.unsplash.com/photo-1606664515528-95258e9a0c1a?w=800',
      ],
      isAvailable: true,
    },
    {
      type: 'SUV',
      make: 'Toyota',
      model: 'Land Cruiser',
      year: 2022,
      capacity: 7,
      pricePerDay: 15000,
      status: APPROVAL_STATUS.APPROVED,
      images: [
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800',
      ],
      isAvailable: true,
    },
  ];

  for (let i = 0; i < vehicleData.length; i++) {
    const vehicle = await prisma.vehicle.create({
      data: {
        agencyId: agencies[i % agencies.length].id,
        ...vehicleData[i],
      },
    });
    vehicles.push(vehicle);
  }
  console.log(`✅ Created ${vehicles.length} vehicles`);

  // Create dummy packages
  const packages = [];
  const packageData = [
    {
      name: 'Northern Areas Tour',
      description: '7-day tour of Northern Pakistan',
      price: 50000,
      duration: 7,
      destinations: ['Hunza', 'Skardu', 'Fairy Meadows'],
      images: [
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      ],
      isActive: true,
    },
    {
      name: 'Coastal Adventure',
      description: '5-day beach tour',
      price: 35000,
      duration: 5,
      destinations: ['Karachi', 'Gwadar', 'Ormara'],
      images: [
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
      ],
      isActive: true,
    },
  ];

  for (let i = 0; i < packageData.length; i++) {
    const pkg = await prisma.package.create({
      data: {
        agencyId: agencies[i % agencies.length].id,
        ...packageData[i],
      },
    });
    packages.push(pkg);
  }
  console.log(`✅ Created ${packages.length} packages`);

  // Create dummy trip requests
  const tripRequests = [];
  for (let i = 0; i < 5; i++) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + (i + 1) * 7);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 3);

    const tripRequest = await prisma.tripRequest.create({
      data: {
        userId: users[i % users.length].id,
        destination: ['Karachi', 'Lahore', 'Islamabad', 'Murree', 'Hunza'][i],
        startDate,
        endDate,
        budget: (i + 1) * 20000,
        travelers: (i % 3) + 1,
        description: `Trip request for ${['Karachi', 'Lahore', 'Islamabad', 'Murree', 'Hunza'][i]}`,
        status: 'PENDING',
      },
    });
    tripRequests.push(tripRequest);
  }
  console.log(`✅ Created ${tripRequests.length} trip requests`);

  // Create dummy bids
  for (let i = 0; i < 3; i++) {
    await prisma.bid.create({
      data: {
        tripRequestId: tripRequests[i].id,
        agencyId: agencies[i % agencies.length].id,
        price: tripRequests[i].budget! * 0.9,
        description: `Bid for trip to ${tripRequests[i].destination}`,
        status: i === 0 ? 'ACCEPTED' : 'PENDING',
      },
    });
  }
  console.log('✅ Created bids');

  // Create dummy bookings
  const bookings = [];
  for (let i = 0; i < 3; i++) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + i * 7);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 2);

    const hotel = hotels[i % hotels.length];
    const room = await prisma.room.findFirst({ where: { hotelId: hotel.id } });

    const booking = await prisma.booking.create({
      data: {
        userId: users[i % users.length].id,
        agencyId: agencies[i % agencies.length].id,
        hotelId: hotel.id,
        roomId: room?.id,
        totalAmount: (i + 1) * 15000,
        startDate,
        endDate,
        status: ['PENDING', 'CONFIRMED', 'COMPLETED'][i],
      },
    });
    bookings.push(booking);
  }
  console.log(`✅ Created ${bookings.length} bookings`);

  // Create dummy reviews
  for (let i = 0; i < 3; i++) {
    await prisma.review.create({
      data: {
        userId: users[i % users.length].id,
        bookingId: bookings[i].id,
        hotelId: bookings[i].hotelId!,
        rating: (i % 5) + 1,
        comment: `Great experience! ${['Excellent service', 'Beautiful location', 'Comfortable stay'][i]}`,
      },
    });
  }
  console.log('✅ Created reviews');

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

