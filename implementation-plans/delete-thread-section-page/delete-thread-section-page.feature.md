# Delete a page from a thread section

**Source:** `implementation-plans/delete-thread-section-page/delete-thread-section-page.draft.md`

## Acceptance criteria

Page actions menu

- AC1: Every page card of the selected section shows an actions menu button.
- AC2: The button of "Brainstorm" is announced as "Page actions for Brainstorm".
- AC3: The opened menu shows one item, "Delete", in red.
- AC4: A long page name is truncated and does not overlap the actions menu button.

Confirmation dialog

- AC5: Selecting "Delete" opens a dialog titled "Delete page?".
- AC6: The dialog body reads: "Brainstorm" will be permanently deleted. This can't be undone.
- AC7: The dialog shows "Cancel" and a red "Delete", with keyboard focus on "Cancel".
- AC8: "Cancel", the close button, a click outside, and Escape each close the dialog when no deletion is in progress.
- AC9: After the dialog is dismissed, "Brainstorm" is still in the list.

Deleting the page

- AC10: After "Delete" is clicked, "Brainstorm" disappears from the list without a page reload.
- AC11: Deleting "Outline" keeps "Brainstorm" and "Draft" in the same order.
- AC12: Deleting one of two pages with the same name keeps the other one.
- AC13: Deleting "Brainstorm" in one section keeps the "Brainstorm" page of another section.
- AC14: A deleted page is still gone after the thread page is reloaded.
- AC15: Deleting the only page shows "No pages yet."
- AC16: Deleting one page of a thread with 3 pages makes the dashboard card show "2 pages".
- AC17: The dashboard card's "last updated" value reflects the time of the deletion.
- AC18: The section is still in the Sections column after one of its pages is deleted.

In progress

- AC19: The "Delete" button shows a loading indicator.
- AC20: "Cancel", "Delete", and the dialog close button are disabled.
- AC21: Escape and a click outside leave the dialog open.

Success

- AC22: The dialog closes.
- AC23: A success notification reads: Page "Brainstorm" deleted.

Failure

- AC24: An error notification reads: Couldn't delete the page. Please try again.
- AC25: The dialog stays open with "Cancel" and "Delete" enabled.
- AC26: After the dialog is closed, "Brainstorm" is still in the list.
- AC27: The dashboard card's page count and "last updated" value are unchanged.

Page already deleted elsewhere

- AC28: "Brainstorm" disappears from the list.
- AC29: The dialog closes.
- AC30: A success notification reads: Page "Brainstorm" deleted.
- AC31: The dashboard card's page count does not drop a second time.
- AC32: The dashboard card's "last updated" value still reflects the earlier deletion.

## Style notes

- Pages are deleted by `id`, never by name (AC12, AC13) — story requirement.
- The delete modal state of sections and pages comes from one generic `useDeleteModal`, the way `useCreateModal` serves both create modals. `useDeleteSection` keeps its return shape — developer decision.
- `PageCardActions` mirrors `SectionCardActions` with page constants; no shared menu component is extracted — developer decision.
- Context values are inline objects split into value and action contexts, with no `useMemo` — developer decision from `create-thread-section.feature.md`.
- Single-line `if`s, implicit-return one-liners, and `=== null` checks that exist in the project are not copied; new code follows `typescript.md` rules 8, 9, and 11. Existing code is not rewritten unless a step changes it — developer decision from `create-thread-section.feature.md`.
- `useThreadsService` calls `useSectionPagesService` by relative path, and the pages service never calls the threads or sections service — developer decision from `create-section-page.feature.md`.
- Component props types stay in the component file and are not exported, unless a test or another file needs them — `react.md` rule 4 and project convention (`PageCard.tsx`).
- Test IDs are imported by file path, because the `index.ts` of a component exports only the component — project convention (`SectionCardActions`).
- Formatting is 2 spaces, double quotes, 80 columns — project convention (`.prettierrc.json`).

## Phase 1: Implementation

After Phase 1, `npm run ts:check` reports errors only in test files that render `PageCard`, `PageList`, or `PagesColumnContent` without the new delete prop. Phase 2 fixes them. `npm run build` type-checks tests too, so it passes only after Phase 2.

---

### Step 1: Add `deletePage` to the pages service

**File:**
`src/services/useSectionPagesService/useSectionPagesService.ts`
`src/services/useSectionPagesService/useSectionPagesService.types.ts`

**Covers:** AC10, AC12, AC13, AC14, AC28

**Context:** It mirrors `deleteSection` in `useThreadSectionsService.ts`: it returns whether a page was removed, so the caller can tell "already deleted elsewhere" apart from a real deletion without treating it as an error. It is named `deletePage` rather than `deleteSectionPage`, because the service already has `deleteSectionPages(sectionId)`, and a name one letter apart would invite mistakes.

**Changes:**

