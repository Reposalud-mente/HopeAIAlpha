import { prisma } from '@/lib/prisma';

/**
 * Validates that all required database entities exist for report generation
 * @param assessmentId The ID of the assessment to validate
 * @returns An object containing validation results and any missing data
 */
export async function validateReportDataRequirements(assessmentId: string) {
  try {
    // Fetch the assessment with all related data needed for report generation
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        patient: true,
        clinician: true,
        clinic: true,
        consultationReasons: true,
        evaluationAreas: {
          include: {
            area: true,
          },
        },
        icdCriteria: {
          include: {
            criteria: true,
          },
        },
      },
    });

    if (!assessment) {
      return {
        isValid: false,
        missingData: ['assessment'],
        message: 'Assessment not found',
      };
    }

    // Check for required related data
    const missingData = [];

    if (!assessment.patient) {
      missingData.push('patient');
    }

    if (!assessment.clinician) {
      missingData.push('clinician');
    }

    if (!assessment.clinic) {
      missingData.push('clinic');
    }

    if (!assessment.consultationReasons || assessment.consultationReasons.length === 0) {
      missingData.push('consultationReasons');
    }

    if (!assessment.evaluationAreas || assessment.evaluationAreas.length === 0) {
      missingData.push('evaluationAreas');
    }

    if (!assessment.icdCriteria || assessment.icdCriteria.length === 0) {
      missingData.push('icdCriteria');
    }

    // Check if we have at least one primary diagnosis
    const hasPrimaryDiagnosis = assessment.icdCriteria.some(
      (criteria) => criteria.isPrimary
    );

    if (!hasPrimaryDiagnosis) {
      missingData.push('primaryDiagnosis');
    }

    return {
      isValid: missingData.length === 0,
      assessment,
      missingData,
      message: missingData.length > 0
        ? `Missing required data: ${missingData.join(', ')}`
        : 'All required data is available',
    };
  } catch (error) {
    console.error('Error validating report data requirements:', error);
    return {
      isValid: false,
      missingData: ['database_error'],
      message: `Database error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Checks if DSM-5 criteria are available in the database
 * @returns Boolean indicating if DSM-5 criteria are available
 */
export async function checkDSM5CriteriaAvailability() {
  try {
    // This is a placeholder - in a real implementation, you would check for DSM-5 criteria
    // Since the current schema only has ICDCriteria, we would need to extend it to include DSM5Criteria
    // For now, we'll just check if there are any ICD criteria as a proxy
    const criteriaCount = await prisma.iCDCriteria.count();
    
    return {
      isAvailable: criteriaCount > 0,
      count: criteriaCount,
    };
  } catch (error) {
    console.error('Error checking DSM-5 criteria availability:', error);
    return {
      isAvailable: false,
      error: `Database error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Retrieves all evaluation areas with their descriptions
 * @returns Array of evaluation areas
 */
export async function getEvaluationAreas() {
  try {
    return await prisma.evaluationArea.findMany({
      where: { isActive: true },
    });
  } catch (error) {
    console.error('Error fetching evaluation areas:', error);
    throw new Error(`Database error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Retrieves all ICD-11 criteria grouped by category
 * @returns Object with ICD-11 criteria grouped by category
 */
export async function getICDCriteriaByCategory() {
  try {
    const criteria = await prisma.iCDCriteria.findMany({
      where: { isActive: true },
    });

    // Group criteria by category
    const groupedCriteria = criteria.reduce((acc, criterion) => {
      if (!acc[criterion.category]) {
        acc[criterion.category] = [];
      }
      acc[criterion.category].push(criterion);
      return acc;
    }, {} as Record<string, typeof criteria>);

    return groupedCriteria;
  } catch (error) {
    console.error('Error fetching ICD criteria by category:', error);
    throw new Error(`Database error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
