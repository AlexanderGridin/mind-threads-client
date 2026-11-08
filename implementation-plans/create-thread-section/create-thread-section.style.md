# Coding style: Create a section in a thread

## From the project
- Files named by role inside a feature folder: `<Component>.tsx`, `<Name>.constants.ts`, `<Name>.utils.ts`, `<Name>.hooks.ts`, `<Name>.types.ts`, `<Name>.context.ts`, plus an `index.ts` barrel in every folder — `src/pages/DashboardPage/components/DashboardPageLoader/`, `src/services/useThreadsService/`
- Context files are `<Name>.context.ts` (singular), with `createContext<... | null>(null)` — `src/pages/DashboardPage/components/DashboardPageLoader/DashboardPageLoader.context.ts`
- Component folders nest sub-components in a `components/` subfolder, each with its own folder and barrel — `src/pages/DashboardPage/components/DashboardContent/components/`
- Small props type sits in the component file, not exported; component-specific types go to `<Name>.types.ts` — `src/pages/DashboardPage/components/DashboardPageLoader/DashboardPageLoader.types.ts`
- Private type guards and pure helpers live in `<Name>.utils.ts`, and functions with several parameters take one object — `src/services/useThreadsService/useThreadsService.utils.ts` (`buildThread({ title, color })`)
- Named exports only, arrow-function components, `type` over `interface`, `import type` for types — `src/components/lib/Button/Button.tsx`, `CLAUDE.md`
- Adapters that need a ref use `forwardRef` with `displayName`, and keep an explicit prop list — `src/components/lib/Button/Button.tsx`
- Test IDs come from `initTestIdCreator("<Name>__")` in `*.constants.ts` — `src/components/lib/ColorPicker/ColorPicker.constants.ts`
- User-visible messages are `UPPER_SNAKE_CASE` constants; messages built from a name are `get...` functions in `*.utils.ts` — `src/pages/DashboardPage/components/DashboardPageLoader/DashboardPageLoader.utils.ts`
- Event handlers are named `handle<Event>`, conditional rendering uses a ternary, and no `useMemo`/`useCallback` is written (the React Compiler memoizes) — `CLAUDE.md`
- Context values are plain inline objects, split into a value context and an action context — `CLAUDE.md`, `src/pages/DashboardPage/components/DashboardPageLoader/`
- Hooks wrap state in `use<Name>Value` / `use<Name>Action` helpers that call `checkContext` — `src/pages/DashboardPage/components/DashboardPageLoader/DashboardPageLoader.hooks.ts`
- Tests: `setup()` helper per file, `renderWithUIProvider` for Chakra components, `renderWithRouter` for routed components — `CLAUDE.md`
- Formatting: 80 columns, 2 spaces, double quotes, trailing commas `es5`, semicolons — `.prettierrc.json` (Prettier runs on `src/`)

## From the code guides
- Arrow functions with a block body and an explicit `return` (no implicit returns) — `typescript.md` rules 2, 9
- Two or more parameters are passed as one destructured object — `typescript.md` rule 3
- Do not repeat code; move shared logic into one function (for example `findThread`, `formatCount`) — `typescript.md` rule 4
- Split long functions by logical responsibility — `typescript.md` rule 5
- Meaningful names; no single-letter names except `e` for events and errors — `typescript.md` rule 7
- Braces on every `if` body, on their own lines — `typescript.md` rule 8
- Vertical rhythm: an empty line above every multiline statement that is not first in its block — `typescript.md` rule 10
- Truthiness checks instead of comparing with `null`, `undefined` or `""` — `typescript.md` rule 11
- Component files are PascalCase; function components only, as arrow functions — `react.md` rules 1–3
- Do not create all-in-one components; split out separate components — `react.md` rule 7
- Context providers split state values from action values — `react.md` rule 8

## Decided by the developer
- `.context.ts` file name (project) over `.contexts.ts` (react.md) → `.context.ts` (from the plan's Style notes)
- Context values are inline objects with no `useMemo` (project, React Compiler) over react.md's memoization → no `useMemo` (from the plan's Style notes)
- Single-line `if`s and implicit-return one-liners in the project are not copied → guide rules 8 and 9 apply; existing code is not rewritten unless a step changes it (from the plan's Style notes)
- `useThreadSectionsService` is a separate service with `getThreadSections`, `createThreadSection`, `deleteThreadSections`; sections stored under the `sections` localStorage key as a flat list (from the plan's Style notes)
- `useThreadsService` calls `useThreadSectionsService()` and imports it by relative path `../useThreadSectionsService`, not through the `@/services` barrel; the sections service never calls the threads service (from the plan's Style notes)
- `SectionForm` is a new form; `ThreadForm` is not generalized; `ThreadFormModalActions` is reused with a union prop type (`onSubmit` or `formId`) (from the plan's Style notes)
- `ThreadPageLoader` holds the thread page state with value and action contexts, mirroring `DashboardPageLoader`; `useThreadState` moves into its hooks file (from the plan's Style notes)
- `DEFAULT_SWATCH_COLOR` in `ColorPicker.constants.ts` is shared by both colour forms (from the plan's Style notes)
- `addThreadSection` writes the section before the thread; the thread's `lastUpdated` is the section's `createdAt` (from the plan's Style notes)
- `useLocalStorage` drops its cache on a `storage` event for its key (from the plan's Style notes)
- Enter submits through the form's `onSubmit` via `type="submit"` with `form={formId}`; `handleSubmit` calls `event.preventDefault()`; unit tests use `fireEvent.submit` instead of pressing Enter (from the plan's Style notes)
- `TruncatedText` controls a Chakra tooltip and opens it only when `scrollWidth > clientWidth` (from the plan's Style notes)
- Adapter props are added only as needed (from the plan's Style notes)
