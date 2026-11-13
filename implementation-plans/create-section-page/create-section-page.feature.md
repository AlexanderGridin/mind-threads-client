# Create a page in a thread section

**Source:** `implementation-plans/create-section-page/create-section-page.draft.md`

## Acceptance criteria

Selecting a section

- AC1: On page load, no section is selected.
- AC2: Clicking a section card selects that section.
- AC3: A selected card's background is filled with the section's color.
- AC4: On a selected card, the name and the actions menu button are readable on both light and dark section colors.
- AC5: Clicking another card selects it and returns the first card to its unselected look.
- AC6: Clicking the selected card again keeps it selected.
- AC7: Opening a section's actions menu does not change the selection.
- AC8: After a reload, no section is selected.
- AC9: Creating a new section does not change the selection.
- AC10: Deleting the selected section clears the selection, and the Pages column shows "Select a section to see its pages."
- AC11: Deleting a different section does not change the selection.

The Pages column

- AC12: With no section selected, the Pages column shows "Select a section to see its pages."
- AC13: With no section selected, there is no "Add page" button.
- AC14: With a section selected, an "Add page" button is shown next to the "Pages" heading.
- AC15: A selected section with no pages shows "No pages yet."
- AC16: Only the selected section's pages are listed.
- AC17: Pages are listed in creation order, oldest first.
- AC18: A page list taller than the column scrolls within the column.

Opening the form

- AC19: "Add page" opens an "Add new page" modal with a required name field, a "Page type" dropdown, a color picker, and Add and Cancel buttons.
- AC20: The name field has focus when the modal opens.
- AC21: The form opens with an empty name, the "Chat" type, and the same default color as "Add new section".
- AC22: The color picker offers the same colors as "Add new section".
- AC23: "Chat" is the only page type option.
- AC24: The "Chat" option shows a chat icon to the left of its label.
- AC25: Cancel closes the modal without creating a page.
- AC26: Reopening after Cancel shows an empty name, "Chat", and the default color.

Name rules

- AC27: Add is disabled for an empty name.
- AC28: Add is disabled for a name with only spaces.
- AC29: "  Ideas  " is saved as "Ideas".
- AC30: Enter with a valid name saves the page.
- AC31: Enter with an empty or spaces-only name creates nothing and keeps the modal open.
- AC32: Two pages with the same name in one section are both kept.

Creating a page

- AC33: Add with valid input closes the modal.
- AC34: The new page appears as the last card in the Pages list.
- AC35: A page card shows the page name, with the page color as its left border.
- AC36: A "Chat" page card shows a chat icon to the left of the name.
- AC37: After the first page is created, "No pages yet." is no longer shown.
- AC38: The new card is scrolled into view in a long list.
- AC39: Clicking a page card does nothing; the Content column still shows "Select a page to see its content."
- AC40: A page card has no actions menu.

Long names

- AC41: A long page name stays on one line and ends with an ellipsis.
- AC42: Hovering a cut-off name shows a tooltip with the full name.
- AC43: Hovering a name that fits shows no tooltip.

Saved data and the dashboard

- AC44: After a reload and selecting the section, the page is listed with its name, chat icon, and color.
- AC45: A page is not listed under another section of the same thread.
- AC46: A page is not listed in any section of another thread.
- AC47: A thread's first page shows "1 page" on its dashboard card.
- AC48: Two pages, in one section or in different sections, show "2 pages".
- AC49: Creating a page sets the thread's "last updated" time to the moment of creation.
- AC50: Deleting a section that holds 2 of the thread's 3 pages leaves the card showing "1 page".
- AC51: A new section with the name of a deleted section has no pages.
- AC52: Deleting a thread deletes its pages.

Error handling and user feedback

- AC53: A successful save shows `Page "Ideas" created.`
- AC54: A failed save shows "Couldn't save the page. Please try again."
- AC55: After a failed save, the modal stays open with the entered name, type, and color, and Add can be clicked again.
- AC56: The Add button shows a loading state while saving.
- AC57: The name field, type dropdown, and color picker are disabled while saving.
- AC58: Pressing Enter while saving creates no second page.
- AC59: Esc, an outside click, ×, and Cancel do not close the modal while saving.
- AC60: If the section was deleted in another tab, Add shows the error notification and the modal stays open.
- AC61: If the thread was deleted in another tab, Add shows the error notification and the modal stays open.

## Style notes

- New hooks go into the existing `ThreadPageLoader.hooks.ts`; it is not split into a `hooks/` folder in this story — developer decision.
- Pages are stored under their own `pages` key by a new `useSectionPagesService`. `useThreadsService` calls it by relative path, the same way it calls `useThreadSectionsService`, and the pages and sections services never call each other or the threads service — follows the developer decision from `create-thread-section.feature.md`.
- The page entity is named `SectionPage` in code, so it is not confused with route pages in `src/pages/` — architect decision.
- Context values are inline objects split into value and action contexts, with no `useMemo` (React Compiler) — developer decision from `create-thread-section.feature.md`.
- Single-line `if`s, implicit-return one-liners, and `=== null` checks that exist in the project are not copied; new code follows `typescript.md` rules 8, 9, and 11. Existing code is not rewritten unless a step changes it — developer decision from `create-thread-section.feature.md`.
- Component props types stay in the component file and are not exported, unless a test or another file needs them — `react.md` rule 4 and project convention (`SectionCard.tsx`).
- Test IDs are imported by file path, because the `index.ts` of a component exports only the component — project convention (`ThreadFormModalActions`).
- Conditional rendering uses ternaries, never `&&` — `CLAUDE.md`.
- Formatting is 2 spaces, double quotes, 80 columns — project convention (`.prettierrc.json`).

## Phase 1: Implementation

After Phase 1, `npm run ts:check` reports errors only in test files: the `ThreadHeaderColorScope` test (its component moves in Step 13), the `applyDeletedSection` tests (new parameter in Step 3), and the tests that render `SectionCard` or `SectionList` without the new props (Step 15). Phase 2 fixes them. `npm run build` type-checks the tests too, so it passes only after Phase 2.

---

### Step 1: Add the `SectionPage` types

**New files:**

- `src/types/SectionPage.ts`

**File:**
`src/types/index.ts`

**Covers:** AC19, AC23, AC35, AC36, AC44

**Context:** A page stores `threadId` as well as `sectionId`, so a thread's pages can be loaded and deleted with one filter (AC46, AC52), without a lookup through sections. `type` is a string union with one member today, so more page types can be added later without changing the stored shape.

**Changes:**

1. Create `src/types/SectionPage.ts`, mirroring `src/types/ThreadSection.ts`:

   ```ts
   export type SectionPageType = "chat";

   export type SectionPage = {
     id: string;
     threadId: string;
     sectionId: string;
     name: string;
     type: SectionPageType;
     color: string;
     createdAt: string;
   };

   export type SectionPageValue = Pick<SectionPage, "name" | "type" | "color">;

   export type NewSectionPage = Pick<
     SectionPage,
     "threadId" | "sectionId" | "name" | "type" | "color"
   >;
   ```

2. Add `export * from "./SectionPage";` to `src/types/index.ts`.

**Verification MANUAL:** `npm run ts:check` reports no errors in `src/types/`.

---

### Step 2: Create `useSectionPagesService`

**New files:**

- `src/services/useSectionPagesService/useSectionPagesService.ts`
- `src/services/useSectionPagesService/useSectionPagesService.types.ts`
- `src/services/useSectionPagesService/useSectionPagesService.constants.ts`
- `src/services/useSectionPagesService/useSectionPagesService.utils.ts`
- `src/services/useSectionPagesService/index.ts`

**File:**
`src/services/index.ts`

**Covers:** AC17, AC29, AC32, AC44, AC45, AC46, AC50, AC52

**Context:** It follows `src/services/useThreadSectionsService/` file for file, so the two storage services read the same way. `deleteSectionPages` returns how many pages it removed, so that the threads service can lower `totalPages` by that number (AC50).

**Changes:**

1. `useSectionPagesService.constants.ts`:

   ```ts
   export const PAGES_STORAGE_KEY = "pages";
   export const INVALID_PAGES_DATA_ERROR = "Stored pages data is invalid";
   ```

2. `useSectionPagesService.types.ts`:

   ```ts
   import type { NewSectionPage, SectionPage } from "@/types";

   export type UseSectionPagesServiceReturn = {
     getThreadPages: (threadId: string) => Promise<SectionPage[]>;
     createSectionPage: (newPage: NewSectionPage) => Promise<SectionPage>;
     deleteSectionPages: (sectionId: string) => Promise<number>;
     deleteThreadPages: (threadId: string) => Promise<void>;
   };
   ```

3. `useSectionPagesService.utils.ts`: add `buildPage` and `isSectionPageList`, the same way as `buildSection` and `isThreadSectionList` in `useThreadSectionsService.utils.ts`. `buildPage` trims the name (AC29) and sets `id: crypto.randomUUID()` and `createdAt: new Date().toISOString()`. The private `isSectionPage` guard checks that `id`, `threadId`, `sectionId`, `name`, `type`, `color`, and `createdAt` are all strings.

