// CommonJS version of seed-reports.ts
const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');
const { format } = require('date-fns');
const { es } = require('date-fns/locale');

// Initialize Prisma Client
const prisma = new PrismaClient();

/**
 * Helper function to calculate age from date of birth
 */
function calculateAge(dateOfBirth) {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

/**
 * Generate a psychological evaluation report
 */
function generatePsychologicalEvaluationReport(patient, clinician, clinic) {
  const patientName = `${patient.firstName} ${patient.lastName}`;
  const patientAge = calculateAge(patient.dateOfBirth);
  const patientGender = patient.gender === 'MALE' ? 'masculino' : 'femenino';
  const clinicianName = clinician ? `${clinician.firstName} ${clinician.lastName}` : 'Dr. Psicólogo';
  const clinicName = clinic ? clinic.name : 'Clínica HopeAI';
  const currentDate = format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: es });

  // Simplified version for testing
  return `# INFORME DE EVALUACIÓN PSICOLÓGICA

## DATOS DE IDENTIFICACIÓN
**Paciente:** ${patientName}
**Edad:** ${patientAge} años
**Género:** ${patientGender}
**Fecha de evaluación:** ${currentDate}
**Psicólogo/a:** ${clinicianName}
**Centro:** ${clinicName}

## MOTIVO DE CONSULTA
Evaluación psicológica general.

## CONCLUSIONES
Este es un informe de prueba generado por el script de seed.`;
}

/**
 * Generate a therapeutic follow-up report
 */
function generateTherapeuticFollowupReport(patient, clinician, clinic) {
  const patientName = `${patient.firstName} ${patient.lastName}`;
  const patientAge = calculateAge(patient.dateOfBirth);
  const patientGender = patient.gender === 'MALE' ? 'masculino' : 'femenino';
  const clinicianName = clinician ? `${clinician.firstName} ${clinician.lastName}` : 'Dr. Psicólogo';
  const clinicName = clinic ? clinic.name : 'Clínica HopeAI';
  const currentDate = format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: es });

  // Simplified version for testing
  return `# INFORME DE SEGUIMIENTO TERAPÉUTICO

## DATOS DE IDENTIFICACIÓN
**Paciente:** ${patientName}
**Edad:** ${patientAge} años
**Género:** ${patientGender}
**Fecha del informe:** ${currentDate}
**Psicólogo/a:** ${clinicianName}
**Centro:** ${clinicName}

## INFORMACIÓN DEL TRATAMIENTO
**Fecha de inicio:** ${format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: es })}
**Número de sesiones realizadas:** 5
**Enfoque terapéutico:** Terapia Cognitivo-Conductual

## CONCLUSIONES
Este es un informe de seguimiento de prueba generado por el script de seed.`;
}

/**
 * Main function to seed reports
 */
async function main() {
  console.log('Starting reports seeding...');

  try {
    // Get all patients from the database
    const patients = await prisma.patient.findMany({
      include: {
        createdBy: true,
      }
    });

    if (patients.length === 0) {
      console.log('No patients found in the database. Please run the patient seed first.');
      return;
    }

    console.log(`Found ${patients.length} patients. Generating reports...`);

    // Get the clinic information
    const clinic = await prisma.clinic.findFirst();
    if (!clinic) {
      console.log('No clinic found in the database. Using default clinic information.');
    }

    // Count existing reports
    const existingReportsCount = await prisma.report.count();
    console.log(`Found ${existingReportsCount} existing reports.`);

    // Generate reports for each patient
    for (const patient of patients) {
      // Create a mock assessment for the patient if it doesn't exist
      let psychEvalAssessment = await prisma.assessment.findFirst({
        where: {
          patientId: patient.id,
          type: 'PSYCHOLOGICAL_EVALUATION'
        }
      });

      if (!psychEvalAssessment) {
        psychEvalAssessment = await prisma.assessment.create({
          data: {
            patientId: patient.id,
            clinicianId: patient.createdById,
            clinicId: clinic ? clinic.id : undefined,
            status: 'IN_PROGRESS',
            type: 'PSYCHOLOGICAL_EVALUATION'
          }
        });
        console.log(`Created new psychological evaluation assessment for patient ${patient.firstName} ${patient.lastName}`);
      }

      // Generate and create psychological evaluation report
      const psychEvalReportText = generatePsychologicalEvaluationReport(patient, patient.createdBy, clinic);

      await prisma.report.create({
        data: {
          assessmentId: psychEvalAssessment.id,
          reportText: psychEvalReportText,
          createdById: patient.createdById,
          version: 1,
          isFinal: true,
          filename: `Informe_Evaluacion_${patient.firstName}_${patient.lastName}_${new Date().toISOString().split('T')[0]}.pdf`,
        }
      });

      console.log(`Created psychological evaluation report for patient ${patient.firstName} ${patient.lastName}`);

      // Create a therapeutic follow-up assessment
      let followupAssessment = await prisma.assessment.findFirst({
        where: {
          patientId: patient.id,
          type: 'THERAPEUTIC_FOLLOWUP'
        }
      });

      if (!followupAssessment) {
        followupAssessment = await prisma.assessment.create({
          data: {
            patientId: patient.id,
            clinicianId: patient.createdById,
            clinicId: clinic ? clinic.id : undefined,
            status: 'IN_PROGRESS',
            type: 'THERAPEUTIC_FOLLOWUP'
          }
        });
        console.log(`Created new therapeutic follow-up assessment for patient ${patient.firstName} ${patient.lastName}`);
      }

      // Generate and create therapeutic follow-up report
      const followupReportText = generateTherapeuticFollowupReport(patient, patient.createdBy, clinic);

      await prisma.report.create({
        data: {
          assessmentId: followupAssessment.id,
          reportText: followupReportText,
          createdById: patient.createdById,
          version: 1,
          isFinal: true,
          filename: `Informe_Seguimiento_${patient.firstName}_${patient.lastName}_${new Date().toISOString().split('T')[0]}.pdf`,
        }
      });

      console.log(`Created therapeutic follow-up report for patient ${patient.firstName} ${patient.lastName}`);
    }

    console.log('Reports seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding reports:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the main function
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
