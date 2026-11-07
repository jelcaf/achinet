import sharedConfig from '@achinet/eslint-config-custom';

export default [
  ...sharedConfig,
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      'no-restricted-syntax': 'off',
      // @nestjs/swagger declares "exports": deep imports fail at runtime for consumers
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@nestjs/swagger/dist/*'],
              message: 'Use the public API of @nestjs/swagger (internal paths are not exported).',
            },
          ],
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },
];
