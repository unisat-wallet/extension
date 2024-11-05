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
        '@typescript-eslint/prefer-ts-expect-error': 'warn',
        '@typescript-eslint/no-unsafe-assignment': 'warn',
        '@typescript-eslint/no-unsafe-member-access': 'warn',
        '@typescript-eslint/no-unsafe-return': 'warn',
        '@typescript-eslint/no-unsafe-call': 'warn',
        '@typescript-eslint/no-unsafe-argument': 'warn',
        '@typescript-eslint/no-empty-interface': 'warn',
        '@typescript-eslint/no-inferrable-types': 'warn',
        '@typescript-eslint/no-empty-function': 'warn',
        '@typescript-eslint/no-floating-promises': 'warn',
        '@typescript-eslint/restrict-plus-operands': 'warn',
        '@typescript-eslint/no-unsafe-enum-comparison': 'warn',
        '@typescript-eslint/no-base-to-string': 'warn',
        '@typescript-eslint/no-non-null-assertion': 'warn',
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/no-unused-expressions': 'warn',
        '@typescript-eslint/prefer-promise-reject-errors': 'warn',
        '@typescript-eslint/no-dynamic-delete': 'warn',
        '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
        '@typescript-eslint/no-redundant-type-constituents': 'warn',
        '@typescript-eslint/no-useless-constructor': 'warn'
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
