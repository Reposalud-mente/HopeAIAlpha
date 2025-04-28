import { PrismaClient } from '@prisma/client';

async function main() {
  try {
    console.log('Creating Prisma client...');
    const prisma = new PrismaClient();
    
    console.log('Connecting to database...');
    await prisma.$connect();
    
    console.log('Connection successful!');
    
    // Get the first user
    const user = await prisma.user.findFirst();
    console.log('First user:', user ? user.id : 'No users found');
    
    // Disconnect
    await prisma.$disconnect();
    console.log('Disconnected from database');
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
