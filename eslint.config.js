// eslint.config.js
import js from '@eslint/js';
import prettier from 'eslint-config-prettier';

export default [
  { ignores: ['node_modules', 'dist', 'build', 'coverage'] },

  js.configs.recommended,

  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        document: 'readonly',
        window: 'readonly',
        console: 'readonly',
        alert: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': 'off',
    },
  },

  prettier,
];