1. Add to `UseSectionPagesServiceReturn`:

   ```ts
   deletePage: (pageId: string) => Promise<boolean>;
   ```

2. Add the method to the hook, after `createSectionPage`, and add it to the returned object:

   ```ts
   const deletePage = async (pageId: string): Promise<boolean> => {
     const storedPages = await getPages();

     const remainingPages = storedPages.filter((page) => {
       return page.id !== pageId;
     });

     if (remainingPages.length === storedPages.length) {
       return false;
     }

     pagesStorage.set(remainingPages);

     return true;
   };
   ```

**Verification MANUAL:** `npm run ts:check` reports no errors in `src/services/useSectionPagesService/`.

---

### Step 2: Add `removeSectionPage` to the threads service

**File:**
`src/services/useThreadsService/useThreadsService.ts`
`src/services/useThreadsService/useThreadsService.types.ts`
`src/services/useThreadsService/useThreadsService.utils.ts`

**Covers:** AC10, AC14, AC16, AC17, AC18, AC27, AC28, AC31, AC32

**Context:** It mirrors `removeThreadSection`. The threads key is read and validated before the page is removed, so invalid thread data fails with nothing changed (AC27). When no page was removed, or the whole thread was deleted elsewhere, the thread is left untouched and the call still succeeds, so the count does not drop twice (AC31, AC32). The two writes are not transactional, the same tradeoff `removeThreadSection` makes. Sections are not touched, so `totalSections` stays and the section stays listed (AC18).

**Changes:**

1. In `useThreadsService.types.ts`, add to `UseThreadsServiceReturn`, after `addSectionPage`:

   ```ts
   removeSectionPage: (params: RemoveSectionPageParams) => Promise<void>;
   ```

   and add the types after `ApplyDeletedSectionParams`:

   ```ts
   export type RemoveSectionPageParams = {
     threadId: string;
     pageId: string;
   };

   export type ApplyDeletedPageParams = {
     thread: MindThread;
     deletedAt: string;
   };
   ```

2. In `useThreadsService.utils.ts`, add after `applyDeletedSection`, and import `ApplyDeletedPageParams`:

   ```ts
   export const applyDeletedPage = ({
     thread,
     deletedAt,
   }: ApplyDeletedPageParams): MindThread => {
     return {
       ...thread,
       totalPages: thread.totalPages - 1,
       lastUpdated: deletedAt,
     };
   };
   ```

3. In `useThreadsService.ts`, import `applyDeletedPage` and `RemoveSectionPageParams`, add the method after `removeThreadSection`, and add it to the returned object after `addSectionPage`:

   ```ts
   const removeSectionPage = async ({
     threadId,
     pageId,
   }: RemoveSectionPageParams): Promise<void> => {
     const storedThreads = await getThreads();
     const storedThread = findThread({ threads: storedThreads, threadId });
     const isPageDeleted = await sectionPagesService.deletePage(pageId);

     if (!isPageDeleted || !storedThread) {
       return;
     }

     threadsStorage.set(
       replaceThread({
         threads: storedThreads,
         updatedThread: applyDeletedPage({
           thread: storedThread,
           deletedAt: new Date().toISOString(),
         }),
       })
     );
   };
   ```

**Verification MANUAL:** `npm run ts:check` reports no errors in `src/services/useThreadsService/`.

---

### Step 3: Add `removePage` to the thread page state

**File:**
`src/pages/ThreadPage/components/ThreadPageLoader/ThreadPageLoader.hooks.ts`

**Covers:** AC10, AC11, AC12, AC13, AC15, AC28

**Changes:**

1. In `useThreadState`, add after `addPage`, and add `removePage` to the returned object after `addPage`:

   ```ts
   const removePage = async (pageId: string) => {
     await threadsService.removeSectionPage({ threadId, pageId });

     setPages((currentPages) => {
       return currentPages.filter((page) => {
         return page.id !== pageId;
       });
     });
   };
   ```

**Verification MANUAL:** `npm run ts:check` reports no errors in `ThreadPageLoader.hooks.ts`.

---

### Step 4: Extract the generic `useDeleteModal` from `useDeleteSection`

**File:**
`src/pages/ThreadPage/components/ThreadPageLoader/ThreadPageLoader.hooks.ts`
`src/pages/ThreadPage/components/ThreadPageLoader/ThreadPageLoader.types.ts`

**Covers:** AC8, AC19, AC20, AC22, AC24, AC25, AC29

**Context:** The page dialog needs the same state and flow as `useDeleteSection`, so the logic moves into one generic hook, the way `useCreateModal` serves both create modals (`typescript.md` rule 4). `useDeleteSection` keeps its exact return shape, so `ThreadPageLoader.tsx` and the existing section tests do not change. On failure the modal stays open because `close` runs only after a successful removal, and `finally` re-enables its buttons.

