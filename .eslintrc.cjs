module.exports = {
  root: true,
  extends: ['cnp', 'cnp/typescript', 'cnp/jest'],
  overrides: [
    {
      files: '*.{ts,cts,mts,tsx}',
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: 'tsconfig.eslint.json',
      },
      rules: {
        '@typescript-eslint/naming-convention': 'off',
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
  ],
  rules: {
    'max-statements': 'off',
  },
  ignorePatterns: [
    'node_modules',
    'packages/*/dist',
    'packages/*/build',
    'packages/*/static',
  ],
};
