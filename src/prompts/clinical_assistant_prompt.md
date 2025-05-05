

/**
 * Function to initialize the clinical assistant with the system prompt
 * @param {Object} client - The AI client instance
 * @returns {Object} - The initialized assistant
 */
export function initializeClinicalAssistant(client) {
  return client.beta.assistants.create({
    name: "Asistente Clínico HopeAI",
    instructions: CLINICAL_ASSISTANT_SYSTEM_PROMPT,
    model: "gpt-4-turbo", // Replace with your preferred model
    tools: [] // Add any specific tools as needed
  });
}
