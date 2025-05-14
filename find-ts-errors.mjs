// find-ts-errors.mjs - Script mejorado para verificación de tipos TypeScript
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Obtener el directorio actual del módulo ES
const __dirname = dirname(fileURLToPath(import.meta.url));

// Configuración personalizable
const config = {
  project: resolve(__dirname, 'tsconfig.json'),
  noEmit: true,
  incremental: true,
  pretty: true,
  // Añadir más opciones según sea necesario
};

// Construir argumentos para tsc
const args = ['--noEmit'];
if (config.project) args.push('--project', config.project);
if (config.incremental) args.push('--incremental');
if (config.pretty) args.push('--pretty');

console.log('🔍 Verificando errores de TypeScript...');

// Ejecutar tsc de forma asíncrona
const tsc = spawn('npx', ['tsc', ...args], {
  stdio: 'inherit',
  shell: true,
});

// Manejar la finalización del proceso
tsc.on('close', (code) => {
  if (code === 0) {
    console.log('✅ No se encontraron errores de TypeScript.');
    process.exit(0);
  } else {
    console.error('❌ Se encontraron errores de TypeScript. Por favor, corríjalos antes de continuar.');
    process.exit(1);
  }
});

// Manejar errores del proceso
tsc.on('error', (err) => {
  console.error('❌ Error al ejecutar TypeScript:', err);
  process.exit(1);
});
