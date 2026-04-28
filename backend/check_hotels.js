const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    const hotels = await prisma.hotel.findMany({
      select: {
        id: true,
        name: true,
        status: true,
        email: true,
        phone: true,
        createdAt: true,
      }
    });

    console.log('Total Hotels:', hotels.length);
    console.log('Hotels by Status:');
    const counts = {};
    hotels.forEach(h => {
      counts[h.status] = (counts[h.status] || 0) + 1;
    });
    console.log(JSON.stringify(counts, null, 2));

    console.log('\nAll Hotels:');
    console.log(JSON.stringify(hotels, null, 2));
  } catch (error) {
    console.error('Error querying hotels:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
