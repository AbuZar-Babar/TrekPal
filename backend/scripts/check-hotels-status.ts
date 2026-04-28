import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const main = async (): Promise<void> => {
  const hotels = await prisma.hotel.findMany({
    select: {
      id: true,
      name: true,
      status: true,
      email: true,
      agencyId: true,
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  console.log(JSON.stringify(hotels, null, 2));
};

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
