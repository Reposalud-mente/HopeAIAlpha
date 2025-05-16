/**
 * Script to run the Supabase Admin Tools test
 */

// Import required modules
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the test file
const testFilePath = path.join(__dirname, '../src/test/supabase-admin-tools-test.js');

// Run the test using node with dotenv
const child = spawn('node', ['-r', 'dotenv/config', testFilePath], {
  env: { ...process.env, NODE_ENV: 'alpha' },
  stdio: 'inherit'
});

// Handle process exit
child.on('exit', (code) => {
  process.exit(code);
});
