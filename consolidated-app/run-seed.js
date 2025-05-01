// Simple script to run the seed file
import { exec } from 'child_process';

console.log('Running seed script...');

exec('pnpm prisma:seed:sessions', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`Stderr: ${stderr}`);
    return;
  }
  console.log(`Stdout: ${stdout}`);
});
