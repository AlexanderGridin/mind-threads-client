# Delete a section from a thread

**Source:** `implementation-plans/delete-thread-section/delete-thread-section.draft.md`

## Acceptance criteria

Section actions menu

- AC1: Every section card shows an actions menu button.
- AC2: The button of "Research" is announced as "Section actions for Research".
- AC3: The opened menu shows one item, "Delete", in red.
- AC4: A long section name is truncated and does not overlap the actions menu button.

Confirmation dialog

- AC5: Selecting "Delete" opens a dialog titled "Delete section?".
- AC6: The dialog body reads: "Research" and all its pages will be permanently deleted. This can't be undone.
- AC7: The dialog shows "Cancel" and a red "Delete", with keyboard focus on "Cancel".
- AC8: "Cancel", the close button, a click outside, and Escape each close the dialog when no deletion is in progress.
- AC9: After the dialog is dismissed, "Research" is still in the list.

Deleting the section

- AC10: After "Delete" is clicked, "Research" disappears from the list without a page reload.
- AC11: Deleting "Ideas" keeps "Research" and "Archive" in the same order.
- AC12: Deleting one of two sections with the same name keeps the other one.
- AC13: A deleted section is still gone after the page is reloaded.
- AC14: Deleting the only section shows "No sections yet."
- AC15: Deleting one of 3 sections makes the dashboard card show "2 sections".
- AC16: The dashboard card's "last updated" value reflects the time of the deletion.

In progress

- AC17: The "Delete" button shows a loading indicator.
- AC18: "Cancel", "Delete", and the dialog close button are disabled.
- AC19: Escape and a click outside leave the dialog open.

Success

- AC20: The dialog closes.
- AC21: A success notification reads: Section "Research" deleted.

Failure

- AC22: An error notification reads: Couldn't delete the section. Please try again.
- AC23: The dialog stays open with "Cancel" and "Delete" enabled.
- AC24: After the dialog is closed, "Research" is still in the list.
- AC25: The dashboard card's section count and "last updated" value are unchanged.

Section already deleted elsewhere

- AC26: "Research" disappears from the list.
- AC27: The dialog closes.
- AC28: A success notification reads: Section "Research" deleted.
- AC29: The dashboard card's section count does not drop a second time.
- AC30: The dashboard card's "last updated" value still reflects the earlier deletion.

## Style notes

- Sections are deleted by `id`, never by name (AC12) — story requirement.
- Context values are inline objects split into value and action contexts, with no `useMemo` — developer decision from `create-thread-section.feature.md`.
- Single-line `if`s, implicit-return one-liners, and `=== null` checks that exist in the project are not copied; new code follows `typescript.md` rules 8, 9, and 11. Existing code is not rewritten unless a step changes it — developer decision from `create-thread-section.feature.md`.
- Component props types stay in the component file and are not exported, unless a test or another file needs them — `react.md` rule 4 and project convention (`SectionCard.tsx`).
- `useThreadsService` calls `useThreadSectionsService` by relative path, and the sections service never calls the threads service — developer decision from `create-thread-section.feature.md`.
- Test IDs are imported by file path, because the `index.ts` of a component exports only the component — project convention (`ThreadFormModalActions`).
- Formatting is 2 spaces, double quotes, 80 columns — project convention (`.prettierrc.json`).

## Phase 1: Implementation

After Phase 1, `npm run ts:check` reports errors only in test files: those that import the moved delete modal actions, and those that render `SectionCard` or `SectionList` without the new prop. Phase 2 fixes them. `npm run build` type-checks tests too, so it passes only after Phase 2.

---

### Step 1: Add `deleteSection` to the sections service

**File:**
`src/services/useThreadSectionsService/useThreadSectionsService.ts`
`src/services/useThreadSectionsService/useThreadSectionsService.types.ts`

**Covers:** AC10, AC12, AC13, AC26

**Context:** The method returns whether a section was removed, so that the caller can tell "already deleted elsewhere" apart from a real deletion without treating it as an error. It is named `deleteSection` rather than `deleteThreadSection` because the service already has `deleteThreadSections(threadId)`, and a name one letter apart would invite mistakes.

**Changes:**

1. Add to `UseThreadSectionsServiceReturn`:

   ```ts
   deleteSection: (sectionId: string) => Promise<boolean>;
   ```

2. Add the method to the hook, after `deleteThreadSections`, and add it to the returned object:

   ```ts
   const deleteSection = async (sectionId: string): Promise<boolean> => {
     const storedSections = await getSections();

     const remainingSections = storedSections.filter((section) => {
       return section.id !== sectionId;
     });

     if (remainingSections.length === storedSections.length) {
       return false;
     }

     sectionsStorage.set(remainingSections);

     return true;
   };
   ```

**Verification MANUAL:** `npm run ts:check` reports no errors in `src/services/useThreadSectionsService/`.