**Changes:**

1. In `ThreadPageLoader.types.ts`, rename the private `CreatedItem` type to `NamedItem`, export it, and update `UseCreateModalParams` to use it:

   ```ts
   export type NamedItem = {
     id: string;
     name: string;
   };

   export type UseCreateModalParams<Value> = {
     create: (value: Value) => Promise<NamedItem>;
     getCreatedMessage: (name: string) => string;
     errorMessage: string;
   };
   ```

2. Add after `UseCreateModalParams`:

   ```ts
   export type UseDeleteModalParams = {
     remove: (itemId: string) => Promise<void>;
     getDeletedMessage: (name: string) => string;
     errorMessage: string;
   };
   ```

3. In `ThreadPageLoader.hooks.ts`, add after `useCreateModal`, and import `NamedItem` and `UseDeleteModalParams` as types:

   ```ts
   export const useDeleteModal = <Item extends NamedItem>({
     remove,
     getDeletedMessage,
     errorMessage,
   }: UseDeleteModalParams) => {
     const [itemToDelete, setItemToDelete] = useState<Item | null>(null);
     const [isDeleting, setIsDeleting] = useState(false);

     const open = (item: Item) => {
       setItemToDelete(item);
     };

     const close = () => {
       setItemToDelete(null);
     };

     const confirm = async () => {
       if (!itemToDelete) {
         return;
       }

       setIsDeleting(true);

       try {
         await remove(itemToDelete.id);

         close();
         notify.success(getDeletedMessage(itemToDelete.name));
       } catch {
         notify.error(errorMessage);
       } finally {
         setIsDeleting(false);
       }
     };

     return { itemToDelete, isDeleting, open, close, confirm };
   };
   ```

4. Replace the body of `useDeleteSection`:

   ```ts
   export const useDeleteSection = ({ removeSection }: UseDeleteSectionParams) => {
     const sectionModal = useDeleteModal<ThreadSection>({
       remove: removeSection,
       getDeletedMessage: getSectionDeletedMessage,
       errorMessage: DELETE_SECTION_ERROR_MESSAGE,
     });

     return {
       sectionToDelete: sectionModal.itemToDelete,
       isDeletingSection: sectionModal.isDeleting,
       openDeleteSectionModal: sectionModal.open,
       closeDeleteSectionModal: sectionModal.close,
       confirmDeleteSection: sectionModal.confirm,
     };
   };
   ```

**Verification MANUAL:** `npm run ts:check` reports no errors in `ThreadPageLoader/`, and deleting a section on a thread page still works as before (dialog, in-progress state, notification).

---

### Step 5: Add the `useDeletePage` hook

**File:**
`src/pages/ThreadPage/components/ThreadPageLoader/ThreadPageLoader.hooks.ts`
`src/pages/ThreadPage/components/ThreadPageLoader/ThreadPageLoader.constants.ts`
`src/pages/ThreadPage/components/ThreadPageLoader/ThreadPageLoader.utils.ts`
`src/pages/ThreadPage/components/ThreadPageLoader/ThreadPageLoader.types.ts`

**Covers:** AC22, AC23, AC24, AC29, AC30

**Changes:**

1. In `ThreadPageLoader.constants.ts`, add after `SAVE_PAGE_ERROR_MESSAGE`:

   ```ts
   export const DELETE_PAGE_ERROR_MESSAGE =
     "Couldn't delete the page. Please try again.";
   ```

2. In `ThreadPageLoader.utils.ts`, add after `getPageCreatedMessage`:

   ```ts
   export const getPageDeletedMessage = (pageName: string) => {
     return `Page "${pageName}" deleted.`;
   };
   ```

3. In `ThreadPageLoader.types.ts`, add after `UseAddPageParams`:

   ```ts
   export type UseDeletePageParams = {
     removePage: (pageId: string) => Promise<void>;
   };
   ```

4. In `ThreadPageLoader.hooks.ts`, add after `useDeleteSection`:

   ```ts
   export const useDeletePage = ({ removePage }: UseDeletePageParams) => {
     const pageModal = useDeleteModal<SectionPage>({
       remove: removePage,
       getDeletedMessage: getPageDeletedMessage,
       errorMessage: DELETE_PAGE_ERROR_MESSAGE,
     });

     return {
       pageToDelete: pageModal.itemToDelete,
       isDeletingPage: pageModal.isDeleting,
       openDeletePageModal: pageModal.open,
       closeDeletePageModal: pageModal.close,
       confirmDeletePage: pageModal.confirm,
     };
   };
   ```

**Verification MANUAL:** `npm run ts:check` reports no errors in `src/pages/ThreadPage/components/ThreadPageLoader/`.

---

### Step 6: Expose page deletion through the thread page contexts

