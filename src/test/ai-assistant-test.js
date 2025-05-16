/**
 * Test script for AI Assistant function result handling
 * 
 * This script tests the implementation of the function result handling in the AI assistant context.
 */

import { AIAssistantService } from '../lib/ai-assistant/ai-assistant-service.js';
import { getEnhancedSystemPrompt } from '../prompts/enhanced_clinical_assistant_prompt.js';

// Mock conversation history for search_patients
const searchPatientsHistory = [
  {
    id: 'user_1',
    role: 'user',
    content: 'Busca pacientes con el nombre Juan'
  },
  {
    id: 'assistant_1',
    role: 'assistant',
    content: '[AI decided to call search_patients with args: {"query":"Juan"}]'
  }
];

// Mock function result for search_patients
const searchPatientsResult = {
  success: true,
  message: 'Pacientes encontrados',
  patients: [
    { id: '1', name: 'Juan Pérez', email: 'juan@example.com', phone: '123456789' },
    { id: '2', name: 'Juan García', email: 'juang@example.com', phone: '987654321' }
  ]
};

// Mock conversation history for schedule_session
const scheduleSessionHistory = [
  {
    id: 'user_1',
    role: 'user',
    content: 'Agenda una cita con Juan Pérez para mañana a las 10 AM'
  },
  {
    id: 'assistant_1',
    role: 'assistant',
    content: '[AI decided to call schedule_session with args: {"patientId":"1","date":"2023-05-17","time":"10:00","duration":60}]'
  }
];

// Mock function result for schedule_session
const scheduleSessionResult = {
  success: true,
  message: 'Sesión agendada correctamente',
  session: {
    id: '123',
    patientId: '1',
    patientName: 'Juan Pérez',
    date: '2023-05-17',
    time: '10:00',
    duration: 60
  }
};

/**
 * Test the sendFunctionResult method for search_patients
 */
async function testSearchPatients() {
  console.log('\n=== Testing sendFunctionResult for search_patients ===');
  
  try {
    // Create an instance of AIAssistantService
    const aiService = new AIAssistantService();
    
    // Call the sendFunctionResult method
    const response = await aiService.sendFunctionResult(
      'search_patients',
      searchPatientsResult,
      searchPatientsHistory,
      { userName: 'Test User' }
    );
    
    console.log('Response from sendFunctionResult:', response);
    
    if (response.text) {
      console.log('Test PASSED: sendFunctionResult returned a text response');
      console.log('Response text:', response.text);
      return true;
    } else {
      console.log('Test FAILED: sendFunctionResult did not return a text response');
      return false;
    }
  } catch (error) {
    console.error('Test FAILED: Error calling sendFunctionResult:', error);
    return false;
  }
}

/**
 * Test the sendFunctionResult method for schedule_session
 */
async function testScheduleSession() {
  console.log('\n=== Testing sendFunctionResult for schedule_session ===');
  
  try {
    // Create an instance of AIAssistantService
    const aiService = new AIAssistantService();
    
    // Call the sendFunctionResult method
    const response = await aiService.sendFunctionResult(
      'schedule_session',
      scheduleSessionResult,
      scheduleSessionHistory,
      { userName: 'Test User' }
    );
    
    console.log('Response from sendFunctionResult:', response);
    
    if (response.text) {
      console.log('Test PASSED: sendFunctionResult returned a text response');
      console.log('Response text:', response.text);
      return true;
    } else {
      console.log('Test FAILED: sendFunctionResult did not return a text response');
      return false;
    }
  } catch (error) {
    console.error('Test FAILED: Error calling sendFunctionResult:', error);
    return false;
  }
}

/**
 * Test the system prompt generation
 */
async function testSystemPrompt() {
  console.log('\n=== Testing system prompt generation ===');
  
  try {
    const systemPrompt = getEnhancedSystemPrompt({
      userName: 'Test User',
      userRole: 'Psicólogo',
      currentSection: 'pacientes',
      currentPage: 'lista',
      patientInfo: 'Juan Pérez'
    });
    
    console.log('System prompt length:', systemPrompt.length);
    console.log('System prompt excerpt:', systemPrompt.substring(0, 200) + '...');
    
    if (systemPrompt && systemPrompt.length > 0) {
      console.log('Test PASSED: System prompt generated successfully');
      return true;
    } else {
      console.log('Test FAILED: System prompt generation failed');
      return false;
    }
  } catch (error) {
    console.error('Test FAILED: Error generating system prompt:', error);
    return false;
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  let allTestsPassed = true;
  
  // Test system prompt generation
  const systemPromptResult = await testSystemPrompt();
  allTestsPassed = allTestsPassed && systemPromptResult;
  
  // Test search_patients function
  const searchPatientsResult = await testSearchPatients();
  allTestsPassed = allTestsPassed && searchPatientsResult;
  
  // Test schedule_session function
  const scheduleSessionResult = await testScheduleSession();
  allTestsPassed = allTestsPassed && scheduleSessionResult;
  
  return allTestsPassed;
}

// Run all tests
runAllTests()
  .then(success => {
    console.log(`\n=== All tests ${success ? 'PASSED' : 'FAILED'} ===`);
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('\n=== Error running tests ===', error);
    process.exit(1);
  });
