# Code review: Create a page in a thread section

**Reviewed:** staged changes, 69 files · **Date:** 2026-11-10 · **Style:** `implementation-plans/create-section-page/create-section-page.style.md`

## Summary

| Category | High | Medium | Low |
| --- | --- | --- | --- |
| Bug | 0 | 2 | 0 |
| Style violation | 0 | 0 | 1 |

## Points

### 1. Section pages are deleted before the section, so a failed section delete loses the pages

**Category:** Bug · **Severity:** Medium · **Status:** Fixed
**Location:** `src/services/useThreadsService/useThreadsService.ts:178-183`

**Problem:** `removeThreadSection` calls `deleteSectionPages` before `deleteSection`. If `deleteSection` throws (for example, invalid stored sections data), the pages are already gone while the section stays. The thread's `totalPages` is not lowered either, so the dashboard count is wrong. Step 5 of the plan deletes the pages after the section, so a failure leaves only orphaned pages that a later delete cleans up.

**Proposed fix:** Move the `deleteSectionPages` call below `deleteSection`, as the plan's Step 5 shows:

```ts
const isSectionDeleted = await threadSectionsService.deleteSection(sectionId);

const deletedPageCount =
  await sectionPagesService.deleteSectionPages(sectionId);
```

Test to add (Phase 2, Step 3): when the stored sections data is invalid, `removeThreadSection` rejects and the section's pages and the thread's `totalPages` stay unchanged.

---

### 2. A stored page with an unknown `type` crashes the whole thread page

**Category:** Bug · **Severity:** Medium · **Status:** Fixed
**Location:** `src/services/useSectionPagesService/useSectionPagesService.utils.ts:1336`, `src/pages/ThreadPage/components/PageTypeIcon/PageTypeIcon.tsx:617`

**Problem:** `isSectionPage` only checks that `type` is a string. A stored page with an unknown type, such as `"note"` from edited storage or a removed type, passes validation. `PAGE_TYPE_CONFIG[type]` is then `undefined`, and destructuring `icon` throws during render. Because the error is thrown in render, it is not caught by the loader's error state, so the whole page breaks.

**Proposed fix:** Validate `type` against the known page types in `isSectionPage`. For example, check `PAGE_TYPES.includes(page.type)`, or define the list of types in `@/types` so the service does not import from a page. Invalid data then reaches the existing `INVALID_PAGES_DATA_ERROR` path and the loader shows its error state.

Test to add (Phase 2, Step 1): `isSectionPageList` returns `false` for an item whose `type` is a string outside the known types.

---

### 3. `selectedItem` is declared twice in `Select`, and the inner one shadows the outer

**Category:** Style violation · **Severity:** Low · **Status:** Fixed
**Location:** `src/components/lib/Select/Select.tsx:66`, `src/components/lib/Select/Select.tsx:73`

**Problem:** `selectedItem` is the item found for the current value in the component body, and `const [selectedItem] = details.items` inside `handleValueChange` shadows it. This breaks the style file's meaningful-names rule (`typescript.md` rule 7) and makes it easy to read the wrong one.

**Proposed fix:** Rename the inner variable to `changedItem`:

```ts
const [changedItem] = details.items;

if (changedItem) {
  onChange(changedItem.value);
}
```

---

# Review round 2: Phase 2 unit tests

**Reviewed:** staged changes, 29 files · **Date:** 2026-11-14 · **Style:** `implementation-plans/create-section-page/create-section-page.style.md`

## Summary

| Category | High | Medium | Low |
| --- | --- | --- | --- |
| Duplication | 0 | 0 | 1 |
| Style violation | 0 | 0 | 1 |

## Points

### 4. Test helpers are copied between test files

**Category:** Duplication · **Severity:** Low · **Status:** Fixed
**Location:** `src/services/useSectionPagesService/__tests__/useSectionPagesService.test.ts:29`, `src/services/useSectionPagesService/__tests__/useSectionPagesService.utils.test.ts:13`, `src/services/useThreadsService/__tests__/useThreadsService.test.ts:49`, `src/pages/ThreadPage/components/AddPageModalContainer/__tests__/AddPageModalContainer.test.tsx:85,105`, `src/pages/ThreadPage/__tests__/ThreadPage.test.tsx:560,572`, `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PagesColumn/__tests__/PagesColumn.test.tsx:62`

**Problem:** `buildNewPage` exists in three test files with the same shape and different defaults. `getAddPageButton` and `openAddPageModal` exist in two or three UI test files. `unit-tests.md` rule 5 says a helper used in more than one file belongs in one shared file. The copies can drift, for example when a field is added to `NewSectionPage`.

**Proposed fix:** Move `buildNewPage` to `src/__test-fixtures__/pages/pages.ts` and use it in the three service tests. Add `getAddPageButton` and `openAddPageModal({ user })` to a new `src/__test-fixtures__/pages/pages.interactions.ts`, export it from the folder's `index.ts`, and use it in the container and `ThreadPage` tests. `PagesColumn.test.tsx` uses a `queryBy` variant that can return `null`, so it stays local. Keep the per-test overrides (name, section id) as `buildNewPage` arguments.

---

### 5. Implicit-return arrow in `waitFor`

**Category:** Style violation · **Severity:** Low · **Status:** Fixed
**Location:** `src/pages/ThreadPage/components/AddPageModalContainer/components/AddPageModal/__tests__/AddPageModal.test.tsx:121`

**Problem:** `await waitFor(() => expect(nameInput).toHaveFocus());` uses an implicit return. The style file requires `typescript.md` rule 9 (block body with explicit `return`) for new code.

**Proposed fix:**

```ts
await waitFor(() => {
  expect(nameInput).toHaveFocus();
});
```
