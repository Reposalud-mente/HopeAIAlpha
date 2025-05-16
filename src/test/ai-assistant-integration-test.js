/**
 * Integration test for AI Assistant function result handling
 * 
 * This script tests the complete function calling workflow by simulating
 * the actual function calls and responses.
 */

import { AIAssistantService } from '../lib/ai-assistant/ai-assistant-service.js';
import { getEnhancedSystemPrompt } from '../prompts/enhanced_clinical_assistant_prompt.js';

// Mock conversation history for search_patients
const searchPatientsHistory = [
  {
    id: 'user_1',
    role: 'user',
    content: 'Busca pacientes con el nombre Juan'
  }
];

// Mock function call for search_patients
const searchPatientsFunctionCall = {
  name: 'search_patients',
  args: { query: 'Juan' }
};

// Mock function result for search_patients
const searchPatientsResult = {
  success: true,
  message: 'Pacientes encontrados',
  patients: [
    { id: '1', name: 'Juan Pérez', email: 'juan@example.com', phone: '123456789' },
    { id: '2', name: 'Juan García', email: 'juang@example.com', phone: '987654321' }
  ]
};

/**
 * Test the complete function calling workflow
 */
async function testCompleteFunctionCallingWorkflow() {
  console.log('\n=== Testing complete function calling workflow ===');
  
  try {
    // Create an instance of AIAssistantService
    const aiService = new AIAssistantService();
    
    // Step 1: Simulate sending a message that triggers a function call
    console.log('Step 1: Sending message to trigger function call...');
    const initialResponse = await aiService.sendMessage(
      'Busca pacientes con el nombre Juan',
      [],
      { userName: 'Test User' },
      true // Enable function calling
    );
    
    console.log('Initial response:', initialResponse);
    
    // Check if the response contains function calls
    if (!initialResponse.functionCalls || initialResponse.functionCalls.length === 0) {
      console.log('Test FAILED: No function calls detected in the response');
      return false;
    }
    
    console.log('Function calls detected:', initialResponse.functionCalls);
    
    // Step 2: Simulate executing the function and getting the result
    console.log('\nStep 2: Executing function and getting result...');
    // In a real scenario, this would be the result of calling the actual function
    const functionResult = searchPatientsResult;
    
    // Step 3: Prepare the history for function response processing
    console.log('\nStep 3: Preparing history for function response processing...');
    const userMessage = {
      id: 'user_test',
      role: 'user',
      content: 'Busca pacientes con el nombre Juan'
    };
    
    const aiFunctionCallInitiationMessage = {
      id: 'assistant_test',
      role: 'assistant',
      content: `[AI decided to call ${searchPatientsFunctionCall.name} with args: ${JSON.stringify(searchPatientsFunctionCall.args)}]`
    };
    
    const historyForFunctionResponseProcessing = [
      ...searchPatientsHistory,
      userMessage,
      aiFunctionCallInitiationMessage
    ];
    
    // Step 4: Send the function result back to the AI
    console.log('\nStep 4: Sending function result back to the AI...');
    const finalAiResponse = await aiService.sendFunctionResult(
      searchPatientsFunctionCall.name,
      functionResult,
      historyForFunctionResponseProcessing,
      { userName: 'Test User' }
    );
    
    console.log('Final AI response:', finalAiResponse);
    
    // Check if the AI provided a meaningful response to the function result
    if (finalAiResponse.text && finalAiResponse.text.length > 0) {
      console.log('Test PASSED: AI provided a meaningful response to the function result');
      console.log('Response text:', finalAiResponse.text);
      return true;
    } else {
      console.log('Test FAILED: AI did not provide a meaningful response to the function result');
      return false;
    }
  } catch (error) {
    console.error('Test FAILED: Error in function calling workflow:', error);
    return false;
  }
}

/**
 * Run the test
 */
testCompleteFunctionCallingWorkflow()
  .then(success => {
    console.log(`\n=== Integration test ${success ? 'PASSED' : 'FAILED'} ===`);
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('\n=== Error running integration test ===', error);
    process.exit(1);
  });
