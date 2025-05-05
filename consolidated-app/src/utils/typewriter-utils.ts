/**
 * Utility functions for managing typewriter animations
 */

/**
 * Reset the animation state for a specific typewriter component
 * @param id The ID of the typewriter component to reset
 */
export const resetTypewriterAnimation = (id: string): void => {
  try {
    const storageKey = `typeit-animated-${id}`;
    localStorage.removeItem(storageKey);
  } catch (error) {
    console.warn(`Error resetting typewriter animation for ID ${id}:`, error);
  }
};

/**
 * Reset all typewriter animation states
 */
export const resetAllTypewriterAnimations = (): void => {
  try {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('typeit-animated-')) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.warn('Error clearing all typewriter animation states:', error);
  }
};

/**
 * Check if a typewriter animation has already been played
 * @param id The ID of the typewriter component to check
 * @returns True if the animation has already been played, false otherwise
 */
export const hasTypewriterAnimationPlayed = (id: string): boolean => {
  try {
    const storageKey = `typeit-animated-${id}`;
    return localStorage.getItem(storageKey) === 'true';
  } catch (error) {
    console.warn(`Error checking typewriter animation state for ID ${id}:`, error);
    return false;
  }
};
