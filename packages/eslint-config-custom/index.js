module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint/eslint-plugin', 'jest'],
  extends: [
    'airbnb-base',
    'airbnb-typescript/base',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/no-unused-expressions': 'error',
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    'import/prefer-default-export': 'off',
    'quotes': ['error', 'single', { 'avoidEscape': true }],
    'class-methods-use-this': 'off',
    'import/no-extraneous-dependencies': [
      'error',
      {
        'devDependencies': [
          '**/**/*{test,spec}.ts', // tests where the extension or filename suffix denotes that it is a test
          '**/**/test/helpers/*.ts'
        ],
        'optionalDependencies': false
      }
    ],
    'jest/no-disabled-tests': 'warn',
    'jest/no-focused-tests': 'error',
    'jest/no-identical-title': 'error',
    'jest/prefer-to-have-length': 'warn',
    'jest/valid-expect': 'error'
  },
};
