import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'
import { 
  sanitizePatientRecord, 
  sanitizeContactInfo, 
  sanitizeIdentifier 
} from '../lib/data-sanitization'

// Initialize Prisma Client
const prisma = new PrismaClient()

// Sample data for alpha testing
const evaluationAreas = [
  { id: 'cognitive', name: 'Cognitivo', description: 'Evaluación de funciones cognitivas' },
  { id: 'emotional', name: 'Emocional', description: 'Evaluación de regulación emocional' },
  { id: 'behavioral', name: 'Conductual', description: 'Evaluación de patrones de comportamiento' },
  { id: 'social', name: 'Social', description: 'Evaluación de habilidades sociales' },
  { id: 'developmental', name: 'Desarrollo', description: 'Evaluación de hitos del desarrollo' },
]

const icdCodes = [
  { 
    code: 'F32.1', 
    name: 'Episodio depresivo moderado', 
    description: 'Episodio depresivo en el que se presentan al menos dos síntomas típicos y al menos tres síntomas adicionales.',
    category: 'Trastornos del estado de ánimo',
    isActive: true
  },
  { 
    code: 'F41.1', 
    name: 'Trastorno de ansiedad generalizada', 
    description: 'Ansiedad generalizada y persistente que no está limitada a ninguna circunstancia ambiental en particular.',
    category: 'Trastornos de ansiedad',
    isActive: true
  },
  { 
    code: 'F43.1', 
    name: 'Trastorno de estrés post-traumático', 
    description: 'Trastorno que surge como respuesta tardía a un acontecimiento estresante o situación de naturaleza excepcionalmente amenazante o catastrófica.',
    category: 'Trastornos relacionados con el estrés',
    isActive: true
  },
]