4. `useSectionPagesService.ts`: use the shape of `useThreadSectionsService.ts`, with `useLocalStorage<SectionPage[]>({ key: PAGES_STORAGE_KEY, throwOnError: true })` and a private `getPages()` that returns `[]` for no stored value and throws `INVALID_PAGES_DATA_ERROR` for invalid data. Then add:
   - `getThreadPages(threadId)`: the stored pages filtered by `threadId`, in stored order (AC17).
   - `createSectionPage(newPage)`: build the page, append it to the stored pages (`[...storedPages, createdPage]`), and return it. Pages are never deduplicated by name (AC32).
   - `deleteSectionPages(sectionId)`:

     ```ts
     const deleteSectionPages = async (sectionId: string): Promise<number> => {
       const storedPages = await getPages();

       const remainingPages = storedPages.filter((page) => {
         return page.sectionId !== sectionId;
       });

       const deletedPageCount = storedPages.length - remainingPages.length;

       if (deletedPageCount) {
         pagesStorage.set(remainingPages);
       }

       return deletedPageCount;
     };
     ```

   - `deleteThreadPages(threadId)`: write back the stored pages without those of `threadId`, as `deleteThreadSections` does.

5. `index.ts`: export `useSectionPagesService` and the types, as `src/services/useThreadSectionsService/index.ts` does.

6. Add `export * from "./useSectionPagesService";` to `src/services/index.ts`.

**Verification MANUAL:** `npm run ts:check` reports no errors in `src/services/useSectionPagesService/`.

---

### Step 3: Add `applyNewPage` and let `applyDeletedSection` subtract pages

**File:**
`src/services/useThreadsService/useThreadsService.utils.ts`
`src/services/useThreadsService/useThreadsService.types.ts`

**Covers:** AC47, AC48, AC49, AC50

**Changes:**

1. In `useThreadsService.types.ts`, add `ApplyNewPageParams = { thread: MindThread; createdAt: string }`, and add `deletedPageCount: number` to `ApplyDeletedSectionParams`.

2. In `useThreadsService.utils.ts`, add `applyNewPage` next to `applyNewSection`:

   ```ts
   export const applyNewPage = ({
     thread,
     createdAt,
   }: ApplyNewPageParams): MindThread => {
     return {
       ...thread,
       totalPages: thread.totalPages + 1,
       lastUpdated: createdAt,
     };
   };
   ```

3. Change `applyDeletedSection` to read `deletedPageCount` and also return `totalPages: thread.totalPages - deletedPageCount`.

**Verification MANUAL:** `npm run ts:check` reports errors only where `applyDeletedSection` is called without `deletedPageCount` (fixed in Step 5) and in its tests.

---

### Step 4: Add `addSectionPage` to the threads service

**File:**
`src/services/useThreadsService/useThreadsService.ts`
`src/services/useThreadsService/useThreadsService.types.ts`
`src/services/useThreadsService/useThreadsService.constants.ts`

**Covers:** AC29, AC32, AC44, AC47, AC48, AC49, AC60, AC61

**Context:** It mirrors `addThreadSection`. Threads, sections, and pages are all read and checked before the first write, so a missing thread (AC61), a missing section (AC60), or invalid data fails with nothing written. The page is written before the thread, as the section is in `addThreadSection`.

**Changes:**

1. In `useThreadsService.constants.ts`, add `export const SECTION_NOT_FOUND_ERROR = "Section not found";`.

2. In `useThreadsService.types.ts`, add `addSectionPage: (newPage: NewSectionPage) => Promise<SectionPage>;` to `UseThreadsServiceReturn`.

3. In `useThreadsService.ts`, call `const sectionPagesService = useSectionPagesService();` (relative import `../useSectionPagesService`) next to `threadSectionsService`, and add:

   ```ts
   const addSectionPage = async (
     newPage: NewSectionPage
   ): Promise<SectionPage> => {
     const storedThreads = await getThreads();

     const storedThread = findThread({
       threads: storedThreads,
       threadId: newPage.threadId,
     });

     if (!storedThread) {
       throw new Error(THREAD_NOT_FOUND_ERROR);
     }

     const threadSections = await threadSectionsService.getThreadSections(
       newPage.threadId
     );

     const sectionExists = threadSections.some((section) => {
       return section.id === newPage.sectionId;
     });

     if (!sectionExists) {
       throw new Error(SECTION_NOT_FOUND_ERROR);
     }

     const createdPage = await sectionPagesService.createSectionPage(newPage);

     threadsStorage.set(
       replaceThread({
         threads: storedThreads,
         updatedThread: applyNewPage({
           thread: storedThread,
           createdAt: createdPage.createdAt,
         }),
       })
     );

     return createdPage;
   };
   ```

4. Return `addSectionPage` from the hook.

**Verification MANUAL:** `npm run ts:check` reports no new errors in `src/services/useThreadsService/useThreadsService.ts` apart from the `applyDeletedSection` call fixed in Step 5.

---

### Step 5: Delete a section's and a thread's pages with them

**File:**
`src/services/useThreadsService/useThreadsService.ts`

**Covers:** AC50, AC51, AC52

**Context:** Pages are deleted whenever the section delete runs, even if the section was already gone, so orphaned pages are cleaned up. The thread is still updated only when this call removed the section, so the counts drop only once (the existing rule from `delete-thread-section`). As before, the writes are not transactional.

**Changes:**

1. In `removeThreadSection`, delete the section's pages after the section, and pass the count to `applyDeletedSection`:

   ```ts
   const isSectionDeleted =
     await threadSectionsService.deleteSection(sectionId);

   const deletedPageCount =
     await sectionPagesService.deleteSectionPages(sectionId);

   if (!isSectionDeleted || !storedThread) {
     return;
   }

   threadsStorage.set(
     replaceThread({
       threads: storedThreads,
       updatedThread: applyDeletedSection({
         thread: storedThread,
         deletedPageCount,
         deletedAt: new Date().toISOString(),
       }),
     })
   );
   ```

2. In `deleteThread`, call `await sectionPagesService.deleteThreadPages(threadId);` right after `deleteThreadSections(threadId)`.

**Verification MANUAL:** `npm run ts:check` reports no errors in `src/services/` production files.

---

### Step 6: Load the thread's pages and add `addPage` to the thread page state

**File:**
`src/pages/ThreadPage/components/ThreadPageLoader/ThreadPageLoader.hooks.ts`
`src/pages/ThreadPage/components/ThreadPageLoader/ThreadPageLoader.types.ts`

**Covers:** AC10, AC16, AC17, AC34, AC44, AC45, AC46

**Context:** The loader keeps every page of the thread in one list, and the Pages column filters it by the selected section (Step 19). Switching sections then needs no extra storage read, and the list keeps creation order (AC17).

**Changes:**

1. In `ThreadPageLoader.types.ts`, add:

   ```ts
   export type AddPageParams = {
     sectionId: string;
     pageValue: SectionPageValue;
   };
   ```

2. In `useThreadState`:
   - Call `useSectionPagesService()` and add `const [pages, setPages] = useState<SectionPage[]>([]);`.
   - In `loadThread`, after the sections are read, read `storedThread ? await sectionPagesService.getThreadPages(threadId) : []`, and call `setPages(storedPages)` next to `setSections`. Add `sectionPagesService` to the effect dependencies.
   - Add:

     ```ts
     const addPage = async ({ sectionId, pageValue }: AddPageParams) => {
       const createdPage = await threadsService.addSectionPage({
         threadId,
         sectionId,
         ...pageValue,
       });

       setPages((currentPages) => {
         return [...currentPages, createdPage];
       });

       return createdPage;
     };
     ```

   - In `removeSection`, after the sections update, also remove that section's pages from state:

     ```ts
     setPages((currentPages) => {
       return currentPages.filter((page) => {
         return page.sectionId !== sectionId;
       });
     });
     ```

   - Return `pages` and `addPage` as well.

**Verification MANUAL:** `npm run ts:check` reports no errors in `ThreadPageLoader.hooks.ts`.

---

### Step 7: Extract `useCreateModal` and build `useAddSection` on it

**File:**
`src/pages/ThreadPage/components/ThreadPageLoader/ThreadPageLoader.hooks.ts`
`src/pages/ThreadPage/components/ThreadPageLoader/ThreadPageLoader.types.ts`

**Covers:** AC33, AC53, AC54, AC55, AC56

**Context:** Adding a page works "almost the same as adding a section", so a copy of `useAddSection` would duplicate its open, saving, last-created, and notification logic (`typescript.md` rule 4). `useAddSection` keeps its return shape, so the loader and its existing tests do not change.

**Changes:**

1. In `ThreadPageLoader.types.ts`, add:

   ```ts
   type CreatedItem = {
     id: string;
     name: string;
   };

   export type UseCreateModalParams<Value> = {
     create: (value: Value) => Promise<CreatedItem>;
     getCreatedMessage: (name: string) => string;
     errorMessage: string;
   };
   ```