---

### Step 2: Add `removeThreadSection` to the threads service

**File:**
`src/services/useThreadsService/useThreadsService.ts`
`src/services/useThreadsService/useThreadsService.types.ts`
`src/services/useThreadsService/useThreadsService.utils.ts`

**Covers:** AC10, AC13, AC15, AC16, AC25, AC26, AC29, AC30

**Context:** It mirrors `addThreadSection`, with three deliberate choices. Both storage keys are read and validated before any write, so invalid data fails with nothing changed (AC25). The section is written before the thread, as in `addThreadSection`, and that write only shrinks storage, so the thread write that follows cannot run out of quota. When no section was removed, or the whole thread was deleted elsewhere, the thread is left untouched and the call still succeeds, so the count does not drop twice (AC29, AC30). The tradeoff is that the two writes are not transactional; a rollback would add an API for a failure that is not realistic here. Pages have no storage yet, so `totalPages` does not change.

**Changes:**

1. In `useThreadsService.types.ts`, add to `UseThreadsServiceReturn`:

   ```ts
   removeThreadSection: (params: RemoveThreadSectionParams) => Promise<void>;
   ```

   and add the types:

   ```ts
   export type RemoveThreadSectionParams = {
     threadId: string;
     sectionId: string;
   };

   export type ApplyDeletedSectionParams = {
     thread: MindThread;
     deletedAt: string;
   };
   ```

2. In `useThreadsService.utils.ts`, add after `applyNewSection`:

   ```ts
   export const applyDeletedSection = ({
     thread,
     deletedAt,
   }: ApplyDeletedSectionParams): MindThread => {
     return {
       ...thread,
       totalSections: thread.totalSections - 1,
       lastUpdated: deletedAt,
     };
   };
   ```

3. In `useThreadsService.ts`, add the method after `addThreadSection`, and add it to the returned object:

   ```ts
   const removeThreadSection = async ({
     threadId,
     sectionId,
   }: RemoveThreadSectionParams): Promise<void> => {
     const storedThreads = await getThreads();
     const storedThread = findThread({ threads: storedThreads, threadId });

     const isSectionDeleted =
       await threadSectionsService.deleteSection(sectionId);

     if (!isSectionDeleted || !storedThread) {
       return;
     }

     threadsStorage.set(
       replaceThread({
         threads: storedThreads,
         updatedThread: applyDeletedSection({
           thread: storedThread,
           deletedAt: new Date().toISOString(),
         }),
       })
     );
   };
   ```

**Verification MANUAL:** `npm run ts:check` reports no errors in `src/services/useThreadsService/`.

---

### Step 3: Add `removeSection` to the thread page state

**File:**
`src/pages/ThreadPage/components/ThreadPageLoader/ThreadPageLoader.hooks.ts`

**Covers:** AC10, AC11, AC12, AC14, AC26

**Changes:**

1. In `useThreadState`, add after `addSection`, and add `removeSection` to the returned object:

   ```ts
   const removeSection = async (sectionId: string) => {
     await threadsService.removeThreadSection({ threadId, sectionId });

     setSections((currentSections) => {
       return currentSections.filter((section) => {
         return section.id !== sectionId;
       });
     });
   };
   ```

**Verification MANUAL:** `npm run ts:check` reports no errors in `ThreadPageLoader.hooks.ts`.

---

### Step 4: Add the `useDeleteSection` hook

**File:**
`src/pages/ThreadPage/components/ThreadPageLoader/ThreadPageLoader.hooks.ts`
`src/pages/ThreadPage/components/ThreadPageLoader/ThreadPageLoader.constants.ts`
`src/pages/ThreadPage/components/ThreadPageLoader/ThreadPageLoader.utils.ts`
`src/pages/ThreadPage/components/ThreadPageLoader/ThreadPageLoader.types.ts`

**Covers:** AC5, AC8, AC17, AC20, AC21, AC22, AC23, AC27, AC28

**Context:** It mirrors `useDeleteThread` in `DashboardPageLoader.hooks.ts`. On failure the modal stays open because `closeDeleteSectionModal` runs only after a successful removal, and `finally` re-enables its buttons.

**Changes:**

1. In `ThreadPageLoader.constants.ts`, add:

   ```ts
   export const DELETE_SECTION_ERROR_MESSAGE =
     "Couldn't delete the section. Please try again.";
   ```

2. In `ThreadPageLoader.utils.ts`, add:

   ```ts
   export const getSectionDeletedMessage = (sectionName: string) => {
     return `Section "${sectionName}" deleted.`;
   };
   ```

3. In `ThreadPageLoader.types.ts`, add:

   ```ts
   export type UseDeleteSectionParams = {
     removeSection: (sectionId: string) => Promise<void>;
   };
   ```

