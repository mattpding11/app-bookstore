import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    // Test infrastructure/spec files are never Fast-Refreshed, so this rule doesn't apply
    files: ['**/*.test.{ts,tsx}', 'src/test-utils.tsx', 'src/setupTests.ts'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
])
