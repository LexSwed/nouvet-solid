module.exports = {
  root: true,
  plugins: ['tailwindcss', '@typescript-eslint', 'solid', 'import'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:tailwindcss/recommended',
    'plugin:solid/typescript',
  ],
  rules: {
    // good to know this can be enforced
    'tailwindcss/no-custom-classname': 'off',
    // conflicts with prettier
    'tailwindcss/classnames-order': 'off',
    '@typescript-eslint/consistent-type-imports': [
      'warn',
      {
        prefer: 'type-imports',
        disallowTypeAnnotations: true,
        fixStyle: 'inline-type-imports',
      },
    ],
    'import/no-duplicates': ['warn', { 'prefer-inline': true }],
    'import/consistent-type-specifier-style': ['warn', 'prefer-inline'],
    'import/order': [
      'warn',
      {
        alphabetize: { order: 'asc', caseInsensitive: true },
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
        ],
      },
    ],
  },
  overrides: [
    {
      env: {
        node: true,
      },
      files: [
        '.eslintrc.cjs',
        'postcss.config.cjs',
        'prettier.config.cjs',
        'tailwind.config.ts',
      ],
      parserOptions: {
        sourceType: 'script',
      },
    },
    {
      files: ['*.ts', '*.tsx'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        // project: ['./tsconfig.json', './packages/*/tsconfig.json'],
      },
      plugins: ['@typescript-eslint'],
      extends: ['plugin:solid/typescript'],
    },
    {
      files: ['*.stories.ts', '*.stories.tsx'],
      extends: ['plugin:storybook/recommended'],
    },
  ],
};