module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  overrides: [
    {
      files: ['src/**/*.{ts,tsx}'],
      extends: ['cnp', 'cnp/typescript', 'cnp/react'],
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: 'tsconfig.json',
      },
      rules: {
        '@typescript-eslint/naming-convention': 'off',
        '@typescript-eslint/no-inferrable-types': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        'max-statements': 'off',
      },
    },
  ],
};
