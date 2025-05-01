// Script to copy PDFKit font files to the build directory
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function copyPDFKitFonts() {
  console.log('Copying PDFKit font files to build directory...');

  // Source directory (PDFKit font files in node_modules)
  const sourceDir = path.join(path.resolve(__dirname, '..'), 'node_modules', 'pdfkit', 'js', 'data');

  // Destination directories (where Next.js expects the font files)
  const destDirs = [
    path.join(process.cwd(), 'build', 'server', 'app', 'api', 'reports', '[id]', 'pdf', 'data'),
    path.join(process.cwd(), 'build', 'server', 'chunks', 'app', 'api', 'reports', '[id]', 'pdf', 'data')
  ];

  // Check if source directory exists
  if (!fs.existsSync(sourceDir)) {
    console.error(`Source directory not found: ${sourceDir}`);
    return;
  }

  // Create destination directories and copy files
  destDirs.forEach(destDir => {
    try {
      // Create destination directory if it doesn't exist
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
        console.log(`Created directory: ${destDir}`);
      }

      // Copy all files from source to destination
      const files = fs.readdirSync(sourceDir);
      files.forEach(file => {
        const sourcePath = path.join(sourceDir, file);
        const destPath = path.join(destDir, file);

        fs.copyFileSync(sourcePath, destPath);
        console.log(`Copied ${file} to ${destDir}`);
      });
    } catch (error) {
      console.error(`Error copying files to ${destDir}:`, error);
    }
  });

  console.log('PDFKit font files copied successfully!');
}

// Execute the function
copyPDFKitFonts();

// Export for potential module usage
export default copyPDFKitFonts;
