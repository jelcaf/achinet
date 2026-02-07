import sharedConfig from '@achinet/eslint-config-custom';

export default [
  ...sharedConfig,
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
];
