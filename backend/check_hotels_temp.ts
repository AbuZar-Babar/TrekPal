import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

const prisma = new PrismaClient();

async function checkHotels() {
  try {
    console.log('Checking database connection...');
    const result = await prisma.$queryRaw`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'hotels'`;
    console.log('Columns in hotels table:', result);

    const hotels = await prisma.hotel.findMany({
      select: {
        id: true,
        name: true,
        status: true,
        email: true,
        phone: true,
      }
    });

    console.log(`Found ${hotels.length} hotels:`);
    hotels.forEach(h => {
      console.log(`- [${h.status}] ${h.name} (ID: ${h.id}, Email: ${h.email}, Phone: ${h.phone})`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkHotels();
