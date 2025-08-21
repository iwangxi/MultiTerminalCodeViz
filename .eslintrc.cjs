module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'airbnb',
    'airbnb/hooks',
    'plugin:import/typescript',
    'prettier', // Make sure this is last to override other configs
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json', // Specify your tsconfig.json path
  },
  plugins: [
    '@typescript-eslint',
    'react',
    'react-hooks',
    'jsx-a11y',
    'import',
    'react-refresh', // For Vite HMR
  ],
  rules: {
    // TypeScript specific rules
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',

    // React specific rules
    'react/react-in-jsx-scope': 'off', // Not needed with React 17+ and Vite
    'react/jsx-filename-extension': [1, { extensions: ['.tsx', '.jsx'] }],
    'react/prop-types': 'off', // We use TypeScript for prop types
    'react/jsx-props-no-spreading': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],


    // Import rules
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
    'import/prefer-default-export': 'off',
    'import/no-extraneous-dependencies': ['error', { devDependencies: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx', 'vite.config.ts', '.eslintrc.cjs', 'eslint.config.js', 'postcss.config.js', 'tailwind.config.js'] }],


    // General rules
    'no-console': 'warn',
    'no-unused-vars': 'off', // Handled by @typescript-eslint/no-unused-vars
    'comma-dangle': ['error', 'always-multiline'],
    semi: ['error', 'always'],
    quotes: ['error', 'single'],
    'object-curly-spacing': ['error', 'always'],
    'arrow-parens': ['error', 'always'],
    'no-shadow': 'off', // Replaced by @typescript-eslint/no-shadow
    '@typescript-eslint/no-shadow': ['error'],
    'no-restricted-exports': 'off',

    // jsx-a11y improvements (can be project-specific)
    'jsx-a11y/anchor-is-valid': 'off', // Often handled by routers
    'jsx-a11y/label-has-associated-control': ['error', {
      assert: 'either', // Allows nesting or id referencing
    }],
  },
  settings: {
    react: {
      version: 'detect', // Automatically detect the React version
    },
    'import/resolver': {
      typescript: {
        project: './tsconfig.json',
      },
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
  ignorePatterns: ['node_modules/', 'dist/', '.eslintrc.cjs', 'vite.config.ts', 'tailwind.config.js', 'postcss.config.js'], // Ignore build outputs and config files
}; 