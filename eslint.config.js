// ESLint configuration for Next.js/React/TypeScript (ESLint v9+)
import js from '@eslint/js';
import next from 'eslint-config-next';

/** @type {import('eslint').Linter.FlatConfig} */
export default [
  js(),
  ...next(),
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json'],
      },
    },
    rules: {
      // Add custom rules here
      'react/jsx-key': 'warn',
      'no-unused-vars': 'warn',
    },
  },
];
