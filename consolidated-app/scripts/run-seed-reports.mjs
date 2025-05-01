#!/usr/bin/env node

// This script is a workaround for running TypeScript files in an ESM environment
// It uses npx to run ts-node with the --esm flag for ESM support

import { spawn } from 'child_process';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const seedFile = resolve(projectRoot, 'prisma/seed-reports.ts');

// Run the seed file with the proper configuration using npx
const child = spawn('npx', [
  'ts-node',
  '--esm',
  '--project', 'tsconfig-seed.json',
  '-r', 'dotenv/config',
  seedFile
], {
  stdio: 'inherit',
  cwd: projectRoot,
  shell: true // Use shell on Windows
});

child.on('exit', (code) => {
  process.exit(code);
});
