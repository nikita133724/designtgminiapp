import {defineConfig, globalIgnores} from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals.js';
import nextTypeScript from 'eslint-config-next/typescript.js';

export default defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', {argsIgnorePattern: '^_'}],
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
]);
