import js from '@eslint/js'
import prettier from 'eslint-plugin-prettier'
import prettierConfig from 'eslint-config-prettier'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import nextPlugin from '@next/eslint-plugin-next'
import tseslint from 'typescript-eslint'

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/.next/**',
      '**/out/**',
      '**/dist/**',
      '**/.git/**',
      '**/generated/**',
      'eslint.config.js',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      'no-unused-vars': 'off',
      'react/react-in-jsx-scope': 'off',
      'no-console': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  {
    plugins: {
      prettier,
      next: nextPlugin,
    },
    rules: {
      'prettier/prettier': 'error',
      'next/no-html-link-for-pages': 'warn',
      '@typescript-eslint/no-require-imports': 'warn',
    },
  },
  prettierConfig,
]
