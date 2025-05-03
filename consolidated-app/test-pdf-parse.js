// Simple test script for pdf-parse using ES modules
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, readFileSync } from 'fs';

// Create a require function
const require = createRequire(import.meta.url);

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testPdfParse() {
  console.log('Testing pdf-parse module...');

  try {
    // Try to load the module using require (since pdf-parse is a CommonJS module)
    console.log('Attempting to load pdf-parse...');
    const pdfParse = require('pdf-parse');
    console.log('Successfully loaded pdf-parse module');

    // Create a simple PDF buffer for testing
    console.log('Creating a test PDF buffer...');
    const pdfPath = join(__dirname, 'test.pdf');

    if (existsSync(pdfPath)) {
      console.log(`Found test PDF at ${pdfPath}`);
      const dataBuffer = readFileSync(pdfPath);

      // Parse the PDF
      console.log('Parsing PDF...');
      const data = await pdfParse(dataBuffer);

      // Log the results
      console.log('PDF parsing successful!');
      console.log('PDF text length:', data.text.length);
      console.log('First 100 characters:', data.text.substring(0, 100));
    } else {
      console.log(`No test PDF found at ${pdfPath}. Creating a simple test...`);
      // If no test PDF exists, just log that we successfully loaded the module
      console.log('PDF-parse module loaded successfully, but no test PDF available.');
    }
  } catch (error) {
    console.error('Error testing pdf-parse:', error);
    console.error('Error details:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
  }
}

// Run the test
testPdfParse().then(() => {
  console.log('Test completed');
}).catch(err => {
  console.error('Test failed:', err);
});
