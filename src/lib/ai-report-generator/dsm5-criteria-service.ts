import { prisma } from '@/lib/prisma';

/**
 * Interface for DSM-5 criteria
 * Note: This is a temporary solution until a proper DSM5Criteria model is added to the schema
 */
export interface DSM5Criteria {
  code: string;
  name: string;
  description: string;
  category: string;
  icdEquivalent?: string;
}

/**
 * Service to handle DSM-5 criteria
 * This is a temporary solution that maps ICD-11 codes to DSM-5 equivalents
 * In a production environment, you would have a proper DSM5Criteria model in the database
 */
export class DSM5CriteriaService {
  /**
   * Maps of ICD-11 codes to DSM-5 equivalents
   * This is a simplified mapping for demonstration purposes
   */
  private static readonly ICD_TO_DSM_MAPPING: Record<string, DSM5Criteria> = {
    // Anxiety disorders
    '6B00': {
      code: '300.02',
      name: 'Trastorno de ansiedad generalizada',
      description: 'Ansiedad y preocupación excesivas sobre una amplia gama de acontecimientos o actividades.',
      category: 'Trastornos de ansiedad',
      icdEquivalent: '6B00'
    },
    '6B01': {
      code: '300.01',
      name: 'Trastorno de pánico',
      description: 'Ataques de pánico recurrentes e inesperados con preocupación persistente.',
      category: 'Trastornos de ansiedad',
      icdEquivalent: '6B01'
    },

    // Mood disorders
    '6A70': {
      code: '296.2x',
      name: 'Trastorno depresivo mayor, episodio único',
      description: 'Episodio depresivo caracterizado por estado de ánimo deprimido y pérdida de interés o placer.',
      category: 'Trastornos depresivos',
      icdEquivalent: '6A70'
    },
    '6A71': {
      code: '296.3x',
      name: 'Trastorno depresivo mayor, recurrente',
      description: 'Episodios depresivos recurrentes caracterizados por estado de ánimo deprimido y pérdida de interés o placer.',
      category: 'Trastornos depresivos',
      icdEquivalent: '6A71'
    },

    // Neurodevelopmental disorders
    '6A00': {
      code: '317-319',
      name: 'Discapacidad intelectual',
      description: 'Déficits en el funcionamiento intelectual y en el comportamiento adaptativo.',
      category: 'Trastornos del neurodesarrollo',
      icdEquivalent: '6A00'
    },
    '6A01': {
      code: '299.00',
      name: 'Trastorno del espectro autista',
      description: 'Déficits persistentes en la comunicación e interacción social, junto con patrones restrictivos y repetitivos de comportamiento.',
      category: 'Trastornos del neurodesarrollo',
      icdEquivalent: '6A01'
    },

    // Psychotic disorders
    '6A20': {
      code: '295.90',
      name: 'Esquizofrenia',
      description: 'Trastorno caracterizado por delirios, alucinaciones, habla desorganizada, comportamiento desorganizado o catatónico y síntomas negativos.',
      category: 'Espectro de la esquizofrenia y otros trastornos psicóticos',
      icdEquivalent: '6A20'
    },
    '6A21': {
      code: '295.70',
      name: 'Trastorno esquizoafectivo',
      description: 'Episodio de alteración del estado de ánimo junto con síntomas del criterio A de esquizofrenia.',
      category: 'Espectro de la esquizofrenia y otros trastornos psicóticos',
      icdEquivalent: '6A21'
    },
  };

  /**
   * Gets DSM-5 criteria equivalent for an ICD-11 code
   * @param icdCode The ICD-11 code
   * @returns The equivalent DSM-5 criteria or undefined if not found
   */
  public static getDSM5EquivalentForICD(icdCode: string): DSM5Criteria | undefined {
    return this.ICD_TO_DSM_MAPPING[icdCode];
  }

  /**
   * Gets all DSM-5 criteria
   * @returns Array of all DSM-5 criteria
   */
  public static getAllDSM5Criteria(): DSM5Criteria[] {
    return Object.values(this.ICD_TO_DSM_MAPPING);
  }

  /**
   * Gets DSM-5 criteria by category
   * @returns Object with DSM-5 criteria grouped by category
   */
  public static getDSM5CriteriaByCategory(): Record<string, DSM5Criteria[]> {
    const criteria = this.getAllDSM5Criteria();

    // Group criteria by category
    return criteria.reduce((acc: Record<string, DSM5Criteria[]>, criterion: DSM5Criteria) => {
      if (!acc[criterion.category]) {
        acc[criterion.category] = [];
      }
      acc[criterion.category].push(criterion);
      return acc;
    }, {} as Record<string, DSM5Criteria[]>);
  }

  /**
   * Gets DSM-5 criteria for an assessment
   * @param assessmentId The assessment ID
   * @returns Array of DSM-5 criteria for the assessment
   */
  public static async getDSM5CriteriaForAssessment(assessmentId: string): Promise<DSM5Criteria[]> {
    // Get the ICD criteria for the assessment
    const assessmentICDCriteria = await prisma.assessmentICDCriteria.findMany({
      where: { assessmentId },
      include: {
        criteria: true,
      },
    });

    // Map to DSM-5 equivalents
    const dsm5Criteria = assessmentICDCriteria
      .map((icdCriteria: { icdCode: string }) => this.getDSM5EquivalentForICD(icdCriteria.icdCode))
      .filter((criteria: DSM5Criteria | undefined): criteria is DSM5Criteria => criteria !== undefined);

    return dsm5Criteria;
  }
}
