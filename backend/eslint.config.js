import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
   js.configs.recommended,
   ...tseslint.configs.recommended,
   {
      files: ['**/src/**/*.ts'],
      languageOptions: {
         parser: tseslint.parser,
         parserOptions: {
            project: false,
            sourceType: 'module',
            ecmaVersion: 'latest'
         }
      },
      rules: {
         'no-console': 'off',
         'no-fallthrough': 'off',
         '@typescript-eslint/no-explicit-any': 'off'
      }
   }
];
