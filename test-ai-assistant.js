/**
 * Test script for the Enhanced AI Assistant Service
 * 
 * This script tests the Enhanced AI Assistant Service by sending a message to the Gemini API
 * with platform context and embodying the HopeAI spirit and values.
 * 
 * Usage: node test-ai-assistant.js
 */

// Import required modules
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

// Get the API key from environment variables or use the one from .env.alpha
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || 'AIzaSyCTIdTqp9sLhbKr6YRtv7Q61-tRTHjNXiQ';

if (!apiKey) {
  console.error('Error: NEXT_PUBLIC_GEMINI_API_KEY environment variable is not set');
  process.exit(1);
}

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(apiKey);

// Test message
const testMessage = "¿Cómo puedes ayudarme con la documentación clínica?";

// Read the enhanced system prompt from the file
const enhancedSystemPromptPath = path.join(__dirname, 'src', 'prompts', 'enhanced_clinical_assistant_prompt.ts');
let enhancedSystemPrompt = '';

try {
  const fileContent = fs.readFileSync(enhancedSystemPromptPath, 'utf8');
  // Extract the prompt string from the file content using regex
  const promptMatch = fileContent.match(/ENHANCED_CLINICAL_ASSISTANT_SYSTEM_PROMPT\s*=\s*`([\s\S]*?)`/);
  if (promptMatch && promptMatch[1]) {
    enhancedSystemPrompt = promptMatch[1];
  } else {
    console.error('Could not extract the enhanced system prompt from the file');
    // Fallback to a simplified system prompt
    enhancedSystemPrompt = `
      You are HopeAI, a helpful assistant for mental health professionals. 
      You provide concise, accurate, and helpful responses to questions about clinical processes, 
      administrative tasks, and general inquiries. 
      Your tone is professional but warm and supportive.
      
      When responding:
      - Keep responses concise and to the point
      - If you don't know something, admit it rather than making up information
      - Focus on being helpful and providing actionable information
      - Be respectful and empathetic
      - Respond in the same language the user is using (Spanish or English)
    `;
  }
} catch (error) {
  console.error('Error reading enhanced system prompt file:', error);
  process.exit(1);
}

// Mock platform context
const mockContext = {
  userName: "Dr. García",
  userRole: "Psicólogo Clínico",
  currentSection: "Documentación",
  recentActivity: [
    "Creación de informe psicológico",
    "Revisión de expediente de paciente"
  ],
  platformFeatures: [
    "Gestión de pacientes",
    "Evaluación psicológica",
    "Documentación clínica",
    "Planificación de tratamientos"
  ]
};

// Add context to the system prompt
let systemPromptWithContext = enhancedSystemPrompt;

systemPromptWithContext += '\n\n# Contexto Actual\n';
    
if (mockContext.userName || mockContext.userRole) {
  systemPromptWithContext += '\n## Información del Usuario\n';
  if (mockContext.userName) systemPromptWithContext += `- Nombre: ${mockContext.userName}\n`;
  if (mockContext.userRole) systemPromptWithContext += `- Rol: ${mockContext.userRole}\n`;
}

if (mockContext.currentSection) {
  systemPromptWithContext += `\n## Sección Actual de la Plataforma\n- ${mockContext.currentSection}\n`;
}

if (mockContext.recentActivity && mockContext.recentActivity.length > 0) {
  systemPromptWithContext += '\n## Actividad Reciente\n';
  mockContext.recentActivity.forEach((activity) => {
    systemPromptWithContext += `- ${activity}\n`;
  });
}

if (mockContext.platformFeatures && mockContext.platformFeatures.length > 0) {
  systemPromptWithContext += '\n## Funcionalidades Relevantes\n';
  mockContext.platformFeatures.forEach((feature) => {
    systemPromptWithContext += `- ${feature}\n`;
  });
}

// Full prompt with system prompt, context, and user message
const fullPrompt = `${systemPromptWithContext}\n\nUsuario: ${testMessage}\nAsistente:`;

/**
 * Sends a message to the Gemini API and logs the response
 */
async function testEnhancedAIAssistant() {
  try {
    console.log('Testing Enhanced AI Assistant Service...');
    console.log(`Sending message: "${testMessage}"`);
    console.log('With platform context for:', mockContext.userName);
    
    // Get the model
    const model = genAI.models.get('gemini-2.5-pro-exp-03-25');
    
    // Generate content
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
      config: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      }
    });
    
    // Get the response text
    const response = result.response;
    const text = response.text();
    
    console.log('\nResponse from Enhanced AI Assistant:');
    console.log('------------------------');
    console.log(text);
    console.log('------------------------');
    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Error testing Enhanced AI Assistant Service:', error);
    process.exit(1);
  }
}

// Run the test
testEnhancedAIAssistant();