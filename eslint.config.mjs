import { FlatCompat } from '@eslint/eslintrc';
import prettierPlugin from 'eslint-plugin-prettier';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import simpleImportSortPlugin from 'eslint-plugin-simple-import-sort';
import unicornPlugin from 'eslint-plugin-unicorn';
import importPlugin from 'eslint-plugin-import';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// Base configuration from React Native recommended rules
const baseConfig = compat.extends('@react-native');

// Custom rules configuration
const customConfig = {
  files: ['**/*.{js,jsx,ts,tsx}'],
  ignores: [
    '**/node_modules/**',
    'android/**',
    'ios/**',
    '__tests__/**',
    'coverage/**',
    'metro.config.js',
    'babel.config.js',
    'jest.config.js',
    '.prettierrc.js',
    '.commitlintrc.js',
    'eslint.config.mjs',
    'index.js',
  ],
  languageOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    parser: tsParser,
    parserOptions: {
      project: './tsconfig.json',
      ecmaFeatures: {
        jsx: true,
      },
    },
  },
  plugins: {
    prettier: prettierPlugin,
    'simple-import-sort': simpleImportSortPlugin,
    'react-hooks': reactHooksPlugin,
    unicorn: unicornPlugin,
    import: importPlugin,
    '@typescript-eslint': tsPlugin,
  },
  rules: {
    // React Native and React rules
    'react/react-in-jsx-scope': 'off',
    'react-native/no-unused-styles': 'error',
    'react-native/split-platform-components': 'error',
    'react-native/no-inline-styles': 'warn',
    'react-native/no-color-literals': 'warn',
    
    // Console warnings for production
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    
    // Prettier formatting
    'prettier/prettier': ['error', { endOfLine: 'auto' }],
    
    // Import organization
    'import/newline-after-import': ['error', { count: 1 }],
    'import/extensions': ['error', 'never', { svg: 'always', png: 'always', jpg: 'always' }],
    'import/prefer-default-export': 'off',
    'simple-import-sort/imports': [
      'error',
      {
        groups: [
          ['^\\u0000'], // side effects
          ['^react', '^react-native', '^@react-native', '^@?\\w'], // external modules (react first, then react-native)
          ['^'], // absolute imports
          ['^\\.'], // relative imports
        ],
      },
    ],
    'simple-import-sort/exports': 'error',
    
    // TypeScript rules
    '@typescript-eslint/require-await': 'off',
    '@typescript-eslint/no-misused-promises': 'off',
    '@typescript-eslint/no-floating-promises': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/explicit-function-return-type': [
      'error',
      {
        allowExpressions: true,
        allowTypedFunctionExpressions: true,
        allowHigherOrderFunctions: false,
      },
    ],
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        vars: 'all',
        args: 'none',
      },
    ],
    '@typescript-eslint/no-explicit-any': ['error', { ignoreRestArgs: true }],
    
    // React Hooks rules
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    
    // React rules
    'react/prop-types': 'off',
    'react/no-unescaped-entities': 'off',
    'react/no-children-prop': 'off',
    'react/no-array-index-key': 'off',
    'react/no-unstable-nested-components': 'off',
    'react/no-unknown-property': 'off',
    
    // ESLint rules
    'global-require': 'off',
    'no-plusplus': 'off',
    complexity: ['error', { max: 12 }],
    'max-depth': ['error', { max: 3 }],
    'max-nested-callbacks': ['error', { max: 3 }],
    'max-params': ['error', { max: 3 }],
    'max-statements': ['error', { max: 12 }],
    'arrow-body-style': ['error', 'as-needed'],
    'object-property-newline': [
      'error',
      { allowAllPropertiesOnSameLine: false },
    ],
    
    // Other rules
    'max-len': [
      'warn',
      {
        code: 82,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
        ignoreComments: true,
      },
    ],
    'padding-line-between-statements': [
      'error',
      {
        blankLine: 'always',
        prev: '*',
        next: 'export',
      },
      {
        blankLine: 'any',
        prev: 'export',
        next: 'export',
      },
    ],
    
    // Unicorn rules
    'unicorn/filename-case': ['error', { case: 'kebabCase' }],
    'unicorn/no-array-for-each': 'error',
    'unicorn/no-array-reduce': 'error',
    'unicorn/no-for-loop': 'error',
    'unicorn/no-lonely-if': 'error',
    'unicorn/no-null': 'off',
    'unicorn/no-useless-undefined': 'error',
    'unicorn/prefer-array-find': 'error',
    'unicorn/prefer-array-flat': 'error',
    'unicorn/prefer-array-flat-map': 'error',
    'unicorn/prefer-array-index-of': 'error',
    'unicorn/prefer-array-some': 'error',
    'unicorn/prefer-includes': 'error',
    'unicorn/prefer-number-properties': 'error',
    'unicorn/prefer-optional-catch-binding': 'error',
    'unicorn/prefer-set-has': 'error',
    'unicorn/prefer-string-slice': 'error',
    'unicorn/prefer-string-starts-ends-with': 'error',
    'unicorn/prefer-string-trim-start-end': 'error',
    'unicorn/prefer-ternary': 'error',
    'unicorn/throw-new-error': 'error',
    'unicorn/no-unsafe-regex': 'off',
  },
};

const config = [
  {
    ignores: [
      '**/node_modules/**',
      'android/**',
      'ios/**',
      '__tests__/**',
      'coverage/**',
      'metro.config.js',
      'babel.config.js',
      'jest.config.js',
      '.prettierrc.js',
      '.commitlintrc.js',
      'eslint.config.mjs',
      'index.js',
    ],
  },
  ...baseConfig,
  customConfig,
];

export default config;