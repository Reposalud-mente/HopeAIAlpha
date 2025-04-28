import { prisma } from './src/lib/prisma.ts';

async function main() {
  try {
    console.log('Connecting to database...');

    // List all models available in the Prisma client
    console.log('Available models:');
    const models = Object.keys(prisma).filter(key =>
      !key.startsWith('_') &&
      !key.startsWith('$') &&
      typeof prisma[key] === 'object'
    );

    console.log(models);

    // Check if AIConsultation model exists
    console.log('Checking for AIConsultation model...');
    if (models.includes('aIConsultation')) {
      console.log('AIConsultation model found as aIConsultation');
    } else if (models.includes('AIConsultation')) {
      console.log('AIConsultation model found as AIConsultation');
    } else {
      console.log('AIConsultation model not found');
    }

    // Disconnect
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
