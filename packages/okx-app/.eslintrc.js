module.exports = {
  root: true,
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  extends: ['cnp', 'cnp/typescript', 'cnp/react'],
  overrides: [
    {
      files: ['*.{ts,tsx}'],
      parserOptions: {
        project: 'tsconfig.eslint.json',
      },
      rules: {
        '@typescript-eslint/naming-convention': 'off',
      },
    },
  ],
};
