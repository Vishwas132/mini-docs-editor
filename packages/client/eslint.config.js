import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';

export default [
  { files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'] },
  { settings: { react: { version: 'detect' } } },
  { languageOptions: { globals: globals.browser } },
  { ignores : ['**/*.d.ts', '**/*.d.tsx', '**/*.test.ts', '**/*.test.tsx', '**/node_modules/', '**/dist/', '**/*.min.js', '**/*.min.css', '**/*.json'] },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  pluginReact.configs.flat['jsx-runtime'],
];
