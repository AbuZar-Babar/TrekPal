import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const columns = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'hotels'
    `;
    console.log('Hotels table columns:', JSON.stringify(columns, null, 2));

    const hotels = await prisma.hotel.findMany({
      take: 5
    });
    console.log('Recent hotels:', JSON.stringify(hotels, null, 2));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