async function main() {
  console.log('Starting alpha database seeding...')
  
  // Create a secure password hash for test users
  const passwordHash = await hash('AlphaTest123!', 10)
  
  // Create a test clinic
  const clinic = await prisma.clinic.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Clínica Alpha Test',
      address: sanitizeContactInfo('123 Calle Principal, Ciudad Test', 'address'),
      contactPhone: sanitizeContactInfo('+1 (555) 123-4567', 'phone'),
      contactEmail: sanitizeContactInfo('contacto@clinicaalphatest.com', 'email'),
      logoUrl: 'https://placehold.co/400x200?text=Alpha+Clinic',
      website: 'https://alpha.clinicatest.com',
      isActive: true
    }
  })
  
  console.log('Created test clinic:', clinic.name)
  
  // Create test users with different roles
  const admin = await prisma.user.upsert({
    where: { email: 'admin@alphatest.com' },
    update: {},
    create: {
      email: 'admin@alphatest.com',
      passwordHash: passwordHash,
      firstName: 'Admin',
      lastName: 'Test',
      role: 'ADMIN',
      clinicId: clinic.id,
      licenseNumber: sanitizeIdentifier('ADMIN-12345'),
      specialty: 'Administración',
      isActive: true
    }
  })
  
  const supervisor = await prisma.user.upsert({
    where: { email: 'supervisor@alphatest.com' },
    update: {},
    create: {
      email: 'supervisor@alphatest.com',
      passwordHash: passwordHash,
      firstName: 'Supervisor',
      lastName: 'Test',
      role: 'SUPERVISOR',
      clinicId: clinic.id,
      licenseNumber: sanitizeIdentifier('SUP-67890'),
      specialty: 'Supervisión Clínica',
      isActive: true
    }
  })
  
  const psychologist = await prisma.user.upsert({
    where: { email: 'psicologo@alphatest.com' },
    update: {},
    create: {
      email: 'psicologo@alphatest.com',
      passwordHash: passwordHash,
      firstName: 'Psicólogo',
      lastName: 'Test',
      role: 'PSYCHOLOGIST',
      clinicId: clinic.id,
      licenseNumber: sanitizeIdentifier('PSI-54321'),
      specialty: 'Psicología Clínica',
      isActive: true
    }
  })
  
  console.log('Created test users with roles:', admin.role, supervisor.role, psychologist.role)
  
  // Create test patients with sanitized data
  const testPatients = [
    {
      firstName: 'Juan',
      lastName: 'Pérez',
      dateOfBirth: new Date('1985-05-15'),
      gender: 'Masculino',
      contactEmail: 'juan.perez@example.com',
      contactPhone: '+1 (555) 987-6543',
      address: 'Av. Principal 123, Ciudad Test',
      emergencyContactName: 'María Pérez',
      emergencyContactPhone: '+1 (555) 456-7890',
      occupation: 'Ingeniero',
      maritalStatus: 'Casado',
      insuranceProvider: 'Seguro Alpha',
      insuranceNumber: 'INS-123456789',
      educationLevel: 'Universidad',
      createdById: psychologist.id
    },
    {
      firstName: 'Ana',
      lastName: 'García',
      dateOfBirth: new Date('1990-10-20'),
      gender: 'Femenino',
      contactEmail: 'ana.garcia@example.com',
      contactPhone: '+1 (555) 234-5678',
      address: 'Calle Secundaria 456, Ciudad Test',
      emergencyContactName: 'Carlos García',
      emergencyContactPhone: '+1 (555) 345-6789',
      occupation: 'Profesora',
      maritalStatus: 'Soltera',
      insuranceProvider: 'Seguro Beta',
      insuranceNumber: 'INS-987654321',
      educationLevel: 'Postgrado',
      createdById: psychologist.id
    }
  ]
  
  // Create sanitized patients
  const patients = await Promise.all(
    testPatients.map(patientData => {
      // Sanitize the patient data
      const sanitizedData = sanitizePatientRecord(patientData)
      
      // Use email for upsert condition and let Prisma generate the ID
      return prisma.patient.upsert({
        where: { 
          contactEmail: sanitizedData.contactEmail // Assuming contactEmail is unique
        },
        update: sanitizedData, // Update with sanitized data if found
        create: sanitizedData  // Create with sanitized data if not found (Prisma handles ID)
      })
    })
  )
  
  console.log(`Created ${patients.length} test patients with sanitized data`)
  
  // Seed evaluation areas
  await Promise.all(
    evaluationAreas.map(area =>
      prisma.evaluationArea.upsert({
        where: { id: area.id },
        update: {},
        create: area
      })
    )
  )
  
  console.log(`Created ${evaluationAreas.length} evaluation areas`)
  
  // Seed ICD codes
  await Promise.all(
    icdCodes.map(code =>
      prisma.iCDCriteria.upsert({
        where: { code: code.code },
        update: {},
        create: code
      })
    )
  )
  
  console.log(`Created ${icdCodes.length} ICD criteria codes`)
  
  // Create a test assessment
  const assessment = await prisma.assessment.create({
    data: {
      patientId: patients[0].id,
      clinicianId: psychologist.id,
      clinicId: clinic.id,
      status: 'IN_PROGRESS',
      consultationReasons: {
        create: [
          { reason: 'Dificultades para dormir' },
          { reason: 'Ansiedad social' }
        ]
      },
      evaluationAreas: {
        create: [
          { 
            areaId: 'emotional',
            notes: 'Presenta signos de ansiedad moderada en situaciones sociales.'
          },
          {
            areaId: 'behavioral',
            notes: 'Conductas de evitación en contextos sociales.'
          }
        ]
      },
      icdCriteria: {
        create: [
          {
            icdCode: 'F41.1',
            isPrimary: true,
            certaintyLevel: 'Alta',
            notes: 'Cumple criterios diagnósticos para TAG.'
          }
        ]
      }
    }
  })
  
  console.log('Created test assessment:', assessment.id)
  
  // Create a test clinical note
  const clinicalNote = await prisma.clinicalNote.create({
    data: {
      assessmentId: assessment.id,
      noteType: 'Sesión inicial',
      content: 'Paciente acude a consulta refiriendo dificultades para dormir y ansiedad en situaciones sociales. Se observa tensión muscular y habla acelerada. Se recomienda evaluación completa.',
      createdById: psychologist.id
    }
  })
  
  console.log('Created test clinical note')
  
  // Create a test report
  const report = await prisma.report.create({
    data: {
      assessmentId: assessment.id,
      reportText: 'INFORME PSICOLÓGICO\n\nDatos de identificación:\nPaciente: [Sanitized]\nEdad: [Sanitized]\nFecha de evaluación: [Date]\n\nMotivo de consulta:\nEl paciente acude a consulta por dificultades para dormir y ansiedad en situaciones sociales.\n\nTécnicas utilizadas:\n- Entrevista clínica\n- Observación conductual\n- Cuestionarios de ansiedad\n\nResultados:\nSe observan síntomas compatibles con un Trastorno de Ansiedad Generalizada (F41.1), con especial afectación en contextos sociales.\n\nConclusiones y recomendaciones:\nSe recomienda iniciar tratamiento psicoterapéutico enfocado en técnicas de control de ansiedad y exposición gradual a situaciones sociales.',
      createdById: psychologist.id,
      isFinal: false
    }
  })
  
  console.log('Created test report')
  
  // Create a test treatment plan
  const treatmentPlan = await prisma.treatmentPlan.create({
    data: {
      assessmentId: assessment.id,
      planText: 'PLAN DE TRATAMIENTO\n\n1. Psicoeducación sobre ansiedad (2 sesiones)\n2. Entrenamiento en técnicas de relajación (3 sesiones)\n3. Reestructuración cognitiva (4 sesiones)\n4. Exposición gradual a situaciones sociales (5 sesiones)\n5. Prevención de recaídas (2 sesiones)',
      startDate: new Date(),
      expectedDuration: '16 semanas',
      createdById: psychologist.id,
      status: 'active'
    }
  })
  
  console.log('Created test treatment plan')
  
  // Create test feedback entries
  const feedback = await prisma.feedback.create({
    data: {
      type: 'suggestion',
      text: 'Sería útil tener una opción para imprimir los informes directamente desde la plataforma.',
      url: '/reports',
      userId: psychologist.id,
      status: 'new'
    }
  })
  
  console.log('Created test feedback')
  
  console.log('Alpha database seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('Error seeding alpha database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