**File:**
`src/pages/ThreadPage/components/ThreadPageLoader/ThreadPageLoader.tsx`
`src/pages/ThreadPage/components/ThreadPageLoader/ThreadPageLoader.types.ts`

**Covers:** AC5, AC10

**Changes:**

1. Add to `ThreadPageValue`, after `lastCreatedPageId`:

   ```ts
   pageToDelete: SectionPage | null;
   isDeletingPage: boolean;
   ```

2. Add to `ThreadPageAction`, after `submitNewPage`:

   ```ts
   openDeletePageModal: (page: SectionPage) => void;
   closeDeletePageModal: () => void;
   confirmDeletePage: () => Promise<void>;
   ```

3. In `ThreadPageLoader.tsx`, take `removePage` from `useThreadState`, call `useDeletePage({ removePage })` after `useAddPage`, and add its two state values to the end of the value context and its three functions to the end of the action context.

**Verification MANUAL:** `npm run ts:check` reports no errors in `src/pages/ThreadPage/components/ThreadPageLoader/`.

---

### Step 7: Create `DeletePageModalContainer`

**New files:**

- `src/pages/ThreadPage/components/DeletePageModalContainer/DeletePageModalContainer.tsx`
- `src/pages/ThreadPage/components/DeletePageModalContainer/DeletePageModalContainer.constants.ts`
- `src/pages/ThreadPage/components/DeletePageModalContainer/DeletePageModalContainer.utils.ts`
- `src/pages/ThreadPage/components/DeletePageModalContainer/index.ts`

**File:**
`src/pages/ThreadPage/components/index.ts`

**Covers:** AC5, AC6, AC7, AC8, AC19, AC20, AC21

**Context:** It follows `DeleteSectionModalContainer.tsx` and reuses the shared `DeleteConfirmationModal`, which already provides the "Cancel" focus, the red "Delete", the in-progress state, and the dismissal rules.

**Changes:**

1. In `DeletePageModalContainer.constants.ts`:

   ```ts
   export const DELETE_PAGE_MODAL_TITLE = "Delete page?";
   ```

2. In `DeletePageModalContainer.utils.ts`:

   ```ts
   export const getDeletePageModalText = (pageName: string) => {
     return `"${pageName}" will be permanently deleted. This can't be undone.`;
   };
   ```

3. In `DeletePageModalContainer.tsx`:

   ```tsx
   import { DeleteConfirmationModal } from "@/components/shared";
   import { useThreadPageAction, useThreadPageValue } from "../ThreadPageLoader";
   import { DELETE_PAGE_MODAL_TITLE } from "./DeletePageModalContainer.constants";
   import { getDeletePageModalText } from "./DeletePageModalContainer.utils";

   export const DeletePageModalContainer = () => {
     const { pageToDelete, isDeletingPage } = useThreadPageValue();
     const { closeDeletePageModal, confirmDeletePage } = useThreadPageAction();

     return pageToDelete ? (
       <DeleteConfirmationModal
         title={DELETE_PAGE_MODAL_TITLE}
         message={getDeletePageModalText(pageToDelete.name)}
         isDeleting={isDeletingPage}
         onClose={closeDeletePageModal}
         onDelete={confirmDeletePage}
       />
     ) : null;
   };
   ```

4. Create `index.ts` with `export * from "./DeletePageModalContainer";`, and add `export * from "./DeletePageModalContainer";` to `src/pages/ThreadPage/components/index.ts`, after `./AddPageModalContainer`.

**Verification MANUAL:** `npm run ts:check` reports no errors in `DeletePageModalContainer/`.

---

### Step 8: Register the modal on the thread page

**File:**
`src/pages/ThreadPage/ThreadPage.tsx`

**Covers:** AC5

**Changes:**

1. Import `DeletePageModalContainer` from `./components`, and render it inside `ThreadPageLoader`, after `<DeleteSectionModalContainer />`.

**Verification MANUAL:** The thread page renders as before, with no dialog open and no console errors.

---

### Step 9: Create `PageCardActions`

**New files:**

- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PagesColumn/components/PageCard/components/index.ts`
- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PagesColumn/components/PageCard/components/PageCardActions/PageCardActions.tsx`
- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PagesColumn/components/PageCard/components/PageCardActions/PageCardActions.constants.ts`
- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PagesColumn/components/PageCard/components/PageCardActions/PageCardActions.utils.ts`
- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PagesColumn/components/PageCard/components/PageCardActions/index.ts`

**Covers:** AC1, AC2, AC3

**Context:** It mirrors `SectionCard/components/SectionCardActions/` file for file, using the same `Menu` adapter and icon (developer decision).

**Changes:**

1. In `PageCardActions.constants.ts`:

   ```ts
   import { initTestIdCreator } from "@/components/lib/utils";

   const createTestId = initTestIdCreator("PageCardActions__");

   export const PageCardActionsTestId = {
     menu: createTestId("menu"),
   } as const;

   export const DELETE_PAGE_MENU_ITEM = {
     value: "delete",
     label: "Delete",
   } as const;
   ```