4. In `ThreadPageLoader.hooks.ts`, add after `useAddSection`:

   ```ts
   export const useDeleteSection = ({
     removeSection,
   }: UseDeleteSectionParams) => {
     const [sectionToDelete, setSectionToDelete] =
       useState<ThreadSection | null>(null);

     const [isDeletingSection, setIsDeletingSection] = useState(false);

     const openDeleteSectionModal = (section: ThreadSection) => {
       setSectionToDelete(section);
     };

     const closeDeleteSectionModal = () => {
       setSectionToDelete(null);
     };

     const confirmDeleteSection = async () => {
       if (!sectionToDelete) {
         return;
       }

       setIsDeletingSection(true);

       try {
         await removeSection(sectionToDelete.id);

         closeDeleteSectionModal();
         notify.success(getSectionDeletedMessage(sectionToDelete.name));
       } catch {
         notify.error(DELETE_SECTION_ERROR_MESSAGE);
       } finally {
         setIsDeletingSection(false);
       }
     };

     return {
       sectionToDelete,
       isDeletingSection,
       openDeleteSectionModal,
       closeDeleteSectionModal,
       confirmDeleteSection,
     };
   };
   ```

**Verification MANUAL:** `npm run ts:check` reports no errors in `src/pages/ThreadPage/components/ThreadPageLoader/`.

---

### Step 5: Expose section deletion through the thread page contexts

**File:**
`src/pages/ThreadPage/components/ThreadPageLoader/ThreadPageLoader.tsx`
`src/pages/ThreadPage/components/ThreadPageLoader/ThreadPageLoader.types.ts`

**Covers:** AC5, AC10

**Changes:**

1. Add to `ThreadPageValue`:

   ```ts
   sectionToDelete: ThreadSection | null;
   isDeletingSection: boolean;
   ```

2. Add to `ThreadPageAction`:

   ```ts
   openDeleteSectionModal: (section: ThreadSection) => void;
   closeDeleteSectionModal: () => void;
   confirmDeleteSection: () => Promise<void>;
   ```

3. In `ThreadPageLoader.tsx`, take `removeSection` from `useThreadState`, call `useDeleteSection({ removeSection })`, and add its two state values to the value context and its three functions to the action context.

**Verification MANUAL:** `npm run ts:check` reports no errors in `src/pages/ThreadPage/components/ThreadPageLoader/`.

---

### Step 6: Create the shared `DeleteConfirmationModal`

**New files:**

- `src/components/shared/DeleteConfirmationModal/DeleteConfirmationModal.tsx`
- `src/components/shared/DeleteConfirmationModal/index.ts`
- `src/components/shared/DeleteConfirmationModal/components/index.ts`
- `src/components/shared/DeleteConfirmationModal/components/DeleteConfirmationModalActions/DeleteConfirmationModalActions.tsx`
- `src/components/shared/DeleteConfirmationModal/components/DeleteConfirmationModalActions/DeleteConfirmationModalActions.constants.ts`
- `src/components/shared/DeleteConfirmationModal/components/DeleteConfirmationModalActions/DeleteConfirmationModalActions.types.ts`
- `src/components/shared/DeleteConfirmationModal/components/DeleteConfirmationModalActions/index.ts`

**File:**
`src/components/shared/index.ts`

**Covers:** AC7, AC8, AC17, AC18, AC19, AC23

**Context:** `DeleteThreadModal` and the new section dialog differ only in title and text, so a copy would break `typescript.md` rule 4. The project has already promoted a modal part this way (`ThreadFormModalActions`). The tradeoff is touching the shipped dashboard code in Step 7, and the import paths of its tests in Phase 2.

**Changes:**

1. Create `DeleteConfirmationModalActions` with the same markup, props, and behavior as `DeleteThreadModalActions`, with `DeleteThreadModalActions` renamed to `DeleteConfirmationModalActions` everywhere. Its test ID creator prefix becomes `"DeleteConfirmationModalActions__"`. Its `index.ts` exports only the component, and `components/index.ts` re-exports that folder.

2. Create `DeleteConfirmationModal.tsx`:

   ```tsx
   import { useRef } from "react";
   import { Dialog, Text } from "@/components/lib";
   import { DeleteConfirmationModalActions } from "./components";

   type DeleteConfirmationModalProps = {
     title: string;
     message: string;
     isDeleting: boolean;
     onClose: () => void;
     onDelete: () => void;
   };

   export const DeleteConfirmationModal = ({
     title,
     message,
     isDeleting,
     onClose,
     onDelete,
   }: DeleteConfirmationModalProps) => {
     const cancelButtonRef = useRef<HTMLButtonElement>(null);

     return (
       <Dialog
         open
         title={title}
         closeDisabled={isDeleting}
         initialFocusRef={cancelButtonRef}
         onClose={onClose}
         content={<Text>{message}</Text>}
         actions={
           <DeleteConfirmationModalActions
             isDeleting={isDeleting}
             cancelButtonRef={cancelButtonRef}
             onDelete={onDelete}
             onCancel={onClose}
           />
         }
       />
     );
   };
   ```

