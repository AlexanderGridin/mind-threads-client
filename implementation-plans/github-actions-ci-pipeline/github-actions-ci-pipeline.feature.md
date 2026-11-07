# CI pipeline and GitHub Pages publishing: Mind Threads client

**Source:** `implementation-plans/github-actions-ci-pipeline/github-actions-ci-pipeline.draft.md`

## Acceptance criteria

Prerequisites

- AC1: Every secret found in the repo's full history is revoked and removed before pipeline work starts.
- AC2: After the secrets check, the repo is public and GitHub Pages is enabled.

Pipeline triggers and order

- AC3: A pull request targeting `main` runs Audit, Tests, and Build in that order.
- AC4: Publish does not run on a pull request.
- AC5: A merge into `main` runs Audit, Tests, Build, and Publish in that order.
- AC6: After two quick merges into `main`, the published site shows the newer merge.
- AC7: On the current `main` (10 moderate advisories, none high or critical, coverage above thresholds), the first run passes all four steps.

Audit

- AC8: A critical advisory fails Audit.
- AC9: A high advisory fails Audit.
- AC10: Only low or moderate advisories pass Audit.

Tests

- AC11: A failed unit test stops Tests at the first failure and fails it.
- AC12: Coverage below the configured threshold for lines, functions, branches, or statements fails Tests.
- AC13: Passing tests with coverage at or above the thresholds pass Tests.
- AC14: A changed threshold applies without a pipeline change.

Build

- AC15: A TypeScript error fails Build.
- AC16: A production build that cannot complete fails Build.
- AC17: A production build that includes unit test files, test helpers, mocks, or fixtures fails Build.
- AC18: No TypeScript errors and no test code in the output pass Build.

Publish

- AC19: After a merge with Audit, Tests, and Build passing, `https://alexandergridin.github.io/mind-threads-client/` serves the version built from that merge.

Published app

- AC20: The published URL displays the dashboard page.
- AC21: Opening a saved thread from the dashboard displays the thread page under the published URL.
- AC22: Opening a thread link directly in a new tab displays the thread page, not a GitHub 404.
- AC23: Reloading a thread page displays the same page, not a GitHub 404.

Branch protection and merge rules

- AC24: Any direct push to `main`, including from a repo admin, is rejected.
- AC25: A pull request with a failed Audit, Tests, or Build cannot be merged.
- AC26: A pull request with passing checks and no reviewer approval can be merged.

Regression and documentation

- AC27: Starting the app locally displays the dashboard at the local development URL.
- AC28: The existing unit test suite passes.
- AC29: The README describes the four pipeline steps, the `main` rules, the published URL, and the rollback steps.

Error handling and user feedback

- AC30: When a step fails, the steps after it do not run.
- AC31: A failed step on a pull request shows a failed check on the pull request.
- AC32: A failed step after a merge shows a failed check on the merge commit.
- AC33: The pipeline run shows the failed step and its logs.
- AC34: GitHub's standard failure notification is sent; no custom alerts are added.
- AC35: If any step fails after a merge, the previously published version is still served.

## Style notes

- Move `renderWithUIProvider` to `src/components/lib/__test-fixtures__/`, outside the `@/components/lib` barrel. It keeps the lib self-contained for later extraction — developer decision.
- Each test file keeps its current import style for the helper: relative imports stay relative (`../../__test-fixtures__`), and alias imports use `@/components/lib/__test-fixtures__` — project convention (`src/components/lib/**/__tests__/`).
- Non-component files use lowercase, dot-suffixed names, such as `forbid-test-code.plugin.ts` — project convention (`src/routing/routing.utils.ts`).
- Actions in the workflow are pinned to a full commit hash with the version in a trailing comment. This extends the repo's pinned-dependency policy to the pipeline, which publishes code to a public URL — project convention (`CLAUDE.md`, Package Management).
- Workflow job names are exactly `Audit`, `Tests`, `Build`, and `Publish`. Branch protection refers to the first three by name, so renaming a job breaks the merge rules.
- `vite-plugins/` is compiled by `tsconfig.node.json`, which does not load Vitest globals. Tests in that folder import `describe`, `it`, and the others from `vitest` explicitly.

