# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run start          # Start dev server with HMR (alias for dev)
npm run dev            # Start dev server with HMR
npm run build          # Type-check and build for production (tsc -b && vite build)
npm run lint           # Run ESLint
npm run format         # Format src/ with Prettier
npm run preview        # Preview production build locally
npm run test              # Run all unit tests once (vitest run)
npm run test:watch        # Run tests in watch mode
npm run test:coverage     # Run tests with coverage report (console output only)
npm run test:coverage:report  # Run tests and generate coverage report in coverage/ folder
```

## Package Management

All packages in `package.json` use fixed versions (no caret `^` or tilde `~` ranges). This ensures consistent, reproducible builds across environments. When adding or updating packages, use exact versions in `package.json`.

## Architecture

This is a React 19 + TypeScript + Vite project in its early stages (only a stub `App` component exists).

Key technical choices:
- **React Compiler** is enabled via `babel-plugin-react-compiler` + `@rolldown/plugin-babel` in `vite.config.ts`. This means manual `useMemo`/`useCallback` is generally unnecessary — the compiler handles memoization automatically.
- **ESLint** uses flat config (`eslint.config.js`) with `typescript-eslint`, `eslint-plugin-react-hooks`, and `eslint-plugin-react-refresh`.
- **Prettier** is configured via `.prettierrc.json` and formats only files in the `src/` folder.
- **Testing** uses Vitest with React Testing Library. Test files live in `src/__tests__/` with `.test.tsx` / `.test.ts` extensions. Vitest configuration is in `vitest.config.ts` and the setup file is `vitest.setup.ts` at the project root.
- Entry point: `src/main.tsx` → `src/App.tsx`.

## Code Conventions

- **Conditional rendering**: Use ternary operators instead of `&&` operator for clarity and consistency.
- **Event handlers**: Create internal `handle[EventName]()` functions for event handlers (e.g., `handleToggleVisibility()`) instead of inline arrow functions in JSX.
- **Variable names**: Avoid single-letter variable names. Use descriptive names like `value`, `item`, `count` instead of `v`, `i`, `c`.
- **Test setup**: Create a reusable `setup()` function within test files to avoid duplicating render and userEvent.setup() calls. The function should return the user object for use in tests.
