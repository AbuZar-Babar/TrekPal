import { adminService } from '../src/modules/admin/admin.service';

async function main() {
  try {
    console.log('Fetching pending hotels via AdminService...');
    const result = await adminService.getHotels(1, 20, 'PENDING');
    console.log('AdminService result:', result.hotels.length);

    const { prisma } = require('../src/config/database');
    const count = await prisma.hotel.count({ where: { status: 'PENDING' } });
    console.log('Direct Prisma count of PENDING hotels:', count);

    if (count > 0) {
      const hotels = await prisma.hotel.findMany({ where: { status: 'PENDING' } });
      console.log('Sample pending hotel IDs:', hotels.map((h: any) => h.id));
    }
  } catch (error: any) {
    console.error('CRASH in getHotels:', error);
    console.error('Stack trace:', error.stack);
  }
}

main();
