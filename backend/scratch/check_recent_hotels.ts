
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env from backend directory
dotenv.config({ path: path.join(__dirname, '../../backend/.env') });

const prisma = new PrismaClient();

async function checkHotels() {
  try {
    const hotels = await prisma.hotel.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    console.log('Recent Hotels:', JSON.stringify(hotels, null, 2));
    
    const pendingCount = await prisma.hotel.count({ where: { status: 'PENDING' } });
    console.log('Pending Hotels Count:', pendingCount);

  } catch (error) {
    console.error('Error fetching hotels:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkHotels();
