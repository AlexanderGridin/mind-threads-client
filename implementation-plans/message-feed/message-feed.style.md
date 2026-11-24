# Coding style: Chat Page Message Feed

## From the project
- Named exports only; no `export default` (the one exception is the CSS module default import, as in `ColorPicker.tsx`) — `src/` (0 default exports)
- Arrow functions for components, hooks, and helpers; no function declarations — `src/` (0 `function` declarations)
- `type` aliases, never `interface` — `src/` (44 files with `export type`, 0 `interface`)
- Component and hook bodies use a block with explicit `return` — `src/pages/ThreadPage/components/ThreadPageLoader/ThreadPageLoader.tsx`
- Conditional JSX uses ternaries with `: null`, never `&&` — `CLAUDE.md` → Code Conventions; `src/` (27 ternaries, 0 `&&` in JSX)
- Event handlers are named `handle[EventName]` and defined outside JSX — `CLAUDE.md`; `src/` (25 occurrences)
- Object parameters for two or more arguments, e.g. `usePageSelection({ pages })` — `ThreadPageLoader.hooks.ts`
- Feature folders split concerns by suffix (`.hooks.ts`, `.types.ts`, `.constants.ts`, `.utils.ts`, `.tsx`), exposed through `index.ts` barrels with `export * from` — `ThreadPageLoader/`, `src/services/useSectionPagesService/`
- Several hooks and their types share one `<Name>.hooks.ts` / `<Name>.types.ts` file, not a folder per hook — `ThreadPageLoader/ThreadPageLoader.hooks.ts`
- Context values are inline objects split into value and action contexts; no `useMemo` (React Compiler is on) — `ThreadPageLoader.tsx`; `vite.config.ts`
- Test IDs come from `initTestIdCreator("<Component>__")` in `<Component>.constants.ts`, exposed as a `<Component>TestId` object with `as const` — `Notifications.constants.ts`, `SectionCard.constants.ts`
- Chakra is used only through `@/components/lib` adapters; feature code never imports `@chakra-ui/react` — `CLAUDE.md` → Third-party Libraries
- Component props types stay in the component file and are not exported — `PageCard.tsx`
- Prettier: 2 spaces, double quotes, semicolons, trailing commas `es5`, 80 columns — `.prettierrc.json`
- Route and shared imports use `@/` aliases; co-located imports within a feature are relative — `PageCard.tsx`, `ThreadPageLoader.hooks.ts`
- Shared components inside a feature folder are imported by direct folder path, not through a parent barrel, to avoid import cycles — `CLAUDE.md` → Routing (`@/routing` note)
- CSS modules are used for descendant styles that Chakra props cannot reach — `MessageComposer.module.css`, `ColorPicker.module.css`
- Tests are co-located in `__tests__/`, with `setup()` helpers and `renderWithUIProvider` — `CLAUDE.md` → Code Conventions
- `tsconfig.app.json` includes test files, so `npm run ts:check` also type-checks `__tests__` — `tsconfig.app.json`

## From the code guides
- Block-bodied arrow functions with explicit `return` (no implicit returns in helpers) — `typescript.md` rule 9
- Vertical rhythm: an empty line above every multiline statement, except the first in a block — `typescript.md` rule 10
- No single-line `if`s; always braces on their own lines — `typescript.md` rule 8
- Truthiness checks, no `=== null` / `!== ""` comparisons unless strictness matters (e.g. `typeof value === "object" && value !== null` in the type guards) — `typescript.md` rule 11
- No single-character names, except `e` for events and similar well-known cases — `typescript.md` rule 7
- Split long functions by logical concern, not by size; do not repeat code, extract shared functions — `typescript.md` rules 4 and 5
- Object parameters for two or more arguments — `typescript.md` rule 3
- Named imports and exports only — `typescript.md` rule 6
- `import type` for type-only imports — `CLAUDE.md` → Code Conventions
- Component files are PascalCase; one component per file, no all-in-one components — `react.md` rules 1, 7
- Component-specific types live in `<Name>.types.ts` — `react.md` rule 5
- Component-specific utils and hooks live in `<Name>.utils.ts` / `<Name>.hooks.ts` — `react.md` rule 6
- Provider-style context values are split into value and action contexts — `react.md` rule 8

## Decided by the developer
- Sanitizer is DOMPurify, pinned to `dompurify@3.4.17`; virtualization is `@tanstack/react-virtual@3.14.26`; both exact versions, no `@types/dompurify` → from the plan's Style notes (developer decision; `CLAUDE.md` → Package Management)
- Message HTML is sanitized with a dedicated DOMPurify instance (`DOMPurify(window)`), and DOMPurify is imported in exactly one file (`MessageContent.utils.ts`) → from the plan's Style notes (developer decision)
- Virtualization uses `useVirtualizer` with dynamic row measurement (`measureElement` + `data-index`). Only `MessageList` calls it, and that component starts with `"use no memo"` → from the plan's Style notes (developer decision; React Compiler is on)
- Rich-text descendant styles are shared between the composer and the feed through one `richText` class in `ChatPageView.module.css`, not copied → from the plan's Style notes (project convention, `typescript.md` rule 4)
- The feed reuses the read-only `TagChip`, moved to `CHAT/components/TagChip/` with an optional `onRemove` → from the plan's Style notes (project structure, rule 4)
- Message reads and writes go through `useThreadsService` (`getPageMessages`, `addPageMessage`) and reach `ChatPageView` through `ThreadPageActionContext`; `ChatPageView` never calls `usePageMessagesService` directly → from the plan's Style notes (architect decision, same pattern as `addSectionPage`)
- Deleting a section or a thread also deletes its messages, the same way it deletes its pages → from the plan's Style notes (architect decision)
- Deleting a Chat page's messages runs even when the page was already deleted elsewhere and runs last, after the thread bookkeeping, so invalid stored messages cannot leave stale counters → from the plan (Phase 1, Step 5; review point 3)
- Sending a message returns `Promise<boolean>` and the composer clears only on success; the error notification belongs to the caller → from the plan (Phase 1, Step 7)
- Messages are stored newest first: `createMessage` prepends, and filtering keeps order without sorting → from the plan (Phase 1, Step 4)
- Component props types stay in the component file → from the plan's Style notes (`react.md` rule 4, project convention)
- Test IDs use `initTestIdCreator` in `<Component>.constants.ts`; each `index.ts` exports only the component → from the plan's Style notes (project convention)
- Formatting: 2 spaces, double quotes, 80 columns → from the plan's Style notes (`.prettierrc.json`)
- Composer files follow the file-based layout of the message composer feature (`MessageComposer.hooks.ts`, `.types.ts`, `.constants.ts`, `.utils.ts`) → from `implementation-plans/message-composer/message-composer.style.md`
- Path shorthand: `CHAT/` = `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PageView/components/ChatPageView/`; code and commits always use the full path → from the plan's Style notes (plan convention)
