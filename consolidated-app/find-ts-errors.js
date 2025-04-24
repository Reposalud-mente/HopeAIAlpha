const { execSync } = require('child_process');

try {
  console.log('Running TypeScript type checking...');
  execSync('npx tsc --noEmit', { stdio: 'inherit' });
  console.log('TypeScript type checking completed successfully!');
} catch (error) {
  console.error('TypeScript type checking failed:', error.message);
  process.exit(1);
}
