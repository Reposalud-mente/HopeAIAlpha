/**
 * Script to run the AI Assistant test
 */

// Import required modules
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the test files
const basicTestPath = path.join(__dirname, '../src/test/test-implementation.js');
const detailedTestPath = path.join(__dirname, '../src/test/verify-implementation.js');

// Run the basic implementation test first
console.log('=== Running basic implementation test ===');
const basicTest = spawn('node', ['-r', 'dotenv/config', basicTestPath], {
  env: { ...process.env, NODE_ENV: 'alpha' },
  stdio: 'inherit'
});

// After the basic test completes, run the detailed verification
basicTest.on('exit', (code) => {
  if (code !== 0) {
    console.error('Basic implementation test failed with code:', code);
    process.exit(code);
  }

  console.log('\n=== Running detailed implementation verification ===');
  const detailedTest = spawn('node', ['-r', 'dotenv/config', detailedTestPath], {
    env: { ...process.env, NODE_ENV: 'alpha' },
    stdio: 'inherit'
  });

  detailedTest.on('exit', (detailedCode) => {
    process.exit(detailedCode);
  });
});


