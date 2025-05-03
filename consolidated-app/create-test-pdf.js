// Script to create a test PDF file for pdf-parse testing
import { jsPDF } from 'jspdf';
import { writeFileSync } from 'fs';

// Create a new PDF document
const doc = new jsPDF();

// Add some text to the PDF
doc.text('This is a test PDF document for pdf-parse testing', 10, 10);
doc.text('It contains some sample DSM-5 content for testing purposes', 10, 20);

// Add some mock DSM-5 content
doc.text('DSM-5 Sample Content', 10, 40);
doc.text('F41.1 Generalized Anxiety Disorder', 10, 50);
doc.text('Diagnostic Criteria:', 10, 60);
doc.text('A. Excessive anxiety and worry occurring more days than not for at least 6 months', 15, 70);
doc.text('B. The person finds it difficult to control the worry', 15, 80);
doc.text('C. The anxiety and worry are associated with three or more of the following:', 15, 90);
doc.text('   1. Restlessness or feeling keyed up or on edge', 20, 100);
doc.text('   2. Being easily fatigued', 20, 110);
doc.text('   3. Difficulty concentrating or mind going blank', 20, 120);
doc.text('   4. Irritability', 20, 130);
doc.text('   5. Muscle tension', 20, 140);
doc.text('   6. Sleep disturbance', 20, 150);

// Save the PDF as a binary buffer
const pdfBuffer = doc.output('arraybuffer');

// Write the buffer to a file
writeFileSync('test.pdf', Buffer.from(pdfBuffer));

console.log('Test PDF created successfully at test.pdf');
