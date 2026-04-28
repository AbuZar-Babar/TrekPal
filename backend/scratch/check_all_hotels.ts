import { prisma } from '../src/config/database';

async function main() {
  try {
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('DATABASE_URL starts with:', process.env.DATABASE_URL?.substring(0, 20));
    console.log('Fetching hotel statistics...');
    const statusCounts = await prisma.hotel.groupBy({
      by: ['status'],
      _count: true
    });
    console.log('Status counts:', JSON.stringify(statusCounts, null, 2));
    
    const latestHotels = await prisma.hotel.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, name: true, status: true, createdAt: true }
    });
    console.log('Latest 5 hotels:', JSON.stringify(latestHotels, null, 2));
  } catch (error: any) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