2. In `ThreadPageLoader.hooks.ts`, add `useCreateModal`, with the body of today's `useAddSection` in generic form:

   ```ts
   export const useCreateModal = <Value>({
     create,
     getCreatedMessage,
     errorMessage,
   }: UseCreateModalParams<Value>) => {
     const [isOpen, setIsOpen] = useState(false);
     const [isSaving, setIsSaving] = useState(false);
     const [lastCreatedId, setLastCreatedId] = useState<string | null>(null);

     const open = () => {
       setIsOpen(true);
     };

     const close = () => {
       setIsOpen(false);
     };

     const submit = async (value: Value) => {
       setIsSaving(true);

       try {
         const createdItem = await create(value);

         setLastCreatedId(createdItem.id);
         close();
         notify.success(getCreatedMessage(createdItem.name));
       } catch {
         notify.error(errorMessage);
       } finally {
         setIsSaving(false);
       }
     };

     return { isOpen, isSaving, lastCreatedId, open, close, submit };
   };
   ```

3. Replace the body of `useAddSection`:

   ```ts
   export const useAddSection = ({ addSection }: UseAddSectionParams) => {
     const sectionModal = useCreateModal({
       create: addSection,
       getCreatedMessage: getSectionCreatedMessage,
       errorMessage: SAVE_SECTION_ERROR_MESSAGE,
     });

     return {
       isAddSectionModalOpen: sectionModal.isOpen,
       isSavingSection: sectionModal.isSaving,
       lastCreatedSectionId: sectionModal.lastCreatedId,
       openAddSectionModal: sectionModal.open,
       closeAddSectionModal: sectionModal.close,
       submitNewSection: sectionModal.submit,
     };
   };
   ```

**Verification MANUAL:** `npx vitest run src/pages/ThreadPage` still passes (adding a section behaves as before), and `npm run ts:check` reports no new errors.

---

### Step 8: Add the `useSectionSelection` hook

**File:**
`src/pages/ThreadPage/components/ThreadPageLoader/ThreadPageLoader.hooks.ts`
`src/pages/ThreadPage/components/ThreadPageLoader/ThreadPageLoader.types.ts`

**Covers:** AC1, AC2, AC5, AC6, AC8, AC9, AC10, AC11

**Context:** The selected section is derived from the loaded sections by id. When the selected section is deleted it drops out of `sections`, so `selectedSection` becomes `null` (AC10) without the delete hook knowing about selection. Creating or deleting another section leaves the id unchanged (AC9, AC11). Selection lives in component state, so a reload clears it (AC1, AC8).

**Changes:**

1. In `ThreadPageLoader.types.ts`, add `UseSectionSelectionParams = { sections: ThreadSection[] }`.

2. In `ThreadPageLoader.hooks.ts`, add:

   ```ts
   export const useSectionSelection = ({
     sections,
   }: UseSectionSelectionParams) => {
     const [selectedSectionId, setSelectedSectionId] = useState<
       string | null
     >(null);

     const selectedSection =
       sections.find((section) => {
         return section.id === selectedSectionId;
       }) ?? null;

     const selectSection = (sectionId: string) => {
       setSelectedSectionId(sectionId);
     };

     return { selectedSection, selectSection };
   };
   ```

**Verification MANUAL:** `npm run ts:check` reports no errors in `ThreadPageLoader.hooks.ts`.

---

### Step 9: Add the `useAddPage` hook

**File:**
`src/pages/ThreadPage/components/ThreadPageLoader/ThreadPageLoader.hooks.ts`
`src/pages/ThreadPage/components/ThreadPageLoader/ThreadPageLoader.types.ts`
`src/pages/ThreadPage/components/ThreadPageLoader/ThreadPageLoader.constants.ts`
`src/pages/ThreadPage/components/ThreadPageLoader/ThreadPageLoader.utils.ts`

**Covers:** AC25, AC33, AC34, AC38, AC53, AC54, AC55, AC56, AC58, AC60, AC61

**Context:** The modal can only be opened with a section selected, so the "no section" branch cannot be reached from the UI. It throws so that it lands in the same error notification instead of failing silently.

**Changes:**

1. In `ThreadPageLoader.constants.ts`, add:

   ```ts
   export const SAVE_PAGE_ERROR_MESSAGE =
     "Couldn't save the page. Please try again.";

   export const NO_SELECTED_SECTION_ERROR = "No section is selected";
   ```

2. In `ThreadPageLoader.utils.ts`, add:

   ```ts
   export const getPageCreatedMessage = (pageName: string) => {
     return `Page "${pageName}" created.`;
   };
   ```

3. In `ThreadPageLoader.types.ts`, add:

   ```ts
   export type UseAddPageParams = {
     addPage: (params: AddPageParams) => Promise<SectionPage>;
     selectedSection: ThreadSection | null;
   };
   ```

4. In `ThreadPageLoader.hooks.ts`, add:

   ```ts
   export const useAddPage = ({ addPage, selectedSection }: UseAddPageParams) => {
     const addPageToSelectedSection = async (pageValue: SectionPageValue) => {
       if (!selectedSection) {
         throw new Error(NO_SELECTED_SECTION_ERROR);
       }

       return addPage({ sectionId: selectedSection.id, pageValue });
     };

     const pageModal = useCreateModal({
       create: addPageToSelectedSection,
       getCreatedMessage: getPageCreatedMessage,
       errorMessage: SAVE_PAGE_ERROR_MESSAGE,
     });

     return {
       isAddPageModalOpen: pageModal.isOpen,
       isSavingPage: pageModal.isSaving,
       lastCreatedPageId: pageModal.lastCreatedId,
       openAddPageModal: pageModal.open,
       closeAddPageModal: pageModal.close,
       submitNewPage: pageModal.submit,
     };
   };
   ```

**Verification MANUAL:** `npm run ts:check` reports no errors in `src/pages/ThreadPage/components/ThreadPageLoader/`.

---

### Step 10: Expose selection and page creation through the thread page contexts

**File:**
`src/pages/ThreadPage/components/ThreadPageLoader/ThreadPageLoader.tsx`
`src/pages/ThreadPage/components/ThreadPageLoader/ThreadPageLoader.types.ts`

**Covers:** AC2, AC10, AC14, AC16, AC19, AC34

**Changes:**

1. In `ThreadPageLoader.types.ts`, add to `ThreadPageValue`:

   ```ts
   pages: SectionPage[];
   selectedSection: ThreadSection | null;
   isAddPageModalOpen: boolean;
   isSavingPage: boolean;
   lastCreatedPageId: string | null;
   ```

   and to `ThreadPageAction`:

   ```ts
   selectSection: (sectionId: string) => void;
   openAddPageModal: () => void;
   closeAddPageModal: () => void;
   submitNewPage: (pageValue: SectionPageValue) => Promise<void>;
   ```

2. In `ThreadPageLoader.tsx`, read `pages` and `addPage` from `useThreadState`. Then call `useSectionSelection({ sections })` and `useAddPage({ addPage, selectedSection })`, after `useDeleteSection`. Add the new values and actions to the two inline context objects.

**Verification MANUAL:** The thread page renders as before, and `npm run ts:check` reports no errors in `ThreadPageLoader/`.

---

### Step 11: Let `Box` render as a button

**File:**
`src/components/lib/Box/Box.tsx`

**Covers:** AC2, AC7

**Context:** Step 15 makes the section name area a real `<button>` placed next to the actions menu, not a clickable `div` around it. This makes it keyboard-accessible. Opening the menu cannot select the section (AC7), because the two are siblings, and click events from the portaled menu do not bubble through the card.

**Changes:**

1. Add to `BoxProps`:

   ```ts
   type?: "button";
   "aria-current"?: boolean;
   ```

   The props are already spread onto `ChakraBox`, so nothing else changes.

**Verification MANUAL:** `npm run ts:check` reports no errors in `src/components/lib/Box/`.

---

### Step 12: Create the `Select` adapter

**New files:**

- `src/components/lib/Select/Select.tsx`
- `src/components/lib/Select/Select.constants.ts`
- `src/components/lib/Select/index.ts`

**File:**
`src/components/lib/index.ts`

**Covers:** AC19, AC23, AC24, AC57

**Context:** A native `<select>` cannot show an icon in its options (AC24), so this wraps Chakra's `Select`. Like `ColorPicker`, it takes `portal`, so the list can render inside the dialog's focus trap. It is generic over the value type, so `PageForm` gets a `SectionPageType` back without a cast.

**Changes:**

1. `Select.constants.ts`: `SelectTestId` made with `initTestIdCreator("Select__")`, with `container`, `trigger`, `content`, and `item`.

