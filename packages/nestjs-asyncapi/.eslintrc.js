module.exports = {
  root: true,
  extends: ["@achinet/eslint-config-custom"],
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  rules: {
    '@typescript-eslint/ban-types': 'off',
    'no-restricted-syntax': 'off',
    'import/no-cycle': [
      'warn',
      {
        maxDepth: 1, // opcional: ignora ciclos muy superficiales
      },
    ],
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          '**/*.test.ts',
          '**/*.spec.ts',
          '**/test/**',
          '**/tests/**',
          '**/jest.config.ts',
          '**/jest-*.config.ts',
          '**/test/configs/**',
        ],
      },
    ],
  },
};
