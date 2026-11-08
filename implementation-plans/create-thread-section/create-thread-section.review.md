# Code review: Create a section in a thread

**Reviewed:** staged changes, 70 files · **Date:** 2026-11-07 · **Style:** `implementation-plans/create-thread-section/create-thread-section.style.md`

## Summary

| Category | High | Medium | Low |
| --- | --- | --- | --- |
| Bug | 0 | 1 | 0 |
| Style violation | 0 | 0 | 1 |
| Duplication | 0 | 0 | 1 |

## Points

### 1. deleteThread can remove the thread and then fail on the sections

**Category:** Bug · **Severity:** Medium · **Status:** Fixed
**Location:** `src/services/useThreadsService/useThreadsService.ts:122-128`

**Problem:** `deleteThread` writes the filtered threads first and then calls `deleteThreadSections`. That call reads the `sections` key and throws `INVALID_SECTIONS_DATA_ERROR` when the data is malformed (or any storage error). By then the thread is already gone from `localStorage`, but the dashboard's `removeThread` throws before it updates its state. The user sees a "delete failed" error and the card stays on screen, even though the thread is deleted and its sections are orphaned. After a reload the thread disappears.

**Proposed fix:** Delete the sections before the threads are written, so a sections failure leaves everything unchanged and the user can retry:

```ts
const deleteThread = async (threadId: string): Promise<void> => {
  const storedThreads = await getThreads();

  await threadSectionsService.deleteThreadSections(threadId);

  threadsStorage.set(
    storedThreads.filter((thread) => thread.id !== threadId)
  );
};
```

Test to add (Phase 2, Step 6): `deleteThread` with malformed `sections` data rejects with `INVALID_SECTIONS_DATA_ERROR` and leaves `threads` unchanged.

---

### 2. `isThreadSectionList` uses an implicit return

**Category:** Style violation · **Severity:** Low · **Status:** Fixed
**Location:** `src/services/useThreadSectionsService/useThreadSectionsService.utils.ts:29-30`

**Problem:** The arrow function has an expression body. The style file requires a block body with an explicit `return` in new code (`typescript.md` rule 9, and "implicit-return one-liners are not copied").

**Proposed fix:**

```ts
export const isThreadSectionList = (
  value: unknown
): value is ThreadSection[] => {
  return Array.isArray(value) && value.every(isThreadSection);
};
```

---

### 3. The tooltip composition is repeated in two lib components

**Category:** Duplication · **Severity:** Low · **Status:** Fixed
**Location:** `src/components/lib/AddIconButton/AddIconButton.tsx:19-35`, `src/components/lib/TruncatedText/TruncatedText.tsx:36-51`

**Problem:** Both components build the same `Tooltip.Root` / `Trigger asChild` / `Portal` / `Positioner` / `Content` structure. A change to tooltip behavior or styling (placement, delay, arrow, z-index) has to be made twice and will drift (`typescript.md` rule 4).

**Proposed fix:** Add a small `Tooltip` lib adapter with explicit props (`label`, `disabled?`, `contentTestId?`, `children`) that wraps this structure. Use it in both components. `TruncatedText` keeps its overflow measurement and passes `disabled={!isOverflowing}`. Add only the props these two callers need.

---

---

# Review round 2

**Reviewed:** staged changes, 62 files (Phase 2 unit tests, shared fixtures, `AddIconButton` test id) · **Date:** 2026-11-08 · **Style:** `implementation-plans/create-thread-section/create-thread-section.style.md`

`npm run ts:check`, `npm run lint` and `npm run test` (544 tests) all pass on the staged content.

## Summary

| Category | High | Medium | Low |
| --- | --- | --- | --- |
| Bug | 0 | 1 | 0 |
| Plan mismatch | 0 | 1 | 0 |
| Style violation | 0 | 0 | 2 |
| Duplication | 0 | 0 | 1 |

## Points

### 1. The "while saving" submit test never reaches the `isSaving` guard

**Category:** Bug · **Severity:** Medium · **Status:** Fixed
**Location:** `src/pages/ThreadPage/components/AddSectionModalContainer/components/AddSectionModal/__tests__/AddSectionModal.test.tsx:210-220`, `:185-196`

**Problem:** `does not call onSubmit when the form is submitted` renders with `isSaving: true`, so `SectionForm` disables the name input and `user.type` types nothing. The name stays empty, so `handleSubmit` returns on `submitDisabled`, not on `isSaving`. Removing `|| isSaving` from `handleSubmit` leaves the test green, so AC13 (Enter while saving creates no second section) has no real coverage. Likewise `keeps the typed name and color...` asserts only the name, although its title and AC34 include the color.