3. Create `index.ts` with `export * from "./DeleteConfirmationModal";`.

4. Add `export * from "./DeleteConfirmationModal";` to `src/components/shared/index.ts`.

**Verification MANUAL:** `npm run ts:check` reports no errors in `src/components/shared/`.

---

### Step 7: Switch `DeleteThreadModal` to the shared modal

**File:**
`src/pages/DashboardPage/components/DeleteThreadModalContainer/components/DeleteThreadModal/DeleteThreadModal.tsx`

**Removed files:** the production files of `src/pages/DashboardPage/components/DeleteThreadModalContainer/components/DeleteThreadModal/components/`: `index.ts`, and `DeleteThreadModalActions/DeleteThreadModalActions.tsx`, `.constants.ts`, `.types.ts`, and `index.ts`. Leave `DeleteThreadModalActions/__tests__/` for Phase 2, Step 7.

**Changes:**

1. Replace the body of `DeleteThreadModal`, and remove the imports it no longer needs (`useRef`, `Dialog`, `Text`, `DeleteThreadModalActions`):

   ```tsx
   return (
     <DeleteConfirmationModal
       title={DELETE_THREAD_MODAL_TITLE}
       message={getDeleteThreadModalText(threadTitle)}
       isDeleting={isDeleting}
       onClose={onClose}
       onDelete={onDelete}
     />
   );
   ```

2. Import `DeleteConfirmationModal` from `@/components/shared`.

**Verification MANUAL:** On the dashboard, deleting a thread still shows the same dialog, focuses "Cancel", and deletes the thread.

---

### Step 8: Create `DeleteSectionModalContainer`

**New files:**

- `src/pages/ThreadPage/components/DeleteSectionModalContainer/DeleteSectionModalContainer.tsx`
- `src/pages/ThreadPage/components/DeleteSectionModalContainer/DeleteSectionModalContainer.constants.ts`
- `src/pages/ThreadPage/components/DeleteSectionModalContainer/DeleteSectionModalContainer.utils.ts`
- `src/pages/ThreadPage/components/DeleteSectionModalContainer/index.ts`

**File:**
`src/pages/ThreadPage/components/index.ts`

**Covers:** AC5, AC6, AC7, AC8

**Changes:**

1. In `DeleteSectionModalContainer.constants.ts`:

   ```ts
   export const DELETE_SECTION_MODAL_TITLE = "Delete section?";
   ```

2. In `DeleteSectionModalContainer.utils.ts`:

   ```ts
   export const getDeleteSectionModalText = (sectionName: string) => {
     return `"${sectionName}" and all its pages will be permanently deleted. This can't be undone.`;
   };
   ```

3. In `DeleteSectionModalContainer.tsx`:

   ```tsx
   import { DeleteConfirmationModal } from "@/components/shared";
   import { useThreadPageAction, useThreadPageValue } from "../ThreadPageLoader";
   import { DELETE_SECTION_MODAL_TITLE } from "./DeleteSectionModalContainer.constants";
   import { getDeleteSectionModalText } from "./DeleteSectionModalContainer.utils";

   export const DeleteSectionModalContainer = () => {
     const { sectionToDelete, isDeletingSection } = useThreadPageValue();
     const { closeDeleteSectionModal, confirmDeleteSection } =
       useThreadPageAction();

     return sectionToDelete ? (
       <DeleteConfirmationModal
         title={DELETE_SECTION_MODAL_TITLE}
         message={getDeleteSectionModalText(sectionToDelete.name)}
         isDeleting={isDeletingSection}
         onClose={closeDeleteSectionModal}
         onDelete={confirmDeleteSection}
       />
     ) : null;
   };
   ```

4. Create `index.ts` with `export * from "./DeleteSectionModalContainer";`, and add `export * from "./DeleteSectionModalContainer";` to `src/pages/ThreadPage/components/index.ts`.

**Verification MANUAL:** `npm run ts:check` reports no errors in `DeleteSectionModalContainer/`.

---

### Step 9: Register the modal on the thread page

**File:**
`src/pages/ThreadPage/ThreadPage.tsx`

**Covers:** AC5

**Changes:**

1. Import `DeleteSectionModalContainer` from `./components`, and render it inside `ThreadPageLoader`, after `<AddSectionModalContainer />`.

**Verification MANUAL:** The thread page renders as before, with no dialog open and no console errors.

---

### Step 10: Create `SectionCardActions`

**New files:**

- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/SectionsColumn/components/SectionCard/components/index.ts`
- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/SectionsColumn/components/SectionCard/components/SectionCardActions/SectionCardActions.tsx`
- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/SectionsColumn/components/SectionCard/components/SectionCardActions/SectionCardActions.constants.ts`
- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/SectionsColumn/components/SectionCard/components/SectionCardActions/SectionCardActions.utils.ts`
- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/SectionsColumn/components/SectionCard/components/SectionCardActions/index.ts`

