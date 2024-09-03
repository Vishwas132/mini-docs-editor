// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.strict,
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    ignores: [
      '**/*.d.ts',
      '**/*.d.tsx',
      '**/*.test.ts',
      '**/*.test.tsx',
      '**/node_modules/',
      '**/dist/',
      '**/*.min.js',
      '**/*.min.css',
      '**/*.json',
    ],
  }
);
