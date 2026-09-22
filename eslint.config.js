import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['**/dist/**', '**/node_modules/**', '**/coverage/**', '.cache/**', '.pnpm-store/**'] },
  ...tseslint.configs.recommended,
);
