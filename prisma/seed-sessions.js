// JavaScript version of seed-sessions.ts for ESM compatibility
import { PrismaClient, SessionStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

// Helper function to create a random date within the last 3 months
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Helper function to get a random item from an array
function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Session types
const sessionTypes = [
  'initial_assessment',
  'follow_up',
  'therapy_session',
  'consultation',
  'crisis_intervention'
];

// Session statuses
const sessionStatuses = [
  SessionStatus.DRAFT,
  SessionStatus.SCHEDULED,
  SessionStatus.IN_PROGRESS,
  SessionStatus.COMPLETED,
  SessionStatus.CANCELLED,
  SessionStatus.NO_SHOW,
  SessionStatus.TRANSFERRED
];

// Sample objectives
const sampleObjectives = [
  {
    title: 'Reducir síntomas de ansiedad',
    description: 'Trabajar en técnicas de respiración y mindfulness para reducir la ansiedad',
    priority: 'high'
  },
  {
    title: 'Mejorar habilidades sociales',
    description: 'Practicar interacciones sociales en entornos controlados',
    priority: 'medium'
  },
  {
    title: 'Desarrollar estrategias de afrontamiento',
    description: 'Identificar y practicar estrategias saludables para manejar el estrés',
    priority: 'high'
  },
  {
    title: 'Establecer rutinas saludables',
    description: 'Crear y mantener rutinas de sueño, alimentación y ejercicio',
    priority: 'medium'
  },
  {
    title: 'Procesar experiencias traumáticas',
    description: 'Utilizar técnicas de EMDR para procesar experiencias traumáticas',
    priority: 'high'
  }
];

// Sample activities
const sampleActivities = [
  {
    title: 'Ejercicio de respiración diafragmática',
    description: 'Practicar respiración profunda durante 5 minutos',
    duration: 10,
    materials: ['Cronómetro', 'Espacio tranquilo']
  },
  {
    title: 'Registro de pensamientos automáticos',
    description: 'Identificar y registrar pensamientos negativos automáticos',
    duration: 15,
    materials: ['Hoja de registro', 'Bolígrafo']
  },
  {
    title: 'Juego de roles para situaciones sociales',
    description: 'Practicar respuestas asertivas en situaciones sociales difíciles',
    duration: 20,
    materials: ['Escenarios escritos', 'Sillas']
  },
  {
    title: 'Técnica de relajación muscular progresiva',
    description: 'Tensar y relajar grupos musculares secuencialmente',
    duration: 15,
    materials: ['Colchoneta', 'Música relajante']
  },
  {
    title: 'Visualización guiada',
    description: 'Imaginar un lugar seguro y tranquilo con todos los sentidos',
    duration: 10,
    materials: ['Guión de visualización']
  }
];

// Sample notes
const sampleNotes = [
  'El paciente muestra avances significativos en el manejo de su ansiedad. Ha estado practicando las técnicas de respiración diariamente y reporta una reducción en la frecuencia de ataques de pánico.',
  'Se observa resistencia a hablar sobre temas familiares. Cuando se menciona a su padre, el paciente cambia de tema o responde con monosílabos. Será importante explorar esta dinámica en futuras sesiones.',
  'La paciente ha completado con éxito su exposición gradual a situaciones sociales. Reporta menor ansiedad anticipatoria y ha podido asistir a una reunión social sin experimentar síntomas intensos de ansiedad.',
  'Se trabajó en la identificación de distorsiones cognitivas. El paciente pudo reconocer su tendencia a la catastrofización y comenzamos a desarrollar pensamientos alternativos más realistas.',
  'La paciente reporta dificultades para mantener la rutina de sueño establecida. Exploramos barreras y ajustamos el plan para hacerlo más realista considerando su horario laboral variable.',
  'Hoy trabajamos en técnicas de mindfulness para manejar los pensamientos intrusivos. El paciente mostró buena receptividad y pudo practicar la técnica de observación de pensamientos sin juzgar.',
  'Se realizó una sesión de EMDR enfocada en el accidente de tráfico. El paciente procesó recuerdos traumáticos con menor activación emocional que en sesiones anteriores.',
  'Revisamos el registro de estado de ánimo de las últimas dos semanas. Se observa una tendencia positiva, con menos días de ánimo deprimido y mayor estabilidad emocional.'
];

// Sample AI suggestions
const sampleAISuggestions = [
  {
    id: uuidv4(),
    content: 'Considerar la inclusión de técnicas de exposición gradual para el manejo de la ansiedad social',
    type: 'activity',
    status: 'pending',
    createdAt: new Date().toISOString(),
    auditTrail: [
      {
        action: 'created',
        timestamp: new Date().toISOString()
      }
    ]
  },
  {
    id: uuidv4(),
    content: 'Explorar posibles patrones de evitación relacionados con situaciones académicas',
    type: 'note',
    status: 'accepted',
    createdAt: new Date().toISOString(),
    auditTrail: [
      {
        action: 'created',
        timestamp: new Date().toISOString()
      },
      {
        action: 'accepted',
        timestamp: new Date().toISOString()
      }
    ]
  },
  {
    id: uuidv4(),
    content: 'Objetivo sugerido: Desarrollar habilidades de comunicación asertiva en el entorno familiar',
    type: 'objective',
    status: 'rejected',
    createdAt: new Date().toISOString(),
    auditTrail: [
      {
        action: 'created',
        timestamp: new Date().toISOString()
      },
      {
        action: 'rejected',
        timestamp: new Date().toISOString(),
        content: 'No es una prioridad en este momento'
      }
    ]
  }
];

// Sample attachments
const sampleAttachments = [
  {
    id: uuidv4(),
    name: 'Registro de pensamientos.pdf',
    type: 'application/pdf',
    url: '/uploads/registro_pensamientos.pdf',
    uploadedAt: new Date().toISOString()
  },
  {
    id: uuidv4(),
    name: 'Plan de exposición.docx',
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    url: '/uploads/plan_exposicion.docx',
    uploadedAt: new Date().toISOString()
  },
  {
    id: uuidv4(),
    name: 'Resultados test ansiedad.jpg',
    type: 'image/jpeg',
    url: '/uploads/resultados_test.jpg',
    uploadedAt: new Date().toISOString()
  }
];

async function seedSessions() {
  try {
    // First, check if we have users and patients in the database
    const usersCount = await prisma.user.count();
    const patientsCount = await prisma.patient.count();

    if (usersCount === 0 || patientsCount === 0) {
      console.log('Please seed users and patients first before seeding sessions');
      return;
    }

    // Get all users with role PSYCHOLOGIST
    const clinicians = await prisma.user.findMany({
      where: {
        role: 'PSYCHOLOGIST'
      }
    });

    if (clinicians.length === 0) {
      console.log('No clinicians found. Please seed users with PSYCHOLOGIST role first');
      return;
    }

    // Get all patients
    const patients = await prisma.patient.findMany();

    if (patients.length === 0) {
      console.log('No patients found. Please seed patients first');
      return;
    }

    console.log(`Found ${clinicians.length} clinicians and ${patients.length} patients`);

    // Delete existing sessions
    const deletedSessions = await prisma.session.deleteMany({});
    console.log(`Deleted ${deletedSessions.count} existing sessions`);

    // Create 20 sessions
    const sessionsToCreate = 20;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 3); // 3 months ago

    const sessionPromises = Array.from({ length: sessionsToCreate }).map(async (_, index) => {
      const patient = getRandomItem(patients);
      const clinician = getRandomItem(clinicians);
      const sessionType = getRandomItem(sessionTypes);
      const status = getRandomItem(sessionStatuses);
      const createdAt = randomDate(startDate, endDate);
      const updatedAt = new Date(createdAt);
      updatedAt.setHours(updatedAt.getHours() + Math.random() * 48); // Update within 48 hours

      // Randomly select 1-3 objectives
      const objectives = Array.from({ length: Math.floor(Math.random() * 3) + 1 }).map(() =>
        getRandomItem(sampleObjectives)
      );

      // Randomly select 1-3 activities
      const activities = Array.from({ length: Math.floor(Math.random() * 3) + 1 }).map(() =>
        getRandomItem(sampleActivities)
      );

      // Randomly select a note
      const notes = getRandomItem(sampleNotes);

      // Randomly decide if we include AI suggestions and attachments
      const includeAISuggestions = Math.random() > 0.5;
      const includeAttachments = Math.random() > 0.5;

      return prisma.session.create({
        data: {
          patientId: patient.id,
          clinicianId: clinician.id,
          type: sessionType,
          status,
          notes,
          objectives: JSON.stringify(objectives),
          activities: JSON.stringify(activities),
          aiSuggestions: includeAISuggestions ? JSON.stringify(sampleAISuggestions) : null,
          attachments: includeAttachments ? JSON.stringify(sampleAttachments) : null,
          createdAt,
          updatedAt
        }
      });
    });

    const createdSessions = await Promise.all(sessionPromises);
    console.log(`Created ${createdSessions.length} sessions`);

    return createdSessions;
  } catch (error) {
    console.error('Error seeding sessions:', error);
    throw error;
  }
}

