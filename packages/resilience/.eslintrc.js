module.exports = {
  root: true,
  extends: ["@achinet/eslint-config-custom"],
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
};
