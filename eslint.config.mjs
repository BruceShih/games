// @ts-check
import antfu from '@antfu/eslint-config'
import oxlint from 'eslint-plugin-oxlint'
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  antfu({
    formatters: true,
    stylistic: {
      indent: 2,
      quotes: 'single',
      semi: false
    },
    vue: {
      overrides: {
        'vue/attributes-order': ['error', {
          order: [
            'DEFINITION',
            'LIST_RENDERING',
            'CONDITIONALS',
            'RENDER_MODIFIERS',
            'GLOBAL',
            ['UNIQUE', 'SLOT'],
            'TWO_WAY_BINDING',
            'OTHER_DIRECTIVES',
            'OTHER_ATTR',
            'EVENTS',
            'CONTENT'
          ],
          alphabetical: true
        }],
        'vue/max-attributes-per-line': ['error', { singleline: 1, multiline: { max: 1 } }],
        'vue/multi-word-component-names': ['off']
      }
    },
    typescript: true,
    rules: {
      'style/max-len': ['warn', { code: 110, ignoreStrings: true, ignoreTemplateLiterals: true }],
      'style/comma-dangle': ['error', 'never'],
      'style/multiline-ternary': ['error', 'always-multiline'],
      'ts/no-explicit-any': ['error']
    },
    ignores: [
      'app/components/ui/**',
      'server/database/migrations'
    ]
  }, {
    files: ['server/**/*.ts'],
    rules: {
      'no-console': ['error', { allow: ['info', 'warn', 'error'] }]
    }
  }, oxlint.configs['flat/recommended'])
  // ...your other rules
)