2. `Select.tsx`:

   ```tsx
   import type { ReactNode } from "react";
   import {
     Portal,
     Select as ChakraSelect,
     createListCollection,
   } from "@chakra-ui/react";
   import { SelectTestId } from "./Select.constants";

   export type SelectItem<Value extends string> = {
     value: Value;
     label: string;
     icon?: ReactNode;
   };

   export type SelectProps<Value extends string> = {
     label: string;
     value: Value;
     items: SelectItem<Value>[];
     onChange: (value: Value) => void;
     "data-testid"?: string;
     portal?: boolean;
     disabled?: boolean;
   };

   export const Select = <Value extends string>({
     label,
     value,
     items,
     "data-testid": testId,
     portal = true,
     disabled = false,
     onChange,
   }: SelectProps<Value>) => {
     const collection = createListCollection({ items });

     const handleValueChange = (
       details: ChakraSelect.ValueChangeDetails<SelectItem<Value>>
     ) => {
       const [selectedItem] = details.items;

       if (selectedItem) {
         onChange(selectedItem.value);
       }
     };

     const content = (
       <ChakraSelect.Positioner>
         <ChakraSelect.Content data-testid={SelectTestId.content}>
           {items.map((item) => {
             return (
               <ChakraSelect.Item
                 key={item.value}
                 item={item}
                 data-testid={SelectTestId.item}
               >
                 {item.icon}
                 <ChakraSelect.ItemText flexGrow={1}>
                   {item.label}
                 </ChakraSelect.ItemText>
                 <ChakraSelect.ItemIndicator />
               </ChakraSelect.Item>
             );
           })}
         </ChakraSelect.Content>
       </ChakraSelect.Positioner>
     );

     return (
       <ChakraSelect.Root
         data-testid={testId ?? SelectTestId.container}
         collection={collection}
         value={[value]}
         width="100%"
         disabled={disabled}
         onValueChange={handleValueChange}
       >
         <ChakraSelect.HiddenSelect />
         <ChakraSelect.Label>{label}</ChakraSelect.Label>

         <ChakraSelect.Control>
           <ChakraSelect.Trigger
             data-testid={SelectTestId.trigger}
             _hover={{ borderColor: "accent", cursor: "pointer" }}
             _focus={{ borderColor: "accent", outlineColor: "accent" }}
           >
             <ChakraSelect.ValueText />
           </ChakraSelect.Trigger>

           <ChakraSelect.IndicatorGroup>
             <ChakraSelect.Indicator />
           </ChakraSelect.IndicatorGroup>
         </ChakraSelect.Control>

         {portal ? <Portal>{content}</Portal> : content}
       </ChakraSelect.Root>
     );
   };
   ```

   The hover and focus styles match `Input` and `ColorPicker`. Chakra's `Select` does not deselect by default, so a value is always selected.

3. `index.ts`: `export { Select, type SelectProps, type SelectItem } from "./Select";`

4. Add the same line, with the `./Select` path, to `src/components/lib/index.ts`.

**Verification MANUAL:** `npm run ts:check` reports no errors in `src/components/lib/Select/`.

---

### Step 13: Move `ThreadHeaderColorScope` to the shared `ContrastColorScope`

**New files:**

- `src/components/shared/ContrastColorScope/ContrastColorScope.tsx`
- `src/components/shared/ContrastColorScope/index.ts`

**File:**
`src/components/shared/index.ts`
`src/pages/ThreadPage/components/ThreadHeader/ThreadHeader.tsx`
`src/pages/ThreadPage/components/ThreadHeader/components/index.ts`

**Removed files:** `src/pages/ThreadPage/components/ThreadHeader/components/ThreadHeaderColorScope/ThreadHeaderColorScope.tsx` and its `index.ts`. Leave `__tests__/` for Phase 2, Step 8.

**Covers:** AC4

**Context:** A selected section card needs the same readable-text logic as the thread header (AC4). The component has nothing header-specific in it, so it is moved and renamed rather than copied.

**Changes:**

1. Create `ContrastColorScope.tsx` with the exact body of `ThreadHeaderColorScope.tsx`, renaming the component to `ContrastColorScope` and its props type to `ContrastColorScopeProps`.

2. `index.ts`: `export * from "./ContrastColorScope";`. Add `export * from "./ContrastColorScope";` to `src/components/shared/index.ts`.

3. In `ThreadHeader.tsx`, import `ContrastColorScope` from `@/components/shared` and use it in place of `ThreadHeaderColorScope`.

4. Remove `export * from "./ThreadHeaderColorScope";` from `ThreadHeader/components/index.ts`, and delete the two production files.

**Verification MANUAL:** The thread header still switches its text and icons to light or dark to match the thread color.

---

### Step 14: Create `useScrollIntoView` and use it in `SectionCard`

**New files:**

- `src/hooks/useScrollIntoView/useScrollIntoView.ts`
- `src/hooks/useScrollIntoView/index.ts`

**File:**
`src/hooks/index.ts`
`src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/SectionsColumn/components/SectionCard/SectionCard.tsx`

**Covers:** AC38

**Context:** `PageCard` needs the scroll-to-new-card effect that `SectionCard` already has. Sharing it as a hook avoids a second copy.

**Changes:**

1. `useScrollIntoView.ts`:

   ```ts
   import { useEffect, useRef } from "react";

   export const useScrollIntoView = <ElementType extends HTMLElement>(
     shouldScroll: boolean
   ) => {
     const elementRef = useRef<ElementType>(null);

     useEffect(() => {
       if (shouldScroll) {
         elementRef.current?.scrollIntoView({ block: "nearest" });
       }
     }, [shouldScroll]);

     return elementRef;
   };
   ```

2. `index.ts`: `export * from "./useScrollIntoView";`. Add `export * from "./useScrollIntoView";` to `src/hooks/index.ts`.

3. In `SectionCard.tsx`, replace the `useRef` and `useEffect` with `const cardRef = useScrollIntoView<HTMLDivElement>(isLastCreated);`, imported from `@/hooks`.

**Verification MANUAL:** Creating a section in a long section list still scrolls the new card into view.

---

### Step 15: Make section cards selectable

**File:**
`src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/SectionsColumn/components/SectionCard/SectionCard.tsx`
`src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/SectionsColumn/components/SectionCard/SectionCard.constants.ts`
`src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/SectionsColumn/components/SectionList/SectionList.tsx`
`src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/SectionsColumn/SectionsColumn.tsx`

**Covers:** AC2, AC3, AC4, AC5, AC6, AC7

**Context:** These files change together because the new required props must reach `SectionCard` for the code to compile. `SectionsColumn` stays the only connected component. The padding moves from the card to the button so the whole name area is clickable, and the card keeps its size. `ContrastColorScope` wraps both the name and the menu button, so both switch to light or dark text on the section color (AC4). The menu list is portaled, so it keeps the app's color mode. Clicking the selected card again sets the same id, so it stays selected (AC6).

**Changes:**

1. In `SectionCard.constants.ts`, add `selectButton: createTestId("select-button")` to `SectionCardTestId`.

2. In `SectionCard.tsx`:
   - Add `isSelected: boolean` and `onSelect: (sectionId: string) => void` to the props, and a `handleSelect` that calls `onSelect(section.id)`.
   - On the card `Box`, set `backgroundColor={isSelected ? section.color : "bg"}`, and replace `py="2" pl="3" pr="1"` with `pr="1"`.
   - Wrap the card's children in `ContrastColorScope`, and put the name in a button:

     ```tsx
     <ContrastColorScope
       backgroundColor={isSelected ? section.color : undefined}
     >
       <Box
         data-testid={SectionCardTestId.selectButton}
         as="button"
         type="button"
         aria-current={isSelected}
         display="flex"
         flexGrow={1}
         minWidth="0"
         py="2"
         pl="3"
         textAlign="left"
         cursor="pointer"
         onClick={handleSelect}
       >
         <TruncatedText data-testid={SectionCardTestId.name} fontWeight="medium">
           {section.name}
         </TruncatedText>
       </Box>

       <SectionCardActions section={section} onDelete={onDelete} />
     </ContrastColorScope>
     ```

3. In `SectionList.tsx`, add `selectedSectionId: string | null` and `onSelectSection: (sectionId: string) => void` to the props, and pass `isSelected={section.id === selectedSectionId}` and `onSelect={onSelectSection}` to each `SectionCard`.

4. In `SectionsColumn.tsx`, read `selectedSection` from `useThreadPageValue()` and `selectSection` from `useThreadPageAction()`, and pass `selectedSectionId={selectedSection ? selectedSection.id : null}` and `onSelectSection={selectSection}` to `SectionList`.

**Verification MANUAL:** On a thread page, clicking a card fills it with its color, and the text and menu icon stay readable on light (yellow) and dark (red, purple) colors. Clicking another card moves the fill, clicking the same card keeps it, and opening any card's menu, or choosing Delete then Cancel, does not change the selection.

---

### Step 16: Add page type constants and the `PageTypeIcon` component

**New files:**

- `src/pages/ThreadPage/components/PageTypeIcon/PageTypeIcon.tsx`
- `src/pages/ThreadPage/components/PageTypeIcon/PageTypeIcon.constants.ts`
- `src/pages/ThreadPage/components/PageTypeIcon/index.ts`

**File:**
`src/pages/ThreadPage/ThreadPage.constants.ts`
`src/pages/ThreadPage/ThreadPage.types.ts`
`src/pages/ThreadPage/components/index.ts`

