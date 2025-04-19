/**
 * Data Sanitization Utilities
 * 
 * This module provides functions for sanitizing and anonymizing data,
 * particularly useful for alpha testing environments.
 */

// Configuration
interface SanitizationConfig {
  enabled: boolean;
  sanitizePatientNames: boolean;
  sanitizeContactInfo: boolean;
  sanitizeIdentifiers: boolean;
  sanitizeNotes: boolean;
  preserveDataStructure: boolean;
}

// Default configuration based on environment
const defaultConfig: SanitizationConfig = {
  enabled: process.env.NEXT_PUBLIC_DATA_SANITIZATION === 'true',
  sanitizePatientNames: true,
  sanitizeContactInfo: true,
  sanitizeIdentifiers: true,
  sanitizeNotes: false,
  preserveDataStructure: true,
};

let currentConfig: SanitizationConfig = { ...defaultConfig };

/**
 * Initialize data sanitization with custom configuration
 */
export function initDataSanitization(config: Partial<SanitizationConfig> = {}) {
  currentConfig = {
    ...defaultConfig,
    ...config,
  };
}

/**
 * Check if data sanitization is enabled
 */
export function isSanitizationEnabled(): boolean {
  return currentConfig.enabled;
}

/**
 * Sanitize a patient name
 */
export function sanitizePatientName(name: string): string {
  if (!currentConfig.enabled || !currentConfig.sanitizePatientNames) {
    return name;
  }
  
  // Replace with a placeholder name that maintains first initial
  const initial = name.charAt(0).toUpperCase();
  return `${initial}. [Sanitized]`;
}

/**
 * Sanitize contact information (email, phone, address)
 */
export function sanitizeContactInfo(info: string, type: 'email' | 'phone' | 'address'): string {
  if (!currentConfig.enabled || !currentConfig.sanitizeContactInfo) {
    return info;
  }
  
  switch (type) {
    case 'email':
      // Keep domain but sanitize username
      const [username, domain] = info.split('@');
      if (!domain) return '[Sanitized Email]';
      return `sanitized@${domain}`;
      
    case 'phone':
      // Keep last 4 digits, replace the rest
      const digits = info.replace(/\D/g, '');
      if (digits.length <= 4) return '[Sanitized Phone]';
      return `XXX-XXX-${digits.slice(-4)}`;
      
    case 'address':
      // Replace with generic placeholder
      return '[Sanitized Address]';
      
    default:
      return '[Sanitized]';
  }
}

/**
 * Sanitize an identifier (license number, insurance number, etc.)
 */
export function sanitizeIdentifier(identifier: string): string {
  if (!currentConfig.enabled || !currentConfig.sanitizeIdentifiers) {
    return identifier;
  }
  
  // Keep format but replace with X's
  return identifier.replace(/[a-zA-Z0-9]/g, 'X');
}

/**
 * Sanitize clinical notes or report text
 */
export function sanitizeNotes(text: string): string {
  if (!currentConfig.enabled || !currentConfig.sanitizeNotes) {
    return text;
  }
  
  // Replace potentially sensitive information with placeholders
  // This is a simplified example - a real implementation would use more sophisticated NLP
  
  // Replace names (simplified approach)
  let sanitized = text.replace(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, '[Patient Name]');
  
  // Replace dates (simplified approach)
  sanitized = sanitized.replace(/\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g, '[Date]');
  
  // Replace phone numbers (simplified approach)
  sanitized = sanitized.replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[Phone Number]');
  
  // Replace emails (simplified approach)
  sanitized = sanitized.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, '[Email]');
  
  return sanitized;
}

/**
 * Sanitize a complete patient record
 */
export function sanitizePatientRecord(patient: any): any {
  if (!currentConfig.enabled) {
    return patient;
  }
  
  // Create a deep copy to avoid modifying the original
  const sanitized = JSON.parse(JSON.stringify(patient));
  
  if (currentConfig.sanitizePatientNames) {
    if (sanitized.firstName) {
      sanitized.firstName = sanitizePatientName(sanitized.firstName);
    }
    if (sanitized.lastName) {
      sanitized.lastName = sanitizePatientName(sanitized.lastName);
    }
    if (sanitized.emergencyContactName) {
      sanitized.emergencyContactName = sanitizePatientName(sanitized.emergencyContactName);
    }
  }
  
  if (currentConfig.sanitizeContactInfo) {
    if (sanitized.contactEmail) {
      sanitized.contactEmail = sanitizeContactInfo(sanitized.contactEmail, 'email');
    }
    if (sanitized.contactPhone) {
      sanitized.contactPhone = sanitizeContactInfo(sanitized.contactPhone, 'phone');
    }
    if (sanitized.emergencyContactPhone) {
      sanitized.emergencyContactPhone = sanitizeContactInfo(sanitized.emergencyContactPhone, 'phone');
    }
    if (sanitized.address) {
      sanitized.address = sanitizeContactInfo(sanitized.address, 'address');
    }
  }
  
  if (currentConfig.sanitizeIdentifiers) {
    if (sanitized.insuranceNumber) {
      sanitized.insuranceNumber = sanitizeIdentifier(sanitized.insuranceNumber);
    }
  }
  
  return sanitized;
}

/**
 * Sanitize a collection of records
 */
export function sanitizeRecords<T>(records: T[]): T[] {
  if (!currentConfig.enabled) {
    return records;
  }
  
  return records.map(record => {
    if (typeof record !== 'object' || record === null) {
      return record;
    }
    
    // Determine the type of record and apply appropriate sanitization
    const recordObj = record as any;
    
    if ('firstName' in recordObj && 'lastName' in recordObj && 'dateOfBirth' in recordObj) {
      // Looks like a patient record
      return sanitizePatientRecord(record) as unknown as T;
    }
    
    // For other record types, you could add specific sanitization logic
    
    return record;
  });
}

// Initialize on module load
if (typeof window !== 'undefined') {
  initDataSanitization();
}