**Covers:** AC1, AC2, AC3

**Context:** It follows `MindThreadCard/components/CardActions.tsx`, using the same `Menu` adapter and icon.

**Changes:**

1. In `SectionCardActions.constants.ts`:

   ```ts
   import { initTestIdCreator } from "@/components/lib/utils";

   const createTestId = initTestIdCreator("SectionCardActions__");

   export const SectionCardActionsTestId = {
     menu: createTestId("menu"),
   } as const;

   export const DELETE_SECTION_MENU_ITEM = {
     value: "delete",
     label: "Delete",
   } as const;
   ```

2. In `SectionCardActions.utils.ts`:

   ```ts
   export const getSectionActionsLabel = (sectionName: string) => {
     return `Section actions for ${sectionName}`;
   };
   ```

3. In `SectionCardActions.tsx`:

   ```tsx
   import { LuEllipsisVertical } from "react-icons/lu";
   import { Menu, type MenuItem } from "@/components/lib";
   import type { ThreadSection } from "@/types";
   import {
     DELETE_SECTION_MENU_ITEM,
     SectionCardActionsTestId,
   } from "./SectionCardActions.constants";
   import { getSectionActionsLabel } from "./SectionCardActions.utils";

   type SectionCardActionsProps = {
     section: ThreadSection;
     onDelete: (section: ThreadSection) => void;
   };

   export const SectionCardActions = ({
     section,
     onDelete,
   }: SectionCardActionsProps) => {
     const handleDelete = () => {
       onDelete(section);
     };

     const menuItems: MenuItem[] = [
       { ...DELETE_SECTION_MENU_ITEM, color: "red", onSelect: handleDelete },
     ];

     return (
       <Menu
         triggerLabel={getSectionActionsLabel(section.name)}
         triggerIcon={<LuEllipsisVertical />}
         data-testid={SectionCardActionsTestId.menu}
         items={menuItems}
       />
     );
   };
   ```

4. Create `SectionCardActions/index.ts` with `export * from "./SectionCardActions";`, and `components/index.ts` with `export * from "./SectionCardActions";`.

**Verification MANUAL:** `npm run ts:check` reports no errors in `SectionCardActions/`.

---

### Step 11: Show the actions on the card and pass the delete handler to it

**File:**
`src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/SectionsColumn/components/SectionCard/SectionCard.tsx`
`src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/SectionsColumn/components/SectionList/SectionList.tsx`
`src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/SectionsColumn/SectionsColumn.tsx`

**Covers:** AC1, AC4, AC5, AC14

**Context:** These files change together because the new required prop must reach `SectionCard` for the code to compile. `SectionsColumn` stays the only connected component, the same way `MindThreadList` receives handlers on the dashboard. The card uses a flex row rather than the dashboard's absolute positioning: `TruncatedText` has `overflow: hidden`, so it shrinks and truncates beside the button and cannot overlap it (AC4). The reduced padding offsets the height of the button, so the card height stays about the same.

**Changes:**

1. In `SectionCard.tsx`, add `onDelete: (section: ThreadSection) => void;` to the props. Import `SectionCardActions` from `./components`. Replace `p="3"` on the outer `Box` with the flex row, and render the actions after the name:

   ```tsx
   <Box
     ref={cardRef}
     data-testid={SectionCardTestId.container}
     display="flex"
     alignItems="center"
     justifyContent="space-between"
     gap="2"
     py="2"
     pl="3"
     pr="1"
     minWidth="0"
     borderRadius="md"
     borderWidth="1px"
     borderColor="border"
     borderLeftWidth="4px"
     borderLeftColor={section.color}
     backgroundColor="bg"
   >
     <TruncatedText data-testid={SectionCardTestId.name} fontWeight="medium">
       {section.name}
     </TruncatedText>

     <SectionCardActions section={section} onDelete={onDelete} />
   </Box>
   ```

2. In `SectionList.tsx`, add `onDeleteSection: (section: ThreadSection) => void;` to the props, and pass `onDelete={onDeleteSection}` to `SectionCard`.

3. In `SectionsColumn.tsx`, take `openDeleteSectionModal` from `useThreadPageAction()`, and pass `onDeleteSection={openDeleteSectionModal}` to `SectionList`.

**Verification MANUAL:** On a thread page, run through the whole flow in the browser: a long section name truncates beside the menu button; the menu shows a red "Delete"; the dialog text and "Cancel" focus are correct; deleting removes the card and shows the notification; after a reload the section is still gone; and the dashboard card shows the lower count and "Updated: just now". Then open the same thread in two tabs, delete a section in one, and confirm that deleting it in the other also succeeds and the count drops only once.

