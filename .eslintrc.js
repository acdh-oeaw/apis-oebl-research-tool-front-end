module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    'plugin:vue/essential',
    '@vue/standard',
    '@vue/typescript/recommended'
  ],
  parserOptions: {
    ecmaVersion: 2020,
    experimentalDecorators: true
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    '@typescript-eslint/no-empty-function': 'warn',
    '@typescript-eslint/member-delimiter-style': 'off',
    'space-before-function-paren': 'off',
    'object-curly-spacing': 'off',
    'no-trailing-spaces': 'warn',
    'padded-blocks': 'off',
    'template-curly-spacing': 'off',
    'array-bracket-spacing': 'off',
    'vue/valid-v-slot': 'off',
    camelcase: 'off',
    'comma-dangle': 'off'
  },
  overrides: [
    {
      files: [
        '**/__tests__/*.{j,t}s?(x)',
        '**/tests/unit/**/*.spec.{j,t}s?(x)'
      ],
      env: {
        mocha: true
      }
    }
  ]
}
