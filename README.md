# Mind Threads — Client

Web client for **Mind Threads**, a React 19 + TypeScript single-page application built with Vite.

## Tech Stack

- **React 19** with the [React Compiler](https://react.dev/learn/react-compiler) enabled (automatic memoization — manual `useMemo`/`useCallback` is generally unnecessary)
- **TypeScript** with strict, type-aware configuration
- **Vite** for dev server (HMR) and production builds
- **Chakra UI** (v3) with a custom Nord color theme and light/dark color modes
- **React Router** (v8) for client-side routing
- **Vitest** + **React Testing Library** for unit and component testing
- **ESLint** (flat config) and **Prettier** for linting and formatting

## Requirements

- **Node.js** ≥ 20 (developed on Node 24)
- **npm** (project uses a `package-lock.json`)

## Getting Started

```bash
# Install dependencies exactly as pinned in package-lock.json
npm ci

# Start the dev server with hot module replacement
npm run start
```

> Use `npm ci` for clean, reproducible installs (CI and fresh setups): it installs
> strictly from `package-lock.json` and fails if the lockfile is out of sync — which
> reinforces this project's pinned-dependency policy. Use `npm install` only when you
> intentionally add or upgrade a dependency, since `npm ci` won't modify the lockfile.

The app will be available at the URL printed by Vite (default: <http://localhost:5173>).

## Available Scripts

| Script | Description |
| --- | --- |
| `npm run start` | Start the Vite dev server with HMR |
| `npm run build` | Type-check and build for production (`tsc -b && vite build`) |
| `npm run preview` | Preview the production build locally |
| `npm run ts:check` | Type-check without emitting output |
| `npm run lint` | Run ESLint over the project |
| `npm run format` | Format `src/` with Prettier |
| `npm run test` | Run all unit tests once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with a coverage report (console output) |
| `npm run test:coverage:report` | Run tests and write a coverage report to `coverage/` |

## Project Structure

```
src/
├── main.tsx              # Entry point (StrictMode → ChakraUIProvider → BrowserRouter → App)
├── App.tsx               # Root component
├── pages/                # Page components, each in its own folder with a barrel export
│   ├── DashboardPage/     #   Dashboard (index route)
│   ├── ThreadPage/        #   Single thread (/threads/:threadId)
│   └── ColorsDemoPage/    #   Theme/color demo (/colors-demo)
├── routing/              # Route definitions (AppRoutes.tsx)
├── components/lib/       # Reusable UI adapters wrapping Chakra UI components
├── components/shared/    # Components shared between pages (e.g. AppLogo)
├── hooks/                # Shared hooks (e.g. useLocalStorage, useFetch)
├── services/             # Data-access hooks (e.g. useThreadsService)
├── types/                # Shared domain types
└── utils/                # Shared utilities
```

### Routes

| Path | Page |
| --- | --- |
| `/` | Dashboard |
| `/threads/:threadId` | Thread page (opened from a dashboard card) |
| `/colors-demo` | Color theme demo |

## Conventions

- **Path alias**: import from `src/` using the `@/` alias (e.g. `import { Button } from "@/components/lib"`).
- **Barrel exports**: each component/module lives in its own folder with an `index.ts`, re-exported by a parent `index.ts`.
- **UI adapters**: Chakra UI components are wrapped in `src/components/lib/` to allow future extraction into a design-system package.
- **Fixed dependency versions**: all packages are pinned (no `^`/`~`) for reproducible builds. Use exact versions when adding or upgrading dependencies.

See [`CLAUDE.md`](./CLAUDE.md) for the full set of code conventions and architectural guidelines.

## Testing

Tests are co-located with the code they cover in `__tests__/` folders and run with Vitest and React Testing Library. Components that rely on Chakra UI should be rendered with `renderWithUIProvider` from `@/components/lib`; components using routing hooks should be wrapped in a `MemoryRouter`.

```bash
npm run test          # single run
npm run test:watch    # watch mode
```
