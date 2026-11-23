# Coding style: Chat page: message composer

## From the project
- Named exports only; no `export default` (the one exception is the CSS module default import, as in `ColorPicker.tsx`) — `src/` (0 default exports)
- Arrow functions for components, hooks, and helpers; no function declarations — `src/` (0 `function` declarations)
- `type` aliases, never `interface` — `src/` (44 files with `export type`, 0 `interface`)
- Component and hook bodies use a block with explicit `return` (39 block bodies vs 7 implicit JSX returns) — `src/pages/ThreadPage/components/ThreadPageLoader/ThreadPageLoader.tsx`
- Conditional JSX uses ternaries with `: null`, never `&&` — `CLAUDE.md` → Code Conventions; `src/` (27 ternaries, 0 `&&` in JSX)
- Event handlers are named `handle[EventName]` and defined outside JSX — `CLAUDE.md`; `src/` (25 occurrences)
- Object parameters for two or more arguments, e.g. `usePageSelection({ pages })`, `useAddPage({ addPage, selectedSection })` — `ThreadPageLoader.hooks.ts`
- Feature folders split concerns by suffix, exposed through `index.ts` barrels with `export * from` — `ThreadPageLoader/` (`.hooks.ts`, `.types.ts`, `.constants.ts`, `.utils.ts`, `.context.ts`, `.tsx`)
- Several hooks and their types share one `<Name>.hooks.ts` / `<Name>.types.ts` file, not a folder per hook — `ThreadPageLoader/ThreadPageLoader.hooks.ts`
- Context values are inline objects split into value and action contexts; no `useMemo` (React Compiler is on) — `ThreadPageLoader.tsx`; `vite.config.ts`
- Test IDs come from `initTestIdCreator("<Component>__")` in `<Component>.constants.ts`, exposed as a `<Component>TestId` object with `as const` — `Notifications.constants.ts`, `SectionCard.constants.ts`
- Chakra is used only through `@/components/lib` adapters; feature code never imports `@chakra-ui/react` — `CLAUDE.md` → Third-party Libraries
- Component props types stay in the component file and are not exported — `PageCard.tsx`
- Prettier: 2 spaces, double quotes, semicolons, trailing commas `es5`, 80 columns — `.prettierrc.json`
- Route and shared imports use `@/` aliases; co-located imports within a feature are relative — `PageCard.tsx`, `ThreadPageLoader.hooks.ts`
- Tests are co-located in `__tests__/`, with `setup()` helpers and `renderWithUIProvider` — `CLAUDE.md` → Code Conventions

## From the code guides
- Block-bodied arrow functions with explicit `return` (no implicit returns in helpers) — `typescript.md` rule 9
- Vertical rhythm: an empty line above every multiline statement, except the first in a block — `typescript.md` rule 10
- No single-line `if`s; always braces on their own lines — `typescript.md` rule 8
- Truthiness checks, no `=== null` / `!== ""` comparisons unless strictness matters — `typescript.md` rule 11
- No single-character names, except `e` for events and similar well-known cases — `typescript.md` rule 7
- Split long functions by logical concern, not by size; do not repeat code, extract shared functions — `typescript.md` rules 4 and 5
- Object parameters for two or more arguments — `typescript.md` rule 3
- Component files are PascalCase; one component per file, no all-in-one components — `react.md` rules 1, 7
- Component-specific types live in `<Name>.types.ts` — `react.md` rule 5
- Commands implement a plain `execute(context)` object with a receiver; invokers never touch the editor directly — `message-composer.feature.md` Style notes (Command pattern)

## Decided by the developer
- Tiptap 3 (`@tiptap/*`, all pinned to exactly `3.32.2`); `document.execCommand()` is never used → from the plan's Style notes (developer decision, story discovery note and step 6 answer)
- Command objects with `execute(context)`: toolbar, Send, and keyboard shortcuts are invokers; `ComposerCommandContext` is the receiver; data-carrying actions use factories such as `createInsertLinkCommand(url)`; tag-field input stays in `useComposerTags`; Tiptap's own extra shortcuts stay as Tiptap provides them → from the plan's Style notes (developer note; boundary chosen by the architect)
- Composer files use the project's file-based layout (`MessageComposer.hooks.ts`, `.utils.ts`, `.types.ts`, `.constants.ts`), plus `MessageComposer.commands.ts` and `MessageComposer.extensions.ts`; this wins over `react.md` rule 6 → from the plan's Style notes (project convention, rule 1 priority)
- Content styles that Chakra props cannot reach go in `MessageComposer.module.css`; layout styles stay as Chakra props on lib adapters → from the plan's Style notes (project convention, `ColorPicker.module.css`)
- Chakra is used only through lib adapters; extend an adapter when a prop is missing; the hidden native `<input type="file">` is the one exception → from the plan's Style notes
- Page selection mirrors section selection: `usePageSelection` derives `selectedPage` from `pages`; switching sections clears the page; returning to a section does not restore it; `PageCard` mirrors `SectionCard` and no shared card component is extracted → from the plan's Style notes (developer decision, plan review)
- Context values are inline objects split into value and action contexts, with no `useMemo` → from the plan's Style notes (developer decision in `create-thread-section.feature.md`)
- Single-line `if`s, implicit-return one-liners, and `=== null` checks that exist in the project are not copied → from the plan's Style notes (developer decision in `create-thread-section.feature.md`)
- Component props types stay in the component file → from the plan's Style notes (`react.md` rule 4, project convention)
- Test IDs use `initTestIdCreator` in `<Component>.constants.ts`; each `index.ts` exports only the component → from the plan's Style notes (project convention)
- Formatting: 2 spaces, double quotes, 80 columns → from the plan's Style notes (`.prettierrc.json`)
