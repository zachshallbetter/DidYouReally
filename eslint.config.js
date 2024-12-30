import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  js.configs.recommended,
  ...compat.extends(
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended'
  ),
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn', 
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'markdownlint/md024': 'off' // Disable duplicate heading check
    },
  },
];