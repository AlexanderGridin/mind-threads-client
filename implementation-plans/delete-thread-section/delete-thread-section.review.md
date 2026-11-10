# Code review: Delete a section from a thread

**Reviewed:** staged changes, 37 files · **Date:** 2026-11-08 · **Style:** `implementation-plans/delete-thread-section/delete-thread-section.style.md`

## Summary

No points. The staged changes (Phase 1 only) have no bugs, style violations, duplication, or oversized units that I could confirm.

## What was checked

- **Scope:** Phase 1 is staged. There are no tests or docs yet, so Phases 2 and 3 were not judged.
- **Automated checks (read-only):** Prettier passes on every staged source file. ESLint reports nothing. `npm run ts:check` reports only the errors the plan predicts for Phase 2: tests that import the moved `DeleteThreadModalActions` files, and `SectionCard.test.tsx` and `SectionList.test.tsx`, which lack the new props.
- **Service flow:** `removeThreadSection` validates threads (`getThreads`) and sections (`deleteSection` → `getSections`) before any write. A failed read writes nothing (AC25). An already-deleted section or thread leaves the thread untouched, so the count does not drop twice (AC29, AC30). `useLocalStorage` drops its cache on a `storage` event, so the "deleted elsewhere" path (AC26) is reachable.
- **Hook flow:** `useDeleteSection` closes the modal only after a successful removal. On failure it keeps `sectionToDelete`, and `finally` re-enables the buttons (AC22, AC23). `closeDisabled` and the disabled buttons block dismissal while deleting (AC18, AC19).
- **Layout:** `TruncatedText` uses Chakra's `truncate`, which sets `overflow: hidden`. In the flex row it shrinks beside the menu button and cannot overlap it (AC4).
- **Plan drift, flagged but not a defect:**
  - `Box.tsx` gained `pl` and `pr` props, which the plan's Step 11 needs but does not list.
  - `DeleteConfirmationModalActions.types.ts` was dropped, as recorded in the style file.
  - The actions `.constants.ts` file was renamed with `git mv` rather than recreated.
  - The plan could list the `Box.tsx` change.

---

# Code review, round 2: Delete a section from a thread

**Reviewed:** staged changes, 21 files (Phase 2: unit tests) · **Date:** 2026-11-09 · **Style:** `implementation-plans/delete-thread-section/delete-thread-section.style.md`

## Summary

| Category | High | Medium | Low |
| --- | --- | --- | --- |
| Bug | 0 | 1 | 1 |
| Duplication | 0 | 1 | 1 |
| Style violation | 0 | 0 | 3 |

Prettier, ESLint, and `npm run ts:check` report nothing on the staged files. Phase 3 (docs) is not staged yet, so it was not judged.

## Points

### 1. The "thread deleted elsewhere" test never reaches the `!storedThread` branch

**Category:** Bug (test hole) · **Severity:** Medium · **Status:** Fixed
**Location:** `src/services/useThreadsService/__tests__/useThreadsService.test.ts:468`

**Problem:** The test seeds sections without the removed section (`threadSectionFixtures.slice(2)`), so `deleteSection` resolves `false` and `removeThreadSection` returns on `!isSectionDeleted`. The `|| !storedThread` half of the guard is never exercised. Deleting it would leave every test green, and the code would then call `applyDeletedSection` on `undefined` when the thread is gone but its section is still stored.

**Proposed fix:** Add a scenario where the threads storage no longer has the thread but the sections storage still has the removed section: `seedThreads([mindThreadFixtures[1]])`, `seedSections(threadSectionFixtures)`. Assert that the call resolves, that the section is removed from storage, and that the stored threads are strictly equal to what was seeded. Keep the existing test, and rename it to say that the section is already gone.

---

### 2. Section helpers are copied between test files

**Category:** Duplication · **Severity:** Medium · **Status:** Fixed
**Location:** `src/pages/ThreadPage/components/DeleteSectionModalContainer/__tests__/DeleteSectionModalContainer.test.tsx:65,386,401`, `src/pages/ThreadPage/__tests__/ThreadPage.test.tsx:553,566,581`, `src/__tests__/App.test.tsx:271`, `SectionsColumn.test.tsx`, `SectionList.test.tsx`, `SectionCardActions.test.tsx`