2. In `PageCardActions.utils.ts`:

   ```ts
   export const getPageActionsLabel = (pageName: string) => {
     return `Page actions for ${pageName}`;
   };
   ```

3. In `PageCardActions.tsx`:

   ```tsx
   import { LuEllipsisVertical } from "react-icons/lu";
   import { Menu, type MenuItem } from "@/components/lib";
   import type { SectionPage } from "@/types";
   import {
     DELETE_PAGE_MENU_ITEM,
     PageCardActionsTestId,
   } from "./PageCardActions.constants";
   import { getPageActionsLabel } from "./PageCardActions.utils";

   type PageCardActionsProps = {
     page: SectionPage;
     onDelete: (page: SectionPage) => void;
   };

   export const PageCardActions = ({ page, onDelete }: PageCardActionsProps) => {
     const handleDelete = () => {
       onDelete(page);
     };

     const menuItems: MenuItem[] = [
       { ...DELETE_PAGE_MENU_ITEM, color: "red", onSelect: handleDelete },
     ];

     return (
       <Menu
         triggerLabel={getPageActionsLabel(page.name)}
         triggerIcon={<LuEllipsisVertical />}
         data-testid={PageCardActionsTestId.menu}
         items={menuItems}
       />
     );
   };
   ```

4. Create `PageCardActions/index.ts` with `export * from "./PageCardActions";`, and `components/index.ts` with `export * from "./PageCardActions";`.

**Verification MANUAL:** `npm run ts:check` reports no errors in `PageCardActions/`.

---

### Step 10: Show the actions on the page card and pass the delete handler to it

**File:**
`src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PagesColumn/components/PageCard/PageCard.tsx`
`src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PagesColumn/components/PageList/PageList.tsx`
`src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PagesColumn/components/PagesColumnContent/PagesColumnContent.tsx`
`src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PagesColumn/PagesColumn.tsx`

**Covers:** AC1, AC4, AC5, AC15

**Context:** These files change together because the new required prop must reach `PageCard` for the code to compile. `PagesColumn` stays the only connected component, as `SectionsColumn` is for section cards. The icon and name move into an inner flex box with `minWidth="0"`, so `justifyContent="space-between"` pushes the button to the right edge while `TruncatedText` shrinks and truncates beside it instead of overlapping it (AC4). The vertical padding drops from `2` to `1` to offset the 32px `sm` icon button, so the card height stays about the same.

**Changes:**

1. In `PageCard.tsx`, add `onDelete: (page: SectionPage) => void;` to the props, and import `PageCardActions` from `./components`. Change the outer `Box` and wrap the icon and name:

   ```tsx
   <Box
     ref={cardRef}
     data-testid={PageCardTestId.container}
     display="flex"
     alignItems="center"
     justifyContent="space-between"
     gap="2"
     py="1"
     pl="3"
     pr="1"
     minWidth="0"
     borderRadius="md"
     borderWidth="1px"
     borderColor="border"
     borderLeftWidth="4px"
     borderLeftColor={page.color}
     backgroundColor="bg"
   >
     <Box display="flex" alignItems="center" gap="2" minWidth="0">
       <PageTypeIcon type={page.type} />

       <TruncatedText data-testid={PageCardTestId.name} fontWeight="medium">
         {page.name}
       </TruncatedText>
     </Box>

     <PageCardActions page={page} onDelete={onDelete} />
   </Box>
   ```

2. In `PageList.tsx`, add `onDeletePage: (page: SectionPage) => void;` to the props, and pass `onDelete={onDeletePage}` to `PageCard`.

3. In `PagesColumnContent.tsx`, add `onDeletePage: (page: SectionPage) => void;` to the props, and pass `onDeletePage={onDeletePage}` to `PageList`.

4. In `PagesColumn.tsx`, take `openDeletePageModal` from `useThreadPageAction()` together with `openAddPageModal`, and pass `onDeletePage={openDeletePageModal}` to `PagesColumnContent`.

**Verification MANUAL:** On a thread page, run through the whole flow in the browser: a long page name truncates beside the menu button and the card height looks the same as before; the menu shows a red "Delete"; the dialog title, text, and "Cancel" focus are correct; deleting removes the card, keeps the section, and shows the notification; deleting the last page shows "No pages yet."; after a reload the page is still gone; and the dashboard card shows one page fewer and "Updated: just now". Then open the same thread in two tabs, delete a page in one, and confirm that deleting it in the other also succeeds and the count drops only once.

---

## Phase 2: Unit tests

