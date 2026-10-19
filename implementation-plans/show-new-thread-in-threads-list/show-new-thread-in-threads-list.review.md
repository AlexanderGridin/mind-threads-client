# Code review: Show created threads on the dashboard

**Reviewed:** staged changes, 80 files · **Date:** 2026-10-19 · **Style:** `implementation-plans/show-new-thread-in-threads-list/show-new-thread-in-threads-list.style.md`

## Summary

| Category        | High | Medium | Low |
| --------------- | ---- | ------ | --- |
| Bug             | 0    | 1      | 0   |
| Style violation | 0    | 0      | 1   |
| Duplication     | 0    | 0      | 1   |

## Points

### 1. `isMindThread` type guard checks only 2 of 6 fields

**Category:** Bug · **Severity:** Medium · **Status:** Fixed
**Location:** `src/services/useThreadsService/useThreadsService.utils.ts:12`

**Problem:** The guard narrows to `MindThread` but only checks `id` and `title`. Stored data such as `[{ "id": "1", "title": "A" }]` passes, so `getThreads` resolves it as valid. The cards then render with an undefined color, `NaN`/"undefined" counts and an invalid date. AC18 says the error card must show when saved threads can't be read.

**Proposed fix:** Check every field of `MindThread` in `isMindThread`. Use `typeof … === "string"` for `id`, `title`, `color` and `lastUpdated`, and `typeof … === "number"` for `totalSections` and `totalPages`. Keep the cast to a `Partial<Record<keyof MindThread, unknown>>` (or similar) instead of repeating `(value as MindThread)`.
Test to add in `useThreadsService.utils.test.ts` (`isMindThreadList`): returns `false` for an item that has `id` and `title` but is missing `color`, `totalSections`, `totalPages` or `lastUpdated`. Optionally add a `getThreads` rejection scenario for the same data in `useThreadsService.test.ts`.

---

### 2. Files are not Prettier-formatted

**Category:** Style violation · **Severity:** Low · **Status:** Fixed
**Location:** `src/pages/DashboardPage/components/AddNewThreadModalContainer/AddNewThreadModalContainer.tsx:12`, `src/pages/DashboardPage/DashboardPage.types.ts:1`, `src/components/lib/Notifications/__tests__/Notifications.test.tsx`, `src/services/useThreadsService/__tests__/useThreadsService.utils.test.ts`

**Problem:** `prettier --check src` fails on these four files (style file: Prettier, printWidth 80). For example, the `<AddNewThreadModal … />` line is 82 characters, and the multi-line import in `DashboardPage.types.ts` fits on one line. Unformatted files add noise to later diffs.

**Proposed fix:** Run `npm run format` on the four files. No logic change.

---

### 3. Test helpers and constants are duplicated across test files

**Category:** Duplication · **Severity:** Low · **Status:** Fixed
**Location:** `MALFORMED_JSON` in `ThreadsSection.test.tsx:13`, `DashboardPage.test.tsx:16`, `AddNewThread.test.tsx:12`, `useThreadsService.test.ts:12`, `useLocalStorage.test.ts:14`. Seeding of stored threads in `DashboardPageLoader.test.tsx:98` (`seedThreads`), `useThreadsService.test.ts:18` (`storeThreads`), and inline `localStorage.setItem(THREADS_STORAGE_KEY, JSON.stringify(…))` in `DashboardContent.test.tsx:21` and `ThreadsSection.test.tsx:37`. `findOpenModalButton` in `DashboardPage.test.tsx:35` and `AddNewThread.test.tsx:27`.

**Problem:** The same constant and helpers are defined in several test files (`unit-tests.md` rules 5–6). If the stored format or the button test id changes, each copy must be updated separately.

**Proposed fix:** Add shared helpers to `src/__test-fixtures__/` (for example `storage.ts`): `MALFORMED_JSON`, `seedThreads(threads)`. Export them through `src/__test-fixtures__/index.ts` and use them in the files listed. Keep `findOpenModalButton` local if it is not worth sharing, or move it next to `AddNewThreadTestId` usage in one place. Do not change test behavior.

---

### 4. Unused `_omitted` variable in the Point 1 test fails the linter

**Category:** Style violation · **Severity:** Low · **Status:** Fixed
**Location:** `src/services/useThreadsService/__tests__/useThreadsService.utils.test.ts:85`

**Problem:** The `it.each` test added for Point 1 destructures `_omitted` to drop a field. `npm run lint` reports `@typescript-eslint/no-unused-vars` for it.

**Proposed fix:** Build the incomplete thread without an unused binding, for example `const incompleteThread = { ...mindThreadFixtures[0], [field]: undefined };`. The test still asserts `false`.

---
