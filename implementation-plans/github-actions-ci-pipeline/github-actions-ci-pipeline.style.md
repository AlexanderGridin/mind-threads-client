# Coding style: CI pipeline and GitHub Pages publishing

## From the project
- Non-component files use lowercase, dot-suffixed names, e.g. `routing.utils.ts`, `router.constants.ts` — `src/routing/`, `src/__test-fixtures__/`
- Component files use PascalCase; one folder per component with an `index.ts` barrel — `src/components/lib/`
- Named exports only; barrel `index.ts` re-exports — `src/components/lib/index.ts`, `src/__test-fixtures__/index.ts`
- Arrow functions with block bodies and explicit `return` — `src/routing/routing.utils.ts`, `src/__test-fixtures__/deferred.ts`
- `type` over `interface` — `src/components/lib/**`
- Tests in `__tests__/` next to the code they test, named after the source file — `src/utils/__tests__/checkContext.test.ts`
- Path alias `@/` for imports from `src/`; relative imports within a folder — `tsconfig.app.json`, `src/components/lib/utils/tests-helpers.ts`
- Prettier: 2-space indent, double quotes, semicolons, trailing commas `es5`, `arrowParens: always`, print width 80 — `.prettierrc.json` (applies to `src/` only)
- `verbatimModuleSyntax`: type-only imports use `import type` — `tsconfig.app.json`, `tsconfig.node.json`
- Config files (`vite.config.ts`) use a default export because the tooling requires it — `vite.config.ts`
- Vitest globals are enabled in `src` and `vitest.setup.ts`, not in `vite-plugins/` — `tsconfig.app.json`, `tsconfig.node.json`
- Test helpers live in `src/__test-fixtures__/`; the mocks folder is `src/__mocks__/` (not present yet) — `CLAUDE.md`, `vitest.config.ts`
- Single-line `if` is used in 10 places and braced in 29 — `src/utils/checkContext.ts` (left as is)

## From the code guides
- Use `type` over `interface` — `typescript.md` rule 1
- Arrow functions instead of function declarations — `typescript.md` rule 2
- Functions with 2+ parameters take one destructured object argument — `typescript.md` rule 3 (see Decided by the developer)
- No duplicated code; extract shared functions — `typescript.md` rule 4
- Split long functions by logical responsibility — `typescript.md` rule 5
- Named exports and imports only — `typescript.md` rule 6
- Meaningful names; no single-character names — `typescript.md` rule 7
- No single-line `if`; braces on their own lines — `typescript.md` rule 8 (see Decided by the developer)
- Explicit `return` in arrow function block bodies — `typescript.md` rule 9
- Empty line above every multiline statement, unless first in its block — `typescript.md` rule 10
- Rely on truthiness, no explicit `null`/`undefined` comparisons — `typescript.md` rule 11
- Test files have a root `describe()` block; clear mocks before each test — `unit-tests.md` rules 8, 9
- Store an element in a constant before asserting or passing it to a user event — `unit-tests.md` rules 13, 18
- Use `toStrictEqual()` for reference types — `unit-tests.md` rule 11
- Use `.not.toBeInTheDocument()` on a stored `queryBy*()` result, not `toBeNull()` — `unit-tests.md` rule 19
- Mock a module once per test file and wrap its real implementation — `unit-tests.md` rule 16
- Create a shared test helper in one file rather than copying it between files — `unit-tests.md` rule 5
- Put component-specific types in `<Name>.types.ts` — `react.md` rule 5
- Place new files by the frontend structure (`components/`, `utils/`, `hooks/`, `pages/`, `routing/`, `types/`, `services/`) — `project-structure.md`

## Decided by the developer
- `renderWithUIProvider` moves to `src/components/lib/__test-fixtures__/`, outside the `@/components/lib` barrel → kept out of the barrel (plan Style notes)
- Test files keep their current import style for the helper: relative imports stay relative (`../../__test-fixtures__`); alias imports use `@/components/lib/__test-fixtures__` (plan Style notes)
- Non-component files use lowercase, dot-suffixed names, such as `forbid-test-code.plugin.ts` (plan Style notes)
- Actions in the workflow are pinned to a full commit hash with the version in a trailing comment (plan Style notes)
- Workflow job names are exactly `Audit`, `Tests`, `Build`, and `Publish` (plan Style notes)
- `vite-plugins/` tests import `describe`, `it`, and the others from `vitest` explicitly (plan Style notes)
- Functions with 2+ parameters take one destructured object argument for new code; existing positional functions (`checkContext`, `renderWithUIProvider`) stay as they are, and `renderWithUIProvider` moves unchanged → guide rule (developer answer)
- `if` statements in new code use braces on their own lines; existing single-line ifs stay as they are → guide rule (developer answer)