---

## Phase 2: Unit tests

Every test file follows `unit-tests.md`: a root `describe()`, a `setup()` or `setupHook()` function, `vi.clearAllMocks()` before each test, elements stored in constants before they are asserted on or passed to a user event, and `toStrictEqual()` for reference types.

---

### Step 1: Test `deleteSection` and add the storage change helper

**File:**
`src/__test-fixtures__/storage/storage.ts`
`src/services/useThreadSectionsService/__tests__/useThreadSectionsService.test.ts`

**Covers:** AC10, AC12, AC13, AC26

**Context:** `useLocalStorage` caches per hook instance and drops the cache only on a `storage` event, so a test that changes storage "from another tab" has to dispatch that event. The helper is shared because Steps 3, 11, and 12 need it too (`unit-tests.md` rule 5).

**Changes:**

1. Add to `src/__test-fixtures__/storage/storage.ts`:

   ```ts
   export const dispatchStorageChange = (key: string) => {
     window.dispatchEvent(new StorageEvent("storage", { key }));
   };
   ```

2. Add a `describe("deleteSection")` block with these scenarios:
   - It removes only the section with the given `id`, resolves `true`, and persists the rest in order.
   - With two sections that have the same name, it removes only the targeted one.
   - For an unknown `id` it resolves `false` and does not call `localStorage.setItem`.
   - After another tab removed the section (`seedSections` and `dispatchStorageChange(SECTIONS_STORAGE_KEY)`), it resolves `false`.
   - It rejects when the stored data is invalid, and nothing is written.

**Verification:** `npx vitest run src/services/useThreadSectionsService` passes.

---

### Step 2: Test `applyDeletedSection`

**File:**
`src/services/useThreadsService/__tests__/useThreadsService.utils.test.ts`

**Covers:** AC15, AC16

**Changes:**

1. Add scenarios: it decrements `totalSections`, sets `lastUpdated` to `deletedAt`, keeps every other field, and does not mutate the input thread.

**Verification:** `npx vitest run src/services/useThreadsService/__tests__/useThreadsService.utils.test.ts` passes.

---

### Step 3: Test `removeThreadSection`

**File:**
`src/services/useThreadsService/__tests__/useThreadsService.test.ts`

**Covers:** AC13, AC15, AC16, AC25, AC29, AC30

**Changes:**

1. Add a `describe("removeThreadSection")` block with these scenarios, using `seedThreads`, `seedSections`, and fake or asserted time for `lastUpdated`:
   - It removes the section, drops `totalSections` by one, sets `lastUpdated` to the deletion time, and leaves other threads unchanged.
   - When the section was already deleted elsewhere (use `dispatchStorageChange`), it resolves and leaves the stored thread strictly equal to what was there, so count and `lastUpdated` do not change.
   - When the whole thread was deleted elsewhere, along with its sections, it resolves and writes nothing.
   - When the `localStorage` write fails (a `Storage.prototype.setItem` spy that throws), it rejects, and sections and threads are unchanged.
   - When the stored threads data is invalid, it rejects and the section is not removed.

**Verification:** `npx vitest run src/services/useThreadsService/__tests__/useThreadsService.test.ts` passes.

---

### Step 4: Test the section deleted message

**File:**
`src/pages/ThreadPage/components/ThreadPageLoader/__tests__/ThreadPageLoader.utils.test.ts`

**Covers:** AC21, AC28

**Changes:**

1. Add a test that `getSectionDeletedMessage("Research")` returns `Section "Research" deleted.`

**Verification:** `npx vitest run src/pages/ThreadPage/components/ThreadPageLoader/__tests__/ThreadPageLoader.utils.test.ts` passes.

---

### Step 5: Test the thread page hooks and extend the service overrides

**File:**
`src/__test-fixtures__/threads/threadsService.ts`
`src/pages/ThreadPage/components/ThreadPageLoader/__tests__/ThreadPageLoader.hooks.test.tsx`

**Covers:** AC10, AC11, AC12, AC14, AC17, AC20, AC21, AC22, AC23, AC26, AC27, AC28

**Changes:**

1. In `threadsService.ts`, add `removeThreadSection` to the `Pick` in `ThreadsServiceOverrides`, to `resetThreadsServiceOverrides`, and to `createServicesMock`, following the shape of `addThreadSection`.

2. Add `useThreadState` scenarios for `removeSection`: it removes only the targeted section by `id` and keeps the order of the rest; the only section leaves an empty list; when the service rejects, the sections are unchanged and the call rejects.