**Proposed fix:** Reach the guard with a valid name: render with `isSaving: false`, type the name, then `rerender(renderModal({ isSaving: true }))`, `fireEvent.submit(form)` and expect `mockOnSubmit` not to have been called. In the keep-values test, also check the selected color is unchanged after the rerenders (for example, submit after `isSaving` returns to false and assert `{ name, color }` is the submitted value).

---

### 2. The round 1 test for the `deleteThread` ordering fix was not written

**Category:** Plan mismatch · **Severity:** Medium · **Status:** Fixed
**Location:** `src/services/useThreadsService/__tests__/useThreadsService.test.ts:479-493` (Phase 2, Step 6)

**Problem:** Round 1 point 1 moved `deleteThreadSections` before the threads write and named a test for it. The `deleteThread` block has only the happy-path sections test. If someone moves the sections call back below the threads write, nothing fails, and a malformed `sections` key goes back to deleting the thread and then rejecting.

**Proposed fix:** Add to `describe("deleteThread")`: with `seedThreads(mindThreadFixtures)` and `localStorage.setItem(SECTIONS_STORAGE_KEY, MALFORMED_JSON)`, `deleteThread(mindThreadFixtures[0].id)` rejects (`SyntaxError`, or `INVALID_SECTIONS_DATA_ERROR` for a non-section array), and `readStoredThreads()` still equals `mindThreadFixtures`.

---

### 3. Disappearing elements are awaited with `waitFor` + `not.toBeInTheDocument`

**Category:** Style violation · **Severity:** Low · **Status:** Rejected
**Location:** `src/pages/ThreadPage/components/AddSectionModalContainer/__tests__/AddSectionModalContainer.test.tsx:107`, `:124`, `:143`; `src/pages/ThreadPage/__tests__/ThreadPage.test.tsx:291-295` (`waitForModalToClose`); `src/__tests__/App.test.tsx:249-251`, `:357-359`
**Reason:** Rejected by the developer.

**Problem:** `unit-tests.md` rule 12 says to keep the element and `await waitForElementToBeRemoved(element)`, not `waitFor` with `not.toBeInTheDocument()`. `ThreadPage.test.tsx` already uses `waitForElementToBeRemoved` elsewhere.

**Proposed fix:** Replace each with `await waitForElementToBeRemoved(modalTitle)` (and `deletedThreadLink` in `App.test.tsx`). In `AddSectionModalContainer.test.tsx`, take `modalTitle` from `getByText` (not `queryByText`) so the element is non-null. Keep the `waitFor` for focus (`AddSectionModal.test.tsx:115`): Zag moves focus asynchronously and there is no element to wait for.

---

### 4. Queries are passed straight into `user` calls and `expect`

**Category:** Style violation · **Severity:** Low · **Status:** Fixed
**Location:** `AddSectionModalContainer.test.tsx:122`, `:141`, `:163`; `ThreadPage.test.tsx:282`, `:357`, `:408`, `:413`, `:426`, `:459`, `:502`; `App.test.tsx:229` and the first `user.click(screen.getByTestId(...))` in `addSection`; `Button.test.tsx:122`

**Problem:** `unit-tests.md` rules 13 and 18 require storing the element in a constant before asserting on it or passing it to a user event. These lines pass `getSubmitButton()`, `getAddSectionButton()`, `getCancelButton()`, `getAddButton()`, `getThreadLink(...)`, `screen.getByTestId(...)` and `getButton()` directly.

**Proposed fix:** Store each in a constant first, for example `const submitButton = getSubmitButton(); await user.click(submitButton);` and `const button = getButton(); expect(button).toHaveAttribute("type", "button");`.

---

### 5. Test helpers are copied between files

**Category:** Duplication · **Severity:** Low · **Status:** Fixed
**Location:** `SectionCard.test.tsx:15,45-51` and `TruncatedText.test.tsx:12,24-30` (`TOOLTIP_OPEN_DELAY_MS`, `waitForOpenDelay`); `SectionList.test.tsx` (`getRenderedNames`), `SectionsColumn.test.tsx` (inline name mapping), `ThreadPage.test.tsx` (`getSectionNames`); `ThreadPage.test.tsx:244`, `App.test.tsx:213` (`type User`)

**Problem:** `unit-tests.md` rule 5 says a helper needed in more than one test file belongs in one shared helper file. `waitForOpenDelay` is an exact copy in two files, and the rendered-section-names helper exists in three forms. A change to the tooltip delay has to be made in each copy.

**Proposed fix:** Move `waitForOpenDelay` (with its constant) to the lib `__test-fixtures__` (for example next to `stubTextOverflow`), and add `getRenderedSectionNames()` to `src/__test-fixtures__/sections/`. Use them in the listed files. Leave the `type User` alias as is unless a shared user type is added alongside.

---