Every test file follows `unit-tests.md`: a root `describe()`, a `setup()` or `setupHook()` function, `vi.clearAllMocks()` before each test, elements stored in constants before they are asserted on or passed to a user event, and `toStrictEqual()` for reference types. Pages are seeded with `seedPages` and `sectionPageFixtures`, and storage changes "from another tab" use `dispatchStorageChange(PAGES_STORAGE_KEY)` from `@/__test-fixtures__`.

---

### Step 1: Test `deletePage`

**File:**
`src/services/useSectionPagesService/__tests__/useSectionPagesService.test.ts`

**Covers:** AC10, AC12, AC13, AC14, AC28

**Changes:**

1. Add a `describe("deletePage")` block with these scenarios:
   - It removes only the page with the given `id`, resolves `true`, and persists the rest in order (`readStoredPages`).
   - With two pages that have the same name, in the same section or in different sections, it removes only the targeted one.
   - For an unknown `id` it resolves `false` and does not call `localStorage.setItem`.
   - After another tab removed the page (`seedPages` and `dispatchStorageChange(PAGES_STORAGE_KEY)`), it resolves `false`.
   - It rejects when the stored data is invalid, and nothing is written.

**Verification:** `npx vitest run src/services/useSectionPagesService` passes.

---

### Step 2: Test `applyDeletedPage`

**File:**
`src/services/useThreadsService/__tests__/useThreadsService.utils.test.ts`

**Covers:** AC16, AC17, AC18

**Changes:**

1. Add scenarios: it decrements `totalPages`, sets `lastUpdated` to `deletedAt`, keeps every other field (including `totalSections`), and does not mutate the input thread.

**Verification:** `npx vitest run src/services/useThreadsService/__tests__/useThreadsService.utils.test.ts` passes.

---

### Step 3: Test `removeSectionPage`

**File:**
`src/services/useThreadsService/__tests__/useThreadsService.test.ts`

**Covers:** AC14, AC16, AC17, AC18, AC27, AC31, AC32

**Context:** It follows the existing `describe("removeThreadSection")` block, which already covers the same cases for sections.

**Changes:**

1. Add a `describe("removeSectionPage")` block with these scenarios, using `seedThreads`, `seedPages`, and fake or asserted time for `lastUpdated`:
   - It removes the page, drops `totalPages` by one, sets `lastUpdated` to the deletion time, keeps `totalSections` and the stored sections, and leaves other threads unchanged.
   - When the page was already deleted elsewhere (use `dispatchStorageChange`), it resolves and leaves the stored thread strictly equal to what was there, so count and `lastUpdated` do not change.
   - When the whole thread was deleted elsewhere, it resolves and writes no thread.
   - When the `localStorage` write fails (a `Storage.prototype.setItem` spy that throws), it rejects, and pages and threads are unchanged.
   - When the stored threads data is invalid, it rejects and the page is not removed.

**Verification:** `npx vitest run src/services/useThreadsService/__tests__/useThreadsService.test.ts` passes.

---

### Step 4: Test the page deleted message

**File:**
`src/pages/ThreadPage/components/ThreadPageLoader/__tests__/ThreadPageLoader.utils.test.ts`

**Covers:** AC23, AC30

**Changes:**

1. Add a test that `getPageDeletedMessage("Brainstorm")` returns `Page "Brainstorm" deleted.`

**Verification:** `npx vitest run src/pages/ThreadPage/components/ThreadPageLoader/__tests__/ThreadPageLoader.utils.test.ts` passes.

---

### Step 5: Test the thread page hooks and extend the service overrides

**File:**
`src/__test-fixtures__/threads/threadsService.ts`
`src/pages/ThreadPage/components/ThreadPageLoader/__tests__/ThreadPageLoader.hooks.test.tsx`

**Covers:** AC10, AC11, AC12, AC13, AC15, AC19, AC22, AC23, AC24, AC25, AC28, AC29, AC30

**Context:** `useDeleteModal` gets no tests of its own. It is tested as is through its two wrappers: the existing `useDeleteSection` tests, which must pass unchanged and prove the refactor, and the new `useDeletePage` tests (`unit-tests.md` rule 1).

**Changes:**

1. In `threadsService.ts`, add `removeSectionPage` to the `Pick` in `ThreadsServiceOverrides`, to `resetThreadsServiceOverrides`, and to `createServicesMock`, following the shape of `removeThreadSection`.

2. Add `useThreadState` scenarios for `removePage`: it removes only the targeted page by `id`, keeps the order of the rest and the pages of other sections; it leaves `sections` unchanged; when the service rejects, the pages are unchanged and the call rejects.

3. Add a `setupDeletePage` helper following `setupDeleteSection`, with these `useDeletePage` scenarios:
   - `openDeletePageModal` sets `pageToDelete`, and `closeDeletePageModal` clears it.
   - `confirmDeletePage` does nothing when no page is selected.
   - `isDeletingPage` is `true` while `removePage` is pending (control it with `createDeferred`).
   - On success, `removePage` is called with the page `id`, `pageToDelete` is cleared, `isDeletingPage` is `false`, and the success notification appears with `getPageDeletedMessage`.
   - On failure, `pageToDelete` is kept, `isDeletingPage` is `false`, and the notification reads `DELETE_PAGE_ERROR_MESSAGE`.

