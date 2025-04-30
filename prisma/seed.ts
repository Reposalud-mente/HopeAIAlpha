import { PrismaClient } from '@prisma/client';
import { seedSessions } from './seed-sessions';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Sample user data
const users = [
  {
    id: uuidv4(),
    email: 'doctor@example.com',
    firstName: 'Carlos',
    lastName: 'Rodríguez',
    role: 'CLINICIAN',
    password: bcrypt.hashSync('password123', 10),
  },
  {
    id: uuidv4(),
    email: 'admin@example.com',
    firstName: 'Ana',
    lastName: 'Martínez',
    role: 'ADMIN',
    password: bcrypt.hashSync('password123', 10),
  },
  {
    id: uuidv4(),
    email: 'therapist@example.com',
    firstName: 'Laura',
    lastName: 'Gómez',
    role: 'CLINICIAN',
    password: bcrypt.hashSync('password123', 10),
  },
];

// Sample patient data
const patients = [
  {
    id: uuidv4(),
    firstName: 'Juan',
    lastName: 'Pérez',
    dateOfBirth: new Date('1985-05-15'),
    gender: 'MALE',
    contactEmail: 'juan@example.com',
    contactPhone: '+34612345678',
  },
  {
    id: uuidv4(),
    firstName: 'María',
    lastName: 'González',
    dateOfBirth: new Date('1990-10-20'),
    gender: 'FEMALE',
    contactEmail: 'maria@example.com',
    contactPhone: '+34623456789',
  },
  {
    id: uuidv4(),
    firstName: 'Pedro',
    lastName: 'Sánchez',
    dateOfBirth: new Date('1978-03-08'),
    gender: 'MALE',
    contactEmail: 'pedro@example.com',
    contactPhone: '+34634567890',
  },
  {
    id: uuidv4(),
    firstName: 'Lucía',
    lastName: 'Fernández',
    dateOfBirth: new Date('1995-12-30'),
    gender: 'FEMALE',
    contactEmail: 'lucia@example.com',
    contactPhone: '+34645678901',
  },
  {
    id: uuidv4(),
    firstName: 'Miguel',
    lastName: 'Torres',
    dateOfBirth: new Date('1982-07-22'),
    gender: 'MALE',
    contactEmail: 'miguel@example.com',
    contactPhone: '+34656789012',
  },
];

async function main() {
  console.log('Starting seed...');

  // Clear existing data
  console.log('Clearing existing data...');
  await prisma.session.deleteMany({});
  await prisma.patient.deleteMany({});
  await prisma.user.deleteMany({});

  // Seed users
  console.log('Seeding users...');
  for (const user of users) {
    await prisma.user.create({
      data: user,
    });
  }
  console.log(`Created ${users.length} users`);

  // Seed patients
  console.log('Seeding patients...');
  for (const patient of patients) {
    // Assign a random clinician as the creator
    const clinicians = users.filter(u => u.role === 'CLINICIAN');
    const randomClinician = clinicians[Math.floor(Math.random() * clinicians.length)];

    await prisma.patient.create({
      data: {
        ...patient,
        createdById: randomClinician.id,
      },
    });
  }
  console.log(`Created ${patients.length} patients`);

  // Seed sessions
  console.log('Seeding sessions...');
  await seedSessions();

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
