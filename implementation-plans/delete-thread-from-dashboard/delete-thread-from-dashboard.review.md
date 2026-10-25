# Code review: Delete a thread from the dashboard

**Reviewed:** commits b577c25 (implementation, 38 files) and 8e6cd5e (unit tests, 16 files) · **Date:** 2026-10-25 · **Style:** `implementation-plans/delete-thread-from-dashboard/delete-thread-from-dashboard.style.md`

Checked against `delete-thread-from-dashboard.feature.md` (Phases 1 and 2; Phase 3 is outside these commits). Every implementation step and every planned test file is present. No bugs found: failure keeps the modal open and the thread in place, double submit and dismissal are blocked while deleting, and the card click is isolated from the menu.

## Summary

| Category | High | Medium | Low |
| --- | --- | --- | --- |
| Plan mismatch | 0 | 0 | 1 |
| Duplication | 0 | 0 | 1 |
| Style violation | 0 | 0 | 1 |
| Oversized unit | 0 | 0 | 1 |

## Points

### 1. Test helpers copy-pasted across four test files

**Category:** Duplication · **Severity:** Low · **Status:** Fixed
**Location:** `src/components/lib/Menu/__tests__/Menu.test.tsx:19`, `src/components/lib/Dialog/__tests__/Dialog.test.tsx:48`, `src/pages/DashboardPage/components/DeleteThreadModalContainer/components/DeleteThreadModal/__tests__/DeleteThreadModal.test.tsx:25`, `src/pages/DashboardPage/components/DeleteThreadModalContainer/__tests__/DeleteThreadModalContainer.test.tsx:61`; `stubLayout` in `Dialog.test.tsx:39` and `DeleteThreadModal.test.tsx:16`; the click-outside helper (`clickOutsideDialog` in `Dialog.test.tsx`, `clickOutsideModal` in `DeleteThreadModal.test.tsx`, inlined in `Menu.test.tsx` and `DeleteThreadModalContainer.test.tsx`) with its `OUTSIDE_POINTER_POSITION` constant

**Problem:** `waitForDismissListeners` is defined identically four times, `stubLayout` twice, and the click-outside pointer sequence four times (two named helpers, two inline). This breaks the style rule "small helpers for repeated logic, no duplicated mocks" (`unit-tests.md`), and the plan already shared `createDeferred` in `src/__test-fixtures__/` for the same reason. A change to the delay or the jsdom workaround must be made in every copy.

**Proposed fix:** Move all three (`waitForDismissListeners`, `stubLayout`, `clickOutside`) into `src/__test-fixtures__/` (e.g. `zag.ts`), re-export from its `index.ts` like `deferred.ts`, and import them in the four test files. Keep the explanatory comments on the shared helpers.

---

### 2. `CardActions` differs from the plan: extra `forMode` prop and mode-dependent `top`

**Category:** Plan mismatch · **Severity:** Low · **Status:** Rejected
**Location:** `src/pages/DashboardPage/components/DashboardContent/components/MindThreadCard/components/CardActions.tsx:19-33`, `MindThreadCard.tsx` (`<CardActions ... forMode={forMode} />`)

**Problem:** Plan Step 12 specifies `CardActionsProps = { thread, onDelete }` and `top="2"` in both grid and list mode. The code adds `forMode` and uses `top="4"` in grid mode. The plan and code now disagree, and the Phase 2 tests were written against the plan.

**Proposed fix:** If the grid offset was a deliberate visual tweak, reject this point and the plan can be updated. Otherwise remove `forMode` from `CardActions` and `MindThreadCard`, and use `top="2"`.

---
### 3. `DashboardPageLoader` owns three unrelated state flows

**Category:** Oversized unit · **Severity:** Low · **Status:** Fixed
**Location:** `src/pages/DashboardPage/components/DashboardPageLoader/DashboardPageLoader.tsx:30-100`

**Problem:** The provider holds list-mode persistence, the add-thread modal and now the delete flow (`threadToDelete`, `isDeletingThread`, `confirmDeleteThread` with its try/catch/finally). This follows the plan, but it breaks `typescript.md` rule 5 (split by logical responsibility) and `react.md` rule 7 (no all-in-one components); every new feature will add more state here.

**Proposed fix:** Keep the state in the loader, as the style file requires, but move the delete flow into a `useDeleteThread({ removeThread })` hook in `DashboardPageLoader.hooks.ts` that returns `threadToDelete`, `isDeletingThread`, `openDeleteThreadModal`, `closeDeleteThreadModal` and `confirmDeleteThread`. The provider only spreads its results into the two contexts. The existing `DashboardPageLoader` tests cover the unchanged behavior.

---
### 4. Removal is awaited with `waitFor` instead of `waitForElementToBeRemoved`

**Category:** Style violation · **Severity:** Low · **Status:** Rejected
**Location:** `src/pages/DashboardPage/components/DeleteThreadModalContainer/__tests__/DeleteThreadModalContainer.test.tsx:239`, `src/components/lib/Menu/__tests__/Menu.test.tsx:139`, `:152`, `:175`, `src/pages/DashboardPage/components/DashboardContent/components/MindThreadCard/components/__tests__/CardActions.test.tsx:79`

**Problem:** The style file requires "To wait for removal: keep the element in a variable, then `await waitForElementToBeRemoved(element)`" (`unit-tests.md` rule 12). These five tests poll with `waitFor(() => expect(...).not.toBeInTheDocument())` or `queryAllByRole("menuitem")...toHaveLength(0)` instead. The same test file already uses `waitForElementToBeRemoved(modalTitle)` at its last test, so the style is inconsistent within the file.

**Proposed fix:** In each test keep the element in a variable before the action (the modal title; the first menu item) and `await waitForElementToBeRemoved(element)`. Caveat: the Menu tests query by role, which ignores hidden elements. If Chakra keeps the closed menu content mounted but hidden, `waitForElementToBeRemoved` will not resolve there. In that case leave those `waitFor` calls and add a one-line comment saying why.

---
