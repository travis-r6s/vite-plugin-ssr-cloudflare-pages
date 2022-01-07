module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    sourceType: 'module'
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:vue/vue3-recommended',
    'standard'
  ],
  plugins: [
    '@typescript-eslint'
  ],
  globals: {
    defineEmits: 'readonly',
    defineProps: 'readonly'
  },
  overrides: [
    {
      files: ['*.ts'],
      rules: {
        'no-undef': 'off'
      }
    }
  ],
  rules: {
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { args: 'after-used', argsIgnorePattern: '^_' }],
    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': ['error'],
    '@typescript-eslint/typedef': ['error'],
    'array-bracket-spacing': ['error', 'never'],
    'arrow-parens': ['error', 'as-needed'],
    'comma-dangle': ['error', 'never'],
    'computed-property-spacing': ['error', 'always'],
    'import/named': 'off',
    'linebreak-style': 'off',
    'no-console': 'off',
    'object-curly-spacing': ['error', 'always'],
    'prefer-const': ['error', { destructuring: 'all' }],
    'space-in-parens': ['error', 'never'],
    'vue/html-closing-bracket-newline': ['error', { singleline: 'never' }],
    'vue/no-v-html': 'off',
    camelcase: ['off', { properties: 'never', ignoreDestructuring: true }],
    curly: ['error', 'multi-line'],
    indent: ['error', 2],
    quotes: [2, 'single', { avoidEscape: true, allowTemplateLiterals: true }],
    semi: ['error', 'never'],
    'vue/max-attributes-per-line': ['error'],
    'vue/multi-word-component-names': 'off'
  }
}
