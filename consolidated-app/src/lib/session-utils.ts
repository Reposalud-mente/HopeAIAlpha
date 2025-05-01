/**
 * Utility functions for session-related operations
 */

/**
 * Translates session type to Spanish and removes underscores
 * @param type The session type string
 * @returns Translated and formatted session type
 */
export const translateSessionType = (type: string): string => {
  if (!type) return '';

  // Replace underscores with spaces
  const withoutUnderscores = type.replace(/_/g, ' ');
  const lowerCaseType = withoutUnderscores.toLowerCase();

  // Uncomment for debugging if needed
  // console.log('Session type before translation:', type);
  // console.log('Without underscores:', withoutUnderscores);
  // console.log('Lowercase:', lowerCaseType);

  // Map of English session types to Spanish translations
  const translations: Record<string, string> = {
    // Common session types
    'crisis intervention': 'Intervención de crisis',
    'initial assessment': 'Evaluación inicial',
    'follow up': 'Seguimiento',
    'therapy': 'Terapia',
    'consultation': 'Consulta',
    'psychological evaluation': 'Evaluación psicológica',
    'family therapy': 'Terapia familiar',
    'group therapy': 'Terapia grupal',
    'couples therapy': 'Terapia de pareja',
    'discharge': 'Alta',

    // Additional variations that might be in the database
    'therapy session': 'Sesión de terapia',
    'individual therapy': 'Terapia individual',
    'cognitive behavioral therapy': 'Terapia cognitivo-conductual',
    'cbt': 'TCC',
    'psychotherapy': 'Psicoterapia',
    'counseling': 'Asesoramiento psicológico',
    'intake': 'Admisión',
    'evaluation': 'Evaluación',
    'assessment': 'Valoración',
    'emergency': 'Emergencia',
    'crisis': 'Crisis',
    'follow-up': 'Seguimiento',
    'checkup': 'Revisión',
  };

  // Check if we have a translation
  const translation = translations[lowerCaseType];
  // console.log('Found translation:', translation || 'none');

  // Return the translation if it exists, otherwise return the formatted type
  return translation ||
    withoutUnderscores.charAt(0).toUpperCase() + withoutUnderscores.slice(1).toLowerCase();
};