**Verification:** `npx vitest run src/pages/ThreadPage/components/ThreadPageLoader` passes, including the unchanged `useDeleteSection` tests.

---

### Step 6: Add shared page deletion test helpers

**New files:**

- `src/__test-fixtures__/deletion/deletion.interactions.ts`
- `src/__test-fixtures__/deletion/index.ts`

**File:**
`src/__test-fixtures__/index.ts`
`src/__test-fixtures__/sections/sections.interactions.ts`
`src/__test-fixtures__/pages/pages.interactions.ts`
every test file that imports `confirmSectionDelete` (found with `grep -rln confirmSectionDelete src`)

**Context:** Opening a card's delete menu and confirming the dialog are the same steps for sections and pages; only the actions label differs. The steps move into one generic helper file instead of being copied (`unit-tests.md` rule 5). `confirmSectionDelete` is renamed because it clicks the shared dialog's button, not anything section-specific. Its callers import it through the `@/__test-fixtures__` barrel, so only the name changes.

**Changes:**

1. In `deletion.interactions.ts`, add `openDeleteMenu({ user, actionsLabel, index = 0 })` with the body of the current `openSectionDeleteMenu`, using `actionsLabel` as the button name, and move `confirmSectionDelete` here, renamed to `confirmDeletion`. Define the `User` type the same way `sections.interactions.ts` does.

2. Create `deletion/index.ts` with `export * from "./deletion.interactions";`, and add `export * from "./deletion";` to `src/__test-fixtures__/index.ts`.

3. In `sections.interactions.ts`, make `openSectionDeleteMenu` call `openDeleteMenu` with `getSectionActionsLabel(sectionName)`, and remove `confirmSectionDelete`.

4. In `pages.interactions.ts`, add:

   ```ts
   type OpenPageDeleteMenuParams = {
     user: User;
     pageName: string;
     index?: number;
   };

   export const openPageDeleteMenu = async ({
     user,
     pageName,
     index = 0,
   }: OpenPageDeleteMenuParams) => {
     await openDeleteMenu({
       user,
       actionsLabel: getPageActionsLabel(pageName),
       index,
     });
   };
   ```

5. Rename every usage of `confirmSectionDelete` to `confirmDeletion`.

**Verification:** `npm run test` passes, which proves the section tests still work with the renamed helper.

---

### Step 7: Test `DeletePageModalContainer`

**New files:**

- `src/pages/ThreadPage/components/DeletePageModalContainer/__tests__/DeletePageModalContainer.utils.test.ts`
- `src/pages/ThreadPage/components/DeletePageModalContainer/__tests__/DeletePageModalContainer.test.tsx`

**Covers:** AC5, AC6, AC7, AC8, AC9, AC19, AC20, AC21, AC22, AC23, AC24, AC25, AC26

**Context:** It follows `DeleteSectionModalContainer.test.tsx`: `@/services` is mocked once with `createServicesMock`, the Escape and outside-click scenarios use `waitForDismissListeners`, `clickOutside`, and a `pointerEventsCheck` `setup` option. `setup()` renders `SectionsColumn`, `PagesColumn`, and `DeletePageModalContainer` inside `ThreadPageLoader`, and selects the first section with `selectSectionCard`, so that its pages are listed.

**Changes:**

1. In the utils test, assert the exact text of `getDeletePageModalText("Brainstorm")`.

2. In the component test, cover these scenarios:
   - No dialog is shown until "Delete" is selected in a page card's menu (`openPageDeleteMenu`).
   - The dialog shows `DELETE_PAGE_MODAL_TITLE` and the text with the page's name, and "Cancel" has keyboard focus.
   - Each of the four dismissals closes the dialog, and the page stays in the list (`getRenderedPageNames`) and in storage (`readStoredPages`).
   - While `threadsServiceOverrides.removeSectionPage` is pending (`createDeferred`), the buttons are disabled, "Delete" shows a loading indicator, and Escape and a click outside leave the dialog open.
   - After success, the dialog closes, the page is no longer listed, and the success notification appears.
   - After failure, the error notification appears and the dialog stays open with both buttons enabled. Then, after the dialog is closed, the page is still listed.

**Verification:** `npx vitest run src/pages/ThreadPage/components/DeletePageModalContainer` passes.

---

### Step 8: Test `PageCardActions`

**New files:**

- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PagesColumn/components/PageCard/components/PageCardActions/__tests__/PageCardActions.test.tsx`
- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PagesColumn/components/PageCard/components/PageCardActions/__tests__/PageCardActions.utils.test.ts`

