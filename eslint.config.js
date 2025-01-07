import antfu from '@antfu/eslint-config'

export default antfu({
  formatters: true,
  vue: true
}, {
  files: ['**/*.vue'],
  rules: {
    'vue/attributes-order': ['error'],
    'vue/max-attributes-per-line': ['error', {
      multiline: {
        max: 1
      }
    }]
  }
}, {
  rules: {
    'style/max-len': ['warn', { code: 110, ignoreStrings: true, ignoreTemplateLiterals: true }],
    'style/comma-dangle': ['error', 'never'],
    'style/multiline-ternary': ['error', 'always-multiline'],
    'style/no-tabs': ['error', {
      allowIndentationTabs: false
    }],
    'style/quotes': ['error', 'single'],
    'ts/no-explicit-any': ['error']
  }
}, {
  ...oxlint.configs['flat/recommended']
})

