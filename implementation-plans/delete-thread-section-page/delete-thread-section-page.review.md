# Code review: Delete a page from a thread section

**Reviewed:** staged changes, 25 files · **Date:** 2026-11-15 · **Style:** `implementation-plans/delete-thread-section-page/delete-thread-section-page.style.md`

## Summary

No points found.

The staged changes cover Phase 1 only (no tests, no docs), so only the implementation steps were checked against the plan and AC1–AC32.

- **Plan match:** Steps 1–10 are implemented as written. The `useDeleteSection` return shape is unchanged, so `ThreadPageLoader.tsx` and the section flow are unaffected.
- **Bugs:** none found. Pages are removed by `id`. `removeSectionPage` validates the threads key before writing, and it leaves the thread untouched when the page or thread was already deleted elsewhere, so the count drops once. On failure the modal stays open, because `close()` runs only after `remove` succeeds and `finally` resets `isDeleting`.
- **Style:** rules 8–11, vertical rhythm, named exports, and block-body arrows are followed.
- **Duplication:** the `DeletePageModalContainer` and `PageCardActions` mirrors of the section versions are the developer's decision (plan Style notes), so they are not reported.
- **Checks run (read-only):** `npm run ts:check` shows no errors outside test files. `prettier --check` and `eslint` pass on all staged files.

## Notes (not points)

- `removeSectionPage` writes pages and then threads without a transaction. The plan states this tradeoff and `removeThreadSection` makes the same one.

---

# Round 2: Phase 2 unit tests

**Reviewed:** staged changes, 22 files · **Date:** 2026-11-15 · **Style:** `implementation-plans/delete-thread-section-page/delete-thread-section-page.style.md`

## Summary

| Category | High | Medium | Low |
| --- | --- | --- | --- |
| Plan mismatch | 0 | 0 | 1 |
| Style violation | 0 | 0 | 1 |
| Duplication | 0 | 0 | 1 |

Checks run (read-only): `npm run ts:check`, `eslint`, and `prettier --check` on the staged files report nothing; `npx vitest run` passes (105 files, 783 tests). Phase 1 was committed before this round, so only the Phase 2 tests and fixtures were reviewed against AC1–AC32 and plan Phase 2, Steps 1–11. Every plan scenario has a test.

## Points

### 1. "Thread deleted elsewhere" test never checks that the page was removed

**Category:** Plan mismatch · **Severity:** Low · **Status:** Fixed
**Location:** `src/services/useThreadsService/__tests__/useThreadsService.test.ts` (`removeSectionPage` → "removes the page and writes no thread when the thread was deleted elsewhere")

**Problem:** The title says the page is removed, but the test asserts only the stored threads and that no thread was written. If `removeSectionPage` stopped deleting the page when its thread is missing, the test would still pass.

**Proposed fix:** After the existing assertions, assert the stored pages: `expect(readStoredPages()).toStrictEqual(sectionPageFixtures.slice(1));`.

---

### 2. `buildPage` takes three positional parameters

**Category:** Style violation · **Severity:** Low · **Status:** Fixed
**Location:** `src/pages/ThreadPage/__tests__/ThreadPage.test.tsx` (`describe("deleting a page")` → `buildPage`, and its 11 call sites)

**Problem:** `typescript.md` rule 3 requires an object parameter for two or more parameters. `buildPage("page-outline-a", "Outline", FIRST_SECTION.id)` is easy to call with the id, name, and section in the wrong order.

**Proposed fix:** Add `type BuildPageParams = { id: string; name: string; sectionId: string };` next to `DeletePageFromSectionParams`, change the helper to `buildPage = ({ id, name, sectionId }: BuildPageParams): SectionPage => ...` with a block body, and update every call to `buildPage({ id: "page-outline", name: "Outline", sectionId: FIRST_SECTION.id })`.

---

### 3. Delete dialog button queries and `waitForLoadedThread` are copied between test files

**Category:** Duplication · **Severity:** Low · **Status:** Fixed
**Location:** `src/pages/ThreadPage/components/DeletePageModalContainer/__tests__/DeletePageModalContainer.test.tsx`, `src/pages/ThreadPage/components/DeleteSectionModalContainer/__tests__/DeleteSectionModalContainer.test.tsx`, `src/pages/DashboardPage/components/DeleteThreadModalContainer/__tests__/DeleteThreadModalContainer.test.tsx`, `src/pages/ThreadPage/__tests__/ThreadPage.test.tsx:295,569,726,868`

**Problem:** `unit-tests.md` rule 5 asks for one shared helper when more than one test file needs it. The three delete-dialog container tests each define the same `getCloseButton` and `getDeleteButton`, plus `getCancelButton` (role-based in the page and section tests, test-id based in the thread test). `ThreadPage.test.tsx` defines an identical `waitForLoadedThread` in four `describe` blocks. A change to the dialog (for example, a renamed button) must be repeated in every copy. This is outside the staged changes except for the new page test and the fourth `waitForLoadedThread`; the developer asked to fix it all.

**Proposed fix:**
1. Create `src/__test-fixtures__/deletion/deletion.queries.ts` with `getDeletionCancelButton`, `getDeletionCloseButton`, and `getDeletionDeleteButton` (block bodies; cancel and delete by `DeleteConfirmationModalActionsTestId`, close by role "Close"), export it from `deletion/index.ts`, and use them in the three container tests, removing the local copies. Distinct names avoid clashing with the local helpers of the other modal tests.
2. In `ThreadPage.test.tsx`, define one `waitForLoadedThread` at file level and delete the four `describe`-level copies.
3. The `Add*Modal` and `Edit*Modal` tests, the `DeleteThreadModal` and `DeleteConfirmationModal*` component tests, and `SectionCardActions`/`PageCardActions` `openMenu` stay as they are; they test other components.

No new test: the existing tests of those files cover the helpers, and `npm run test` must still pass.

---
