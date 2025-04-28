import { PrismaClient } from '@prisma/client';

async function main() {
  try {
    console.log('Creating Prisma client...');
    const prisma = new PrismaClient();

    console.log('Connecting to database...');
    await prisma.$connect();

    console.log('Connection successful!');

    // Test a simple query
    const userCount = await prisma.user.count();
    console.log(`Number of users in database: ${userCount}`);

    // Disconnect
    await prisma.$disconnect();
    console.log('Disconnected from database');
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
