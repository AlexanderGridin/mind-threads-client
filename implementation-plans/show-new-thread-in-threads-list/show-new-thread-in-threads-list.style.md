# Coding style: Show created threads on the dashboard

## From the project
- Files split by concern with dotted suffixes: `<Name>.constants.ts`, `<Name>.types.ts`, `<Name>.hooks.ts`, `<Name>.utils.ts`, `<Name>.context.ts` (singular), `<Name>.tsx` — `src/pages/DashboardPage/components/DashboardPageLoader/`, `src/hooks/useFetch/`
- Hook folders hold one hook per `use<Name>.ts` with `use<Name>.types.ts`, `use<Name>.utils.ts`, `use<Name>.errors.ts` and an `index.ts` that re-exports everything — `src/hooks/useFetch/`, `src/hooks/useLocalStorage/`
- Every component folder has an `index.ts` (`export * from "./X";`), and each parent folder re-exports its children — `src/pages/DashboardPage/components/index.ts`
- Test IDs are built with `initTestIdCreator("<Name>__")` in `<Name>.constants.ts`, exposed as a `<Name>TestId` object with `as const` — `src/pages/DashboardPage/components/DashboardContent/components/MindThreadList/MindThreadList.constants.ts`
- User-visible strings and other constants are exported `UPPER_SNAKE_CASE` from the component's `*.constants.ts` — `AddNewThread.constants.ts`, `ThreadForm.constants.ts`
- Enumerations are `as const` objects in `DashboardPage.constants.ts`, with a derived union type in `DashboardPage.types.ts` — `ThreadListMode` / `ThreadListModeType`
- Components are arrow functions (`export const X = (...) => ...`) with a props type named `XProps`; some existing props types are exported, some are not — `AddNewThreadModal.tsx`, `ChakraUIProvider.tsx`
- Internal JSX handlers are named `handle<Event>` and passed by name — `ThreadForm.tsx`, `AddNewThreadModal.tsx`. Context actions keep their plain names (`toggleThreadListMode`)
- Conditional rendering uses ternaries with `: null` — `AddNewThread.tsx`
- Context pattern: `createContext<X | null>(null)` in `*.context.ts`, read through `use<X>Value` / `use<X>Action` hooks in `*.hooks.ts` that call `checkContext` from `@/utils` — `DashboardPageLoader.hooks.ts`
- Imports: `import type` for types; path alias `@/` for cross-feature imports; relative `../` inside a feature — `MindThreadList.tsx`, `DashboardPageLoader.tsx`
- Chakra adapters from `@/components/lib` (`Box`, `Text`, `VStack`, `Button`, `Dialog`) with theme tokens (`bg.muted`, `fg.muted`, `accent`) — `src/components/lib/`
- Formatting: Prettier with printWidth 80, 2 spaces, double quotes, semicolons, `trailingComma: "es5"` — `.prettierrc.json`
- Lint: ESLint flat config with `react-hooks` and `react-refresh` (component files should export only components) — `eslint.config.js`
- No manual `useMemo`/`useCallback`: the React Compiler handles memoization — `CLAUDE.md`
- Tests are co-located in `__tests__/`, use `renderWithUIProvider` from `@/components/lib`, and wrap routing with `MemoryRouter` — `CLAUDE.md`
- New top-level service folder `src/services/` with a folder per service and a barrel `index.ts` — mirrors `src/hooks/` (`project-structure.md`)

## From the code guides
- Prefer `type` over `interface` — `typescript.md` rule 1
- Arrow functions for functions and components — `typescript.md` rule 2, `react.md` rule 3
- Functions with 2+ parameters take one destructured object — `typescript.md` rule 3
- Do not repeat yourself; extract shared functions — `typescript.md` rule 4
- Split long functions by logical responsibility — `typescript.md` rule 5
- Named exports and imports only, no default exports — `typescript.md` rule 6
- Descriptive names; no single-character names except conventions such as `e` for errors — `typescript.md` rule 7
- Component files use PascalCase; function components only — `react.md` rules 1–2
- Component-specific types go in `<Component>.types.ts`; the props type stays in the component file — `react.md` rules 4–5
- Component-specific hooks and utils use `<Component>.hooks.ts` / `<Component>.utils.ts` — `react.md` rule 6
- No all-in-one components: separate elements that can stand alone — `react.md` rule 7
- Context values are split into state values and action values — `react.md` rule 8 (state memoization is left to the React Compiler, per `CLAUDE.md`)
- A frontend `services/` folder holds hooks that return methods — `project-structure.md`

## Decided by the developer
- `useLocalStorage` gets an opt-in strict mode (`throwOnError: true`) that rethrows read/write errors after logging them; the default stays log-and-swallow → opt-in strict mode (from the plan's Style notes)
- Functions with 2+ parameters take one destructured object, so `useLocalStorage` changes to `useLocalStorage({ key, throwOnError })`, matching `useFetch({ baseUrl, defaultHeaders })` → destructured object (from the plan's Style notes; `typescript.md` rule 3)
- Services are hooks returning async methods, in `src/services/<useXService>/` with the `useLocalStorage` file split (`<name>.ts`, `<name>.types.ts`, `<name>.constants.ts`, `<name>.utils.ts`, `index.ts`) → adopted (from the plan's Style notes)
- Enumerations: `as const` objects in `DashboardPage.constants.ts` with derived union types in `DashboardPage.types.ts` → adopted (from the plan's Style notes)
- Test IDs via `initTestIdCreator` in `<Component>.constants.ts`, and user-visible strings as constants in the same file → adopted (from the plan's Style notes)
- The context file keeps the project's `DashboardPageLoader.context.ts` name instead of `.contexts.ts` → project name wins (from the plan's Style notes)
- Props types of new components are declared in the component file and not exported → adopted (from the plan's Style notes; `react.md` rule 4)
- Non-component exports (the toaster instance, `notify`) go in a separate `Notifications.toaster.ts` file, because `eslint-plugin-react-refresh` flags component files that also export non-components → adopted (from the plan's Style notes)
- Conditional JSX uses ternaries; a component that switches between several views may use early `return`s → adopted (from the plan's Style notes; `CLAUDE.md`)
- The "Add new thread" modal's open state moves from the header into the `DashboardPageLoader` context, so the header and the empty state open one modal instance → adopted (from the plan's Style notes; AC11)
- Test helper for hooks is named `setup()`, not `setupHook()` (`unit-tests.md` rule 2) → project convention wins; the plan's Phase 2 Step 4 `setupHook()` is read as `setup()` (decided in Phase 2, Step 2)