**Covers:** AC21, AC23, AC24, AC36, AC44

**Context:** The type dropdown (Step 21) and the page card (Step 17) both show the type's icon, and they live in different subtrees of `ThreadPage/components/`, so the icon sits at that level. `PAGE_TYPE_CONFIG` is a `Record` over `SectionPageType`, so adding a type later fails to compile until it gets a label and an icon.

**Changes:**

1. In `ThreadPage.types.ts`, add:

   ```ts
   export type PageTypeConfig = {
     label: string;
     icon: IconType;
   };
   ```

   (`import type { IconType } from "react-icons";`)

2. In `ThreadPage.constants.ts`, add:

   ```ts
   export const PAGE_TYPES: SectionPageType[] = ["chat"];

   export const DEFAULT_PAGE_TYPE: SectionPageType = "chat";

   export const PAGE_TYPE_CONFIG: Record<SectionPageType, PageTypeConfig> = {
     chat: { label: "Chat", icon: LuMessageSquare },
   };
   ```

   (`LuMessageSquare` from `react-icons/lu`, the icon set the project already uses.)

3. `PageTypeIcon.constants.ts`:

   ```ts
   const createTestId = initTestIdCreator("PageTypeIcon__");

   export const PageTypeIconTestId: Record<SectionPageType, string> = {
     chat: createTestId("chat"),
   };
   ```

4. `PageTypeIcon.tsx`:

   ```tsx
   type PageTypeIconProps = {
     type: SectionPageType;
   };

   export const PageTypeIcon = ({ type }: PageTypeIconProps) => {
     const { icon: TypeIcon } = PAGE_TYPE_CONFIG[type];

     return (
       <Box
         data-testid={PageTypeIconTestId[type]}
         as="span"
         display="flex"
         flexShrink={0}
       >
         <TypeIcon aria-hidden />
       </Box>
     );
   };
   ```

5. `index.ts`: `export * from "./PageTypeIcon";`. Add `export * from "./PageTypeIcon";` to `src/pages/ThreadPage/components/index.ts`.

**Verification MANUAL:** `npm run ts:check` reports no errors in `PageTypeIcon/`.

---

### Step 17: Create `PageCard`

**New files:**

- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PagesColumn/components/PageCard/PageCard.tsx`
- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PagesColumn/components/PageCard/PageCard.constants.ts`
- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PagesColumn/components/PageCard/index.ts`

**Covers:** AC35, AC36, AC38, AC39, AC40, AC41, AC42, AC43

**Context:** It follows the unselected look of `SectionCard`, with the type icon in place of the actions menu (AC40). It has no click handler, so clicking it does nothing (AC39). `TruncatedText` already provides the ellipsis and the tooltip shown only for cut-off names (AC41 to AC43).

**Changes:**

1. `PageCard.constants.ts`: `PageCardTestId` made with `initTestIdCreator("PageCard__")`, with `container` and `name`, `as const`.

2. `PageCard.tsx`:

   ```tsx
   type PageCardProps = {
     page: SectionPage;
     isLastCreated: boolean;
   };

   export const PageCard = ({ page, isLastCreated }: PageCardProps) => {
     const cardRef = useScrollIntoView<HTMLDivElement>(isLastCreated);

     return (
       <Box
         ref={cardRef}
         data-testid={PageCardTestId.container}
         display="flex"
         alignItems="center"
         gap="2"
         py="2"
         px="3"
         minWidth="0"
         borderRadius="md"
         borderWidth="1px"
         borderColor="border"
         borderLeftWidth="4px"
         borderLeftColor={page.color}
         backgroundColor="bg"
       >
         <PageTypeIcon type={page.type} />

         <TruncatedText data-testid={PageCardTestId.name} fontWeight="medium">
           {page.name}
         </TruncatedText>
       </Box>
     );
   };
   ```

   Import `PageTypeIcon` from `@/pages/ThreadPage/components/PageTypeIcon`.

3. `index.ts`: `export * from "./PageCard";`.

**Verification MANUAL:** `npm run ts:check` reports no errors in `PageCard/`.

---

### Step 18: Create `PageList`

**New files:**

- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PagesColumn/components/PageList/PageList.tsx`
- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PagesColumn/components/PageList/PageList.constants.ts`
- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PagesColumn/components/PageList/index.ts`

**Covers:** AC16, AC17, AC34, AC38

**Changes:**

1. Follow `SectionsColumn/components/SectionList/` exactly: `PageListTestId.container` (prefix `"PageList__"`), and a `VStack` with `gap="2"` and `alignItems="stretch"` that maps `pages: SectionPage[]` to `PageCard`s with `key={page.id}` and `isLastCreated={page.id === lastCreatedPageId}`. Props: `pages` and `lastCreatedPageId: string | null`.

2. `index.ts`: `export * from "./PageList";`.

**Verification MANUAL:** `npm run ts:check` reports no errors in `PageList/`.

---

### Step 19: Create `PagesColumn`

**New files:**

- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PagesColumn/PagesColumn.tsx`
- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PagesColumn/PagesColumn.utils.ts`
- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PagesColumn/PagesColumn.types.ts`
- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PagesColumn/index.ts`
- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PagesColumn/components/PagesColumnContent/PagesColumnContent.tsx`
- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PagesColumn/components/PagesColumnContent/index.ts`
- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PagesColumn/components/index.ts`

**File:**
`src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/ThreadColumns.constants.ts`
`src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/index.ts`

**Covers:** AC10, AC12, AC13, AC14, AC15, AC16, AC17, AC18, AC37

**Context:** `PagesColumn` is the connected component, like `SectionsColumn`. The three body states (no selection, no pages, list) go into `PagesColumnContent` with early returns, so there is no nested ternary. `ThreadColumn` already scrolls its body (AC18).

**Changes:**

1. In `ThreadColumns.constants.ts`, add `addPageButton: createTestId("add-page-button")` to `ThreadColumnsTestId`, and:

   ```ts
   export const PAGES_COLUMN_EMPTY_MESSAGE = "No pages yet.";
   export const ADD_PAGE_BUTTON_LABEL = "Add page";
   ```

2. `PagesColumn.types.ts`: `GetSectionPagesParams = { pages: SectionPage[]; sectionId: string }`.

3. `PagesColumn.utils.ts`:

   ```ts
   export const getSectionPages = ({ pages, sectionId }: GetSectionPagesParams) => {
     return pages.filter((page) => {
       return page.sectionId === sectionId;
     });
   };
   ```

4. `PagesColumnContent.tsx`:

   ```tsx
   type PagesColumnContentProps = {
     selectedSection: ThreadSection | null;
     pages: SectionPage[];
     lastCreatedPageId: string | null;
   };

   export const PagesColumnContent = ({
     selectedSection,
     pages,
     lastCreatedPageId,
   }: PagesColumnContentProps) => {
     if (!selectedSection) {
       return <ThreadColumnMessage message={PAGES_COLUMN_MESSAGE} />;
     }

     const sectionPages = getSectionPages({
       pages,
       sectionId: selectedSection.id,
     });

     if (!sectionPages.length) {
       return <ThreadColumnMessage message={PAGES_COLUMN_EMPTY_MESSAGE} />;
     }

     return (
       <PageList pages={sectionPages} lastCreatedPageId={lastCreatedPageId} />
     );
   };
   ```

5. `PagesColumn.tsx`:

   ```tsx
   export const PagesColumn = () => {
     const { selectedSection, pages, lastCreatedPageId } = useThreadPageValue();
     const { openAddPageModal } = useThreadPageAction();

     return (
       <ThreadColumn
         data-testid={ThreadColumnsTestId.pagesColumn}
         heading={PAGES_COLUMN_HEADING}
         headerAction={
           selectedSection ? (
             <AddIconButton
               data-testid={ThreadColumnsTestId.addPageButton}
               tooltipLabel={ADD_PAGE_BUTTON_LABEL}
               onClick={openAddPageModal}
             />
           ) : null
         }
       >
         <PagesColumnContent
           selectedSection={selectedSection}
           pages={pages}
           lastCreatedPageId={lastCreatedPageId}
         />
       </ThreadColumn>
     );
   };
   ```

   Import the hooks from `@/pages/ThreadPage/components/ThreadPageLoader`, as `SectionsColumn.tsx` does.

6. Add the barrels: `PagesColumnContent/index.ts`, and `PagesColumn/components/index.ts` exporting `PagesColumnContent`, `PageCard`, and `PageList`. `PagesColumn/index.ts` exports `PagesColumn`. Add `export * from "./PagesColumn";` to `ThreadColumns/components/index.ts`.

**Verification MANUAL:** `npm run ts:check` reports no errors in `PagesColumn/`.

---

### Step 20: Show `PagesColumn` in the thread columns

**File:**
`src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/ThreadColumns.tsx`

**Covers:** AC12, AC13, AC14, AC39

**Changes:**

1. Replace the inline Pages `ThreadColumn` and its `ThreadColumnMessage` with `<PagesColumn />`. Remove the `PAGES_COLUMN_HEADING` and `PAGES_COLUMN_MESSAGE` imports, which are now unused there. The Content column stays as it is (AC39).

**Verification MANUAL:** On a thread page, the Pages column shows "Select a section to see its pages." with no add button. After a section is selected, it shows "No pages yet." and a "+" button with the "Add page" tooltip.

---

### Step 21: Create `PageForm`

**New files:**

- `src/pages/ThreadPage/components/AddPageModalContainer/components/AddPageModal/components/PageForm/PageForm.tsx`
- `src/pages/ThreadPage/components/AddPageModalContainer/components/AddPageModal/components/PageForm/PageForm.constants.ts`
- `src/pages/ThreadPage/components/AddPageModalContainer/components/AddPageModal/components/PageForm/index.ts`
- `src/pages/ThreadPage/components/AddPageModalContainer/components/AddPageModal/components/index.ts`

**Covers:** AC19, AC22, AC23, AC24, AC30, AC31, AC57, AC58

**Context:** It follows `SectionForm.tsx`, with a `Select` added between the name and the color. `portal={false}` keeps both popups inside the dialog's focus trap, as in `SectionForm`. The color picker is the same `ColorPicker`, so it has the same swatches (AC22).

**Changes:**

1. `PageForm.constants.ts`:

   ```ts
   const createTestId = initTestIdCreator("PageForm__");

   export const PageFormTestId = {
     form: createTestId("form"),
     nameInput: createTestId("name-input"),
     typeSelect: createTestId("type-select"),
     colorPicker: createTestId("color-picker"),
   } as const;

   export const PAGE_NAME_LABEL = "Page name";
   export const PAGE_NAME_PLACEHOLDER = "Enter page name";
   export const PAGE_TYPE_LABEL = "Page type";
   export const PAGE_COLOR_LABEL = "Color";
   ```

2. `PageForm.tsx`: same props as `SectionForm` with `value: SectionPageValue` and `onChange: (value: SectionPageValue) => void`. It has `handleNameChange`, `handleColorChange`, `handleSubmit` (which calls `preventDefault`), and:

   ```tsx
   const handleTypeChange = (type: SectionPageType) => {
     onChange({ ...value, type });
   };

   const pageTypeItems = PAGE_TYPES.map((type) => {
     return {
       value: type,
       label: PAGE_TYPE_CONFIG[type].label,
       icon: <PageTypeIcon type={type} />,
     };
   });
   ```

   Render the `VStack as="form"` from `SectionForm` with the required `Input`, then:

   ```tsx
   <Select
     data-testid={PageFormTestId.typeSelect}
     label={PAGE_TYPE_LABEL}
     value={value.type}
     items={pageTypeItems}
     portal={false}
     disabled={disabled}
     onChange={handleTypeChange}
   />
   ```

   then the `ColorPicker`, with the same props as in `SectionForm` and the page constants. `disabled` goes to all three fields (AC57).

3. `index.ts`: `export * from "./PageForm";`. `components/index.ts`: `export * from "./PageForm";`.

**Verification MANUAL:** `npm run ts:check` reports no errors in `PageForm/`.

---

### Step 22: Create `AddPageModal`

**New files:**

- `src/pages/ThreadPage/components/AddPageModalContainer/components/AddPageModal/AddPageModal.tsx`
- `src/pages/ThreadPage/components/AddPageModalContainer/components/AddPageModal/AddPageModal.constants.ts`
- `src/pages/ThreadPage/components/AddPageModalContainer/components/AddPageModal/index.ts`
- `src/pages/ThreadPage/components/AddPageModalContainer/components/index.ts`

**Covers:** AC19, AC20, AC21, AC25, AC26, AC27, AC28, AC31, AC55, AC56, AC58, AC59

**Context:** It mirrors `AddSectionModal.tsx`. The two modals have the same shape but a different value type, defaults, and form. A shared generic modal would need a render-prop form, which costs more readability than the duplication it saves. The modal unmounts when it closes, so it always reopens with the defaults (AC26). After a failed save it stays mounted with its state (AC55).

**Changes:**

1. `AddPageModal.constants.ts`:

   ```ts
   export const ADD_PAGE_MODAL_TITLE = "Add new page";
   export const ADD_PAGE_SUBMIT_LABEL = "Add";

   export const DEFAULT_PAGE_FORM_VALUE: SectionPageValue = {
     name: "",
     type: DEFAULT_PAGE_TYPE,
     color: DEFAULT_SWATCH_COLOR,
   };
   ```

   Import `DEFAULT_SWATCH_COLOR` the same way `AddSectionModal.constants.ts` does (AC21), and `DEFAULT_PAGE_TYPE` from `@/pages/ThreadPage/ThreadPage.constants`.

2. `AddPageModal.tsx`: copy the structure of `AddSectionModal.tsx`, with `onSubmit: (pageValue: SectionPageValue) => void`, `useState<SectionPageValue>(DEFAULT_PAGE_FORM_VALUE)`, `PageForm` in place of `SectionForm`, and the page title and submit label. Keep `submitDisabled = !formValue.name.trim()` (AC27, AC28), the `handleSubmit` guard against `submitDisabled || isSaving` (AC31, AC58), `closeDisabled={isSaving}` (AC59), `initialFocusRef={nameInputRef}` (AC20), and `isSubmitting={isSaving}` on `ThreadFormModalActions` (AC56, AC59).

3. `index.ts`: `export * from "./AddPageModal";`. `components/index.ts`: `export * from "./AddPageModal";`.

**Verification MANUAL:** `npm run ts:check` reports no errors in `AddPageModal/`.

---

### Step 23: Create `AddPageModalContainer`

**New files:**

- `src/pages/ThreadPage/components/AddPageModalContainer/AddPageModalContainer.tsx`
- `src/pages/ThreadPage/components/AddPageModalContainer/index.ts`

**File:**
`src/pages/ThreadPage/components/index.ts`

**Covers:** AC19, AC25, AC33

**Changes:**

1. Follow `AddSectionModalContainer.tsx`: read `isAddPageModalOpen` and `isSavingPage` from `useThreadPageValue()`, and `closeAddPageModal` and `submitNewPage` from `useThreadPageAction()`. Return `<AddPageModal isSaving={isSavingPage} onClose={closeAddPageModal} onSubmit={submitNewPage} />` when the modal is open, and `null` otherwise.

2. `index.ts`: `export * from "./AddPageModalContainer";`. Add `export * from "./AddPageModalContainer";` to `src/pages/ThreadPage/components/index.ts`.

**Verification MANUAL:** `npm run ts:check` reports no errors in `AddPageModalContainer/`.

---

### Step 24: Register the modal on the thread page

**File:**
`src/pages/ThreadPage/ThreadPage.tsx`

**Covers:** AC19, AC33, AC34, AC53

**Changes:**

1. Import `AddPageModalContainer` from `./components` and render `<AddPageModalContainer />` after `<AddSectionModalContainer />`.

**Verification MANUAL:** Run the whole flow in the browser:
- Select a section, open "Add page", and check the focus, the defaults, the single "Chat" option with its icon, and the swatches.
- Add "  Ideas  " with Enter, then check the notification, the trimmed name, the chat icon, the left border, and the scroll into view.
- Add two pages with the same name, switch sections and back, then reload and select the section again.
- Delete a section that has pages, and check that the dashboard shows the new page count and "Updated: just now".
- In two tabs, delete the section (then the thread) in one tab, and click Add in the other. The error notification appears and the modal stays open with its values.

## Phase 2: Unit tests

---

### Step 1: Add page fixtures and test `useSectionPagesService`

**New files:**

- `src/__test-fixtures__/pages/pages.ts`
- `src/__test-fixtures__/pages/pages.storage.ts`
- `src/__test-fixtures__/pages/pages.queries.ts`
- `src/__test-fixtures__/pages/index.ts`
- `src/services/useSectionPagesService/__tests__/useSectionPagesService.test.ts`
- `src/services/useSectionPagesService/__tests__/useSectionPagesService.utils.test.ts`

**File:**
`src/__test-fixtures__/index.ts`

**Covers:** AC17, AC29, AC32, AC45, AC46, AC50, AC52

**Context:** The fixtures mirror `src/__test-fixtures__/sections/` and are shared by Steps 3, 5, 12 to 14, and 17 to 19 (`unit-tests.md` rule 5).

**Changes:**

1. `pages.ts`: `sectionPageFixtures: SectionPage[]` with four pages: two in `threadSectionFixtures[0]` (with ascending `createdAt`), one in `threadSectionFixtures[1]`, and one in `threadSectionFixtures[2]` (another thread). All have `type: "chat"`.

2. `pages.storage.ts`: `seedPages(pages)` and `readStoredPages()`, the same way as `seedSections` and `readStoredSections`, using `PAGES_STORAGE_KEY`.

3. `pages.queries.ts`: `getRenderedPageNames()`, the same way as `getRenderedSectionNames`, using `PageCardTestId.name`.

4. `index.ts` exports all three files. Add `export * from "./pages";` to `src/__test-fixtures__/index.ts`.

5. Following `useThreadSectionsService.test.ts` and its utils test, cover:
   - `getThreadPages`: `[]` with nothing stored; only the given thread's pages, in stored order; an error for malformed JSON and for invalid data.
   - `createSectionPage`: it appends after the stored pages, trims the name, and keeps two pages with the same name.
   - `deleteSectionPages`: it returns the number removed and keeps the other sections' pages; it returns `0` and writes nothing when the section has no pages.
   - `deleteThreadPages`: it removes only that thread's pages.
   - `buildPage` and `isSectionPageList`: a valid list, a non-array, and an item with a missing field.

**Verification:** `npx vitest run src/services/useSectionPagesService` passes.

---

### Step 2: Test `applyNewPage` and the page count in `applyDeletedSection`

**File:**
`src/services/useThreadsService/__tests__/useThreadsService.utils.test.ts`

**Covers:** AC47, AC48, AC49, AC50

**Changes:**

1. Add `applyNewPage` cases: `totalPages` goes up by one, `lastUpdated` equals `createdAt`, and the other fields stay the same.

2. Pass `deletedPageCount` in the existing `applyDeletedSection` cases, and add a case where `totalPages` drops by that count (3 pages, 2 deleted, leaves 1).

**Verification:** `npx vitest run src/services/useThreadsService/__tests__/useThreadsService.utils.test.ts` passes.

---

### Step 3: Test `addSectionPage` and the page cleanup in the threads service

**File:**
`src/services/useThreadsService/__tests__/useThreadsService.test.ts`

**Covers:** AC29, AC32, AC47, AC48, AC49, AC50, AC51, AC52, AC60, AC61

**Changes:**

1. `addSectionPage`:
   - It returns the stored page with the name trimmed, raises `totalPages` from 0 to 1 and then to 2 (in the same section and in another section), and sets `lastUpdated` to the page's `createdAt`.
   - It throws `THREAD_NOT_FOUND_ERROR` when the thread is missing, and `SECTION_NOT_FOUND_ERROR` when the section is missing or belongs to another thread. Both leave the pages and threads storage unchanged.
   - It throws for invalid stored pages, with nothing written.
   - Simulate deletions from another tab with `dispatchStorageChange`, as the existing `removeThreadSection` tests do.

2. `removeThreadSection`: it deletes the section's pages, keeps the others, and lowers `totalPages` by the deleted count (AC50). A new section with the same name has no pages (AC51). When the section was already deleted elsewhere, `totalPages` is unchanged.

3. `deleteThread`: it removes that thread's pages and keeps the other thread's pages (AC52).

**Verification:** `npx vitest run src/services/useThreadsService` passes.

---

### Step 4: Test the page created message

**File:**
`src/pages/ThreadPage/components/ThreadPageLoader/__tests__/ThreadPageLoader.utils.test.ts`

**Covers:** AC53

**Changes:**

1. Add `getPageCreatedMessage("Ideas")` returns `Page "Ideas" created.`

**Verification:** `npx vitest run src/pages/ThreadPage/components/ThreadPageLoader/__tests__/ThreadPageLoader.utils.test.ts` passes.

---

### Step 5: Test the new thread page hooks and extend the service overrides

**File:**
`src/__test-fixtures__/threads/threadsService.ts`
`src/pages/ThreadPage/components/ThreadPageLoader/__tests__/ThreadPageLoader.hooks.test.tsx`

**Covers:** AC1, AC2, AC5, AC6, AC9, AC10, AC11, AC34, AC44, AC45, AC46, AC53, AC54, AC55, AC56, AC60, AC61

**Changes:**

1. In `threadsService.ts`, add `addSectionPage` to `ThreadsServiceOverrides`, `resetThreadsServiceOverrides`, and `createServicesMock`, the same way as `addThreadSection`.

2. Using the file's existing `setupHook` pattern:
   - `useThreadState`: it loads only the thread's pages; `addPage` appends the created page; `removeSection` drops that section's pages from `pages`.
   - `useSectionSelection`: `null` at first; `selectSection` selects; selecting the same id again keeps it; it becomes `null` when the selected section leaves `sections` (rerender with the section removed); it stays when another section is added or removed.
   - `useAddPage`: `submitNewPage` calls `addPage` with the selected section's id and the value, closes the modal, sets `lastCreatedPageId`, and notifies success. While pending (deferred promise from `@/__test-fixtures__`), `isSavingPage` is `true`. On rejection, it shows the error notification, keeps the modal open, and resets `isSavingPage`. With no selected section, it shows the error notification and does not call `addPage`.
   - The existing `useAddSection` tests stay unchanged and now cover `useCreateModal` through it.

**Verification:** `npx vitest run src/pages/ThreadPage/components/ThreadPageLoader` passes.

---

### Step 6: Test `Box` as a button

**File:**
`src/components/lib/Box/__tests__/Box.test.tsx`

**Covers:** AC2

**Changes:**

1. Add a case: `as="button"`, `type="button"`, and `aria-current` render a `button` element with `type="button"` and `aria-current="true"`.

**Verification:** `npx vitest run src/components/lib/Box` passes.

---

### Step 7: Test the `Select` adapter

**New files:**

- `src/components/lib/Select/__tests__/Select.test.tsx`

**Covers:** AC19, AC23, AC24, AC57

**Context:** It follows `ColorPicker.test.tsx` for opening a Zag popup in jsdom. Use the `stubLayout` and pointer-events `setup` options only where needed (`unit-tests.md` rule 14).

**Changes:**

1. Cover: it renders the label and the selected item's label; opening it lists every item with its icon before the label; choosing an item calls `onChange` with that item's value; `disabled` disables the trigger; with `portal={false}`, the content renders inside the root container.

**Verification:** `npx vitest run src/components/lib/Select` passes.

---

### Step 8: Move the color scope test to `ContrastColorScope`

**New files:**

- `src/components/shared/ContrastColorScope/__tests__/ContrastColorScope.test.tsx`

**File:**
`src/pages/ThreadPage/components/ThreadHeader/components/ThreadHeaderColorScope/__tests__/ThreadHeaderColorScope.test.tsx` (removed)

**Covers:** AC4

**Changes:**

1. Move the test file and rename `ThreadHeaderColorScope` to `ContrastColorScope` in it. The scenarios stay the same. Delete the now-empty `ThreadHeaderColorScope/` folder.

**Verification:** `npx vitest run src/components/shared/ContrastColorScope src/pages/ThreadPage/components/ThreadHeader` passes.

---

### Step 9: Test `useScrollIntoView`

**New files:**

- `src/hooks/useScrollIntoView/__tests__/useScrollIntoView.test.ts`

**Covers:** AC38

**Changes:**

1. Using `setupHook` with `renderHook`, attach the returned ref to an element whose `scrollIntoView` is a `vi.fn()`. Cover: it scrolls with `{ block: "nearest" }` when `shouldScroll` is `true`; it does not scroll when `false`; it scrolls when the value changes from `false` to `true`.

**Verification:** `npx vitest run src/hooks/useScrollIntoView` passes.

---

### Step 10: Test the selectable `SectionCard` and update `SectionList`

**File:**
`src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/SectionsColumn/components/SectionCard/__tests__/SectionCard.test.tsx`
`src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/SectionsColumn/components/SectionList/__tests__/SectionList.test.tsx`

**Covers:** AC2, AC3, AC4, AC7

**Changes:**

1. Add `isSelected` and `onSelect` to the `setup()` of both files, with defaults `false` and a `vi.fn()`.

2. `SectionCard`:
   - Clicking the name button calls `onSelect` with the section id.
   - Opening the actions menu, and choosing Delete, does not call `onSelect`.
   - Unselected: `aria-current="false"`, the `bg` background, and no forced color scope.
   - Selected: `aria-current="true"`, the section color as background, and the name and menu button inside a `.chakra-theme.light` scope for `#ebcb8b` and a `.chakra-theme.dark` scope for `#2e3440`.

