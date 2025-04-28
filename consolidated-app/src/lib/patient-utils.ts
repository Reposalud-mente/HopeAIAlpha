import { Patient, PatientListItem } from '@/contexts/PatientContext';

/**
 * Formats a patient's full name by combining first and last name
 * 
 * @param patient - The patient object containing firstName and lastName properties
 * @returns A formatted string with the patient's full name
 * @example
 * // Returns "John Doe"
 * formatPatientName({ firstName: "John", lastName: "Doe" })
 */
export function formatPatientName(patient: Patient | PatientListItem): string {
  return `${patient.firstName} ${patient.lastName}`;
}

/**
 * Calculates a patient's age based on their date of birth
 * 
 * @param dateOfBirth - The patient's date of birth
 * @returns The patient's age in years
 * @example
 * // Returns the age based on the current date
 * calculateAge(new Date('1990-01-01'))
 */
export function calculateAge(dateOfBirth: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = today.getMonth() - dateOfBirth.getMonth();

  // Adjust age if birthday hasn't occurred yet this year
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
    age--;
  }

  return age;
}
