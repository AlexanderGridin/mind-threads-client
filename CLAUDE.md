# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run start          # Start dev server with HMR (alias for dev)
npm run dev            # Start dev server with HMR
npm run build          # Type-check and build for production (tsc -b && vite build)
npm run ts:check       # Check TypeScript types without emitting (tsc -p tsconfig.app.json --noEmit)
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

This is a React 19 + TypeScript + Vite project with client-side routing.

Key technical choices:
- **React Compiler** is enabled via `babel-plugin-react-compiler` + `@rolldown/plugin-babel` in `vite.config.ts`. This means manual `useMemo`/`useCallback` is generally unnecessary — the compiler handles memoization automatically.
- **ESLint** uses flat config (`eslint.config.js`) with `typescript-eslint`, `eslint-plugin-react-hooks`, and `eslint-plugin-react-refresh`.
- **Prettier** is configured via `.prettierrc.json` and formats only files in the `src/` folder.
- **Testing** uses Vitest with React Testing Library. Component tests live co-located with components in `__tests__/` folders (e.g., `src/components/lib/Button/__tests__/Button.test.tsx`). Vitest configuration is in `vitest.config.ts` and the setup file is `vitest.setup.ts` at the project root.
- **Path aliases**: The project uses path alias `@/` (configured in `tsconfig.app.json` and `vite.config.ts`) to import from `src/`. Example: `import { Button } from "@/components/lib"`.
- **React Router**: Client-side routing is handled by `react-router` (v8). Routes are defined in `src/routing/AppRoutes.tsx` and wrapped with `BrowserRouter` in `src/main.tsx`.
- **Folder structure**:
  - `src/pages/` — Page components (e.g., `HomePage`, `ThreadPage`), each in its own folder with an `index.ts` barrel export. Pages are co-located with their tests in `__tests__/` folders.
  - `src/routing/` — Routing configuration, including `AppRoutes.tsx` which defines all routes.
  - `src/components/lib/` — Reusable UI component adapters (wrappers around Chakra UI components).
- Entry point: `src/main.tsx` wraps the app with `StrictMode` → `ChakraUIProvider` → `BrowserRouter` → `src/App.tsx`.

## Code Conventions

- **Conditional rendering**: Use ternary operators instead of `&&` operator for clarity and consistency.
- **Event handlers**: Create internal `handle[EventName]()` functions for event handlers (e.g., `handleToggleVisibility()`) instead of inline arrow functions in JSX.
- **Variable names**: Avoid single-letter variable names. Use descriptive names like `value`, `item`, `count` instead of `v`, `i`, `c`.
- **Test setup**: Create a reusable `setup()` function within test files that calls a render function with the component under test and `userEvent.setup()`. For components using Chakra UI, use `renderWithUIProvider` from `@/components/lib` (which wraps the component with `ChakraUIProvider`). The function should return the user object and render result only when the render result is used within the tests.
- **Types vs Interfaces**: Prefer `type` over `interface`. Only use `interface` when you need its specific features (declaration merging, built-in object compatibility).
- **Type-only imports**: Use `import type` for importing types (e.g., `import type { ReactNode } from "react"`). Required by `verbatimModuleSyntax` compiler option.
- **Component functions**: Use arrow functions for components instead of function declarations (e.g., `export const MyComponent = () => {}`).
- **Barrel exports**: Use barrel exports (`index.ts`) at multiple levels. Each component lives in its own folder with an `index.ts` (e.g., `src/components/lib/Button/index.ts`), and the parent folder also has an `index.ts` that re-exports all components (e.g., `src/components/lib/index.ts`). This enables easier future extraction to separate packages.
- **Routing**: When testing components that use routing hooks (e.g., `useNavigate`), wrap them with `MemoryRouter` to provide routing context. Example:
  ```tsx
  renderWithUIProvider(
    <MemoryRouter initialEntries={["/"]}>
      <App />
    </MemoryRouter>
  );
  ```

## Third-party Libraries

- **Chakra UI**: The app is initialized with `ChakraUIProvider` (wrapper for Chakra's `ChakraProvider`) in `src/main.tsx`. This provider must wrap the entire app. Component adapters are stored in `src/components/lib/` — these wrap Chakra UI components and are re-exported via `src/components/lib/index.ts`. Example pattern:
  ```tsx
  // src/components/lib/Button/Button.tsx
  import { Button as ChakraButton } from "@chakra-ui/react";
  export const Button = ({ children, onClick }: ButtonProps) => (
    <ChakraButton onClick={onClick}>{children}</ChakraButton>
  );
  ```
  This structure allows for easier future extraction into a separate design system package. For testing components that use Chakra UI, always use `renderWithUIProvider` from `@/components/lib`.
- **React Router**: Client-side routing library (v8) used for page navigation. Routes are defined in `src/routing/AppRoutes.tsx` using `Routes` and `Route` components. The app is wrapped with `BrowserRouter` in `src/main.tsx` to provide routing context. For testing, use `MemoryRouter` to simulate navigation without affecting the browser history.
