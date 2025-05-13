import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

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

  // --- BEGIN PATIENT SEEDING ---
  console.log('\nSeeding patients...');
  const existingPatientCount = await prisma.patient.count();
  if (existingPatientCount > 0) {
    console.log(`  Found ${existingPatientCount} existing patients. Skipping patient creation.`);
  } else {
    const patientsData = [
      {
        firstName: 'Juan',
        lastName: 'Pérez',
        dateOfBirth: new Date('1985-05-15'),
        gender: 'MALE',
        contactEmail: 'juan.perez@example.com',
        contactPhone: '+56912345678',
        address: 'Av. Providencia 1234, Santiago',
        emergencyContactName: 'María Pérez',
        emergencyContactPhone: '+56987654321',
        occupation: 'Ingeniero',
        maritalStatus: 'MARRIED',
        insuranceProvider: 'Fonasa',
        insuranceNumber: '12345678',
        educationLevel: 'UNIVERSITY',
        createdById: adminUser.id, // Use adminUser from this script
      },
      {
        firstName: 'María',
        lastName: 'González',
        dateOfBirth: new Date('1990-10-20'),
        gender: 'FEMALE',
        contactEmail: 'maria.gonzalez@example.com',
        contactPhone: '+56923456789',
        address: 'Calle Los Leones 567, Providencia',
        emergencyContactName: 'Pedro González',
        emergencyContactPhone: '+56976543210',
        occupation: 'Profesora',
        maritalStatus: 'SINGLE',
        insuranceProvider: 'Isapre',
        insuranceNumber: '87654321',
        educationLevel: 'UNIVERSITY',
        createdById: adminUser.id, // Use adminUser from this script
      },
      // Add the other patients from seed-patients.ts here, ensuring createdById points to adminUser.id
       {
        firstName: 'Carlos',
        lastName: 'Rodríguez',
        dateOfBirth: new Date('1978-03-25'),
        gender: 'MALE',
        contactEmail: 'carlos.rodriguez@example.com',
        contactPhone: '+56934567890',
        address: 'Av. Las Condes 789, Las Condes',
        emergencyContactName: 'Ana Rodríguez',
        emergencyContactPhone: '+56965432109',
        occupation: 'Abogado',
        maritalStatus: 'DIVORCED',
        insuranceProvider: 'Fonasa',
        insuranceNumber: '23456789',
        educationLevel: 'UNIVERSITY',
        createdById: adminUser.id,
      },
      {
        firstName: 'Ana',
        lastName: 'Martínez',
        dateOfBirth: new Date('1995-07-10'),
        gender: 'FEMALE',
        contactEmail: 'ana.martinez@example.com',
        contactPhone: '+56945678901',
        address: 'Calle Apoquindo 123, Las Condes',
        emergencyContactName: 'Luis Martínez',
        emergencyContactPhone: '+56954321098',
        occupation: 'Estudiante',
        maritalStatus: 'SINGLE',
        insuranceProvider: 'Isapre',
        insuranceNumber: '34567890',
        educationLevel: 'UNIVERSITY',
        createdById: adminUser.id,
      },
      {
        firstName: 'Pedro',
        lastName: 'López',
        dateOfBirth: new Date('1982-12-05'),
        gender: 'MALE',
        contactEmail: 'pedro.lopez@example.com',
        contactPhone: '+56956789012',
        address: 'Av. Vitacura 456, Vitacura',
        emergencyContactName: 'Laura López',
        emergencyContactPhone: '+56943210987',
        occupation: 'Médico',
        maritalStatus: 'MARRIED',
        insuranceProvider: 'Isapre',
        insuranceNumber: '45678901',
        educationLevel: 'UNIVERSITY',
        createdById: adminUser.id,
      },
    ];

    let createdCount = 0;
    for (const patientData of patientsData) {
      try {
        await prisma.patient.create({ data: patientData });
        console.log(`  Created patient: ${patientData.firstName} ${patientData.lastName}`);
        createdCount++;
      } catch (error: any) {
         if (error.code === 'P2002' && error.meta?.target?.includes('contactEmail')) {
           // Unique constraint failed, likely email already exists
           console.warn(`  Patient with email ${patientData.contactEmail} already exists. Skipping.`);
         } else {
           // Re-throw other errors
           throw error;
         }
      }
    }
  }
// --- END PATIENT SEEDING ---

// --- BEGIN APPOINTMENT AND MESSAGE SEEDING ---
console.log('\nSeeding appointments y mensajes...');

// Get all patients and users
const patients = await prisma.patient.findMany();
const users = await prisma.user.findMany();
if (patients.length > 0 && users.length > 0) {
  // Seed appointments (citas)
  for (const patient of patients) {
    const appointmentDate = new Date(Date.now() + Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000); // Entre hoy y 7 días más
    const appointmentEndTime = new Date(appointmentDate.getTime() + 60 * 60 * 1000); // 1 hour after start

    await prisma.appointment.create({
      data: {
        patientId: patient.id,
        userId: patient.createdById,
        date: appointmentDate,
        endTime: appointmentEndTime,
        duration: 60, // 60 minutes
        title: 'Consulta Regular',
        status: 'SCHEDULED',
        notes: `Consulta de seguimiento para ${patient.firstName}`,
        isRecurring: false,
        reminderSent: false,
      }
    });
  }
  // Seed messages (mensajes)
  for (const patient of patients) {
    await prisma.message.create({
      data: {
        patientId: patient.id,
        userId: patient.createdById,
        content: `Hola ${patient.firstName}, su próxima cita está agendada. Por favor confirme su asistencia.`,
        sentAt: new Date(),
        read: false
      }
    });
    await prisma.message.create({
      data: {
        patientId: patient.id,
        userId: patient.createdById,
        content: (() => {
  switch (patient.firstName) {
    case 'Ana':
      return `Hola Ana, espero que hayas tenido una buena semana. ¿Te gustaría compartir cómo te has sentido últimamente?`;
    case 'Juan':
      return `Juan, recuerda que puedes escribirme si surge alguna inquietud antes de nuestra próxima sesión. ¡Estoy aquí para apoyarte!`;
    case 'Pedro':
      return `Pedro, ¿hubo algún avance o desafío que quieras comentar antes de vernos? Tu bienestar es importante para mí.`;
    case 'María':
      return `María, si necesitas conversar o compartir algo, no dudes en enviarme un mensaje. Nos vemos pronto.`;
    default:
      return `Estimado/a ${patient.firstName}, ¿cómo se ha sentido últimamente? Si desea, puede compartir cualquier experiencia o emoción antes de nuestra próxima sesión. Estoy aquí para acompañarle en su proceso.`;
  }
})(),
        sentAt: new Date(),
        read: false
      }
    });
  }
  console.log(`  Se crearon citas y mensajes para ${patients.length} pacientes.`);
}
// --- END APPOINTMENT AND MESSAGE SEEDING ---

console.log('\nSeed data creation process finished!')
}
main()
  .catch(e => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })