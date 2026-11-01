# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run start          # Start dev server with HMR
npm run build          # Type-check and build for production (tsc -b && vite build)
npm run ts:check       # Check TypeScript types without emitting (tsc -p tsconfig.app.json --noEmit)
npm run lint           # Run ESLint
npm run format         # Format src/ with Prettier
npm run preview        # Preview production build locally
npm run test           # Run all unit tests once (vitest run)
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Run tests with coverage report (console output only)
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
- **React Router**: Client-side routing is handled by `react-router` (v8). Routes are defined in `src/routing/AppRoutes.tsx` using `Routes`/`Route` and wrapped with `BrowserRouter` in `src/main.tsx`. For testing, use `MemoryRouter` (see Code Conventions → Routing). Route paths are defined in `src/routing/routing.constants.ts` (`AppPath`), and thread links are built with `getThreadPath(threadId)` from `src/routing/routing.utils.ts`. Import both by file path, not through the `@/routing` barrel: the barrel exports `AppRoutes`, which imports `@/pages`, so pages importing the barrel would create an import cycle.
- **Folder structure**:
  - `src/pages/` — Page components (e.g., `DashboardPage`, `ThreadPage`), each in its own folder with an `index.ts` barrel export. Pages are co-located with their tests in `__tests__/` folders.
  - `src/routing/` — Routing configuration, including `AppRoutes.tsx` which defines all routes.
  - `src/components/lib/` — Reusable UI component adapters (wrappers around Chakra UI components).
  - `src/components/shared/` — App components shared between features (e.g., `ThreadForm` and `ThreadFormModalActions`, used by the Add and Edit thread modals), one folder per component, re-exported from `src/components/shared/index.ts` and imported via `@/components/shared`.
  - `src/hooks/` — Reusable hooks (e.g., `useLocalStorage`, `useFetch`), organized as a folder per hook.
  - `src/services/` — Data-access hooks that return async methods (e.g., `useThreadsService`, which exposes `getThreads`, `createThread`, `updateThread` and `deleteThread`), organized as a folder per service. Threads are currently persisted in `localStorage` under the `threads` key.
  - `src/types/` — Shared TypeScript types, re-exported via a barrel `index.ts`.
  - `src/utils/` — Standalone utility functions, co-located with their tests in `__tests__/`.
  - `src/__mocks__/`, `src/__test-fixtures__/` — Shared test mocks and fixtures.
- **File-naming conventions**: Within a feature folder, split concerns into co-located files by suffix — e.g. `local-storage.hooks.ts` (hooks), `local-storage.types.ts` (types) — and expose them through the folder's `index.ts`.
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
- **Routing in tests**: Components that render links or use routing hooks are tested with `renderWithRouter` from `@/__test-fixtures__` instead of `renderWithUIProvider`. It renders the component on a route, shows the current path in a location marker (`LOCATION_MARKER_TEST_ID`) on every other route, and returns the router.

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

  App-wide notifications are rendered by `Notifications`, which is mounted inside `ChakraUIProvider`, and triggered with `notify.success(message)` or `notify.error(message)` from `@/components/lib`. They appear bottom-right, close automatically after 5 s, and follow the color mode. Tests rendered with `renderWithUIProvider` see them, and `vitest.setup.ts` clears them after each test.

  Adapter props worth knowing: `Menu` takes a `triggerLabel`, a `triggerIcon` and an `items` array (`{ value, label, color?, onSelect }`); `Dialog` accepts `closeDisabled` (blocks Esc, outside click and the × button) and `initialFocusRef`; `Button` accepts `loading` and forwards a ref; `ColorPicker` accepts `disabled`. `LinkOverlay` takes `asChild` and expects a child that renders a link, such as react-router's `Link`; the adapter itself does not import react-router. The whole overlaid area becomes clickable while the child stays a real link. Other interactive elements inside such a card need `zIndex="1"` to stay clickable above the overlay. `FullScreenLoader` takes `shown` and `label`: while `shown` is true it covers the page with a `role="status"` element named by `label`, and it renders nothing otherwise.
