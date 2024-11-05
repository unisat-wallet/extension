// @ts-check
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

import eslint from '@eslint/js';

export default tseslint.config(
    { ignores: ['dist', '*.js'] },
    {
        extends: [eslint.configs.recommended, ...tseslint.configs.recommended, ...tseslint.configs.strictTypeChecked],
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            ecmaVersion: 2023,
            globals: {
                Buffer: true
            },
            parserOptions: {
                projectService: true,
                tsconfigDirName: import.meta.dirname
            }
        },
        plugins: {
            'react-hooks': reactHooks,
            react
        },
        rules: {
            ...reactHooks.configs.recommended.rules,
            ...react.configs.recommended.rules,

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
        }
    },
    {
        files: ['**/*.js'],
        ...tseslint.configs.disableTypeChecked
    }
);
