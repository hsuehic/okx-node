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
    },
  ],
};
