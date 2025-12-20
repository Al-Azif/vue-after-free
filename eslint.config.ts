import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import { defineConfig } from 'eslint/config'
import neostandard from 'neostandard'

export default defineConfig([
  { files: ['**/*.{js,mjs,cjs,ts,mts,cts}'], plugins: { js }, extends: ['js/recommended'], languageOptions: { globals: globals.browser } },
  { files: ['**/*.js'], languageOptions: { sourceType: 'script' } },
  tseslint.configs.recommended,
  neostandard({
    ts: true,
    env: ['browser', 'es2015'],
  })
])
