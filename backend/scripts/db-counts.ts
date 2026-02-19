import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const tableCountQueries = {
  users: () => prisma.user.count(),
  agencies: () => prisma.agency.count(),
  admins: () => prisma.admin.count(),
  hotels: () => prisma.hotel.count(),
  rooms: () => prisma.room.count(),
  vehicles: () => prisma.vehicle.count(),
  packages: () => prisma.package.count(),
  trip_requests: () => prisma.tripRequest.count(),
  bids: () => prisma.bid.count(),
  bookings: () => prisma.booking.count(),
  reviews: () => prisma.review.count(),
  trip_groups: () => prisma.tripGroup.count(),
  trip_group_members: () => prisma.tripGroupMember.count(),
  messages: () => prisma.message.count(),
};

const main = async (): Promise<void> => {
  const counts: Record<string, number> = {};

  for (const [table, query] of Object.entries(tableCountQueries)) {
    counts[table] = await query();
  }

  console.log(
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        counts,
      },
      null,
      2
    )
  );
};

main()
  .catch((error) => {
    console.error('[db-counts] Failed to collect table counts');
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
