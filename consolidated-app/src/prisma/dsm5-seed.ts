import { PrismaClient } from '@prisma/client';

// Initialize Prisma Client
const prisma = new PrismaClient();

// DSM-5 criteria data
const dsm5Criteria = [
  // Anxiety disorders
  {
    code: '300.02',
    name: 'Trastorno de ansiedad generalizada',
    description: 'Ansiedad y preocupación excesivas sobre una amplia gama de acontecimientos o actividades.',
    category: 'Trastornos de ansiedad',
    icdEquivalent: '6B00'
  },
  {
    code: '300.01',
    name: 'Trastorno de pánico',
    description: 'Ataques de pánico recurrentes e inesperados con preocupación persistente.',
    category: 'Trastornos de ansiedad',
    icdEquivalent: '6B01'
  },
  {
    code: '300.23',
    name: 'Trastorno de ansiedad social',
    description: 'Miedo o ansiedad intensos en situaciones sociales donde la persona está expuesta al escrutinio de los demás.',
    category: 'Trastornos de ansiedad',
    icdEquivalent: '6B04'
  },
  
  // Mood disorders
  {
    code: '296.2x',
    name: 'Trastorno depresivo mayor, episodio único',
    description: 'Episodio depresivo caracterizado por estado de ánimo deprimido y pérdida de interés o placer.',
    category: 'Trastornos depresivos',
    icdEquivalent: '6A70'
  },
  {
    code: '296.3x',
    name: 'Trastorno depresivo mayor, recurrente',
    description: 'Episodios depresivos recurrentes caracterizados por estado de ánimo deprimido y pérdida de interés o placer.',
    category: 'Trastornos depresivos',
    icdEquivalent: '6A71'
  },
  {
    code: '300.4',
    name: 'Trastorno depresivo persistente (Distimia)',
    description: 'Estado de ánimo deprimido crónico que ocurre la mayor parte del día durante al menos 2 años.',
    category: 'Trastornos depresivos',
    icdEquivalent: '6A72'
  },
  
  // Neurodevelopmental disorders
  {
    code: '317-319',
    name: 'Discapacidad intelectual',
    description: 'Déficits en el funcionamiento intelectual y en el comportamiento adaptativo.',
    category: 'Trastornos del neurodesarrollo',
    icdEquivalent: '6A00'
  },
  {
    code: '299.00',
    name: 'Trastorno del espectro autista',
    description: 'Déficits persistentes en la comunicación e interacción social, junto con patrones restrictivos y repetitivos de comportamiento.',
    category: 'Trastornos del neurodesarrollo',
    icdEquivalent: '6A02'
  },
  {
    code: '314.01',
    name: 'Trastorno por déficit de atención con hiperactividad',
    description: 'Patrón persistente de inatención y/o hiperactividad-impulsividad que interfiere con el funcionamiento o desarrollo.',
    category: 'Trastornos del neurodesarrollo',
    icdEquivalent: '6A05'
  },
  
  // Psychotic disorders
  {
    code: '295.90',
    name: 'Esquizofrenia',
    description: 'Trastorno caracterizado por delirios, alucinaciones, habla desorganizada, comportamiento desorganizado o catatónico y síntomas negativos.',
    category: 'Espectro de la esquizofrenia y otros trastornos psicóticos',
    icdEquivalent: '6A20'
  },
  {
    code: '295.70',
    name: 'Trastorno esquizoafectivo',
    description: 'Episodio de alteración del estado de ánimo junto con síntomas del criterio A de esquizofrenia.',
    category: 'Espectro de la esquizofrenia y otros trastornos psicóticos',
    icdEquivalent: '6A21'
  },
  
  // Trauma and stressor-related disorders
  {
    code: '309.81',
    name: 'Trastorno de estrés postraumático',
    description: 'Desarrollo de síntomas característicos después de la exposición a uno o más eventos traumáticos.',
    category: 'Trastornos relacionados con traumas y factores de estrés',
    icdEquivalent: '6B40'
  },
  {
    code: '309.0',
    name: 'Trastorno de adaptación',
    description: 'Desarrollo de síntomas emocionales o comportamentales en respuesta a un estresante identificable.',
    category: 'Trastornos relacionados con traumas y factores de estrés',
    icdEquivalent: '6B43'
  }
];

async function main() {
  console.log('Starting DSM-5 criteria seeding...');
  
  // Seed DSM-5 criteria
  for (const criteria of dsm5Criteria) {
    await prisma.dSM5Criteria.upsert({
      where: { code: criteria.code },
      update: criteria,
      create: criteria,
    });
  }
  
  console.log(`Seeded ${dsm5Criteria.length} DSM-5 criteria`);
  console.log('DSM-5 criteria seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding DSM-5 criteria:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
