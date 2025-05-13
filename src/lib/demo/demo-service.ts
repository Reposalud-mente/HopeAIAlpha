/**
 * Demo Mode Service
 * 
 * This service handles the creation and management of demo data for alpha testing.
 * It provides functions to check if a user needs demo data and to populate demo data.
 */

import { PrismaClient, User, Patient, Assessment, Appointment } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { trackEvent, EventType } from '@/lib/monitoring';

// Constants
const DEMO_INDICATOR = '[DEMO]'; // Prefix for demo patient names to make them easily identifiable
const DEMO_PATIENTS_COUNT = 5; // Number of demo patients to create per user

/**
 * Check if a user needs demo data
 * 
 * @param userId The ID of the user to check
 * @returns True if the user needs demo data, false otherwise
 */
export async function userNeedsDemoData(userId: string): Promise<boolean> {
  try {
    // Check if the user has any patients
    const patientCount = await prisma.patient.count({
      where: {
        createdById: userId,
      },
    });

    // Check if the user has any demo patients
    const demoPatientCount = await prisma.patient.count({
      where: {
        createdById: userId,
        firstName: {
          startsWith: DEMO_INDICATOR,
        },
      },
    });

    // User needs demo data if they have no patients or only have demo patients
    return patientCount === 0 || (patientCount > 0 && patientCount === demoPatientCount);
  } catch (error) {
    console.error('Error checking if user needs demo data:', error);
    trackEvent({
      type: EventType.ERROR,
      name: 'demo_check_error',
      data: {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });
    return false;
  }
}

/**
 * Create demo patients for a user
 * 
 * @param userId The ID of the user to create demo patients for
 * @returns The created demo patients
 */
export async function createDemoPatients(userId: string): Promise<Patient[]> {
  try {
    // Check if the user already has demo patients
    const existingDemoPatients = await prisma.patient.findMany({
      where: {
        createdById: userId,
        firstName: {
          startsWith: DEMO_INDICATOR,
        },
      },
    });

    // If the user already has demo patients, return them
    if (existingDemoPatients.length > 0) {
      return existingDemoPatients;
    }

    // Create demo patients
    const demoPatients = await Promise.all(
      getDemoPatientData(userId).map(async (patientData) => {
        return prisma.patient.create({
          data: patientData,
        });
      })
    );

    // Track the event
    trackEvent({
      type: EventType.USER_ACTION,
      name: 'demo_patients_created',
      data: {
        userId,
        count: demoPatients.length,
      },
    });

    return demoPatients;
  } catch (error) {
    console.error('Error creating demo patients:', error);
    trackEvent({
      type: EventType.ERROR,
      name: 'demo_patients_creation_error',
      data: {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });
    return [];
  }
}

/**
 * Create demo assessments for a patient
 * 
 * @param patientId The ID of the patient to create assessments for
 * @param userId The ID of the user creating the assessments
 * @param clinicId The ID of the clinic
 * @returns The created assessments
 */
export async function createDemoAssessments(
  patientId: string,
  userId: string,
  clinicId: string
): Promise<Assessment[]> {
  try {
    // Create 1-2 assessments per patient
    const assessmentCount = Math.floor(Math.random() * 2) + 1;
    const assessments: Assessment[] = [];

    for (let i = 0; i < assessmentCount; i++) {
      const assessment = await prisma.assessment.create({
        data: {
          patientId,
          clinicianId: userId,
          clinicId,
          assessmentDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000), // Random date in the last 30 days
          status: 'IN_PROGRESS',
          type: 'PSYCHOLOGICAL_EVALUATION',
        },
      });
      assessments.push(assessment);
    }

    return assessments;
  } catch (error) {
    console.error('Error creating demo assessments:', error);
    trackEvent({
      type: EventType.ERROR,
      name: 'demo_assessments_creation_error',
      data: {
        patientId,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });
    return [];
  }
}

/**
 * Create demo appointments for a patient
 * 
 * @param patientId The ID of the patient to create appointments for
 * @param userId The ID of the user creating the appointments
 * @returns The created appointments
 */
export async function createDemoAppointments(
  patientId: string,
  userId: string
): Promise<Appointment[]> {
  try {
    // Create 1-3 appointments per patient
    const appointmentCount = Math.floor(Math.random() * 3) + 1;
    const appointments: Appointment[] = [];

    for (let i = 0; i < appointmentCount; i++) {
      // Create appointments in the future
      const appointmentDate = new Date();
      appointmentDate.setDate(appointmentDate.getDate() + Math.floor(Math.random() * 14) + 1); // 1-14 days in the future
      appointmentDate.setHours(9 + Math.floor(Math.random() * 8), 0, 0, 0); // Between 9 AM and 5 PM

      // Calculate end time (1 hour later)
      const endTime = new Date(appointmentDate);
      endTime.setHours(endTime.getHours() + 1);

      const appointment = await prisma.appointment.create({
        data: {
          patientId,
          userId,
          date: appointmentDate,
          endTime,
          status: 'SCHEDULED',
          title: 'Consulta de seguimiento',
          duration: 60,
          notes: 'Cita de seguimiento programada automáticamente (demo)',
        },
      });
      appointments.push(appointment);
    }

    return appointments;
  } catch (error) {
    console.error('Error creating demo appointments:', error);
    trackEvent({
      type: EventType.ERROR,
      name: 'demo_appointments_creation_error',
      data: {
        patientId,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });
    return [];
  }
}

/**
 * Get demo patient data
 * 
 * @param userId The ID of the user to create demo patients for
 * @returns An array of demo patient data
 */
function getDemoPatientData(userId: string): Array<any> {
  return [
    {
      firstName: `${DEMO_INDICATOR} Juan`,
      lastName: 'Pérez',
      dateOfBirth: new Date('1985-05-15'),
      gender: 'Masculino',
      contactEmail: `demo.juan.perez.${Date.now()}@example.com`,
      contactPhone: '+56912345678',
      address: 'Av. Providencia 1234, Santiago',
      emergencyContactName: 'María Pérez',
      emergencyContactPhone: '+56987654321',
      occupation: 'Ingeniero',
      maritalStatus: 'Casado',
      insuranceProvider: 'Fonasa',
      insuranceNumber: '12345678',
      educationLevel: 'Universidad',
      createdById: userId,
      isActive: true,
    },
    {
      firstName: `${DEMO_INDICATOR} María`,
      lastName: 'González',
      dateOfBirth: new Date('1990-10-20'),
      gender: 'Femenino',
      contactEmail: `demo.maria.gonzalez.${Date.now()}@example.com`,
      contactPhone: '+56923456789',
      address: 'Calle Los Leones 567, Providencia',
      emergencyContactName: 'Pedro González',
      emergencyContactPhone: '+56934567890',
      occupation: 'Profesora',
      maritalStatus: 'Soltera',
      insuranceProvider: 'Isapre',
      insuranceNumber: '87654321',
      educationLevel: 'Postgrado',
      createdById: userId,
      isActive: true,
    },
    {
      firstName: `${DEMO_INDICATOR} Carlos`,
      lastName: 'Rodríguez',
      dateOfBirth: new Date('1978-03-08'),
      gender: 'Masculino',
      contactEmail: `demo.carlos.rodriguez.${Date.now()}@example.com`,
      contactPhone: '+56934567890',
      address: 'Av. Las Condes 789, Las Condes',
      emergencyContactName: 'Ana Rodríguez',
      emergencyContactPhone: '+56945678901',
      occupation: 'Abogado',
      maritalStatus: 'Divorciado',
      insuranceProvider: 'Isapre',
      insuranceNumber: '23456789',
      educationLevel: 'Universidad',
      createdById: userId,
      isActive: true,
    },
    {
      firstName: `${DEMO_INDICATOR} Ana`,
      lastName: 'Martínez',
      dateOfBirth: new Date('1995-12-30'),
      gender: 'Femenino',
      contactEmail: `demo.ana.martinez.${Date.now()}@example.com`,
      contactPhone: '+56945678901',
      address: 'Calle Suecia 123, Providencia',
      emergencyContactName: 'Luis Martínez',
      emergencyContactPhone: '+56956789012',
      occupation: 'Diseñadora',
      maritalStatus: 'Soltera',
      insuranceProvider: 'Fonasa',
      insuranceNumber: '34567890',
      educationLevel: 'Técnico',
      createdById: userId,
      isActive: true,
    },
    {
      firstName: `${DEMO_INDICATOR} Pedro`,
      lastName: 'Sánchez',
      dateOfBirth: new Date('1982-07-22'),
      gender: 'Masculino',
      contactEmail: `demo.pedro.sanchez.${Date.now()}@example.com`,
      contactPhone: '+56956789012',
      address: 'Av. Apoquindo 456, Las Condes',
      emergencyContactName: 'Carmen Sánchez',
      emergencyContactPhone: '+56967890123',
      occupation: 'Médico',
      maritalStatus: 'Casado',
      insuranceProvider: 'Isapre',
      insuranceNumber: '45678901',
      educationLevel: 'Postgrado',
      createdById: userId,
      isActive: true,
    },
  ];
}
