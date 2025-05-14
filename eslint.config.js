// ESLint configuration for Next.js 15/React 19/TypeScript 5.x (ESLint v9+)
import js from '@eslint/js';
import next from 'eslint-config-next';
import globals from 'globals';

/** @type {import('eslint').Linter.FlatConfig} */
export default [
  // Base JavaScript configuration
  js(),

  // Next.js configuration (includes React rules)
  ...next(),

  // Global settings for all files
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    settings: {
      react: {
        version: '19',
      },
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
    },
  },

  // TypeScript files configuration
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json'],
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      // TypeScript specific rules
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'off', // Allow inferred return types
      '@typescript-eslint/no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }],
      '@typescript-eslint/consistent-type-imports': ['warn', {
        prefer: 'type-imports',
        disallowTypeAnnotations: false,
      }],
      '@typescript-eslint/no-floating-promises': 'warn',

      // React specific rules
      'react/jsx-key': 'warn',
      'react/jsx-uses-react': 'off', // Not needed in React 19
      'react/react-in-jsx-scope': 'off', // Not needed in React 19
      'react/prop-types': 'off', // Use TypeScript types instead
      'react/display-name': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // Import rules
      'import/no-unresolved': 'off', // TypeScript handles this
      'import/order': ['warn', {
        'groups': [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
          'object',
          'type'
        ],
        'pathGroups': [
          {
            'pattern': 'react',
            'group': 'builtin',
            'position': 'before'
          },
          {
            'pattern': 'next/**',
            'group': 'builtin',
            'position': 'before'
          },
          {
            'pattern': '@/**',
            'group': 'internal',
            'position': 'after'
          }
        ],
        'pathGroupsExcludedImportTypes': ['react'],
        'newlines-between': 'always',
        'alphabetize': {
          'order': 'asc',
          'caseInsensitive': true
        }
      }],

      // General code quality rules
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
      'no-debugger': 'warn',
      'no-alert': 'warn',
      'prefer-const': 'warn',
      'no-unused-vars': 'off', // Using TypeScript version instead
    },
  },

  // Server components specific rules
  {
    files: ['**/app/**/*.tsx', '**/app/**/*.ts', '!**/app/**/*.client.tsx', '!**/app/**/*.client.ts'],
    rules: {
      // Prevent client-only hooks in server components
      'react-hooks/rules-of-hooks': 'off', // Disable to allow custom rule below
      'no-restricted-imports': [
        'error',
        {
          name: 'react',
          importNames: ['useState', 'useEffect', 'useLayoutEffect', 'useReducer', 'useRef', 'useImperativeHandle', 'useCallback', 'useMemo', 'useContext', 'useDebugValue', 'useDeferredValue', 'useTransition', 'useId', 'useSyncExternalStore', 'useInsertionEffect'],
          message: "This React Hook cannot be used in a Server Component. Add 'use client' directive at the top of the file or create a separate client component."
        }
      ],
    },
  },

  // Client components specific rules
  {
    files: ['**/*.client.tsx', '**/*.client.ts', '**/components/**/*.tsx', '**/components/**/*.ts'],
    rules: {
      // Client-side specific rules
      'no-restricted-imports': 'off',
    },
  },

  // Test files specific rules
  {
    files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx', '**/tests/**/*.ts', '**/tests/**/*.tsx'],
    rules: {
      // Relax rules for test files
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
    },
  },

  // Configuration files specific rules
  {
    files: ['*.config.js', '*.config.ts', '*.config.mjs', 'next.config.ts'],
    rules: {
      // Relax rules for configuration files
      '@typescript-eslint/no-var-requires': 'off',
      'import/no-default-export': 'off',
    },
  },
];
