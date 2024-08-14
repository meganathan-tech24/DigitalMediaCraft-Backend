module.exports = {
  env: {
    node: true, // Enable Node.js globals
    es2021: true, // Enable ECMAScript 2021 features
  },
  extends: [
    'eslint:recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
  ],
  parserOptions: {
    ecmaVersion: 'latest', // Use the latest ECMAScript features
    sourceType: 'module', // Allows the use of imports
  },
  plugins: ['import'],
  rules: {
    'no-console': 'off', // Disable the rule for console statements
    'no-unused-vars': ['error', { args: 'none', vars: 'all' }],
    'no-undef': 'error',
    'no-empty-function': 'warn',
    'no-unreachable': 'error',
    'quotes': ['error', 'single'], // Use single quotes
    'semi': ['error', 'always'], // Enforce semicolons
    'camelcase': ['error', { properties: 'always' }],
    'eqeqeq': ['error', 'always'], // Enforce === and !==
    'consistent-return': 'error',
    'no-param-reassign': ['off'], // Disable rule for reassigning function parameters
    'no-throw-literal': 'error',
    'prefer-const': ['error', {
      destructuring: 'all',
      ignoreReadBeforeAssign: false,
    }],
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', ['sibling', 'parent'], 'index'],
        pathGroups: [
          {
            pattern: 'react',
            group: 'external',
            position: 'before',
          },
        ],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
    'import/no-unresolved': 'error',
    'callback-return': ['error', ['callback', 'cb']],
    'handle-callback-err': ['error', '^(err|error)$'],
  },
};
