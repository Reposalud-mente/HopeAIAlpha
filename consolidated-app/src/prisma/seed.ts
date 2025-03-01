import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  // Generate password hash
  const password = "password123"
  const passwordHash = await bcrypt.hash(password, 10)
  
  // Seed evaluation areas
  const evaluationAreas = [
    { id: 'cognitiva', name: 'Función Cognitiva', description: 'Evaluación de procesos cognitivos' },
    { id: 'emocional', name: 'Regulación Emocional', description: 'Evaluación de capacidad emocional' },
    { id: 'conductual', name: 'Comportamiento', description: 'Evaluación de patrones de comportamiento' },
    { id: 'social', name: 'Funcionamiento Social', description: 'Evaluación de habilidades sociales' },
    { id: 'personalidad', name: 'Rasgos de Personalidad', description: 'Evaluación de rasgos y patrones' },
    { id: 'autoconcepto', name: 'Autoconcepto', description: 'Evaluación de la percepción de sí mismo' },
    { id: 'trauma', name: 'Trauma', description: 'Evaluación de experiencias traumáticas' },
    { id: 'estres', name: 'Estrés y Afrontamiento', description: 'Evaluación de niveles de estrés' },
    { id: 'familiar', name: 'Dinámica Familiar', description: 'Evaluación de relaciones familiares' }
  ]
  
  // Seed ICD codes (just a few examples)
  const icdCodes = [
    { code: '6A00', name: 'Trastornos del desarrollo intelectual', category: 'Neurodevelopmental' },
    { code: '6A01', name: 'Trastornos del espectro autista', category: 'Neurodevelopmental' },
    { code: '6A20', name: 'Esquizofrenia', category: 'Psychotic' },
    { code: '6A21', name: 'Trastorno esquizoafectivo', category: 'Psychotic' },
    { code: '6A70', name: 'Episodio depresivo', category: 'Mood' },
    { code: '6A71', name: 'Trastorno depresivo recurrente', category: 'Mood' },
    { code: '6B00', name: 'Trastorno de ansiedad generalizada', category: 'Anxiety' },
    { code: '6B01', name: 'Trastorno de pánico', category: 'Anxiety' }
  ]
  
  // Create a demo clinic
  const clinic = await prisma.clinic.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Clínica HopeAI Demo',
      address: 'Calle Principal 123, Ciudad',
      contactPhone: '+1234567890',
      contactEmail: 'info@hopeai.com',
      website: 'https://hopeai.com'
    }
  })
  
  // Create a demo admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@hopeai.com' },
    update: {},
    create: {
      email: 'admin@hopeai.com',
      passwordHash: passwordHash,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      clinicId: clinic.id
    }
  })
  
  // Create a demo psychologist
  const psychologist = await prisma.user.upsert({
    where: { email: 'psicologo@hopeai.com' },
    update: {},
    create: {
      email: 'psicologo@hopeai.com',
      passwordHash: passwordHash,
      firstName: 'Dr.',
      lastName: 'Psicólogo',
      role: 'PSYCHOLOGIST',
      clinicId: clinic.id,
      licenseNumber: 'PSI-12345',
      specialty: 'Psicología Clínica'
    }
  })
  
  // Seed evaluation areas as a batch operation
  await Promise.all(
    evaluationAreas.map(area =>
      prisma.evaluationArea.upsert({
        where: { id: area.id },
        update: {},
        create: area
      })
    )
  )
  
  // Seed ICD codes as a batch operation
  await Promise.all(
    icdCodes.map(code =>
      prisma.iCDCriteria.upsert({
        where: { code: code.code },
        update: {},
        create: code
      })
    )
  )
  
  console.log('Seed data created successfully!')
}

main()
  .catch(e => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 