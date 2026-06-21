# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server with HMR
npm run build    # Type-check and build for production (tsc -b && vite build)
npm run lint     # Run ESLint
npm run preview  # Preview production build locally
```

No test runner is configured yet — a draft to add Vitest lives in `.doc/add-vitest.draft.md`.

## Architecture

This is a React 19 + TypeScript + Vite project in its early stages (only a stub `App` component exists).

Key technical choices:
- **React Compiler** is enabled via `babel-plugin-react-compiler` + `@rolldown/plugin-babel` in `vite.config.ts`. This means manual `useMemo`/`useCallback` is generally unnecessary — the compiler handles memoization automatically.
- **ESLint** uses flat config (`eslint.config.js`) with `typescript-eslint`, `eslint-plugin-react-hooks`, and `eslint-plugin-react-refresh`.
- Entry point: `src/main.tsx` → `src/App.tsx`.
