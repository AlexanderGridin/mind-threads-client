# Coding style: Delete a page from a thread section

## From the project
- Arrow-function components and helpers, named exports only, `export const` — `SectionCardActions.tsx`, `DeleteSectionModalContainer.tsx`, `useThreadsService.ts`
- Two or more parameters are passed as one destructured object — `removeThreadSection({ threadId, sectionId })`, `applyDeletedSection({...})`, `useCreateModal`
- `type` aliases only, no `interface` — `ThreadPageLoader.types.ts`, `useThreadsService.types.ts`
- Props type declared in the component file and not exported — `SectionCardActions.tsx`, `PageCard.tsx`
- Component folder layout: `Name.tsx`, `Name.constants.ts`, `Name.utils.ts`, `Name.types.ts`, `Name.hooks.ts` (file-based, kept for `ThreadPageLoader` even though it grows), a `components/` subfolder with its own `components/index.ts`, and an `index.ts` barrel per folder — `SectionsColumn/components/SectionCard/`, `ThreadPageLoader/`
- Test IDs created with `initTestIdCreator("<Component>__")` and exported as `<Component>TestId` with `as const`; the test ID object lives in `.constants.ts` — `SectionCardActions.constants.ts`, `PageCard.constants.ts`
- Message and label helpers return a template string from a block body with `return` — `getSectionDeletedMessage`, `getSectionActionsLabel`
- Error and modal constants are `UPPER_SNAKE_CASE` in `.constants.ts` — `DELETE_SECTION_ERROR_MESSAGE`, `DELETE_SECTION_MODAL_TITLE`
- Conditional rendering with a ternary and `null` — `DeleteSectionModalContainer.tsx`
- Context values are inline objects with no `useMemo`, split into a value context and an action context — `ThreadPageLoader.tsx`
- Services are `useXService` hooks that return async methods and persist through `useLocalStorage({ throwOnError: true })`; storage keys live in `.constants.ts`; one service calls another by relative path — `useThreadsService.ts`, `useSectionPagesService.ts`
- Service and utils helpers return explicit values from block bodies — `findThread`, `applyNewPage`
- Vertical rhythm: an empty line above multiline statements, except the first statement of a block — `useThreadsService.ts`
- Test fixtures are grouped by feature: `<feature>.interactions.ts` (user actions), `<feature>.storage.ts`, `<feature>.queries.ts`, with a `type User = ReturnType<typeof userEvent.setup>` alias — `src/__test-fixtures__/sections/sections.interactions.ts`
- Formatting from `.prettierrc.json`: 2 spaces, double quotes, semicolons, trailing commas `es5`, 80 columns, `arrowParens: "always"`

## From the code guides
- Prefer `type` over `interface` — `typescript.md` rule 1
- Arrow functions instead of function declarations — `typescript.md` rule 2
- Object destructuring for two or more parameters — `typescript.md` rule 3
- No duplicated logic: shared helpers in one place — `typescript.md` rule 4
- Split long functions by logical responsibility — `typescript.md` rule 5
- Named exports only — `typescript.md` rule 6
- Descriptive names, no single-character names outside conventional cases — `typescript.md` rule 7
- No single-line `if` statements; the body goes in braces on its own line — `typescript.md` rule 8
- Implicit one-line arrow returns are not used; use a block body with an explicit `return` — `typescript.md` rule 9
- Empty line above multiline statements (vertical rhythm) — `typescript.md` rule 10
- No explicit `null`, `undefined`, or `""` comparisons in `if`; rely on truthiness unless a strict check is needed (for example, `=== null` in `useThreadsService.ts` stays) — `typescript.md` rule 11
- Function components only, arrow syntax — `react.md` rules 2 and 3
- Component file names are PascalCase — `react.md` rule 1
- Do not create all-in-one components; `DeletePageModalContainer` and `PageCardActions` are separate components — `react.md` rule 7
- Split context values into state and action values — `react.md` rule 8
- Component-specific types in `.types.ts` when there are several or they are complex — `react.md` rule 5
- Test layout follows `unit-tests.md` (loaded for Phase 2): `setup()` / `setupHook()` helpers, `vi.clearAllMocks()`, elements stored in constants before assertion or user-event calls, `toStrictEqual()` for reference types, a root `describe()`, `__tests__/` folders

## Decided by the developer
- Pages are deleted by `id`, never by name → story requirement (plan Style notes)
- `useDeleteModal` is one generic hook shared by sections and pages, the way `useCreateModal` serves both create modals; `useDeleteSection` keeps its return shape → developer decision (plan Style notes)
- `PageCardActions` mirrors `SectionCardActions` with page constants; no shared menu component is extracted → developer decision (plan Style notes)
- Context values are inline objects split into value and action contexts, with no `useMemo` (overrides `react.md` rule 8's memoization wording; the React Compiler is enabled) → developer decision from `create-thread-section.feature.md` (plan Style notes)
- Single-line `if`s, implicit-return one-liners, and `=== null` checks that exist in the project are not copied; new code follows `typescript.md` rules 8, 9, and 11; existing code is not rewritten unless a step changes it → developer decision from `create-thread-section.feature.md` (plan Style notes)
- `useThreadsService` calls `useSectionPagesService` by relative path, and the pages service never calls the threads or sections service → developer decision from `create-section-page.feature.md` (plan Style notes)
- Component props types stay in the component file and are not exported, unless a test or another file needs them → `react.md` rule 4 and project convention, `PageCard.tsx` (plan Style notes)
- Test IDs are imported by file path, because the `index.ts` of a component exports only the component → project convention, `SectionCardActions` (plan Style notes)
- Project file layout wins over `react.md` rule 6: `ThreadPageLoader.hooks.ts` stays file-based and gains `useDeleteModal` and `useDeletePage` (michelangelo priority rule 1)

## Plan notes
- Phase 1 contains no tests or docs; the plan's Phase 2 holds the 11 unit test steps.
- The plan has no documentation steps. Phase 3 is derived from Phase 1: the only candidate is the `DeleteConfirmationModal` usage line in `CLAUDE.md`. The project's memory note says `CLAUDE.md` lists examples rather than inventories, so no Phase 3 step is planned unless the developer asks for one.
