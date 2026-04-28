import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const counts = await prisma.hotel.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    });
    console.log('Hotel status counts:', JSON.stringify(counts, null, 2));

    const pendingHotels = await prisma.hotel.findMany({
      where: { status: 'PENDING' },
      select: { id: true, name: true, email: true, createdAt: true }
    });
    console.log('Pending hotels:', JSON.stringify(pendingHotels, null, 2));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
