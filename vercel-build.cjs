// This file needs to remain CommonJS for Vercel compatibility
// Rename this file to vercel-build.cjs if you encounter module issues
const { execSync } = require('child_process');

// Set environment variables to disable TypeScript and ESLint checking
process.env.NEXT_TYPESCRIPT_CHECK_DISABLED = '1';
process.env.NEXT_ESLINT_CHECK_DISABLED = '1';

try {
  console.log('Running custom build script...');

  // Run the Next.js build command
  execSync('next build', {
    stdio: 'inherit',
    env: {
      ...process.env,
      NEXT_TYPESCRIPT_CHECK_DISABLED: '1',
      NEXT_ESLINT_CHECK_DISABLED: '1'
    }
  });

  console.log('Build completed successfully!');
  // Copy PDFKit font files to the build directory
  console.log('Copying PDFKit font files...');
  execSync('node scripts/copy-pdfkit-fonts.js', {
    stdio: 'inherit'
  });
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}
