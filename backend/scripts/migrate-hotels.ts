import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrate() {
  console.log('Starting hotel migration...');

  // 1. Fetch all hotels
  const hotels = await prisma.hotel.findMany({
    include: {
      rooms: true
    }
  });

  console.log(`Found ${hotels.length} hotels to migrate.`);

  for (const hotel of hotels) {
    console.log(`Migrating hotel: ${hotel.name}`);

    // Update hotel to be independent (status remains as is, but we could mark as APPROVED if they were already)
    // We also need to handle email/authUid if they are null, but for existing ones we might need to generate placeholders or keep null
    await prisma.hotel.update({
      where: { id: hotel.id },
      data: {
        agencyId: null, // Fully decouple
        status: hotel.status === 'APPROVED' ? 'APPROVED' : 'PENDING'
      }
    });

    // 2. Initialize RoomAvailability for the next 30 days
    for (const room of hotel.rooms) {
      console.log(`  Initializing availability for room type: ${room.type}`);
      
      const startDate = new Date();
      for (let i = 0; i < 30; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        date.setHours(0, 0, 0, 0);

        await prisma.roomAvailability.upsert({
          where: {
            roomId_date: {
              roomId: room.id,
              date: date
            }
          },
          update: {
            available: room.quantity
          },
          create: {
            roomId: room.id,
            date: date,
            available: room.quantity
          }
        });
      }
    }
  }

  console.log('Migration completed successfully.');
}

migrate()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