3. Add a `setupDeleteSection` helper following `setupAddSection`, with these `useDeleteSection` scenarios:
   - `openDeleteSectionModal` sets `sectionToDelete`, and `closeDeleteSectionModal` clears it.
   - `confirmDeleteSection` does nothing when no section is selected.
   - `isDeletingSection` is `true` while `removeSection` is pending (control it with `createDeferred`).
   - On success, `sectionToDelete` is cleared, `isDeletingSection` is `false`, and the success notification appears with `getSectionDeletedMessage`.
   - On failure, `sectionToDelete` is kept, `isDeletingSection` is `false`, and the notification reads `DELETE_SECTION_ERROR_MESSAGE`.

**Verification:** `npx vitest run src/pages/ThreadPage/components/ThreadPageLoader` passes.

---

### Step 6: Test `DeleteConfirmationModal`

**New files:**

- `src/components/shared/DeleteConfirmationModal/__tests__/DeleteConfirmationModal.test.tsx`

**Covers:** AC7, AC8, AC17, AC18, AC19, AC23

**Context:** The Escape and outside-click scenarios use `waitForDismissListeners`, `clickOutside`, and a `pointerEventsCheck` `setup` option, as in `DeleteThreadModalContainer.test.tsx`.

**Changes:**

1. Render the modal with `renderWithUIProvider` and cover these scenarios:
   - It shows the given `title` and `message`.
   - "Cancel" has keyboard focus when the modal opens. Use `stubLayout`, as `DeleteThreadModal.test.tsx` does.
   - `onClose` is called by "Cancel", the close button, a click outside, and Escape when `isDeleting` is `false`.
   - `onDelete` is called by "Delete".
   - With `isDeleting`, the close button, "Cancel", and "Delete" are disabled, "Delete" shows a loading indicator, and Escape and a click outside do not call `onClose`.

**Verification:** `npx vitest run src/components/shared/DeleteConfirmationModal/__tests__/DeleteConfirmationModal.test.tsx` passes.

---

### Step 7: Move the delete actions test to the shared component

**New files:**

- `src/components/shared/DeleteConfirmationModal/components/DeleteConfirmationModalActions/__tests__/DeleteConfirmationModalActions.test.tsx`

**File:**
`src/pages/DashboardPage/components/DeleteThreadModalContainer/components/DeleteThreadModal/components/DeleteThreadModalActions/__tests__/DeleteThreadModalActions.test.tsx` (moved with `git mv`, so the folder is removed)

**Covers:** AC7, AC17, AC18

**Changes:**

1. Move the test file to the new path, and rename `DeleteThreadModalActions` to `DeleteConfirmationModalActions` throughout it, including its imports and `describe()` name. The scenarios do not change.

**Verification:** `npx vitest run src/components/shared/DeleteConfirmationModal` passes.

---

### Step 8: Update the dashboard tests to the shared test IDs

**File:**
`src/pages/DashboardPage/components/DeleteThreadModalContainer/components/DeleteThreadModal/__tests__/DeleteThreadModal.test.tsx`
`src/pages/DashboardPage/components/DeleteThreadModalContainer/__tests__/DeleteThreadModalContainer.test.tsx`
`src/pages/DashboardPage/__tests__/DashboardPage.test.tsx`
`src/__tests__/App.test.tsx`

**Changes:**

1. In each file, replace the import of `DeleteThreadModalActionsTestId` with an import of `DeleteConfirmationModalActionsTestId` from `@/components/shared/DeleteConfirmationModal/components/DeleteConfirmationModalActions/DeleteConfirmationModalActions.constants`, and rename the usages. The scenarios do not change, and they prove that the dashboard behaves as before.

**Verification:** `npx vitest run src/pages/DashboardPage src/__tests__/App.test.tsx` passes.

---

### Step 9: Test `DeleteSectionModalContainer`

**New files:**

- `src/pages/ThreadPage/components/DeleteSectionModalContainer/__tests__/DeleteSectionModalContainer.utils.test.ts`
- `src/pages/ThreadPage/components/DeleteSectionModalContainer/__tests__/DeleteSectionModalContainer.test.tsx`

**Covers:** AC5, AC6, AC8, AC9, AC17, AC18, AC19, AC20, AC21, AC22, AC23, AC24

**Context:** It follows `DeleteThreadModalContainer.test.tsx`, except that it renders the real `SectionsColumn` inside `ThreadPageLoader`, as `SectionsColumn.test.tsx` does, and mocks `@/services` once with `createServicesMock`.

**Changes:**

1. In the utils test, assert the exact text of `getDeleteSectionModalText("Research")`.

2. In the component test, cover these scenarios:
   - No dialog is shown until "Delete" is selected in a card's menu.
   - The dialog shows the title and the text with the section's name.
   - Each of the four dismissals closes the dialog, and the section stays in the list and in storage.
   - While `threadsServiceOverrides.removeThreadSection` is pending (`createDeferred`), the buttons are disabled, "Delete" shows a loading indicator, and Escape and a click outside leave the dialog open.
   - After success, the dialog closes and the success notification appears.
   - After failure, the error notification appears and the dialog stays open with both buttons enabled. Then, after the dialog is closed, the section is still listed.

