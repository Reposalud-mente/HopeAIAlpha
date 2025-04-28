import { PrismaClient } from '@prisma/client';

async function main() {
  try {
    console.log('Creating Prisma client...');
    const prisma = new PrismaClient();
    
    console.log('Connecting to database...');
    await prisma.$connect();
    
    console.log('Connection successful!');
    
    // Test a simple query on the AIConsultation model
    console.log('Testing AIConsultation model...');
    
    // List all available models
    console.log('Available models:');
    const models = Object.keys(prisma).filter(key => 
      !key.startsWith('_') && 
      !key.startsWith('$') &&
      typeof prisma[key] === 'object'
    );
    console.log(models);
    
    // Check if AIConsultation model exists
    if (models.includes('aIConsultation')) {
      console.log('AIConsultation model found as aIConsultation');
      
      // Count AIConsultations
      const count = await prisma.aIConsultation.count();
      console.log(`Number of AI consultations: ${count}`);
      
      // Create a test consultation
      const testConsultation = await prisma.aIConsultation.create({
        data: {
          userId: '00000000-0000-0000-0000-000000000001', // Replace with a valid user ID
          messages: []
        }
      });
      console.log('Created test consultation:', testConsultation);
      
      // Delete the test consultation
      await prisma.aIConsultation.delete({
        where: { id: testConsultation.id }
      });
      console.log('Deleted test consultation');
    } else {
      console.log('AIConsultation model not found as aIConsultation');
    }
    
    // Disconnect
    await prisma.$disconnect();
    console.log('Disconnected from database');
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