**Covers:** AC2, AC3

**Context:** It follows `SectionCardActions.test.tsx` and `SectionCardActions.utils.test.ts`.

**Changes:**

1. `PageCardActions.utils.test.ts`: assert that `getPageActionsLabel("Brainstorm")` returns `Page actions for Brainstorm`.

2. `PageCardActions.test.tsx`: the button has the accessible name from the label; opening the menu shows exactly one item, `DELETE_PAGE_MENU_ITEM.label`, with a red color; selecting it calls `onDelete` with the page.

**Verification:** `npx vitest run src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PagesColumn/components/PageCard/components` passes.

---

### Step 9: Test the page card and the prop chain

**File:**
`src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PagesColumn/components/PageCard/__tests__/PageCard.test.tsx`
`src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PagesColumn/components/PageList/__tests__/PageList.test.tsx`
`src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PagesColumn/__tests__/PagesColumn.test.tsx`

**Covers:** AC1, AC4, AC15, AC18

**Changes:**

1. `PageCard.test.tsx`: pass `onDelete` from `setup()` (a `vi.fn()` default). Update the first scenario: the icon is now the first child of the name's parent, not of the card. Replace the "has no button" scenario with one that the card shows exactly one button, the actions button for the page. Add a scenario for AC4: the card is a flex row with `justify-content: space-between`, and the name has `text-overflow: ellipsis`. jsdom has no layout, so the overlap itself is confirmed by the manual check in Phase 1, Step 10.

2. `PageList.test.tsx`: pass `onDeletePage` from `setup()`, and add a scenario that every card has an actions button and that selecting "Delete" on the second card calls `onDeletePage` with that card's page.

3. `PagesColumn.test.tsx`: render `DeletePageModalContainer` in `setup()`, and add scenarios:
   - Deleting the only page of the selected section shows `PAGES_COLUMN_EMPTY_MESSAGE`.
   - After a page is deleted, the selected section is still listed and still selected.

**Verification:** `npx vitest run src/pages/ThreadPage/components/ThreadContent` passes.

---

### Step 10: Test the deletion flow on the thread page

**File:**
`src/pages/ThreadPage/__tests__/ThreadPage.test.tsx`

**Covers:** AC5, AC10, AC11, AC12, AC13, AC14, AC15, AC18, AC23, AC28, AC29, AC30

**Context:** It follows the existing `describe("deleting a section")` block. Pages for these scenarios are built from `sectionPageFixtures[0]` with overridden `id`, `name`, and `sectionId`.

**Changes:**

1. Add a `describe("deleting a page")` block, with a small helper that selects a section, opens a page's delete menu, and confirms, and with these scenarios:
   - With "Brainstorm", "Outline", and "Draft", deleting "Outline" leaves "Brainstorm" and "Draft" in order (`getRenderedPageNames`).
   - With two pages of the same name in one section, deleting one leaves the other.
   - With a "Brainstorm" page in each of two sections, deleting it in the first section leaves it listed when the second section is selected.
   - After deleting and remounting the page, then selecting the same section, the page is not listed.
   - Deleting the only page shows `PAGES_COLUMN_EMPTY_MESSAGE`, and the section is still listed (`getRenderedSectionNames`).
   - When the page was already deleted elsewhere (`seedPages` and `dispatchStorageChange(PAGES_STORAGE_KEY)` after the page loaded), confirming removes the card, closes the dialog, and shows the success notification.

**Verification:** `npx vitest run src/pages/ThreadPage/__tests__/ThreadPage.test.tsx` passes.

---

### Step 11: Test the dashboard card after a page deletion

**File:**
`src/__tests__/App.test.tsx`

**Covers:** AC16, AC17, AC27, AC31, AC32

**Context:** These criteria span two pages, so they belong in `App.test.tsx`, next to the existing `describe("deleting a section")` block, which already moves between the dashboard and a thread and covers the same three cases for sections.

**Changes:**

1. Add a `describe("deleting a page")` block, with a `deletePage` helper next to `deleteSection`, and these scenarios that read `MindThreadCardTestId.pages` and `MindThreadCardTestId.lastUpdated`:
   - Deleting one page of a thread with 3 pages, then returning to the dashboard, shows "2 pages" and `JUST_NOW_TEXT`.
   - When the deletion fails (a `Storage.prototype.setItem` spy that throws during the delete), returning to the dashboard shows the original count and "last updated" value. Restore the spy before navigating.
   - When the page was deleted elsewhere after its thread was opened (update the seeds to the state the other tab left, with the earlier `lastUpdated`, then call `dispatchStorageChange` for the pages and threads keys), confirming and returning to the dashboard shows the count dropped once and the earlier "last updated" value.

**Verification:** `npm run test` passes for the whole project, and `npm run ts:check`, `npm run lint`, and `npm run build` report no errors.