**Verification:** `npx vitest run src/pages/ThreadPage/components/DeleteSectionModalContainer` passes.

---

### Step 10: Test the section card actions and the prop chain

**New files:**

- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/SectionsColumn/components/SectionCard/components/SectionCardActions/__tests__/SectionCardActions.test.tsx`
- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/SectionsColumn/components/SectionCard/components/SectionCardActions/__tests__/SectionCardActions.utils.test.ts`

**File:**
`src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/SectionsColumn/components/SectionCard/__tests__/SectionCard.test.tsx`
`src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/SectionsColumn/components/SectionList/__tests__/SectionList.test.tsx`
`src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/SectionsColumn/__tests__/SectionsColumn.test.tsx`

**Covers:** AC1, AC2, AC3, AC4, AC14

**Changes:**

1. `SectionCardActions.utils.test.ts`: assert that `getSectionActionsLabel("Research")` returns `Section actions for Research`.

2. `SectionCardActions.test.tsx`: the button has the accessible name from the label; opening the menu shows exactly one item, "Delete", with a red color; selecting it calls `onDelete` with the section.

3. `SectionCard.test.tsx`: pass `onDelete` from `setup()` (a `vi.fn()` default). Add scenarios: the card shows the actions button; for AC4, the card is a flex row and the name has `text-overflow: ellipsis` (jsdom has no layout, so the overlap itself is confirmed by the manual check in Phase 1, Step 11).

4. `SectionList.test.tsx`: pass `onDeleteSection` from `setup()`, and add a scenario that every card has an actions button and that selecting "Delete" calls `onDeleteSection` with that card's section.

5. `SectionsColumn.test.tsx`: add a scenario that deleting the only section shows `SECTIONS_COLUMN_MESSAGE`. Render `DeleteSectionModalContainer` in `setup()`.

**Verification:** `npx vitest run src/pages/ThreadPage/components/ThreadContent` passes.

---

### Step 11: Test the deletion flow on the thread page

**File:**
`src/pages/ThreadPage/__tests__/ThreadPage.test.tsx`

**Covers:** AC5, AC10, AC11, AC12, AC13, AC14, AC21, AC26, AC27, AC28

**Changes:**

1. Add a `describe("deleting a section")` block with small helpers for opening a card's menu and confirming the deletion, and with these scenarios:
   - With "Research", "Ideas", and "Archive", deleting "Ideas" leaves "Research" and "Archive" in order (`getRenderedSectionNames`).
   - With two sections of the same name, deleting one leaves the other.
   - After deleting and remounting the page, the section is not listed.
   - Deleting the only section shows `SECTIONS_COLUMN_MESSAGE`.
   - When the section was already deleted elsewhere (`seedSections` and `dispatchStorageChange(SECTIONS_STORAGE_KEY)` after the page loaded), confirming removes the card, closes the dialog, and shows the success notification.

**Verification:** `npx vitest run src/pages/ThreadPage/__tests__/ThreadPage.test.tsx` passes.

---

### Step 12: Test the dashboard card after a deletion

**File:**
`src/__tests__/App.test.tsx`

**Covers:** AC15, AC16, AC25, AC29, AC30

**Context:** These criteria span two pages, so they belong in the existing `describe("creating and deleting sections")` block, which already navigates between the dashboard and a thread.

**Changes:**

1. Add a `deleteSection` helper next to `addSection`, and add these scenarios:
   - Deleting one of 3 sections, then returning to the dashboard, shows "2 sections" and `JUST_NOW_TEXT`.
   - When the deletion fails (a `Storage.prototype.setItem` spy that throws during the delete), returning to the dashboard shows the original count and "last updated" value. Restore the spy before navigating.
   - When the section was deleted elsewhere after its thread was opened (update the seeds to the state the other tab left, with the earlier `lastUpdated`, then call `dispatchStorageChange` for both storage keys), confirming and returning to the dashboard shows the count dropped once and the earlier "last updated" value.

**Verification:** `npm run test` passes for the whole project, and `npm run ts:check` and `npm run build` report no errors.

---

## Phase 3: Documentation

---

### Step 1: Update `CLAUDE.md`

**File:**
`CLAUDE.md`

**Covers:** AC10, AC15, AC29

**Changes:**

1. In the `src/services/` bullet, list `addThreadSection` and `removeThreadSection` among the methods `useThreadsService` exposes, and add that `removeThreadSection` leaves the thread untouched when the section was already deleted elsewhere.

2. In the `src/components/shared/` bullet, add `DeleteConfirmationModal`, used by the delete thread and delete section dialogs, to the examples.

**Verification MANUAL:** Both bullets in `CLAUDE.md` match the methods in `useThreadsService.ts` and the contents of `src/components/shared/`.