3. `SectionList`: only the card whose id equals `selectedSectionId` has `aria-current="true"`, and clicking a card calls `onSelectSection` with its id.

**Verification:** `npx vitest run src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/SectionsColumn/components` passes.

---

### Step 11: Test section selection in `SectionsColumn`

**File:**
`src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/SectionsColumn/__tests__/SectionsColumn.test.tsx`

**Covers:** AC1, AC5, AC6, AC8, AC9, AC10, AC11

**Changes:**

1. Add a `selectSectionCard({ user, sectionName })` helper to `src/__test-fixtures__/sections/sections.interactions.ts`. It finds the button by its accessible name (the section name) and clicks it. Steps 14, 18, and 19 reuse it.

2. Cover, with the existing `setup()` (loader, column, and both section modals):
   - No card is selected after load, and after a remount.
   - Selecting the second card unselects the first; clicking it again keeps it selected.
   - Creating a section keeps the selection.
   - Deleting the selected section leaves no card selected.
   - Deleting another section keeps the selection.

**Verification:** `npx vitest run src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/SectionsColumn/__tests__/SectionsColumn.test.tsx` passes.

---

### Step 12: Test `PageTypeIcon` and `PageCard`

**New files:**

- `src/pages/ThreadPage/components/PageTypeIcon/__tests__/PageTypeIcon.test.tsx`
- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PagesColumn/components/PageCard/__tests__/PageCard.test.tsx`

**Covers:** AC35, AC36, AC38, AC39, AC40, AC41, AC42, AC43

**Context:** The truncation and tooltip cases reuse the helpers in `src/components/lib/__test-fixtures__/layout` and `tooltip`, as `SectionCard.test.tsx` does.

**Changes:**

1. `PageTypeIcon`: the `chat` type renders `PageTypeIconTestId.chat` with an `svg` inside.

2. `PageCard`:
   - It shows the name, the chat icon before the name, and the page color as its left border color.
   - It has no button (no actions menu, nothing to click).
   - It calls `scrollIntoView` only when `isLastCreated` is set.
   - A truncated name shows a tooltip on hover, and a fitting name shows none.

**Verification:** `npx vitest run src/pages/ThreadPage/components/PageTypeIcon src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PagesColumn/components/PageCard` passes.

---

### Step 13: Test `PageList` and `getSectionPages`

**New files:**

- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PagesColumn/components/PageList/__tests__/PageList.test.tsx`
- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PagesColumn/__tests__/PagesColumn.utils.test.ts`

**Covers:** AC16, AC17

**Changes:**

1. `PageList`: it renders the pages in the given order (`getRenderedPageNames`), and only the last created card scrolls.

2. `getSectionPages`: it returns only the section's pages, in their original order, and `[]` for a section with no pages.

**Verification:** `npx vitest run src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PagesColumn` passes.

---

### Step 14: Test `PagesColumn`

**New files:**

- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PagesColumn/__tests__/PagesColumn.test.tsx`

