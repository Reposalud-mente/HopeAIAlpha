/**
 * Test script for Supabase Admin Tools
 * 
 * This script tests the implementation of the Supabase admin tools
 * to ensure they work correctly with the Supabase database.
 */

import { searchPatients } from '../lib/ai-assistant/supabase-admin-tools.js';

// Test user ID - replace with a valid user ID from your Supabase database
const TEST_USER_ID = process.env.TEST_USER_ID || 'test-user-id';

/**
 * Test the searchPatients function with an empty query
 */
async function testSearchPatientsEmptyQuery() {
  console.log('\n=== Testing searchPatients with empty query ===');
  
  try {
    const result = await searchPatients({ query: '' }, TEST_USER_ID);
    
    console.log('Result:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log(`Test PASSED: Found ${result.count} patients`);
      return true;
    } else {
      console.log('Test FAILED: Search was not successful');
      return false;
    }
  } catch (error) {
    console.error('Test FAILED with error:', error);
    return false;
  }
}

/**
 * Test the searchPatients function with a specific query
 */
async function testSearchPatientsWithQuery() {
  console.log('\n=== Testing searchPatients with specific query ===');
  
  try {
    // Use a common name that's likely to exist in the database
    const result = await searchPatients({ query: 'a' }, TEST_USER_ID);
    
    console.log('Result:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log(`Test PASSED: Found ${result.count} patients matching query`);
      return true;
    } else {
      console.log('Test FAILED: Search was not successful');
      return false;
    }
  } catch (error) {
    console.error('Test FAILED with error:', error);
    return false;
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  let allTestsPassed = true;
  
  // Test searchPatients with empty query
  const emptyQueryResult = await testSearchPatientsEmptyQuery();
  allTestsPassed = allTestsPassed && emptyQueryResult;
  
  // Test searchPatients with specific query
  const specificQueryResult = await testSearchPatientsWithQuery();
  allTestsPassed = allTestsPassed && specificQueryResult;
  
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
