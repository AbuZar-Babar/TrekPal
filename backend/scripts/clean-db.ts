import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning all database tables (preserving admins)...');

  // Deletions ordered by dependency hierarchy
  await prisma.message.deleteMany({});
  await prisma.tripGroupMember.deleteMany({});
  await prisma.tripGroup.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.bidRevision.deleteMany({});
  await prisma.bid.deleteMany({});
  await prisma.packageRoomAllocation.deleteMany({});
  await prisma.package.deleteMany({});
  await prisma.tripRequest.deleteMany({});
  await prisma.roomAvailability.deleteMany({});
  await prisma.room.deleteMany({});
  await prisma.hotelService.deleteMany({});
  await prisma.hotel.deleteMany({});
  await prisma.vehicle.deleteMany({});
  await prisma.driver.deleteMany({});
  await prisma.vehicleProvider.deleteMany({});
  await prisma.agency.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Database cleaned successfully.');
}

main()
  .catch((e) => {
    console.error('Database cleanup failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