**Covers:** AC10, AC12, AC13, AC14, AC15, AC16, AC17, AC18, AC45, AC46

**Context:** Like `SectionsColumn.test.tsx`, it renders the real `ThreadPageLoader` with `SectionsColumn` and `PagesColumn` (plus `DeleteSectionModalContainer` for AC10), seeds storage with `seedThreads`, `seedSections`, and `seedPages`, and selects sections with `selectSectionCard`. `PagesColumnContent` is tested through it.

**Changes:**

1. Cover:
   - With no selection, it shows "Select a section to see its pages." and no "Add page" button.
   - After selecting, it shows the "Add page" button next to the heading.
   - It shows "No pages yet." for a section without pages.
   - It lists only the selected section's pages, oldest first, and switching sections switches the list.
   - It lists no page from another thread's section.
   - Deleting the selected section brings back the no-selection message.
   - The list container sits inside the column's scrollable body (`overflowY: auto`).

**Verification:** `npx vitest run src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PagesColumn/__tests__/PagesColumn.test.tsx` passes.

---

### Step 15: Update the `ThreadColumns` test

**File:**
`src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/__tests__/ThreadColumns.test.tsx`

**Covers:** AC12, AC39

**Changes:**

1. Keep the existing assertions on the Pages column heading and message, which are now rendered by `PagesColumn`. Wrap the render in `ThreadPageLoader` if the test does not already provide the contexts. Add an assertion that the Content column still shows "Select a page to see its content."

**Verification:** `npx vitest run src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/__tests__/ThreadColumns.test.tsx` passes.

---

### Step 16: Test `PageForm`

**New files:**

- `src/pages/ThreadPage/components/AddPageModalContainer/components/AddPageModal/components/PageForm/__tests__/PageForm.test.tsx`

**Covers:** AC19, AC22, AC23, AC24, AC57

**Context:** It follows `SectionForm.test.tsx`.

**Changes:**

1. Cover:
   - It renders the required "Page name" input, the "Page type" select showing "Chat", and the "Color" picker.
   - Typing calls `onChange` with the new name.
   - Opening the select lists only "Chat", with the chat icon before the label.
   - Picking a swatch calls `onChange` with that color, and the swatches equal `NORD_AURORA_SWATCHES`.
   - Submitting the form calls `onSubmit`.
   - `disabled` disables all three fields.

**Verification:** `npx vitest run src/pages/ThreadPage/components/AddPageModalContainer/components/AddPageModal/components/PageForm` passes.

---

### Step 17: Test `AddPageModal`

**New files:**

- `src/pages/ThreadPage/components/AddPageModalContainer/components/AddPageModal/__tests__/AddPageModal.test.tsx`

**Covers:** AC19, AC20, AC21, AC25, AC27, AC28, AC30, AC31, AC56, AC57, AC58, AC59

**Context:** It follows `AddSectionModal.test.tsx`, including its `waitForDismissListeners`, `clickOutside`, and pointer-events `setup` option for the Esc and outside-click cases.

**Changes:**

1. Cover:
   - The title is "Add new page", the name field has focus, and the defaults are an empty name, "Chat", and `DEFAULT_SWATCH_COLOR`.
   - Add is disabled for an empty or spaces-only name, and Enter then does not call `onSubmit`.
   - Enter with a valid name calls `onSubmit` with `{ name, type: "chat", color }`.
   - Cancel calls `onClose`.
   - With `isSaving`: Add shows a loading state, all fields are disabled, Enter does not call `onSubmit`, and Esc, an outside click, ×, and Cancel do not call `onClose`.

**Verification:** `npx vitest run src/pages/ThreadPage/components/AddPageModalContainer/components/AddPageModal/__tests__/AddPageModal.test.tsx` passes.

---

### Step 18: Test `AddPageModalContainer`

**New files:**

- `src/pages/ThreadPage/components/AddPageModalContainer/__tests__/AddPageModalContainer.test.tsx`

**Covers:** AC19, AC25, AC26, AC29, AC32, AC33, AC34, AC37, AC38, AC53, AC54, AC55, AC60, AC61

**Context:** It follows `AddSectionModalContainer.test.tsx`: the real `ThreadPageLoader` with `SectionsColumn`, `PagesColumn`, and `AddPageModalContainer`, and `@/services` mocked once with `createServicesMock`. Pending and failing saves use `threadsServiceOverrides.addSectionPage` with `createDeferred`.

**Changes:**

1. Cover:
   - "Add page" opens the modal, and Cancel closes it with no page created. Reopening after typing a name and picking a color shows the defaults.
   - Adding "  Ideas  " closes the modal, shows `Page "Ideas" created.`, removes "No pages yet.", lists "Ideas" last, and scrolls it into view.
   - Two pages named "Ideas" are both listed.
   - A rejected save shows "Couldn't save the page. Please try again.", keeps the modal open with the name, type, and color, and a second Add succeeds.
   - With the section removed from storage (`seedSections` without it, then `dispatchStorageChange`), Add shows the error notification and keeps the modal open. Do the same with the thread removed.

**Verification:** `npx vitest run src/pages/ThreadPage/components/AddPageModalContainer` passes.

---

### Step 19: Test page creation on the thread page

**File:**
`src/pages/ThreadPage/__tests__/ThreadPage.test.tsx`

**Covers:** AC8, AC44, AC45, AC46, AC47, AC48, AC49, AC50, AC52

**Context:** It adds a `describe("creating a page")` block next to `"creating a section"`, with the same route-based `setup`.

**Changes:**

1. Cover:
   - A created page is still listed after a remount, once its section is selected again, with its name, chat icon, and color. No section is selected after the remount.
   - The page is not listed under the thread's other section or in another thread.
   - The stored thread's `totalPages` is 1 after the first page and 2 after a second one in another section, and `lastUpdated` equals the page's `createdAt`. The dashboard's "1 page" and "2 pages" wording is already covered by the `MindThreadCard` tests.
   - Deleting a section that holds 2 of 3 pages leaves `totalPages` at 1 and removes those pages from storage.

**Verification:** `npx vitest run src/pages/ThreadPage/__tests__/ThreadPage.test.tsx` passes, and `npm run test`, `npm run lint`, and `npm run build` all pass.

## Phase 3: Documentation

---

### Step 1: Update `CLAUDE.md`

**File:**
`CLAUDE.md`

**Covers:** AC44, AC50, AC52

**Changes:**

1. In the `src/services/` bullet:
   - Add `addSectionPage` to the methods of `useThreadsService`.
   - Add that `useSectionPagesService` persists pages under the `pages` key.
   - Add that `removeThreadSection` and `deleteThread` also delete the pages of the removed section or thread and update `totalPages`.

2. In the `src/components/shared/` bullet, add `ContrastColorScope` to the examples: it switches its children to light or dark text for a colored background, and is used by the thread header and the selected section card.

3. In the `src/hooks/` bullet, add `useScrollIntoView` to the examples.

**Verification MANUAL:** The three bullets in `CLAUDE.md` match `useThreadsService.ts`, `src/services/useSectionPagesService/`, `src/components/shared/`, and `src/hooks/`.