// Main execution
seedSessions()
  .then(async () => {
    console.log('Sessions seeding completed successfully');
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
// JavaScript version of seed-sessions.ts for ESM compatibility
import { PrismaClient, SessionStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

// Helper function to create a random date within the last 3 months
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Helper function to get a random item from an array
function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Session types
const sessionTypes = [
  'initial_assessment',
  'follow_up',
  'therapy_session',
  'consultation',
  'crisis_intervention'
];

// Session statuses
const sessionStatuses = [
  SessionStatus.DRAFT,
  SessionStatus.SCHEDULED,
  SessionStatus.IN_PROGRESS,
  SessionStatus.COMPLETED,
  SessionStatus.CANCELLED,
  SessionStatus.NO_SHOW,
  SessionStatus.TRANSFERRED
];

// Sample objectives
const sampleObjectives = [
  {
    title: 'Reducir síntomas de ansiedad',
    description: 'Trabajar en técnicas de respiración y mindfulness para reducir la ansiedad',
    priority: 'high'
  },
  {
    title: 'Mejorar habilidades sociales',
    description: 'Practicar interacciones sociales en entornos controlados',
    priority: 'medium'
  },
  {
    title: 'Desarrollar estrategias de afrontamiento',
    description: 'Identificar y practicar estrategias saludables para manejar el estrés',
    priority: 'high'
  },
  {
    title: 'Establecer rutinas saludables',
    description: 'Crear y mantener rutinas de sueño, alimentación y ejercicio',
    priority: 'medium'
  },
  {
    title: 'Procesar experiencias traumáticas',
    description: 'Utilizar técnicas de EMDR para procesar experiencias traumáticas',
    priority: 'high'
  }
];

// Sample activities
const sampleActivities = [
  {
    title: 'Ejercicio de respiración diafragmática',
    description: 'Practicar respiración profunda durante 5 minutos',
    duration: 10,
    materials: ['Cronómetro', 'Espacio tranquilo']
  },
  {
    title: 'Registro de pensamientos automáticos',
    description: 'Identificar y registrar pensamientos negativos automáticos',
    duration: 15,
    materials: ['Hoja de registro', 'Bolígrafo']
  },
  {
    title: 'Juego de roles para situaciones sociales',
    description: 'Practicar respuestas asertivas en situaciones sociales difíciles',
    duration: 20,
    materials: ['Escenarios escritos', 'Sillas']
  },
  {
    title: 'Técnica de relajación muscular progresiva',
    description: 'Tensar y relajar grupos musculares secuencialmente',
    duration: 15,
    materials: ['Colchoneta', 'Música relajante']
  },
  {
    title: 'Visualización guiada',
    description: 'Imaginar un lugar seguro y tranquilo con todos los sentidos',
    duration: 10,
    materials: ['Guión de visualización']
  }
];

// Sample notes
const sampleNotes = [
  'El paciente muestra avances significativos en el manejo de su ansiedad. Ha estado practicando las técnicas de respiración diariamente y reporta una reducción en la frecuencia de ataques de pánico.',
  'Se observa resistencia a hablar sobre temas familiares. Cuando se menciona a su padre, el paciente cambia de tema o responde con monosílabos. Será importante explorar esta dinámica en futuras sesiones.',
  'La paciente ha completado con éxito su exposición gradual a situaciones sociales. Reporta menor ansiedad anticipatoria y ha podido asistir a una reunión social sin experimentar síntomas intensos de ansiedad.',
  'Se trabajó en la identificación de distorsiones cognitivas. El paciente pudo reconocer su tendencia a la catastrofización y comenzamos a desarrollar pensamientos alternativos más realistas.',
  'La paciente reporta dificultades para mantener la rutina de sueño establecida. Exploramos barreras y ajustamos el plan para hacerlo más realista considerando su horario laboral variable.',
  'Hoy trabajamos en técnicas de mindfulness para manejar los pensamientos intrusivos. El paciente mostró buena receptividad y pudo practicar la técnica de observación de pensamientos sin juzgar.',
  'Se realizó una sesión de EMDR enfocada en el accidente de tráfico. El paciente procesó recuerdos traumáticos con menor activación emocional que en sesiones anteriores.',
  'Revisamos el registro de estado de ánimo de las últimas dos semanas. Se observa una tendencia positiva, con menos días de ánimo deprimido y mayor estabilidad emocional.'
];

// Sample AI suggestions
const sampleAISuggestions = [
  {
    id: uuidv4(),
    content: 'Considerar la inclusión de técnicas de exposición gradual para el manejo de la ansiedad social',
    type: 'activity',
    status: 'pending',
    createdAt: new Date().toISOString(),
    auditTrail: [
      {
        action: 'created',
        timestamp: new Date().toISOString()
      }
    ]
  },
  {
    id: uuidv4(),
    content: 'Explorar posibles patrones de evitación relacionados con situaciones académicas',
    type: 'note',
    status: 'accepted',
    createdAt: new Date().toISOString(),
    auditTrail: [
      {
        action: 'created',
        timestamp: new Date().toISOString()
      },
      {
        action: 'accepted',
        timestamp: new Date().toISOString()
      }
    ]
  },
  {
    id: uuidv4(),
    content: 'Objetivo sugerido: Desarrollar habilidades de comunicación asertiva en el entorno familiar',
    type: 'objective',
    status: 'rejected',
    createdAt: new Date().toISOString(),
    auditTrail: [
      {
        action: 'created',
        timestamp: new Date().toISOString()
      },
      {
        action: 'rejected',
        timestamp: new Date().toISOString(),
        content: 'No es una prioridad en este momento'
      }
    ]
  }
];

// Sample attachments
const sampleAttachments = [
  {
    id: uuidv4(),
    name: 'Registro de pensamientos.pdf',
    type: 'application/pdf',
    url: '/uploads/registro_pensamientos.pdf',
    uploadedAt: new Date().toISOString()
  },
  {
    id: uuidv4(),
    name: 'Plan de exposición.docx',
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    url: '/uploads/plan_exposicion.docx',
    uploadedAt: new Date().toISOString()
  },
  {
    id: uuidv4(),
    name: 'Resultados test ansiedad.jpg',
    type: 'image/jpeg',
    url: '/uploads/resultados_test.jpg',
    uploadedAt: new Date().toISOString()
  }
];

async function seedSessions() {
  try {
    // First, check if we have users and patients in the database
    const usersCount = await prisma.user.count();
    const patientsCount = await prisma.patient.count();

    if (usersCount === 0 || patientsCount === 0) {
      console.log('Please seed users and patients first before seeding sessions');
      return;
    }

    // Get all users with role PSYCHOLOGIST
    const clinicians = await prisma.user.findMany({
      where: {
        role: 'PSYCHOLOGIST'
      }
    });

    if (clinicians.length === 0) {
      console.log('No clinicians found. Please seed users with PSYCHOLOGIST role first');
      return;
    }

    // Get all patients
    const patients = await prisma.patient.findMany();

    if (patients.length === 0) {
      console.log('No patients found. Please seed patients first');
      return;
    }

    console.log(`Found ${clinicians.length} clinicians and ${patients.length} patients`);

    // Delete existing sessions
    const deletedSessions = await prisma.session.deleteMany({});
    console.log(`Deleted ${deletedSessions.count} existing sessions`);

    // Create 20 sessions
    const sessionsToCreate = 20;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 3); // 3 months ago

    const sessionPromises = Array.from({ length: sessionsToCreate }).map(async (_, index) => {
      const patient = getRandomItem(patients);
      const clinician = getRandomItem(clinicians);
      const sessionType = getRandomItem(sessionTypes);
      const status = getRandomItem(sessionStatuses);
      const createdAt = randomDate(startDate, endDate);
      const updatedAt = new Date(createdAt);
      updatedAt.setHours(updatedAt.getHours() + Math.random() * 48); // Update within 48 hours

      // Randomly select 1-3 objectives
      const objectives = Array.from({ length: Math.floor(Math.random() * 3) + 1 }).map(() =>
        getRandomItem(sampleObjectives)
      );

      // Randomly select 1-3 activities
      const activities = Array.from({ length: Math.floor(Math.random() * 3) + 1 }).map(() =>
        getRandomItem(sampleActivities)
      );

      // Randomly select a note
      const notes = getRandomItem(sampleNotes);

      // Randomly decide if we include AI suggestions and attachments
      const includeAISuggestions = Math.random() > 0.5;
      const includeAttachments = Math.random() > 0.5;

      return prisma.session.create({
        data: {
          patientId: patient.id,
          clinicianId: clinician.id,
          type: sessionType,
          status,
          notes,
          objectives: JSON.stringify(objectives),
          activities: JSON.stringify(activities),
          aiSuggestions: includeAISuggestions ? JSON.stringify(sampleAISuggestions) : null,
          attachments: includeAttachments ? JSON.stringify(sampleAttachments) : null,
          createdAt,
          updatedAt
        }
      });
    });

    const createdSessions = await Promise.all(sessionPromises);
    console.log(`Created ${createdSessions.length} sessions`);

    return createdSessions;
  } catch (error) {
    console.error('Error seeding sessions:', error);
    throw error;
  }
}

// Main execution
seedSessions()
  .then(async () => {
    console.log('Sessions seeding completed successfully');
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