**Problem:** "Open a card's menu, select the first item, and confirm" is written out in six test files, and `readStoredSections` is defined again in two new ones. `unit-tests.md` rule 5 says that a helper needed in more than one file belongs in one shared file. A change to the menu or the dialog has to be repeated in every copy.

**Proposed fix:** Add to `src/__test-fixtures__/sections/`: `readStoredSections()`, `openSectionDeleteMenu({ user, sectionName, index })`, and `confirmSectionDelete(user)`. Export them from the fixtures barrel, and replace the local copies in the new tests. Leave the older `readStoredThreads` copies alone, as they are not in the staged changes.

---

### 3. `dispatchStorageChange` is dead in the "already deleted elsewhere" service test

**Category:** Bug (test hole) · **Severity:** Low · **Status:** Fixed
**Location:** `src/services/useThreadsService/__tests__/useThreadsService.test.ts:453`

**Problem:** `useLocalStorage` reads lazily and caches only after the first read. No read happens before `seedSections` and `dispatchStorageChange`, so the event invalidates nothing. The test reads as if it checks cache invalidation (AC26), but it only checks a section that is missing from storage.

**Proposed fix:** Remove the `dispatchStorageChange` call and its import from this test, and rename the test to "when the section is no longer in storage". Stale-cache behavior stays covered by `useThreadSectionsService.test.ts` and `ThreadPage.test.tsx`, which read before they change storage.

---

### 4. Element query passed straight to `expect()`

**Category:** Style violation · **Severity:** Low · **Status:** Fixed
**Location:** `src/pages/ThreadPage/components/DeleteSectionModalContainer/__tests__/DeleteSectionModalContainer.test.tsx:277`

**Problem:** `expect(queryModalTitle()).not.toBeInTheDocument();` breaks `unit-tests.md` rules 13 and 19.

**Proposed fix:** Store it first: `const closedModalTitle = queryModalTitle();`, then `expect(closedModalTitle).not.toBeInTheDocument();`. Better still, reuse the title found before the click and assert on it after the dialog closes.

---

### 5. `vi.clearAllMocks()` is missing before each test

**Category:** Style violation · **Severity:** Low · **Status:** Fixed
**Location:** `src/pages/ThreadPage/components/DeleteSectionModalContainer/__tests__/DeleteSectionModalContainer.test.tsx`, `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/SectionsColumn/components/SectionCard/components/SectionCardActions/__tests__/SectionCardActions.test.tsx`

**Problem:** `unit-tests.md` rule 8 and the plan's Phase 2 intro require clearing all mocks before each test. These two new files have no `beforeEach(() => { vi.clearAllMocks(); })`.

**Proposed fix:** Add a root-level `beforeEach` with `vi.clearAllMocks()` to both files.

---

### 6. Implicit-return arrows in new test code

**Category:** Style violation · **Severity:** Low · **Status:** Fixed
**Location:** `src/components/shared/DeleteConfirmationModal/__tests__/DeleteConfirmationModal.test.tsx:76,114`, `src/__test-fixtures__/threads/threadsService.ts:52`

**Problem:** `typescript.md` rule 9 and the plan's Style notes require block bodies with an explicit `return` in new code. The two `waitFor(() => expect(...))` calls and the `removeThreadSection` override use implicit returns.

**Proposed fix:** Use block bodies. For `waitFor`, `() => { expect(cancelButton).toHaveFocus(); }`. For the override, `(removeParams) => { return (threadsServiceOverrides.removeThreadSection ?? threadsService.removeThreadSection)(removeParams); }`.

---

### 7. `getSectionCardNames` only wraps `getRenderedSectionNames`

**Category:** Duplication · **Severity:** Low · **Status:** Fixed
**Location:** `src/pages/ThreadPage/__tests__/ThreadPage.test.tsx:549`

**Problem:** The helper returns `getRenderedSectionNames()` unchanged. It adds a second name for the same thing, and the other new tests call the shared helper directly.

**Proposed fix:** Remove `getSectionCardNames`, and call `getRenderedSectionNames()` in its five usages.

---

## Outside the staged changes

- `src/pages/ThreadPage/__tests__/ThreadPage.test.tsx:142` — `document.title` was asserted right after the loader disappeared, but `useDocumentTitle` sets it in an effect, so the test failed about 1 run in 6. Fixed with `waitFor` at the developer's request.
