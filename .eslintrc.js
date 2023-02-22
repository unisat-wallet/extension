module.exports = {
  env: {
    browser: true,
    es2021: true,
    jest: true
  },
  extends: ['eslint:recommended', 'plugin:react/recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  plugins: ['react', 'react-hooks', '@typescript-eslint', 'import', 'simple-import-sort', 'unused-imports'],
  rules: {
    /**
     * off or 0：Indicates that the rule is not validated.
     * warn or 1：Indicates the validation rule, when not satisfied, give a warning
     * error or 2 ：Indicates that the validation rules are not met, and an error is reported if they are not satisfied.
     */
    quotes: [2, 'single'],
    // "no-console": process.env.NODE_ENV === 'production' ? 2 : 0, // do not disable the console
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0, // disable debugger
    semi: 0,
    'no-control-regex': 2,
    'linebreak-style': [0, 'error', 'windows'],
    indent: ['error', 2, { SwitchCase: 1 }],
    'array-bracket-spacing': [2, 'never'],
    'no-irregular-whitespace': 0,
    'no-trailing-spaces': 1,
    'eol-last': 0,
    'no-unused-vars': [1, { vars: 'all', args: 'after-used' }],
    'no-underscore-dangle': 0,
    'no-lone-blocks': 0,
    'no-class-assign': 2,
    'no-floating-decimal': 2,
    'no-loop-func': 1,
    'no-cond-assign': 2,
    'no-delete-var': 2,
    'no-dupe-keys': 2,
    'no-duplicate-case': 2,
    'no-dupe-args': 2,
    'no-empty': 2,
    'no-func-assign': 2,
    'no-invalid-this': 0,
    'no-this-before-super': 0,
    'no-undef': 1,
    'no-use-before-define': 0,
    camelcase: 0,
    '@typescript-eslint/no-var-requires': 0,

    'react/display-name': 0,
    'react/react-in-jsx-scope': 0,
    'react/no-unescaped-entities': 0,
    'unused-imports/no-unused-imports': 'warn',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }
    ]
  },
  settings: {
    'import/resolver': {
      typescript: {}
    }
  },
  overrides: [
    {
      files: ['**/*.tsx'],
      rules: {
        'react/prop-types': 'off'
      }
    }
  ]
};
