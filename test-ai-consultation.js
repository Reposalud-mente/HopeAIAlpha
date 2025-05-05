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
      
      // Create a test consultation with context information
      const testConsultation = await prisma.aIConsultation.create({
        data: {
          userId: '00000000-0000-0000-0000-000000000001', // Replace with a valid user ID
          messages: [],
          metadata: {
            // Include context information in the metadata
            currentSection: "Test Section",
            currentPage: "Test Page",
            contextUsed: true
          }
        }
      });
      console.log('Created test consultation with context information:', testConsultation);
      
      // Update the test consultation with a message
      const updatedConsultation = await prisma.aIConsultation.update({
        where: { id: testConsultation.id },
        data: {
          messages: [
            {
              id: 1,
              content: "¿Cómo puedo crear un informe psicológico?",
              sender: "user",
              type: "text",
              timestamp: new Date().toISOString()
            },
            {
              id: 2,
              content: "Para crear un informe psicológico en HopeAI, puedes utilizar las plantillas predefinidas en la sección de Documentación. Estas plantillas están diseñadas siguiendo las mejores prácticas clínicas y te permitirán estructurar la información de manera profesional y completa.",
              sender: "ai",
              type: "text",
              timestamp: new Date().toISOString()
            }
          ]
        }
      });
      console.log('Updated test consultation with messages:', updatedConsultation);
      
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
