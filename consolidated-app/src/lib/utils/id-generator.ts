/**
 * Utility functions for generating unique IDs
 */

/**
 * Generates a unique ID with a prefix and random component
 * @param prefix Optional prefix for the ID
 * @returns A unique ID string
 */
export function generateUniqueId(prefix: string = 'id'): string {
  const timestamp = Date.now();
  // Use a more unique random component with higher entropy
  const randomPart = Math.floor(Math.random() * 10000);
  const randomString = Math.random().toString(36).substring(2, 9);
  return `${prefix}_${timestamp}_${randomPart}_${randomString}`;
}
