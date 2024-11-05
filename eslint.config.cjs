module.exports = {
    env: {
        browser: true,
        es2021: true,
        jest: true
    },
    extends: [
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/strict',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'prettier'
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaFeatures: {
            jsx: true
        },
        ecmaVersion: 'latest',
        sourceType: 'module',
        projectService: true,
        project: './tsconfig.json',
        tsconfigRootDir: __dirname
    },
    ignorePatterns: ['.eslintrc.js', '*.js'],
    plugins: ['react', 'react-hooks', '@typescript-eslint', 'import', 'simple-import-sort', 'unused-imports'],
    rules: {
        'no-undef': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        'no-empty': 'off',
        '@typescript-eslint/restrict-template-expressions': 'off',
        '@typescript-eslint/only-throw-error': 'off',
        '@typescript-eslint/no-unnecessary-condition': 'off',
        '@typescript-eslint/unbound-method': 'warn',
        '@typescript-eslint/no-confusing-void-expression': 'off',
        '@typescript-eslint/no-extraneous-class': 'off',
        'no-async-promise-executor': 'off',
        '@typescript-eslint/no-misused-promises': 'off',
        '@typescript-eslint/no-unnecessary-type-parameters': 'off',
        '@typescript-eslint/no-duplicate-enum-values': 'off',
        'prefer-spread': 'off',
        '@typescript-eslint/ban-types': 'off',
        'react/react-in-jsx-scope': 'off',
        '@typescript-eslint/no-empty-object-type': 'off',
        '@typescript-eslint/ban-ts-comment': 'off',

        // Additional rules
        '@typescript-eslint/prefer-ts-expect-error': 'error',
        '@typescript-eslint/no-unsafe-assignment': 'error',
        '@typescript-eslint/no-unsafe-member-access': 'error',
        '@typescript-eslint/no-unsafe-return': 'error',
        '@typescript-eslint/no-unsafe-call': 'error',
        '@typescript-eslint/no-unsafe-argument': 'error',
        '@typescript-eslint/no-empty-interface': 'error',
        '@typescript-eslint/no-inferrable-types': 'error',
        '@typescript-eslint/no-empty-function': 'error',
        '@typescript-eslint/no-floating-promises': 'off',
        '@typescript-eslint/restrict-plus-operands': 'error',
        '@typescript-eslint/no-unsafe-enum-comparison': 'error',
        '@typescript-eslint/no-base-to-string': 'error',
        '@typescript-eslint/no-non-null-assertion': 'error',
        '@typescript-eslint/no-explicit-any': 'error',
        '@typescript-eslint/no-unused-expressions': 'error',
        '@typescript-eslint/prefer-promise-reject-errors': 'error',
        '@typescript-eslint/no-dynamic-delete': 'error',
        '@typescript-eslint/no-unnecessary-type-assertion': 'error',
        '@typescript-eslint/no-redundant-type-constituents': 'error',
        '@typescript-eslint/no-useless-constructor': 'error'
    },
    settings: {
        'import/resolver': {
            typescript: {}
        },
        react: {
            version: 'detect'
        }
    },
    overrides: [
        {
            files: ['**/*.tsx'],
            rules: {
                'react/prop-types': 'off'
            }
        }
    ],
    globals: {
        Buffer: true
    }
};
