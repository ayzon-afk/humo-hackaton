import js from '@eslint/js';
import vue from 'eslint-plugin-vue';
import globals from 'globals';
import prettier from 'eslint-config-prettier';

/** Единые правила кода для клиента и сервера */
export default [
  { ignores: ['**/node_modules/**', '**/dist/**', 'server/data/**', 'server/uploads/**'] },
  js.configs.recommended,
  ...vue.configs['flat/recommended'],
  {
    files: ['client/**/*.{js,vue}'],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ['server/**/*.js', 'scripts/**/*.mjs', '*.js'],
    languageOptions: { globals: globals.node },
  },
  {
    rules: {
      'no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'none', ignoreRestSiblings: true },
      ],
      'no-empty': ['error', { allowEmptyCatch: true }],
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'prefer-const': 'error',
      'vue/multi-word-component-names': 'off',
      'vue/require-default-prop': 'off',
    },
  },
  prettier,
];