## Phase 1: Implementation

Steps 1 to 3 change repo settings on GitHub and must happen in order, before any pipeline work (the story's prerequisites). Steps 2, 3, and 13 are outward-facing: the developer confirms each one before it runs.

---

### Step 1: Scan the full repo history for secrets

**Covers:** AC1

**Context:** The repo is about to go public, and its whole history goes with it. Nothing has been scanned yet; `gitleaks` is not installed on this machine and neither is Docker, so install the release binary outside the project.

**Changes:**

1. Fetch every remote branch and tag, so the scan sees what would become public:
   ```bash
   git fetch --all --tags
   ```
2. Install `gitleaks` from its [GitHub releases](https://github.com/gitleaks/gitleaks/releases) to a folder outside the repo, and run it from the repo root. It scans all refs by default:
   ```bash
   gitleaks git --redact --verbose .
   ```
3. Review the repo's issues and pull request descriptions by hand (`gh issue list --state all`, `gh pr list --state all`). They become public too, and `gitleaks` does not read them.
4. If anything is found, stop and hand it to the developer: revoke the secret first, then remove it from history. Rewriting history needs a force push, so it is the developer's call. Do not continue to Step 2 until the scan is clean.

**Verification MANUAL:** `gitleaks` exits 0 with `no leaks found`, or every finding has been revoked, removed, and a re-scan is clean.

---

### Step 2: Make the repo public

**Covers:** AC2

**Context:** Branch protection returns HTTP 403 on this private repo on the current plan, and Pages has the same plan limit, so this comes first. It cannot be fully undone: public code may be cached or copied. Commit history also exposes author emails, including the personal address on some commits, so the developer should know that before confirming.

**Changes:**

1. With the developer's confirmation, run:
   ```bash
   gh repo edit AlexanderGridin/mind-threads-client --visibility public --accept-visibility-change-consequences
   ```

**Verification MANUAL:** `gh repo view --json visibility` prints `PUBLIC`.

---

### Step 3: Enable GitHub Pages with GitHub Actions as the source

**Covers:** AC2

**Context:** The `workflow` build type lets the Publish job deploy an artifact directly, so no `gh-pages` branch is needed. That also keeps generated files out of the git history.

**Changes:**

1. Enable Pages:
   ```bash
   gh api -X POST repos/AlexanderGridin/mind-threads-client/pages -f build_type=workflow
   ```

**Verification MANUAL:** `gh api repos/AlexanderGridin/mind-threads-client/pages --jq '.build_type + " " + .html_url'` prints `workflow` and the published URL.

---

### Step 4: Move `renderWithUIProvider` out of the production barrel

**New files:**

- `src/components/lib/__test-fixtures__/renderWithUIProvider.ts`
- `src/components/lib/__test-fixtures__/index.ts`

**File:**
`src/components/lib/utils/tests-helpers.ts` (deleted), `src/components/lib/utils/index.ts`, `vitest.config.ts`, and the 40 files that import the helper

**Covers:** AC7, AC17, AC18

**Context:** Today's production bundle contains `@testing-library/dom` and `@testing-library/react`, about 177 kB minified. `src/components/lib/utils/index.ts:1` re-exports the helper through `@/components/lib`, and those packages have import side effects, so tree-shaking cannot remove them. The Build guard in Step 5 would fail on current `main` until this is fixed, which AC7 rules out. This step changes import lines in test files, an exception to "no tests in Phase 1": the helper cannot move without them, and the build stays broken otherwise. No test logic changes.

**Changes:**

1. Move the helper. Its content does not change, and its `../ChakraUIProvider` import stays valid from the new folder:
   ```bash
   mkdir -p src/components/lib/__test-fixtures__
   git mv src/components/lib/utils/tests-helpers.ts src/components/lib/__test-fixtures__/renderWithUIProvider.ts
   ```
2. Add the folder's barrel, and do not re-export it from `src/components/lib/index.ts`:
   ```ts
   // src/components/lib/__test-fixtures__/index.ts
   export * from "./renderWithUIProvider";
   ```
3. Remove `export * from "./tests-helpers";` from `src/components/lib/utils/index.ts`. Keep `initTestIdCreator` there.
4. Rewrite the imports. This handles 39 of the 40 files:
   ```bash
   grep -rl 'renderWithUIProvider' src | xargs sed -i -E \
     's#import \{ renderWithUIProvider \} from "@/components/lib"#import { renderWithUIProvider } from "@/components/lib/__test-fixtures__"#; s#import \{ renderWithUIProvider \} from "((\.\./)+)utils"#import { renderWithUIProvider } from "\1__test-fixtures__"#'
   ```
5. Split the remaining mixed import by hand in `src/components/lib/Notifications/__tests__/Notifications.test.tsx:4`:
   ```ts
   import { notify } from "@/components/lib";
   import { renderWithUIProvider } from "@/components/lib/__test-fixtures__";
   ```
6. In `vitest.config.ts`, change the coverage exclude so that both fixture folders are excluded:
   ```ts
   "**/__test-fixtures__/**",
   ```
   This replaces `"src/__test-fixtures__/**"`.

**Verification MANUAL:** `npm run test` passes, `npm run build` succeeds, and `grep -c "getByTestId" dist/assets/*.js` prints `0`. The main bundle drops from about 918 kB to about 741 kB.

---

### Step 5: Create the plugin that detects test code in the bundle

**New files:**

- `vite-plugins/forbid-test-code.plugin.ts`

**Covers:** AC17

**Context:** A Vite plugin runs inside `vite build`, so `npm run build` fails the same way locally and in the pipeline, and the workflow stays one command. The plugin reads the bundler's module list rather than searching output text, so minified names cannot hide a match. `chunk.modules` also lists tree-shaken modules. That is stricter than the output alone, by choice: production code importing from a test folder is a mistake either way. No false positives on the current graph.

**Changes:**

1. Create the plugin:
   ```ts
   import type { Plugin } from "vite";

   const TEST_CODE_PATTERN =
     /\/(__tests__|__mocks__|__test-fixtures__)\/|\.(test|spec)\.[cm]?[jt]sx?(\?|$)|\/node_modules\/(@testing-library|@vitest|vitest)\//;

   export const findTestModules = (moduleIds: string[]) => {
     return moduleIds.filter((moduleId) => {
       return TEST_CODE_PATTERN.test(moduleId);
     });
   };

   export const forbidTestCode = (): Plugin => {
     return {
       name: "forbid-test-code",
       generateBundle(_options, bundle) {
         const moduleIds = Object.values(bundle).flatMap((item) => {
           return item.type === "chunk" ? Object.keys(item.modules) : [];
         });

         const testModules = findTestModules(moduleIds);

         if (testModules.length) {
           this.error(
             `Production build includes test code:\n${testModules.join("\n")}`
           );
         }
       },
     };
   };
   ```

**Verification MANUAL:** The file exists and has no editor type errors. It is not compiled by `tsc -b` until Step 6.

---

### Step 6: Register the plugin in the build

**File:**
`vite.config.ts`, `tsconfig.node.json`

**Covers:** AC15, AC16, AC17, AC18

**Context:** `npm run build` already runs `tsc -b && vite build`, and `tsc -b` already covers `src`, including test files (checked: it exits 2 on a type error in either). AC15, AC16, and AC18 therefore need no build script change.

**Changes:**

1. In `vite.config.ts`, import the plugin and append it to `plugins`:
   ```ts
   import { forbidTestCode } from "./vite-plugins/forbid-test-code.plugin";
   ```
   ```ts
   plugins: [
     react(),
     babel({ presets: [reactCompilerPreset()] }),
     forbidTestCode(),
   ],
   ```
2. In `tsconfig.node.json`, add the folder so the plugin is type-checked:
   ```json
   "include": ["vite.config.ts", "vite-plugins"]
   ```

**Verification MANUAL:** `npm run build` succeeds. Then add `import "@/__test-fixtures__";` to the top of `src/main.tsx`, confirm `npx vite build` exits 1 with `Production build includes test code` and the module list, and revert the line.

---

### Step 7: Build for the published base path

**File:**
`vite.config.ts`

**Covers:** AC20, AC27

**Context:** The site is served under `/mind-threads-client/`. Setting `base` only for `build` and `preview` keeps the dev server at `http://localhost:5173/`, as the README documents and AC27 requires. The path is a constant rather than a workflow variable, so a local build and preview match the published site. The tradeoff is that renaming the repo means changing this constant.

**Changes:**

1. Convert the config to its function form and set `base`:
   ```ts
   const PUBLISHED_BASE_PATH = "/mind-threads-client/";

   // https://vite.dev/config/
   export default defineConfig(({ command, isPreview }) => {
     return {
       base: command === "build" || isPreview ? PUBLISHED_BASE_PATH : "/",
       plugins: [
         react(),
         babel({ presets: [reactCompilerPreset()] }),
         forbidTestCode(),
       ],
       resolve: {
         tsconfigPaths: true,
       },
     };
   });
   ```

**Verification MANUAL:** After `npm run build`, every `href` and `src` in `dist/index.html` starts with `/mind-threads-client/`. `npm run start` still serves the app at `http://localhost:5173/`.

---

### Step 8: Pass the base path to the router

**File:**
`src/main.tsx`

**Covers:** AC20, AC21, AC23, AC27

**Context:** Without a `basename`, `BrowserRouter` matches the full path `/mind-threads-client/` against `AppPath` and renders no route. `import.meta.env.BASE_URL` gives `/` in dev and the published path in a build, so there is one source of truth (Step 7). `Link`, `useNavigate`, and `getThreadPath` then need no change, because React Router prepends the basename. No file in `src` hard-codes a root-relative production URL.

**Changes:**

1. Set the prop:
   ```tsx
   <BrowserRouter basename={import.meta.env.BASE_URL}>
   ```

**Verification MANUAL:** Run `npm run build && npm run preview` and open `http://localhost:4173/mind-threads-client/`. The dashboard shows, opening a thread goes to `/mind-threads-client/threads/<id>`, and reloading keeps the thread page. `npm run start` still works at the root URL.

---

### Step 9: Create the workflow with its triggers and the Audit job

**New files:**

- `.github/workflows/ci.yml`

**Covers:** AC3, AC5, AC6, AC8, AC9, AC10, AC31, AC32, AC33, AC34

**Context:** Each pipeline step is its own job, because that gives the three named checks branch protection needs and shows the steps by name on a pull request. The tradeoff is repeated setup and a second `npm ci`, which the npm cache keeps cheap. A composite action would remove the repetition but is too much machinery for this size. The workflow-level `concurrency` group covers AC6: runs on `main` queue in push order and never cancel a running publish, and a newer queued run replaces an older queued one, so the newest merge always publishes last. A concurrency group on the Publish job alone would not do this, because a slower older run could reach Publish after a newer one. Audit needs no install, as `npm audit` reads only the lockfile. `--audit-level=high` currently exits 0 against the 10 moderate advisories. Failed checks, run logs, and failure notifications (AC31 to AC34) come with GitHub Actions, so nothing is added for them.

**Changes:**

1. Create the file. Commit hashes were resolved on 2026-11-07:
   ```yaml
   name: CI

   on:
     pull_request:
       branches: [main]
     push:
       branches: [main]

   concurrency:
     group: ci-${{ github.ref }}
     cancel-in-progress: ${{ github.event_name == 'pull_request' }}

   permissions:
     contents: read

   env:
     NODE_VERSION: "24"

   jobs:
     audit:
       name: Audit
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
         - uses: actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 # v7.1.0
           with:
             node-version: ${{ env.NODE_VERSION }}
         - run: npm audit --audit-level=high
   ```

**Verification MANUAL:** `npm audit --audit-level=high` exits 0 locally, and the workflow file shows no YAML errors in the editor.

---

### Step 10: Add the Tests job

**File:**
`.github/workflows/ci.yml`

**Covers:** AC3, AC11, AC12, AC13, AC14, AC30

**Context:** `npm run test:coverage` already enforces the thresholds in `vitest.config.ts` (AC12 to AC14 need no threshold in the workflow). `--bail=1` is added here rather than to the script, so local coverage runs still report every failure.

**Changes:**

1. Add under `jobs`:
   ```yaml
   tests:
     name: Tests
     needs: audit
     runs-on: ubuntu-latest
     steps:
       - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
       - uses: actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 # v7.1.0
         with:
           node-version: ${{ env.NODE_VERSION }}
           cache: npm
       - run: npm ci
       - run: npm run test:coverage -- --bail=1
   ```

**Verification MANUAL:** `npm ci && npm run test:coverage -- --bail=1` exits 0 locally.

---

### Step 11: Add the Build job

**File:**
`.github/workflows/ci.yml`

**Covers:** AC3, AC15, AC16, AC17, AC18, AC22, AC23, AC30

**Context:** GitHub Pages has no rewrite rules, so a direct thread link would hit GitHub's 404 page. Pages serves a site's own `404.html` for unknown paths, and a copy of `index.html` there boots the app, and the router renders the right page from the URL. The tradeoff is that those responses carry HTTP 404 status, which visitors do not see; a redirect-script approach avoids that but adds a script to `index.html` and rewrites URLs. The copy and upload run only on `push`, since pull requests never publish.

**Changes:**

1. Add under `jobs`:
   ```yaml
   build:
     name: Build
     needs: tests
     runs-on: ubuntu-latest
     steps:
       - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
       - uses: actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 # v7.1.0
         with:
           node-version: ${{ env.NODE_VERSION }}
           cache: npm
       - run: npm ci
       - run: npm run build
       - name: Serve the app for direct links
         if: github.event_name == 'push'
         run: cp dist/index.html dist/404.html
       - uses: actions/upload-pages-artifact@fc324d3547104276b827a68afc52ff2a11cc49c9 # v5.0.0
         if: github.event_name == 'push'
         with:
           path: dist
   ```

**Verification MANUAL:** `npm run build` exits 0 locally and `cp dist/index.html dist/404.html` leaves both files in `dist/`.

---

### Step 12: Add the Publish job

**File:**
`.github/workflows/ci.yml`

**Covers:** AC4, AC5, AC19, AC30, AC35

**Context:** Publish runs only after Build passes, and only on `push`. Because `main` accepts no direct pushes after Step 13, a `push` here always means a merge. A failed run never reaches `deploy-pages`, and a failed deployment does not replace the live site, so the previous version stays up (AC35). Write permissions are granted to this job alone. `actions/configure-pages` is left out because the base path is already set in Step 7, and Pages was enabled in Step 3.

**Changes:**

1. Add under `jobs`:
   ```yaml
   publish:
     name: Publish
     needs: build
     if: github.event_name == 'push'
     runs-on: ubuntu-latest
     permissions:
       pages: write
       id-token: write
     environment:
       name: github-pages
       url: ${{ steps.deployment.outputs.page_url }}
     steps:
       - id: deployment
         uses: actions/deploy-pages@368f82528645a54fb793d4d04e342629a3f51346 # v5.0.1
   ```

**Verification MANUAL:** Review the finished file: the jobs chain `audit → tests → build → publish`, and only `publish` has write permissions. The real run is covered in [End-to-end checks on GitHub](#end-to-end-checks-on-github).

---

### Step 13: Protect `main`

**Covers:** AC24, AC25, AC26

**Context:** Audit, Tests, and Build are all required because a job skipped after a failure reports as success; requiring all three means the job that actually failed still blocks the merge. `enforce_admins` rejects admin pushes too. Zero required approvals allows solo merges (AC26) while still requiring a pull request. `strict: false` means branches do not have to be up to date before merging, which avoids a rebase and re-run per merge; the tradeoff is that two individually passing pull requests can break `main` together, in which case the post-merge run stops before Publish. Apply this while this story's pull request is open, so the pull request itself goes through the gate.

**Changes:**

1. With the developer's confirmation, run:
   ```bash
   gh api -X PUT repos/AlexanderGridin/mind-threads-client/branches/main/protection --input - <<'EOF'
   {
     "required_status_checks": {
       "strict": false,
       "checks": [{ "context": "Audit" }, { "context": "Tests" }, { "context": "Build" }]
     },
     "enforce_admins": true,
     "required_pull_request_reviews": { "required_approving_review_count": 0 },
     "restrictions": null
   }
   EOF
   ```

**Verification MANUAL:** `gh api repos/AlexanderGridin/mind-threads-client/branches/main/protection --jq '.enforce_admins.enabled, [.required_status_checks.checks[].context]'` prints `true` and the three job names.

## Phase 2: Unit tests

Only the build guard is new testable code. The workflow and the repo settings cannot be unit tested, so their criteria are confirmed in [End-to-end checks on GitHub](#end-to-end-checks-on-github).

---

### Step 1: Test the `forbidTestCode` plugin

**New files:**

- `vite-plugins/__tests__/forbid-test-code.plugin.test.ts`

**Covers:** AC17, AC18

**Changes:**

1. Import `beforeEach`, `describe`, `expect`, `it`, and `vi` from `vitest` (see `Style notes`), wrap everything in a root `describe("forbidTestCode", ...)`, and clear mocks in `beforeEach`.
2. Add a helper that runs the hook against a minimal bundle with one chunk and one asset:
   ```ts
   type GenerateBundleHook = (
     this: { error: (message: string) => void },
     options: unknown,
     bundle: unknown
   ) => void;

   const error = vi.fn();

   const runGenerateBundle = (moduleIds: string[]) => {
     const generateBundle = forbidTestCode()
       .generateBundle as unknown as GenerateBundleHook;

     const modules = Object.fromEntries(
       moduleIds.map((moduleId) => {
         return [moduleId, {}];
       })
     );

     generateBundle.call(
       { error },
       {},
       {
         "assets/index.js": { type: "chunk", modules },
         "assets/index.css": { type: "asset" },
       }
     );
   };
   ```
3. Cover `findTestModules` with `it.each`:
   - Detected: a file in `__tests__/`, `*.test.ts`, `*.spec.ts`, `*.test.ts?v=1`, a file in `__mocks__/`, a file in `src/__test-fixtures__/` and in `src/components/lib/__test-fixtures__/`, and `node_modules/@testing-library/react`, `@vitest/runner`, and `vitest`.
   - Not detected: a page component, a name that only resembles the pattern such as `latest.tsx`, and `node_modules/react`.
4. Cover `generateBundle`:
   - No test code: `error` is not called.
   - Test code in a chunk: `error` is called once, and the message contains the module path.

**Verification:** `npx vitest run vite-plugins` passes all scenarios, and `npx tsc -b` exits 0 (the test file is compiled by `tsconfig.node.json`).

---

### Step 2: Run the full suite with the pipeline's command

**Covers:** AC7, AC13, AC28

**Context:** The helper move in Phase 1 Step 4 changed imports in 40 test files, and no test logic should change. This step adds no tests; it confirms the suite with the exact command the Tests job runs.

**Changes:**

1. Run `npm run test:coverage -- --bail=1`, and fix any import the Phase 1 rewrite missed.

**Verification:** The command exits 0, every existing test passes (402 before this story, plus the new plugin tests), and all four coverage metrics are at or above 90%.

## Phase 3: Documentation

---

### Step 1: Document the pipeline in the README

**File:**
`README.md`

**Covers:** AC29

**Changes:**

1. Add a `## CI and Publishing` section after `## Testing`, covering:
   - The published URL: `https://alexandergridin.github.io/mind-threads-client/`.
   - The four steps and what fails each: Audit (`npm audit --audit-level=high`, so low and moderate advisories do not fail it), Tests (`npm run test:coverage -- --bail=1`, thresholds in `vitest.config.ts`), Build (`npm run build`: type errors, build errors, or test code in the bundle), Publish (merges into `main` only).
   - The `main` rules: no direct pushes, including admins; changes arrive through pull requests; Audit, Tests, and Build must pass; no reviewer approval is required.
   - The rollback steps from the story: open and merge a pull request that reverts the change, and the pipeline republishes the earlier code. It is not instant, as it takes one pull request run and one run after the merge. A revert cannot merge while Audit, Tests, or Build fails on it, so the failing step has to be fixed first.
2. In `## Testing`, change the helper's import to `@/components/lib/__test-fixtures__`.
3. In the `## Routes` section, add one line saying the published site serves these paths under `/mind-threads-client/`.

**Verification MANUAL:** The README names all four steps, the `main` rules, the published URL, and the rollback steps, and the commands match `.github/workflows/ci.yml`.

---

### Step 2: Update the project instructions

**File:**
`CLAUDE.md`

**Covers:** AC17, AC29

**Changes:**

1. Update every mention that `renderWithUIProvider` comes from `@/components/lib` (the `Test setup` convention, and the Chakra UI section's testing sentence) to say `@/components/lib/__test-fixtures__`, relative within the lib, and never re-exported from the lib's barrel.
2. In `Architecture`, under `React Router`, add that `BrowserRouter` gets `basename={import.meta.env.BASE_URL}`, and `base` is set in `vite.config.ts` for `build` and `preview` only.
3. In `Architecture`, add a bullet for the build guard: `vite-plugins/forbid-test-code.plugin.ts` fails `vite build` when a chunk contains test code, so production code must not import from `__tests__`, `__mocks__`, `__test-fixtures__`, or test libraries.
4. In `Architecture`, add a bullet for the pipeline: `.github/workflows/ci.yml` defines Audit, Tests, Build, and Publish; branch protection requires the first three by job name, so job names must not change without updating it.
5. Extend the `Folder structure` entry for `src/__mocks__/`, `src/__test-fixtures__/` with `src/components/lib/__test-fixtures__/`.

**Verification MANUAL:** `grep -n "renderWithUIProvider" CLAUDE.md` shows no remaining claim that it comes from the `@/components/lib` barrel, and the new bullets match the code.

## End-to-end checks on GitHub

These criteria depend on real pipeline runs, so they cannot pass until the code is on a pull request or merged. Commits, pushes, and merges below are the developer's to run or to approve. Close or revert every throwaway pull request afterward.

| Criteria | When | Check |
| --- | --- | --- |
| AC3, AC4, AC7 | This story's pull request | Audit, Tests, and Build run in order and pass; Publish shows as skipped. |
| AC5, AC7, AC19, AC20 | After merging this story | All four jobs pass and the published URL shows the dashboard. |
| AC21, AC22, AC23 | After merging this story | On the site, create a thread, open it from the dashboard, open its link in a new tab, and reload. Each shows the thread page. |
| AC24 | After Step 13 | `git push origin main` with an empty commit is rejected. |
| AC26 | This story's pull request | With checks green and no approval, merging is allowed. |
| AC8, AC9, AC10 | Throwaway pull request | Add a dependency version with a known critical advisory, then one with a high advisory (confirm severity with `npm audit` first). Audit fails on each, and Tests and Build do not run (AC30). |
| AC11, AC25, AC31, AC33 | Throwaway pull request | Add two failing tests. Tests fails after the first, the pull request shows a failed check, merging is blocked, and the run shows the failed step and logs. |
| AC12, AC14 | Throwaway pull request | Raise a threshold above current coverage in `vitest.config.ts` only. Tests fails with no workflow change. |
| AC15 | Throwaway pull request | Add a type error. Build fails, and Publish does not run. |
| AC17 | Throwaway pull request | Add `import "@/__test-fixtures__";` to `src/main.tsx`. Build fails and names the modules. |
| AC6 | Two small pull requests | Merge both within a minute. The site shows the second one. |
| AC32, AC34, AC35 | One throwaway pull request, reverted afterward | Add a Build step `if: github.event_name == 'push'` with `run: exit 1`. After the merge, the commit shows a failed check, GitHub sends its standard notification, Publish does not run, and the site still serves the earlier version. Revert through a pull request. |
| AC27 | Locally | `npm run start` shows the dashboard at `http://localhost:5173/`. |
