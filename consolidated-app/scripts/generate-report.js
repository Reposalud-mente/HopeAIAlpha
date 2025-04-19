const { PrismaClient } = require('@prisma/client');
const path = require('path');
const fs = require('fs');

// This script is a temporary solution to test the AI report generator
// It will be replaced by the API endpoints in the future

// Initialize Prisma Client
const prisma = new PrismaClient();

// Create a simple mock AI report agent for testing
class MockAIReportAgent {
  async generateReport(request) {
    console.log('Generating mock report for assessment:', request.assessmentId);

    // Generate a simple mock report
    const reportText = `# INFORME DE EVALUACIÓN PSICOLÓGICA

## DATOS DE IDENTIFICACIÓN
**Paciente:** [Nombre del Paciente]
**Edad:** [Edad] años

## MOTIVO DE CONSULTA
El paciente acude por evaluación psicológica.

## ÁREAS EVALUADAS
Se evaluaron las siguientes áreas:
- Cognitiva
- Emocional
- Conductual

## DIAGNÓSTICO
**Diagnóstico Principal:**
Se observan características compatibles con los criterios diagnósticos.

## CONCLUSIONES
Basado en la evaluación realizada, se recomienda seguimiento terapéutico.

## RECOMENDACIONES
1. Psicoeducación
2. Terapia cognitivo-conductual
3. Seguimiento periódico

## PLAN DE TRATAMIENTO
1. Fase inicial (1-4 semanas)
2. Fase intermedia (5-12 semanas)
3. Fase de consolidación (13-20 semanas)

---

Este informe es de carácter confidencial.`;

    // Generate a mock report ID
    const reportId = `mock-${Date.now()}`;

    return {
      success: true,
      reportId,
      reportText,
    };
  }
}

async function main() {
  console.log('AI Report Generator Test Script');
  console.log('==============================');

  try {
    // Get the first assessment from the database
    let assessment = await prisma.assessment.findFirst({
      where: {
        status: 'IN_PROGRESS',
      },
      include: {
        patient: true,
        clinician: true,
      },
    });

    // If no assessment is found, try to find any patient and create a mock assessment
    if (!assessment) {
      console.log('No assessment found in the database. Creating a mock assessment...');

      // Find a patient
      const patient = await prisma.patient.findFirst();

      if (!patient) {
        console.error('No patients found in the database. Please create a patient first.');
        return;
      }

      // Find a clinician (user)
      const clinician = await prisma.user.findFirst({
        where: {
          role: 'PSYCHOLOGIST',
        },
      });

      if (!clinician) {
        console.error('No clinicians found in the database. Please create a clinician first.');
        return;
      }

      // Find a clinic
      const clinic = await prisma.clinic.findFirst();

      if (!clinic) {
        console.error('No clinics found in the database. Please create a clinic first.');
        return;
      }

      // Create a mock assessment object (not saving to database)
      assessment = {
        id: `mock-${Date.now()}`,
        patientId: patient.id,
        clinicianId: clinician.id,
        clinicId: clinic.id,
        status: 'IN_PROGRESS',
        createdAt: new Date(),
        updatedAt: new Date(),
        patient,
        clinician,
        clinic,
      };

      console.log('Created mock assessment for testing purposes.');
    }

    console.log(`Found assessment: ${assessment.id}`);
    console.log(`Patient: ${assessment.patient.firstName} ${assessment.patient.lastName}`);
    console.log(`Clinician: ${assessment.clinician.firstName} ${assessment.clinician.lastName}`);

    // Create a new instance of the mock AI report agent
    const aiReportAgent = new MockAIReportAgent();

    console.log('Generating report...');

    // Generate the report
    const result = await aiReportAgent.generateReport({
      assessmentId: assessment.id,
      userId: assessment.clinicianId,
      language: 'es',
      includeRecommendations: true,
      includeTreatmentPlan: true,
      reportStyle: 'clinical',
    });

    if (result.success) {
      console.log('Report generated successfully!');
      console.log(`Report ID: ${result.reportId}`);

      // Save the report to a file
      const reportFilePath = path.join(__dirname, '../reports', `report_${result.reportId}.md`);

      // Create the reports directory if it doesn't exist
      if (!fs.existsSync(path.join(__dirname, '../reports'))) {
        fs.mkdirSync(path.join(__dirname, '../reports'));
      }

      // Write the report to a file
      fs.writeFileSync(reportFilePath, result.reportText);

      console.log(`Report saved to: ${reportFilePath}`);
    } else {
      console.error(`Failed to generate report: ${result.error}`);
    }
  } catch (error) {
    console.error('Error generating report:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
