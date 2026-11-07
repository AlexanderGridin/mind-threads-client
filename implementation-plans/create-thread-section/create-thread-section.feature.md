# Create a section in a thread

**Source:** `implementation-plans/create-thread-section/create-thread-section.draft.md`

## Acceptance criteria

Opening the form

- AC1: On a loaded thread page, with or without sections, an icon button with a "+" icon is visible next to the "Sections" heading. Hovering over it shows a tooltip "Add section".
- AC2: On the "not found" or load error page, no "Add section" button is shown.
- AC3: Clicking the "+" icon button (tooltip "Add section") opens an "Add new section" modal with a required name field, a color picker, and Add and Cancel buttons.
- AC4: When the modal opens, the name field has keyboard focus.
- AC5: A just-opened modal has an empty name, and the color picker has the same colors and default color as the "Add new thread" modal.
- AC6: Cancel closes the modal and creates no section.
- AC7: After cancelling with a typed name, reopening shows the empty name and the default color.

Name rules

- AC8: With an empty name, Add is disabled.
- AC9: With a name of only spaces, Add is disabled.
- AC10: The name "  Ideas  " is saved as "Ideas".
- AC11: Enter in the name field with a valid name saves the section, the same as Add.
- AC12: Enter with an empty or spaces-only name creates nothing, and the modal stays open.
- AC13: Enter while a save is in progress creates no second section.
- AC14: Two sections named "Ideas" in one thread are both kept.

Creating a section

- AC15: Add with a valid name and color closes the modal.
- AC16: The new section appears as the last card in the Sections list, with its name and its color as the card's left border.
- AC17: After the first section is created, "No sections yet." is no longer shown.
- AC18: Sections are listed in creation order, oldest first.
- AC19: When the list is taller than the column, every section can be reached by scrolling within the column.
- AC20: When the list is taller than the column, a new section's card is scrolled into view.
- AC21: After a section is created, the Pages column still shows "Select a section to see its pages."
- AC22: Clicking a section card does nothing.

Long names

- AC23: A name too long for one line stays on one line and is cut off with an ellipsis.
- AC24: Hovering over a cut-off name shows a tooltip with the full name.
- AC25: Hovering over a name that fits shows no tooltip.

Saved data and the dashboard

- AC26: After a reload, the section is still listed with its name and color.
- AC27: A section created in one thread is not listed in another thread.
- AC28: A thread with its first section shows "1 section" on its dashboard card.
- AC29: A thread with two sections shows "2 sections" on its dashboard card.
- AC30: Creating a section sets the thread's "last updated" time on the dashboard to the moment of creation.
- AC31: Deleting a thread deletes its sections.

Error handling and user feedback

- AC32: When saving "Ideas" completes, a success notification says `Section "Ideas" created.`
- AC33: When the save fails, an error notification says "Couldn't save the section. Please try again."
- AC34: After a failed save, the modal stays open with the entered name and color, and Add can be clicked again.
- AC35: While a save is in progress, the Add button shows a loading state.
- AC36: While a save is in progress, Esc, an outside click, the × button and Cancel leave the modal open.
- AC37: If the thread was deleted in another tab while the modal was open, Add shows the same error notification and the modal stays open.

## Style notes

- The thread page state moves into a `ThreadPageLoader` with a value context and an action context, mirroring `DashboardPageLoader` (files `ThreadPageLoader.tsx`, `.context.ts`, `.hooks.ts`, `.types.ts`, `.constants.ts`, `.utils.ts`). The action provider wraps the value provider, and the context values are inline objects with no `useMemo`, because the React Compiler memoizes them. The project's `.context.ts` file name wins over the `.contexts.ts` name in `react.md` — developer decision; project convention (`src/pages/DashboardPage/components/DashboardPageLoader/`).
- Sections are stored in a new `sections` localStorage key as a flat list of `{ id, threadId, name, color, createdAt }`, in creation order. A separate `useThreadSectionsService` (`src/services/useThreadSectionsService/`) owns the key: `getThreadSections`, `createThreadSection` and `deleteThreadSections` — developer decision.
- `useThreadsService` calls `useThreadSectionsService()` and uses its methods where it needs them: `addThreadSection` (checks the thread, stores the section, updates the thread) and `deleteThread` (removes the thread's sections). `useThreadSectionsService` never calls `useThreadsService`, so there is no cycle. `useThreadsService` imports the sections hook by relative path (`../useThreadSectionsService`), not through the `@/services` barrel — developer decision.
- The UI creates a section only through `useThreadsService().addThreadSection`. `useThreadSectionsService().createThreadSection` only stores a section, and the thread page uses the sections service directly only to read sections when it loads — architecture decision.
- `addThreadSection` writes the section before the thread. The sections list is what grows, so a quota error fails the first write and leaves the thread unchanged. The thread's `lastUpdated` is the created section's `createdAt`, so both come from one timestamp — architecture decision.
- `useLocalStorage` caches what it reads, per hook instance. It now drops the cache when a `storage` event reports a change to its key from another tab, so `addThreadSection` sees a thread deleted in another tab and throws `THREAD_NOT_FOUND_ERROR` (AC37). Same-tab writes through another instance do not fire `storage`, so a hook instance does not re-read after another instance writes. The thread page reads sections only on load, and then keeps them in state — architecture decision.
- Enter submits the section through the form's `onSubmit` event. The modal's Add button is the form's submit button: it renders `type="submit"` and is attached to the form with `form={formId}`, where `formId` comes from `useId()` in `AddSectionModal`. The color picker renders a hidden `type="text"` input, so the form has two text inputs and browsers submit on Enter only through a submit button. A button linked through its `form` attribute counts as the form's default button. While Add is disabled (empty name, or saving), Enter does not submit. The Add button has no click handler in this mode, because the native submit already calls `onSubmit`. The `onSubmit` handler calls `event.preventDefault()`, so the page never reloads — developer decision.
- user-event looks for the implicit-submit button only among the form's descendants, and jsdom has no native implicit submission, so unit tests cannot press Enter to submit this form. Tests check the wiring instead: Add has `type="submit"`, and `addButton.form` is the section form. They submit the form with `fireEvent.submit(form)`, and clicking Add submits it through jsdom's form-owner support. Enter itself is checked manually — architecture decision.
- Lib adapters that need a ref (`Box`, `Input`) use `forwardRef` plus a `displayName`, like `Button` — project convention (`src/components/lib/Button/Button.tsx`).
- The tooltip for cut-off names comes from a new `TruncatedText` lib component. It controls a Chakra tooltip and opens it only when the text overflows (`scrollWidth > clientWidth`), measured when the tooltip asks to open — architecture decision.
- `SectionForm` is a new form next to the section modal. `ThreadForm` is not generalized, because its field, labels and value type are thread-specific. `ThreadFormModalActions` is reused as is, because its props are already generic. The default color is shared through `DEFAULT_SWATCH_COLOR` in `ColorPicker.constants.ts`, so both modals use the same one (AC5) — architecture decision.
- Adapter props are added only as needed, and each adapter keeps its explicit prop list — project convention (previous plans).
- User-visible strings are `UPPER_SNAKE_CASE` constants in `*.constants.ts`. Messages built from a name are `get...` functions in `*.utils.ts`. Test IDs use `initTestIdCreator("<Name>__")` — project convention (`DashboardPageLoader.utils.ts`, `*.constants.ts`).
- `if` bodies always go in braces on their own lines, arrow functions use a block body with an explicit `return`, and `if` checks on falsy values use truthiness. The project's single-line `if`s and implicit-return one-liners are not copied, and existing code is not rewritten unless a step changes it — code guide (`typescript.md` rules 8, 9, 11).
- Functions with two or more parameters take one destructured object — code guide (`typescript.md` rule 3).
- Conditional rendering uses a ternary, event handlers are named `handle<Event>`, and there is no `useMemo`/`useCallback` — project convention (`CLAUDE.md`).

## Phase 1: Implementation

---

### Step 1: Add the section types

**New files:**

- `src/types/ThreadSection.ts`

**File:**
`src/types/index.ts`

**Covers:** AC16, AC26, AC27

**Changes:**

1. Create `src/types/ThreadSection.ts`:

   ```ts
   export type ThreadSection = {
     id: string;
     threadId: string;
     name: string;
     color: string;
     createdAt: string;
   };

   export type ThreadSectionValue = Pick<ThreadSection, "name" | "color">;

   export type NewThreadSection = Pick<ThreadSection, "threadId" | "name" | "color">;
   ```

   `ThreadSectionValue` is what the form edits. `NewThreadSection` is what the services receive.

2. Add `export * from "./ThreadSection";` to `src/types/index.ts`.

**Verification MANUAL:** `npm run ts:check` passes.

---

### Step 2: Drop the useLocalStorage cache when another tab changes the key

**File:**
`src/hooks/useLocalStorage/useLocalStorage.ts`

**Covers:** AC37

**Context:** `read()` returns the cached value once one is set. The thread page reads the threads when it loads, so without this change, a thread deleted in another tab would still be found when the user clicks Add. The browser fires `storage` only in the tabs that did not make the change. `event.key` is `null` when another tab calls `localStorage.clear()`.

**Changes:**

1. Import `useEffect` next to `useRef`.
2. After `cacheRef`, add:

   ```ts
   useEffect(() => {
     const handleStorage = (event: StorageEvent) => {
       if (!event.key || event.key === key) {
         cacheRef.current = null;
       }
     };

     window.addEventListener("storage", handleStorage);

     return () => {
       window.removeEventListener("storage", handleStorage);
     };
   }, [key]);
   ```

**Verification MANUAL:** `npm run ts:check` passes, and the dashboard still loads, adds, edits and deletes threads.

---

### Step 3: Add the thread sections service constants, types and utils

**New files:**

- `src/services/useThreadSectionsService/useThreadSectionsService.constants.ts`
- `src/services/useThreadSectionsService/useThreadSectionsService.types.ts`
- `src/services/useThreadSectionsService/useThreadSectionsService.utils.ts`

**Covers:** AC10, AC14, AC18

**Context:** These follow the file split of `src/services/useThreadsService/`.

**Changes:**

1. `useThreadSectionsService.constants.ts`:

   ```ts
   export const SECTIONS_STORAGE_KEY = "sections";
   export const INVALID_SECTIONS_DATA_ERROR = "Stored sections data is invalid";
   ```

2. `useThreadSectionsService.types.ts`:

   ```ts
   export type UseThreadSectionsServiceReturn = {
     getThreadSections: (threadId: string) => Promise<ThreadSection[]>;
     createThreadSection: (newSection: NewThreadSection) => Promise<ThreadSection>;
     deleteThreadSections: (threadId: string) => Promise<void>;
   };
   ```

3. `useThreadSectionsService.utils.ts`:

   ```ts
   export const buildSection = ({
     threadId,
     name,
     color,
   }: NewThreadSection): ThreadSection => {
     return {
       id: crypto.randomUUID(),
       threadId,
       name: name.trim(),
       color,
       createdAt: new Date().toISOString(),
     };
   };
   ```

   Also add a private `isThreadSection` type guard and an exported `isThreadSectionList`, the same way as `isMindThread` / `isMindThreadList` in `useThreadsService.utils.ts`. They check that `id`, `threadId`, `name`, `color` and `createdAt` are strings.

**Verification MANUAL:** `npm run ts:check` passes.

---

### Step 4: Create the useThreadSectionsService hook

**New files:**

- `src/services/useThreadSectionsService/useThreadSectionsService.ts`
- `src/services/useThreadSectionsService/index.ts`

**File:**
`src/services/index.ts`

**Covers:** AC14, AC16, AC18, AC26, AC27, AC31

**Context:** Sections are appended, so the storage order is the creation order (AC18). Names are not checked for uniqueness (AC14). This service does not know about threads: it does not check that the thread exists and does not update it. `useThreadsService` does both (Steps 6 and 7).

**Changes:**

1. `useThreadSectionsService.ts`:

   ```ts
   export const useThreadSectionsService = (): UseThreadSectionsServiceReturn => {
     const sectionsStorage = useLocalStorage<ThreadSection[]>({
       key: SECTIONS_STORAGE_KEY,
       throwOnError: true,
     });

     const getSections = async (): Promise<ThreadSection[]> => {
       const storedSections = sectionsStorage.read();

       if (!storedSections) {
         return [];
       }

       if (!isThreadSectionList(storedSections)) {
         throw new Error(INVALID_SECTIONS_DATA_ERROR);
       }

       return storedSections;
     };

     const getThreadSections = async (
       threadId: string
     ): Promise<ThreadSection[]> => {
       const storedSections = await getSections();

       return storedSections.filter((section) => {
         return section.threadId === threadId;
       });
     };

     const createThreadSection = async (
       newSection: NewThreadSection
     ): Promise<ThreadSection> => {
       const createdSection = buildSection(newSection);
       const storedSections = await getSections();

       sectionsStorage.set([...storedSections, createdSection]);

       return createdSection;
     };

     const deleteThreadSections = async (threadId: string): Promise<void> => {
       const storedSections = await getSections();

       sectionsStorage.set(
         storedSections.filter((section) => {
           return section.threadId !== threadId;
         })
       );
     };

     return { getThreadSections, createThreadSection, deleteThreadSections };
   };
   ```

   `getSections` is private and not returned.

2. `index.ts`, following `src/services/useThreadsService/index.ts`: export the hook and its return type.
3. Add `export * from "./useThreadSectionsService";` to `src/services/index.ts`.

**Verification MANUAL:** `npm run ts:check` passes.

---

### Step 5: Add the findThread and applyNewSection utils to the threads service

**Files:**
`src/services/useThreadsService/useThreadsService.utils.ts`, `src/services/useThreadsService/useThreadsService.types.ts`

**Covers:** AC28, AC29, AC30

**Changes:**

1. In `useThreadsService.types.ts`, add:

   ```ts
   export type ApplyNewSectionParams = {
     thread: MindThread;
     createdAt: string;
   };

   export type FindThreadParams = {
     threads: MindThread[];
     threadId: string;
   };
   ```

2. In `useThreadsService.utils.ts`, add:

   ```ts
   export const applyNewSection = ({
     thread,
     createdAt,
   }: ApplyNewSectionParams): MindThread => {
     return {
       ...thread,
       totalSections: thread.totalSections + 1,
       lastUpdated: createdAt,
     };
   };

   export const findThread = ({ threads, threadId }: FindThreadParams) => {
     return threads.find((thread) => {
       return thread.id === threadId;
     });
   };
   ```

**Verification MANUAL:** `npm run ts:check` passes.

---

### Step 6: Add addThreadSection to the threads service

**Files:**
`src/services/useThreadsService/useThreadsService.ts`, `src/services/useThreadsService/useThreadsService.types.ts`

**Covers:** AC10, AC14, AC16, AC26, AC28, AC29, AC30, AC37

**Context:** Adding a section changes the thread too, so the threads service runs the whole operation and uses the sections service for the storage part. `findThread` replaces the `find` callback that `getThread` and `updateThread` each repeat today, so all three methods share it.

**Changes:**

1. In `UseThreadsServiceReturn`, add `addThreadSection: (newSection: NewThreadSection) => Promise<ThreadSection>;`.
2. In `useThreadsService.ts`, import the hook by relative path, `import { useThreadSectionsService } from "../useThreadSectionsService";`, and call it below `threadsStorage`:

   ```ts
   const threadSectionsService = useThreadSectionsService();
   ```

3. Add the method:

   ```ts
   const addThreadSection = async (
     newSection: NewThreadSection
   ): Promise<ThreadSection> => {
     const storedThreads = await getThreads();

     const storedThread = findThread({
       threads: storedThreads,
       threadId: newSection.threadId,
     });

     if (!storedThread) {
       throw new Error(THREAD_NOT_FOUND_ERROR);
     }

     const createdSection =
       await threadSectionsService.createThreadSection(newSection);

     threadsStorage.set(
       replaceThread({
         threads: storedThreads,
         updatedThread: applyNewSection({
           thread: storedThread,
           createdAt: createdSection.createdAt,
         }),
       })
     );

     return createdSection;
   };
   ```

4. In `getThread` and `updateThread`, replace the inline `storedThreads.find(...)` with `findThread({ threads: storedThreads, threadId })` (`threadId: threadUpdate.id` in `updateThread`).
5. Add `addThreadSection` to the returned object.

**Verification MANUAL:** `npm run ts:check` passes, and `npm run test -- useThreadsService` still passes.

---

### Step 7: Delete a thread's sections together with the thread

**File:**
`src/services/useThreadsService/useThreadsService.ts`

**Covers:** AC31

**Changes:**

1. In `deleteThread`, after the threads are written, add `await threadSectionsService.deleteThreadSections(threadId);`.

**Verification MANUAL:** `npm run ts:check` passes. In the browser, seed a `sections` entry for a thread, delete the thread on the dashboard, and check that the entry is gone from `localStorage.sections`.

---

### Step 8: Show singular and plural counts on the dashboard card

**New files:**

- `src/pages/DashboardPage/components/DashboardContent/components/MindThreadCard/utils/formatCount.ts`

**Files:**
`src/pages/DashboardPage/components/DashboardContent/components/MindThreadCard/utils/index.ts`, `src/pages/DashboardPage/components/DashboardContent/components/MindThreadCard/MindThreadCard.constants.ts`, `src/pages/DashboardPage/components/DashboardContent/components/MindThreadCard/components/CardContent.tsx`

**Covers:** AC28, AC29

**Context:** The card renders `{thread.totalSections} sections`, which would read "1 sections". The page count uses the same helper, so the card's two counts stay consistent.

**Changes:**

1. Create `formatCount.ts`:

   ```ts
   type FormatCountParams = {
     count: number;
     singular: string;
     plural: string;
   };

   export const formatCount = ({ count, singular, plural }: FormatCountParams) => {
     const noun = count === 1 ? singular : plural;

     return `${count} ${noun}`;
   };
   ```

2. Re-export it from `utils/index.ts`.
3. In `MindThreadCard.constants.ts`, add:

   ```ts
   export const SECTION_COUNT_NOUNS = { singular: "section", plural: "sections" } as const;
   export const PAGE_COUNT_NOUNS = { singular: "page", plural: "pages" } as const;
   ```

4. In `CardContent.tsx`, render `{formatCount({ count: thread.totalSections, ...SECTION_COUNT_NOUNS })}` and `{formatCount({ count: thread.totalPages, ...PAGE_COUNT_NOUNS })}` in place of the two hard-coded strings.

**Verification MANUAL:** On the dashboard, a thread with `totalSections: 1` in localStorage shows "1 section", and one with 2 shows "2 sections".

---

### Step 9: Make the Box adapter forward a ref and add the layout props this feature needs

**File:**
`src/components/lib/Box/Box.tsx`

**Covers:** AC16, AC19, AC20

**Changes:**

1. Add to `BoxProps`: `minHeight?: string; overflowY?: string; gridTemplateRows?: string; borderLeftWidth?: string; borderLeftColor?: string;`.
2. Wrap the component in `forwardRef`, following `Button.tsx`:

   ```tsx
   export const Box = forwardRef<HTMLDivElement, BoxProps>(
     ({ children, ...props }, ref) => {
       return (
         <ChakraBox ref={ref} {...props}>
           {children}
         </ChakraBox>
       );
     }
   );

   Box.displayName = "Box";
   ```

**Verification MANUAL:** `npm run ts:check` passes, and the dashboard and thread pages look the same as before.

---

### Step 10: Make the Input adapter forward a ref

**File:**
`src/components/lib/Input/Input.tsx`

**Covers:** AC4

**Changes:**

1. Wrap the component in `forwardRef<HTMLInputElement, InputProps>`, pass `ref={ref}` to `ChakraInput`, and set `Input.displayName = "Input";`, following `Button.tsx`.

**Verification MANUAL:** `npm run ts:check` passes, and the Add/Edit thread modals still type and save as before.

---

### Step 11: Add the Button size, type and form props, and the VStack alignment, id and onSubmit

**Files:**
`src/components/lib/Button/Button.tsx`, `src/components/lib/VStack/VStack.tsx`

**Covers:** AC1, AC11, AC16

**Changes:**

1. In `ButtonProps`:
   - add `size?: "xs" | "sm" | "md";`, `type?: "button" | "submit";` and `form?: string;`;
   - make `onClick` optional (`onClick?: () => void;`), because a submit button attached to a form needs no click handler.
2. Destructure `size`, `type = "button"` and `form`, and pass them to `ChakraButton`. `size` has no default, so existing buttons keep Chakra's default size. The `"button"` default keeps every existing button from submitting a form by accident.
3. In `VStackProps`:
   - add `"stretch"` to the `alignItems` union;
   - add `id?: string;` and `onSubmit?: (event: FormEvent) => void;` (import `FormEvent` as a type from `react`). Both reach `ChakraVStack` through the props spread, and they are used when the stack renders `as="form"`.

**Verification MANUAL:** `npm run ts:check` passes, and existing buttons look and behave the same.

---

### Step 12: Share the default swatch color

**Files:**
`src/components/lib/ColorPicker/ColorPicker.constants.ts`, `src/pages/DashboardPage/components/AddNewThreadModalContainer/components/AddNewThreadModal/AddNewThreadModal.constants.ts`

**Covers:** AC5

**Changes:**

1. In `ColorPicker.constants.ts`, below `NORD_AURORA_SWATCHES`, add `export const DEFAULT_SWATCH_COLOR = NORD_AURORA_SWATCHES[3];`.
2. In `AddNewThreadModal.constants.ts`, import `DEFAULT_SWATCH_COLOR` from the same file path in place of `NORD_AURORA_SWATCHES`, and use `color: DEFAULT_SWATCH_COLOR`.

**Verification MANUAL:** The "Add new thread" modal still opens with the green default color.

---

### Step 13: Add the TruncatedText lib component

**New files:**

- `src/components/lib/TruncatedText/TruncatedText.tsx`
- `src/components/lib/TruncatedText/TruncatedText.utils.ts`
- `src/components/lib/TruncatedText/TruncatedText.constants.ts`
- `src/components/lib/TruncatedText/index.ts`

**File:**
`src/components/lib/index.ts`

**Covers:** AC23, AC24, AC25

**Context:** Chakra's tooltip cannot open only on overflow by itself. Refusing open requests through a controlled `open` prop does not work: Chakra keeps its own open state, so a refused tooltip can still appear, and a close request can be ignored. Instead, the text is measured on pointer enter, and the tooltip's `disabled` prop is set from that result. While the text fits, Chakra never opens the tooltip. The measurement is taken at each pointer enter, so it is always current, with no `ResizeObserver`.

**Changes:**

1. `TruncatedText.utils.ts`:

   ```ts
   export const isTextTruncated = (element: HTMLElement | null) => {
     if (!element) {
       return false;
     }

     return element.scrollWidth > element.clientWidth;
   };
   ```

2. `TruncatedText.constants.ts`: a `TruncatedTextTestId` with `text` and `tooltip`, built with `initTestIdCreator("TruncatedText__")` from `../utils`.
3. `TruncatedText.tsx`:

   ```tsx
   export type TruncatedTextProps = {
     children: string;
     "data-testid"?: string;
     fontSize?: string;
     fontWeight?: string;
     color?: string;
   };

   export const TruncatedText = ({
     children,
     "data-testid": dataTestId,
     ...textProps
   }: TruncatedTextProps) => {
     const textRef = useRef<HTMLParagraphElement>(null);
     const [isOverflowing, setIsOverflowing] = useState(false);

     const handlePointerEnter = () => {
       setIsOverflowing(isTextTruncated(textRef.current));
     };

     return (
       <ChakraTooltip.Root disabled={!isOverflowing}>
         <ChakraTooltip.Trigger asChild>
           <ChakraText
             ref={textRef}
             data-testid={dataTestId ?? TruncatedTextTestId.text}
             truncate
             onPointerEnter={handlePointerEnter}
             {...textProps}
           >
             {children}
           </ChakraText>
         </ChakraTooltip.Trigger>

         <Portal>
           <ChakraTooltip.Positioner>
             <ChakraTooltip.Content data-testid={TruncatedTextTestId.tooltip}>
               {children}
             </ChakraTooltip.Content>
           </ChakraTooltip.Positioner>
         </Portal>
       </ChakraTooltip.Root>
     );
   };
   ```

   Import `Tooltip as ChakraTooltip`, `Text as ChakraText` and `Portal` from `@chakra-ui/react`, and `useRef` and `useState` from `react`.

4. `index.ts`: `export { TruncatedText, type TruncatedTextProps } from "./TruncatedText";`, and add the same export to `src/components/lib/index.ts`.

**Verification MANUAL:** `npm run ts:check` passes. Temporarily render `<Box width="80px"><TruncatedText>A very long section name</TruncatedText></Box>` on the colors demo page: the text ends in an ellipsis and hovering shows the full name. A short text shows no tooltip. Remove the temporary code afterwards.

---

### Step 14: Let ThreadFormModalActions submit a form by its id

**Files:**
`src/components/shared/ThreadFormModalActions/ThreadFormModalActions.types.ts`, `src/components/shared/ThreadFormModalActions/ThreadFormModalActions.tsx`

**Covers:** AC11, AC35

**Context:** The submit button either calls `onSubmit` on click, as the thread modals use it today, or submits the form whose id it gets. A union type lets callers pass exactly one of the two, so a form-attached button can never submit twice (native submit plus click handler).

**Changes:**

1. In `ThreadFormModalActions.types.ts`, replace the props type with a union:

   ```ts
   type ThreadFormModalActionsBaseProps = {
     submitLabel: string;
     submitDisabled: boolean;
     isSubmitting?: boolean;
     onCancel: () => void;
   };

   type SubmitOnClickProps = {
     onSubmit: () => void;
     formId?: never;
   };

   type SubmitFormProps = {
     formId: string;
     onSubmit?: never;
   };

   export type ThreadFormModalActionsProps = ThreadFormModalActionsBaseProps &
     (SubmitOnClickProps | SubmitFormProps);
   ```

2. In `ThreadFormModalActions.tsx`, destructure `formId` as well, and change the submit `Button`:

   ```tsx
   const submitType = formId ? "submit" : "button";

   // ...
   <Button
     data-testid={ThreadFormModalActionsTestId.submitButton}
     background="accent"
     type={submitType}
     form={formId}
     loading={isSubmitting}
     disabled={submitDisabled || isSubmitting}
     onClick={onSubmit}
   >
   ```

   `onSubmit` is `undefined` when `formId` is set, so the button only submits the form.

**Verification MANUAL:** `npm run ts:check` passes, and the Add/Edit thread modals still save on click.

---

### Step 15: Add the ThreadPageLoader constants, utils, types and contexts

**New files:**

- `src/pages/ThreadPage/components/ThreadPageLoader/ThreadPageLoader.constants.ts`
- `src/pages/ThreadPage/components/ThreadPageLoader/ThreadPageLoader.utils.ts`
- `src/pages/ThreadPage/components/ThreadPageLoader/ThreadPageLoader.types.ts`
- `src/pages/ThreadPage/components/ThreadPageLoader/ThreadPageLoader.context.ts`

**Covers:** AC32, AC33

**Changes:**

1. `ThreadPageLoader.constants.ts`:

   ```ts
   export const SAVE_SECTION_ERROR_MESSAGE =
     "Couldn't save the section. Please try again.";
   ```

2. `ThreadPageLoader.utils.ts`:

   ```ts
   export const getSectionCreatedMessage = (sectionName: string) => {
     return `Section "${sectionName}" created.`;
   };
   ```

3. `ThreadPageLoader.types.ts`:

   ```ts
   export type ThreadPageValue = {
     thread: MindThread | null;
     sections: ThreadSection[];
     threadStatus: ThreadStatusType;
     isAddSectionModalOpen: boolean;
     isSavingSection: boolean;
     lastCreatedSectionId: string | null;
   };

   export type ThreadPageAction = {
     openAddSectionModal: () => void;
     closeAddSectionModal: () => void;
     submitNewSection: (sectionValue: ThreadSectionValue) => Promise<void>;
   };

   export type UseAddSectionParams = {
     addSection: (sectionValue: ThreadSectionValue) => Promise<ThreadSection>;
   };
   ```

   Import `ThreadStatusType` from `@/pages/ThreadPage/ThreadPage.types`.

4. `ThreadPageLoader.context.ts`: `ThreadPageValueContext` and `ThreadPageActionContext`, created with `createContext<... | null>(null)`, following `DashboardPageLoader.context.ts`.

**Verification MANUAL:** `npm run ts:check` passes.

---

### Step 16: Add the ThreadPageLoader hooks

**New files:**

- `src/pages/ThreadPage/components/ThreadPageLoader/ThreadPageLoader.hooks.ts`

**File:**
`src/pages/ThreadPage/ThreadPage.hooks.ts`

**Covers:** AC6, AC15, AC16, AC17, AC18, AC20, AC26, AC27, AC32, AC33, AC34, AC37

**Context:** `useThreadState` moves from `ThreadPage.hooks.ts` into the loader. It reads the sections through `useThreadSectionsService` when it loads, and creates them through `useThreadsService().addThreadSection`. A sections read error puts the page into the existing load error state. The add-section flow follows `useEditThread` in `DashboardPageLoader.hooks.ts`: a saving flag, the modal closes only on success, and the notifications are sent from the hook.

**Changes:**

1. Add `useThreadPageValue` and `useThreadPageAction`, which call `checkContext`, the same way as `useDashboardPageValue` / `useDashboardPageAction`.
2. Move `useThreadState` here from `ThreadPage.hooks.ts`. `ThreadPage.hooks.ts` keeps only `useNavigateToDashboard`, so remove the imports it no longer uses. Extend the moved hook:

   ```ts
   const threadsService = useThreadsService();
   const threadSectionsService = useThreadSectionsService();

   const [sections, setSections] = useState<ThreadSection[]>([]);

   // inside loadThread, replacing the getThread call:
   const storedThread = await threadsService.getThread(threadId);

   const storedSections = storedThread
     ? await threadSectionsService.getThreadSections(threadId)
     : [];

   if (!isActive) {
     return;
   }

   setThread(storedThread);
   setSections(storedSections);
   // ...setThreadStatus as before

   const addSection = async (sectionValue: ThreadSectionValue) => {
     const createdSection = await threadsService.addThreadSection({
       threadId,
       ...sectionValue,
     });

     setSections((currentSections) => {
       return [...currentSections, createdSection];
     });

     return createdSection;
   };

   return { thread, sections, threadStatus, addSection };
   ```

   Add `threadSectionsService` to the effect's dependency list.

3. Add `useAddSection`:

   ```ts
   export const useAddSection = ({ addSection }: UseAddSectionParams) => {
     const [isAddSectionModalOpen, setIsAddSectionModalOpen] = useState(false);
     const [isSavingSection, setIsSavingSection] = useState(false);

     const [lastCreatedSectionId, setLastCreatedSectionId] = useState<
       string | null
     >(null);

     const openAddSectionModal = () => {
       setIsAddSectionModalOpen(true);
     };

     const closeAddSectionModal = () => {
       setIsAddSectionModalOpen(false);
     };

     const submitNewSection = async (sectionValue: ThreadSectionValue) => {
       setIsSavingSection(true);

       try {
         const createdSection = await addSection(sectionValue);

         setLastCreatedSectionId(createdSection.id);
         closeAddSectionModal();
         notify.success(getSectionCreatedMessage(createdSection.name));
       } catch {
         notify.error(SAVE_SECTION_ERROR_MESSAGE);
       } finally {
         setIsSavingSection(false);
       }
     };

     return {
       isAddSectionModalOpen,
       isSavingSection,
       lastCreatedSectionId,
       openAddSectionModal,
       closeAddSectionModal,
       submitNewSection,
     };
   };
   ```

**Verification MANUAL:** `npm run ts:check` fails only in `ThreadPage.tsx`, which still imports `useThreadState` from the old file. Step 19 fixes it.

---

### Step 17: Create the ThreadPageLoader component

**New files:**

- `src/pages/ThreadPage/components/ThreadPageLoader/ThreadPageLoader.tsx`
- `src/pages/ThreadPage/components/ThreadPageLoader/index.ts`

**File:**
`src/pages/ThreadPage/components/index.ts`

**Covers:** AC26, AC27

**Changes:**

1. `ThreadPageLoader.tsx`, following `DashboardPageLoader.tsx`:

   ```tsx
   type ThreadPageLoaderProps = {
     threadId: string;
     children: ReactNode;
   };

   export const ThreadPageLoader = ({ threadId, children }: ThreadPageLoaderProps) => {
     const { thread, sections, threadStatus, addSection } = useThreadState(threadId);

     const {
       isAddSectionModalOpen,
       isSavingSection,
       lastCreatedSectionId,
       openAddSectionModal,
       closeAddSectionModal,
       submitNewSection,
     } = useAddSection({ addSection });

     return (
       <ThreadPageActionContext.Provider
         value={{ openAddSectionModal, closeAddSectionModal, submitNewSection }}
       >
         <ThreadPageValueContext.Provider
           value={{
             thread,
             sections,
             threadStatus,
             isAddSectionModalOpen,
             isSavingSection,
             lastCreatedSectionId,
           }}
         >
           {children}
         </ThreadPageValueContext.Provider>
       </ThreadPageActionContext.Provider>
     );
   };
   ```

2. `index.ts`: export `ThreadPageLoader`, `useThreadPageValue`, `useThreadPageAction`, and the `ThreadPageLoader.constants` and `ThreadPageLoader.utils` exports, in the same shape as `DashboardPageLoader/index.ts`.
3. Add `export * from "./ThreadPageLoader";` to `src/pages/ThreadPage/components/index.ts`.

**Verification MANUAL:** `npm run ts:check` reports only the `ThreadPage.tsx` error from Step 16.

---

### Step 18: Create the ThreadPageLayout component

**New files:**

- `src/pages/ThreadPage/components/ThreadPageLayout/ThreadPageLayout.tsx`
- `src/pages/ThreadPage/components/ThreadPageLayout/index.ts`

**File:**
`src/pages/ThreadPage/components/index.ts`

**Covers:** AC2

**Context:** The current body of `ThreadPage` moves here unchanged, except that it reads `thread` / `threadStatus` from the loader context. `ThreadHeader` and `ThreadContent` keep their props, so their tests do not change.

**Changes:**

1. `ThreadPageLayout.tsx`: move the JSX, the `useDocumentTitle(getThreadPageTitle(...))` call and the `FullScreenLoader` from `ThreadPage.tsx`. Get the data with `const { thread, threadStatus } = useThreadPageValue();`, and import the page constants and utils from `@/pages/ThreadPage/ThreadPage.constants` and `@/pages/ThreadPage/ThreadPage.utils`.
2. `index.ts` re-exports it, and `src/pages/ThreadPage/components/index.ts` adds `export * from "./ThreadPageLayout";`.

**Verification MANUAL:** `npm run ts:check` reports only the `ThreadPage.tsx` error from Step 16.

---

### Step 19: Compose the ThreadPage from the loader and the layout

**File:**
`src/pages/ThreadPage/ThreadPage.tsx`

**Covers:** AC2

**Changes:**

1. Replace the body with:

   ```tsx
   export const ThreadPage = () => {
     const { threadId = "" } = useParams();

     return (
       <ThreadPageLoader threadId={threadId}>
         <ThreadPageLayout />
       </ThreadPageLoader>
     );
   };
   ```

2. Remove the imports that are no longer used.

**Verification MANUAL:** `npm run ts:check` passes. Open a thread, an unknown thread ID, and a thread with malformed `threads` data: each behaves as before (columns, "not found" message, load error message).

---

### Step 20: Create the SectionForm component

**New files:**

- `src/pages/ThreadPage/components/AddSectionModalContainer/components/AddSectionModal/components/SectionForm/SectionForm.tsx`
- `src/pages/ThreadPage/components/AddSectionModalContainer/components/AddSectionModal/components/SectionForm/SectionForm.constants.ts`
- `src/pages/ThreadPage/components/AddSectionModalContainer/components/AddSectionModal/components/SectionForm/index.ts`
- `src/pages/ThreadPage/components/AddSectionModalContainer/components/AddSectionModal/components/index.ts`

**Covers:** AC3, AC4, AC5, AC11, AC12

**Context:** This follows `ThreadForm` (`src/components/shared/ThreadForm/ThreadForm.tsx`), with a `name` field, a ref for the initial focus, and an `id` so the modal's Add button can attach to the form. Enter and Add both fire the form's `onSubmit` event (see Style notes).

**Changes:**

1. `SectionForm.constants.ts`:

   ```ts
   const createTestId = initTestIdCreator("SectionForm__");

   export const SectionFormTestId = {
     form: createTestId("form"),
     nameInput: createTestId("name-input"),
     colorPicker: createTestId("color-picker"),
   } as const;

   export const SECTION_NAME_LABEL = "Section name";
   export const SECTION_NAME_PLACEHOLDER = "Enter section name";
   export const SECTION_COLOR_LABEL = "Color";
   ```

2. `SectionForm.tsx`:

   ```tsx
   type SectionFormProps = {
     formId: string;
     value: ThreadSectionValue;
     nameInputRef: RefObject<HTMLInputElement | null>;
     disabled?: boolean;
     onChange: (value: ThreadSectionValue) => void;
     onSubmit: () => void;
   };

   export const SectionForm = ({
     formId,
     value,
     nameInputRef,
     disabled = false,
     onChange,
     onSubmit,
   }: SectionFormProps) => {
     const handleNameChange = (name: string) => {
       onChange({ ...value, name });
     };

     const handleColorChange = (color: string) => {
       onChange({ ...value, color });
     };

     const handleSubmit = (event: FormEvent) => {
       event.preventDefault();
       onSubmit();
     };

     return (
       <VStack
         data-testid={SectionFormTestId.form}
         id={formId}
         as="form"
         gap="4"
         alignItems="flex-start"
         onSubmit={handleSubmit}
       >
         <Input
           ref={nameInputRef}
           data-testid={SectionFormTestId.nameInput}
           value={value.name}
           label={SECTION_NAME_LABEL}
           required
           placeholder={SECTION_NAME_PLACEHOLDER}
           disabled={disabled}
           onChange={handleNameChange}
         />

         <ColorPicker
           data-testid={SectionFormTestId.colorPicker}
           label={SECTION_COLOR_LABEL}
           value={value.color}
           portal={false}
           fullWidth
           disabled={disabled}
           onChange={handleColorChange}
         />
       </VStack>
     );
   };
   ```

3. Add the `index.ts` barrels for `SectionForm/` and for `AddSectionModal/components/`.

**Verification MANUAL:** `npm run ts:check` passes.

---

### Step 21: Create the AddSectionModal component

**New files:**

- `src/pages/ThreadPage/components/AddSectionModalContainer/components/AddSectionModal/AddSectionModal.tsx`
- `src/pages/ThreadPage/components/AddSectionModalContainer/components/AddSectionModal/AddSectionModal.constants.ts`
- `src/pages/ThreadPage/components/AddSectionModalContainer/components/AddSectionModal/index.ts`
- `src/pages/ThreadPage/components/AddSectionModalContainer/components/index.ts`

**Covers:** AC3, AC4, AC5, AC8, AC9, AC11, AC12, AC13, AC34, AC35, AC36

**Context:** This follows `AddNewThreadModal` and `EditThreadModal` (`closeDisabled`, `isSubmitting`). The form state lives in the modal. The modal unmounts on close, so reopening starts empty (AC7), and it stays mounted after a failed save, so the entered values are kept (AC34). Add is attached to the form through `formId` (from `useId()`), so Add and Enter both fire the form's `onSubmit`, which calls `handleSubmit`. A disabled Add already blocks Enter in the browser (AC12, AC13), and the guard in `handleSubmit` also covers a submit that arrives some other way.

**Changes:**

1. `AddSectionModal.constants.ts`:

   ```ts
   export const ADD_SECTION_MODAL_TITLE = "Add new section";
   export const ADD_SECTION_SUBMIT_LABEL = "Add";

   export const DEFAULT_SECTION_FORM_VALUE: ThreadSectionValue = {
     name: "",
     color: DEFAULT_SWATCH_COLOR,
   };
   ```

   Import `DEFAULT_SWATCH_COLOR` from `@/components/lib/ColorPicker/ColorPicker.constants`.

2. `AddSectionModal.tsx`:

   ```tsx
   type AddSectionModalProps = {
     isSaving: boolean;
     onClose: () => void;
     onSubmit: (sectionValue: ThreadSectionValue) => void;
   };

   export const AddSectionModal = ({ isSaving, onClose, onSubmit }: AddSectionModalProps) => {
     const formId = useId();
     const nameInputRef = useRef<HTMLInputElement>(null);

     const [formValue, setFormValue] = useState<ThreadSectionValue>(
       DEFAULT_SECTION_FORM_VALUE
     );

     const submitDisabled = !formValue.name.trim();

     const handleSubmit = () => {
       if (submitDisabled || isSaving) {
         return;
       }

       onSubmit(formValue);
     };

     return (
       <Dialog
         open
         title={ADD_SECTION_MODAL_TITLE}
         closeDisabled={isSaving}
         initialFocusRef={nameInputRef}
         onClose={onClose}
         content={
           <SectionForm
             formId={formId}
             value={formValue}
             nameInputRef={nameInputRef}
             disabled={isSaving}
             onChange={setFormValue}
             onSubmit={handleSubmit}
           />
         }
         actions={
           <ThreadFormModalActions
             formId={formId}
             submitLabel={ADD_SECTION_SUBMIT_LABEL}
             submitDisabled={submitDisabled}
             isSubmitting={isSaving}
             onCancel={onClose}
           />
         }
       />
     );
   };
   ```

3. Add the `index.ts` barrels for `AddSectionModal/` and `AddSectionModalContainer/components/`.

**Verification MANUAL:** `npm run ts:check` passes.

---

### Step 22: Create the AddSectionModalContainer component

**New files:**

- `src/pages/ThreadPage/components/AddSectionModalContainer/AddSectionModalContainer.tsx`
- `src/pages/ThreadPage/components/AddSectionModalContainer/index.ts`

**File:**
`src/pages/ThreadPage/components/index.ts`

**Covers:** AC3, AC6, AC7, AC15

**Changes:**

1. Following `AddNewThreadModalContainer.tsx`:

   ```tsx
   export const AddSectionModalContainer = () => {
     const { isAddSectionModalOpen, isSavingSection } = useThreadPageValue();
     const { closeAddSectionModal, submitNewSection } = useThreadPageAction();

     return isAddSectionModalOpen ? (
       <AddSectionModal
         isSaving={isSavingSection}
         onClose={closeAddSectionModal}
         onSubmit={submitNewSection}
       />
     ) : null;
   };
   ```

   Import the hooks from `../ThreadPageLoader`.

2. Add the `index.ts` barrel, and `export * from "./AddSectionModalContainer";` in `src/pages/ThreadPage/components/index.ts`.

**Verification MANUAL:** `npm run ts:check` passes.

---

### Step 23: Register the AddSectionModalContainer in the ThreadPage

**File:**
`src/pages/ThreadPage/ThreadPage.tsx`

**Covers:** AC3

**Changes:**

1. Render `<AddSectionModalContainer />` after `<ThreadPageLayout />`, inside `ThreadPageLoader`, the same way `DashboardPage.tsx` renders its modal containers.

**Verification MANUAL:** `npm run ts:check` passes. The page looks the same, because nothing opens the modal yet.

---

### Step 24: Add the ThreadColumnMessage component

**New files:**

- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/ThreadColumnMessage/ThreadColumnMessage.tsx`
- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/ThreadColumnMessage/index.ts`

**File:**
`src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/index.ts`

**Covers:** AC17, AC21

**Context:** In the next step, `ThreadColumn` takes children in place of a `message` prop, because the Sections column shows either a list or a message. This component keeps the muted message style in one place.

**Changes:**

1. Create the component:

   ```tsx
   type ThreadColumnMessageProps = {
     message: string;
   };

   export const ThreadColumnMessage = ({ message }: ThreadColumnMessageProps) => {
     return <Text color="fg.muted">{message}</Text>;
   };
   ```

2. Add the `index.ts` barrel, and re-export it from `ThreadColumns/components/index.ts`.

**Verification MANUAL:** `npm run ts:check` passes.

---

### Step 25: Give ThreadColumn a header action and a scrollable body

**Files:**
`src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/ThreadColumn/ThreadColumn.tsx`, `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/ThreadColumns.tsx`

**Covers:** AC1, AC19, AC21

**Context:** The heading row stays in place while only the body scrolls, so "Add section" stays visible in a long list. The body stretches its children, so the section cards fill the column width.

**Changes:**

1. Replace the `message` prop with `children: ReactNode`, and add `headerAction?: ReactNode`. New render:

   ```tsx
   const alignItems = isCentered ? "center" : "stretch";
   const justifyContent = isCentered ? "center" : "flex-start";

   return (
     <Box
       as="section"
       data-testid={dataTestId}
       display="flex"
       flexDirection="column"
       gap="3"
       p="4"
       minWidth="0"
       minHeight="0"
     >
       {heading ? (
         <HStack justifyContent="space-between" gap="2">
           <Text as="h3" fontSize="md" fontWeight="semibold" color="fg">
             {heading}
           </Text>

           {headerAction}
         </HStack>
       ) : null}

       <Box
         display="flex"
         flexDirection="column"
         alignItems={alignItems}
         justifyContent={justifyContent}
         flexGrow={1}
         minHeight="0"
         overflowY="auto"
       >
         {children}
       </Box>
     </Box>
   );
   ```

2. In `ThreadColumns.tsx`, pass each message as `<ThreadColumnMessage message={...} />` children, in place of the `message` prop, for all three columns. The Sections column is replaced in Step 29.

**Verification MANUAL:** The thread page looks the same as before: headings on the first two columns and a centered message in the third.

---

### Step 26: Create the SectionCard component

**New files:**

- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/SectionsColumn/components/SectionCard/SectionCard.tsx`
- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/SectionsColumn/components/SectionCard/SectionCard.constants.ts`
- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/SectionsColumn/components/SectionCard/index.ts`

**Covers:** AC16, AC20, AC22, AC23, AC24, AC25

**Context:** The card has no click handler and no pointer cursor (AC22). It scrolls itself into view when it is the section just created. `block: "nearest"` scrolls only the column body, and only when the card is out of view.

**Changes:**

1. `SectionCard.constants.ts`: `SectionCardTestId` with `container` and `name`, built with `initTestIdCreator("SectionCard__")`.
2. `SectionCard.tsx`:

   ```tsx
   type SectionCardProps = {
     section: ThreadSection;
     isLastCreated: boolean;
   };

   export const SectionCard = ({ section, isLastCreated }: SectionCardProps) => {
     const cardRef = useRef<HTMLDivElement>(null);

     useEffect(() => {
       if (isLastCreated) {
         cardRef.current?.scrollIntoView({ block: "nearest" });
       }
     }, [isLastCreated]);

     return (
       <Box
         ref={cardRef}
         data-testid={SectionCardTestId.container}
         p="3"
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
       </Box>
     );
   };
   ```

3. Add the `index.ts` barrel.

**Verification MANUAL:** `npm run ts:check` passes.

---

### Step 27: Create the SectionList component

**New files:**

- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/SectionsColumn/components/SectionList/SectionList.tsx`
- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/SectionsColumn/components/SectionList/SectionList.constants.ts`
- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/SectionsColumn/components/SectionList/index.ts`

**Covers:** AC16, AC18

**Changes:**

1. `SectionList.constants.ts`: `SectionListTestId` with `container`, built with `initTestIdCreator("SectionList__")`.
2. `SectionList.tsx` is presentational. It renders the sections in the order it gets them:

   ```tsx
   type SectionListProps = {
     sections: ThreadSection[];
     lastCreatedSectionId: string | null;
   };

   export const SectionList = ({ sections, lastCreatedSectionId }: SectionListProps) => {
     return (
       <VStack data-testid={SectionListTestId.container} gap="2" alignItems="stretch">
         {sections.map((section) => {
           return (
             <SectionCard
               key={section.id}
               section={section}
               isLastCreated={section.id === lastCreatedSectionId}
             />
           );
         })}
       </VStack>
     );
   };
   ```

   Import `SectionCard` from `../SectionCard`.

3. Add the `index.ts` barrel.

**Verification MANUAL:** `npm run ts:check` passes.

---

### Step 28: Create the shared AddIconButton component

**Revised during Phase 1:** the "Add section" text button is replaced by a shared icon button. The `AddSectionButton` component is not created.

**New files:**

- `src/components/lib/AddIconButton/AddIconButton.tsx`
- `src/components/lib/AddIconButton/index.ts`

**Files:**

- `src/components/lib/index.ts`
- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/ThreadColumns.constants.ts` (adds `ADD_SECTION_BUTTON_LABEL` and `ThreadColumnsTestId.addSectionButton`)
- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/SectionsColumn/SectionsColumn.tsx`
- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/SectionsColumn/components/index.ts`

**Covers:** AC1, AC3

**Changes:**

1. `AddIconButton.tsx` is a lib adapter. It renders the lib `IconButton` (`variant="outline"`, `size="xs"`) with a `LuPlus` icon from `react-icons/lu`, inside a Chakra tooltip that shows `tooltipLabel` on hover. `tooltipLabel` is also the `aria-label`. Props: `tooltipLabel: string`, `onClick: () => void`, `"data-testid"?: string`. The component has no app logic, so the next feature (add-section page) can reuse it with its own label.
2. Export it from `src/components/lib/index.ts`.
3. In `ThreadColumns.constants.ts`, add `export const ADD_SECTION_BUTTON_LABEL = "Add section";` and `addSectionButton: createTestId("add-section-button")` to `ThreadColumnsTestId`.
4. `SectionsColumn.tsx` renders `<AddIconButton tooltipLabel={ADD_SECTION_BUTTON_LABEL} onClick={openAddSectionModal} />` as the `headerAction`, with `openAddSectionModal` from `useThreadPageAction()`.
5. Remove the `AddSectionButton` export from `SectionsColumn/components/index.ts`.

**Verification MANUAL:** `npm run ts:check` passes.

---

### Step 29: Create the SectionsColumn and use it in ThreadColumns

**New files:**

- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/SectionsColumn/SectionsColumn.tsx`
- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/SectionsColumn/index.ts`

**Files:**
`src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/index.ts`, `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/ThreadColumns.tsx`

**Covers:** AC1, AC2, AC16, AC17, AC18, AC20

**Context:** `ThreadView` renders `ThreadColumns` only in the `Loaded` status, so the button never shows on the "not found" or load error page (AC2).

**Changes:**

1. `SectionsColumn.tsx`:

   ```tsx
   export const SectionsColumn = () => {
     const { sections, lastCreatedSectionId } = useThreadPageValue();

     return (
       <ThreadColumn
         data-testid={ThreadColumnsTestId.sectionsColumn}
         heading={SECTIONS_COLUMN_HEADING}
         headerAction={<AddSectionButton />}
       >
         {sections.length ? (
           <SectionList sections={sections} lastCreatedSectionId={lastCreatedSectionId} />
         ) : (
           <ThreadColumnMessage message={SECTIONS_COLUMN_MESSAGE} />
         )}
       </ThreadColumn>
     );
   };
   ```

   Import the constants from `../../ThreadColumns.constants`, and `ThreadColumn` / `ThreadColumnMessage` from their sibling folders.

2. Add the `index.ts` barrel, and re-export `SectionsColumn` from `ThreadColumns/components/index.ts`.
3. In `ThreadColumns.tsx`, replace the first `ThreadColumn` with `<SectionsColumn />`, and remove the imports that are no longer used.

**Verification MANUAL:** On a loaded thread, the "+" icon button is next to "Sections", and hovering over it shows "Add section". Creating "  Ideas  " closes the modal, shows `Section "Ideas" created.`, and adds an "Ideas" card with a colored left border in place of "No sections yet.". Enter in the name field also saves (the page does not reload), and the section is still there after a reload.

---

### Step 30: Let the thread columns fill the viewport height and scroll on their own

**Files:**
`src/pages/ThreadPage/components/ThreadPageLayout/ThreadPageLayout.tsx`, `src/pages/ThreadPage/components/ThreadContent/ThreadContent.tsx`, `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/ThreadColumns.tsx`, `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/ThreadColumns.constants.ts`

**Covers:** AC19, AC20

**Context:** `#root` is 100% high and a flex column, but flex and grid items default to `min-height: auto`, so a long list would stretch the page instead of scrolling inside the column. Every ancestor between `#root` and the column body needs `minHeight="0"`, and the grid needs one row that may shrink.

**Changes:**

1. Add `minHeight="0"` to the container `Box` in `ThreadPageLayout.tsx` and to the `main` `Box` in `ThreadContent.tsx`.
2. In `ThreadColumns.constants.ts`, add `export const THREAD_COLUMNS_ROWS_TEMPLATE = "minmax(0, 1fr)";`.
3. In `ThreadColumns.tsx`, add `gridTemplateRows={THREAD_COLUMNS_ROWS_TEMPLATE}` and `minHeight="0"` to the grid `Box`.

**Verification MANUAL:** Create sections until the list is taller than the window. The page itself does not scroll vertically, the Sections column scrolls with the heading and "Add section" still visible, and every new section's card is scrolled into view. A name too long for the card ends in an ellipsis and shows a tooltip on hover.

## Phase 2: Unit tests

---

### Step 1: Add the shared section fixtures and test helpers

**New files:**

- `src/__test-fixtures__/sections.ts`
- `src/components/lib/__test-fixtures__/layout.ts`

**Files:**
`src/__test-fixtures__/index.ts`, `src/__test-fixtures__/storage.ts`, `src/__test-fixtures__/threadsService.ts`, `src/components/lib/__test-fixtures__/index.ts`, `vitest.setup.ts`

**Covers:** AC16, AC18, AC20, AC24, AC25, AC26, AC27, AC33, AC37

**Changes:**

1. `sections.ts`: `threadSectionFixtures: ThreadSection[]` with two sections of `mindThreadFixtures[0]` (oldest first) and one of `mindThreadFixtures[1]`, with distinct names and colors. Export it from `src/__test-fixtures__/index.ts`.
2. `storage.ts`: add `seedSections(sections: ThreadSection[])`, using `SECTIONS_STORAGE_KEY` from `@/services/useThreadSectionsService/useThreadSectionsService.constants`, next to `seedThreads`.
3. `threadsService.ts`: add `addThreadSection` to `ThreadsServiceOverrides`, `resetThreadsServiceOverrides` and the `useThreadsService` wrapper in `createServicesMock`, the same way as the existing overrides. `useThreadSectionsService` is not wrapped: tests drive it through seeded or malformed `sections` data.
4. `layout.ts`: `stubTextOverflow({ isOverflowing }: { isOverflowing: boolean })`, which uses `vi.spyOn(HTMLElement.prototype, "scrollWidth", "get")` and `"clientWidth"` to return `200`/`100` (overflowing) or `100`/`100`. Export it from the lib fixtures `index.ts`.
5. `vitest.setup.ts`: jsdom has no `scrollIntoView`, so add `Element.prototype.scrollIntoView = vi.fn();` next to the `ResizeObserver` stub.

**Verification:** `npm run test` still passes (no behavior changes).

---

### Step 2: Test the useLocalStorage cache invalidation

**File:**
`src/hooks/useLocalStorage/__tests__/useLocalStorage.test.ts`

**Covers:** AC37

**Changes:** In a new `describe("cache invalidation")` block, using the file's existing `setupHook()`:

1. After a `read()`, write a new value with `localStorage.setItem` and dispatch `new StorageEvent("storage", { key })`: the next `read()` returns the new value.
2. A `StorageEvent` with `key: null` also drops the cache.
3. A `StorageEvent` for another key keeps the cached value.
4. After unmount, a `StorageEvent` no longer drops the cache (the listener is removed).

**Verification:** `npm run test -- useLocalStorage` passes.

---

### Step 3: Test the thread sections service utils

**New files:**

- `src/services/useThreadSectionsService/__tests__/useThreadSectionsService.utils.test.ts`

**Covers:** AC10

**Changes:**

1. `buildSection`: trims "  Ideas  " to "Ideas", keeps `threadId` and `color`, sets `createdAt` to the current time (`vi.useFakeTimers()` / `vi.setSystemTime`), and gives each call a fresh `id` (spy on `crypto.randomUUID` the way the `buildThread` tests do).
2. `isThreadSectionList`: true for valid lists and `[]`; false for a non-array, `null` items, and items with a missing or wrong-typed field.

**Verification:** `npm run test -- useThreadSectionsService.utils` passes.

---

### Step 4: Test the thread sections service

**New files:**

- `src/services/useThreadSectionsService/__tests__/useThreadSectionsService.test.ts`

**Covers:** AC14, AC16, AC18, AC26, AC27, AC31

**Changes:** Use a `setupHook()` that renders `useThreadSectionsService` with `renderHook`, following `useThreadsService.test.ts`, and seed data with `seedSections`:

1. `getThreadSections`: returns `[]` when nothing is stored, returns only the given thread's sections in stored order, and throws `INVALID_SECTIONS_DATA_ERROR` for malformed data (`MALFORMED_JSON` and a non-section array).
2. `createThreadSection`: appends the trimmed section after the existing ones, returns it, and stores two sections with the same name side by side.
3. `deleteThreadSections`: removes the given thread's sections and keeps the others.

**Verification:** `npm run test -- useThreadSectionsService.test` passes.

---

### Step 5: Test the new threads service utils

**File:**
`src/services/useThreadsService/__tests__/useThreadsService.utils.test.ts`

**Covers:** AC28, AC29, AC30

**Changes:** Add `describe` blocks:

1. `applyNewSection`: increments `totalSections` from 0 to 1 and from 1 to 2, sets `lastUpdated` to `createdAt`, and keeps the other fields (`toStrictEqual`).
2. `findThread`: returns the matching thread, or `undefined`.

**Verification:** `npm run test -- useThreadsService.utils` passes.

---

### Step 6: Test addThreadSection and deleteThread in the threads service

**File:**
`src/services/useThreadsService/__tests__/useThreadsService.test.ts`

**Covers:** AC16, AC26, AC28, AC29, AC30, AC31, AC37

**Changes:** Using `seedThreads` / `seedSections`, with the real sections service underneath:

1. `addThreadSection`: stores the trimmed section in the `sections` key and returns it. It sets the thread's `totalSections` to 1 and then 2, and its `lastUpdated` to the returned section's `createdAt` (fake system time). Other threads are untouched.
2. `addThreadSection` with an unknown `threadId` throws `THREAD_NOT_FOUND_ERROR` and stores no section.
3. `addThreadSection` after another tab removed the thread: read once through the hook, overwrite `threads` with `localStorage.setItem`, dispatch a `StorageEvent` for `THREADS_STORAGE_KEY`, and expect `THREAD_NOT_FOUND_ERROR`.
4. `deleteThread` removes that thread's sections from the `sections` key and keeps the other threads' sections.

**Verification:** `npm run test -- useThreadsService.test` passes.

---

### Step 7: Test formatCount and the card counts

**New files:**

- `src/pages/DashboardPage/components/DashboardContent/components/MindThreadCard/utils/__tests__/formatCount.test.ts`

**File:**
`src/pages/DashboardPage/components/DashboardContent/components/MindThreadCard/__tests__/MindThreadCard.test.tsx`

**Covers:** AC28, AC29

**Changes:**

1. `formatCount`: 0 → "0 sections", 1 → "1 section", 2 → "2 sections".
2. `MindThreadCard`: a thread with `totalSections: 1` shows "1 section", and one with 2 shows "2 sections" (spread `mindThreadFixture` with the override). Update any existing assertion that the new wording changes.

**Verification:** `npm run test -- MindThreadCard formatCount` passes.

---

### Step 8: Test the extended adapters

**Files:**
`src/components/lib/Box/__tests__/Box.test.tsx`, `src/components/lib/Input/__tests__/Input.test.tsx`, `src/components/lib/Button/__tests__/Button.test.tsx`, `src/components/lib/VStack/__tests__/VStack.test.tsx`

**Covers:** AC4, AC11, AC20

**Changes:**

1. `Box`: a ref passed to `Box` points to the rendered element.
2. `Input`: a ref passed to `Input` points to the `<input>`.
3. `Button`:
   - renders with `size="xs"` and still calls `onClick`;
   - has `type="button"` by default;
   - with `type="submit"` and `form="<id>"`, it is attached to the form with that id (`button.form` is the form), and clicking it submits that form even when the button sits outside it.
4. `VStack`: rendered `as="form"` with an `id`, it has that id and calls `onSubmit` when the form is submitted (`fireEvent.submit`).

**Verification:** `npm run test -- src/components/lib` passes.

---

### Step 9: Test the TruncatedText component

**New files:**

- `src/components/lib/TruncatedText/__tests__/TruncatedText.test.tsx`
- `src/components/lib/TruncatedText/__tests__/TruncatedText.utils.test.ts`

**Covers:** AC23, AC24, AC25

**Changes:**

1. `isTextTruncated`: false for `null`, true when `scrollWidth > clientWidth`, false when they are equal (use `stubTextOverflow`).
2. `TruncatedText`, with a `setup({ isOverflowing = false } = {})` that calls `stubTextOverflow`, `userEvent.setup()` and `renderWithUIProvider` (relative import inside the lib):
   - renders the text;
   - when overflowing, hovering shows the tooltip with the full text (`await screen.findByTestId(TruncatedTextTestId.tooltip)`);
   - when not overflowing, hovering shows no tooltip, even after the open delay has passed;
   - unhovering hides the tooltip again (`waitForElementToBeRemoved`).

**Verification:** `npm run test -- TruncatedText` passes.

---

### Step 10: Test the form mode of ThreadFormModalActions

**File:**
`src/components/shared/ThreadFormModalActions/__tests__/ThreadFormModalActions.test.tsx`

**Covers:** AC11, AC35

**Changes:** Extend the file's `setup` with an optional `formId`, and render a `<form id={formId} onSubmit={submitSpy}>` next to the actions when it is given:

1. Without `formId` (existing tests): the submit button has `type="button"`, and clicking it calls `onSubmit`.
2. With `formId`: the submit button has `type="submit"`, `button.form` is the form, and clicking it fires the form's submit spy once.
3. With `formId` and `submitDisabled` or `isSubmitting`: the button is disabled, and clicking it does not fire the submit spy.

**Verification:** `npm run test -- ThreadFormModalActions` passes.

---

### Step 11: Test the ThreadPageLoader utils and hooks

**New files:**

- `src/pages/ThreadPage/components/ThreadPageLoader/__tests__/ThreadPageLoader.utils.test.ts`
- `src/pages/ThreadPage/components/ThreadPageLoader/__tests__/ThreadPageLoader.hooks.test.tsx`

**File:**
`src/pages/ThreadPage/__tests__/ThreadPage.hooks.test.tsx`

**Covers:** AC15, AC16, AC18, AC26, AC27, AC32, AC33, AC34, AC37

**Changes:**

1. `getSectionCreatedMessage("Ideas")` returns `Section "Ideas" created.`.
2. Move the `describe("useThreadState")` block from `ThreadPage.hooks.test.tsx` into `ThreadPageLoader.hooks.test.tsx`. Leave only the `useNavigateToDashboard` tests in the old file. Extend `useThreadState` with: it loads only this thread's sections in order; `sections` is `[]` for an unknown thread; malformed `sections` data gives the `Error` status; `addSection` appends the created section and returns it.
3. `useAddSection` (`setupHook` with a `vi.fn()` `addSection`): `open`/`close` toggle `isAddSectionModalOpen`. While `submitNewSection` waits on a deferred `addSection`, `isSavingSection` is true. On success, the modal closes, `lastCreatedSectionId` is set and the success notification appears. On rejection, the modal stays open, `isSavingSection` returns to false and `SAVE_SECTION_ERROR_MESSAGE` appears.
4. `useThreadPageValue` / `useThreadPageAction` throw outside the provider.

**Verification:** `npm run test -- ThreadPageLoader ThreadPage.hooks` passes.

---

### Step 12: Test the ThreadPageLayout

**New files:**

- `src/pages/ThreadPage/components/ThreadPageLayout/__tests__/ThreadPageLayout.test.tsx`

**Covers:** AC2

**Changes:** Render `<ThreadPageLoader threadId=...><ThreadPageLayout /></ThreadPageLoader>` with `renderWithRouter`. Check that the loader is shown while loading, that the columns show for a stored thread, and that the "not found" message shows for an unknown ID. Detailed page behavior stays in `ThreadPage.test.tsx`.

**Verification:** `npm run test -- ThreadPageLayout` passes.

---

### Step 13: Test the SectionForm

**New files:**

- `src/pages/ThreadPage/components/AddSectionModalContainer/components/AddSectionModal/components/SectionForm/__tests__/SectionForm.test.tsx`

**Covers:** AC3, AC11, AC12

**Changes:** Use a `setup({ value, disabled })` with a fixed `formId`, `vi.fn()` handlers and a `createRef`:

1. It renders the required "Section name" input and the color picker, and the form has the given `id`.
2. Typing calls `onChange` with the new name, keeping the color.
3. Submitting the form (`fireEvent.submit(form)`) calls `onSubmit` once, and prevents the default submission (`fireEvent.submit` returns `false`).
4. `disabled` disables the input.
5. The ref points to the name input.

**Verification:** `npm run test -- SectionForm` passes.

---

### Step 14: Test the AddSectionModal

**New files:**

- `src/pages/ThreadPage/components/AddSectionModalContainer/components/AddSectionModal/__tests__/AddSectionModal.test.tsx`

**Covers:** AC3, AC4, AC5, AC8, AC9, AC11, AC12, AC13, AC34, AC35, AC36

**Changes:** Use a `setup({ isSaving = false } = {})` with `vi.fn()` `onClose`/`onSubmit`, and use `stubLayout` so that Zag can move focus:

1. The title "Add new section", an empty name, the Add and Cancel buttons, and the color equal to `DEFAULT_SWATCH_COLOR` (the same constant `AddNewThreadModal` uses).
2. The name input has focus after opening.
3. Add has `type="submit"` and is attached to the section form (`addButton.form` is the element with `SectionFormTestId.form`). This wiring is what makes Enter submit in a browser; see Style notes for why the test does not press Enter.
4. Add is disabled for an empty name and for spaces only, and a form submit (`fireEvent.submit`) then does not call `onSubmit`.
5. Clicking Add, and submitting the form, each call `onSubmit` once with the typed value.
6. With `isSaving`, Add shows the loading state, Cancel is disabled, a form submit does not call `onSubmit`, and Esc, `clickOutside` and the × button do not call `onClose`.
7. Re-rendering with `isSaving` going from true to false keeps the typed name and color (AC34).

**Verification:** `npm run test -- AddSectionModal.test` passes.

---

### Step 15: Test the AddSectionModalContainer

**New files:**

- `src/pages/ThreadPage/components/AddSectionModalContainer/__tests__/AddSectionModalContainer.test.tsx`

**Covers:** AC6, AC7, AC15, AC32, AC33

**Changes:** Render it inside `ThreadPageLoader` (stored thread seeded), together with `AddSectionButton`, so that the real context drives it:

1. The modal is hidden at first and opens on "Add section".
2. Cancel closes it and stores no section.
3. Reopening after typing and cancelling shows an empty name.
4. A successful Add closes the modal and shows the success notification.
5. A failed Add (`threadsServiceOverrides.addThreadSection` rejecting) keeps it open and shows the error notification.

**Verification:** `npm run test -- AddSectionModalContainer` passes.

---

### Step 16: Test ThreadColumnMessage and the updated ThreadColumn

**New files:**

- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/ThreadColumnMessage/__tests__/ThreadColumnMessage.test.tsx`

**File:**
`src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/ThreadColumn/__tests__/ThreadColumn.test.tsx`

**Covers:** AC1, AC19, AC21

**Changes:**

1. `ThreadColumnMessage` renders its message.
2. Update the `ThreadColumn` tests from the `message` prop to children. Add tests: `headerAction` renders next to the heading, no header row renders without a heading, and the children render inside the body.

**Verification:** `npm run test -- ThreadColumn` passes.

---

### Step 17: Test the SectionCard

**New files:**

- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/SectionsColumn/components/SectionCard/__tests__/SectionCard.test.tsx`

**Covers:** AC16, AC20, AC22, AC23, AC24, AC25

**Changes:**

1. It renders the section name, and its left border color is the section color (`toHaveStyle`).
2. With `isLastCreated`, it calls `scrollIntoView` with `{ block: "nearest" }`. Without it, it does not.
3. Clicking the card changes nothing: no navigation and no modal.
4. With `stubTextOverflow({ isOverflowing: true })`, hovering the name shows the full-name tooltip. Without overflow, no tooltip.

**Verification:** `npm run test -- SectionCard` passes.

---

### Step 18: Test the SectionList

**New files:**

- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/SectionsColumn/components/SectionList/__tests__/SectionList.test.tsx`

**Covers:** AC16, AC18

**Changes:**

1. It renders one card per section, in the given order (compare the names of `getAllByTestId(SectionCardTestId.name)`).
2. Only the card whose id equals `lastCreatedSectionId` calls `scrollIntoView`.

**Verification:** `npm run test -- SectionList` passes.

---

### Step 19: Test the AddSectionButton

**New files:**

- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/SectionsColumn/components/AddSectionButton/__tests__/AddSectionButton.test.tsx`

**Covers:** AC1, AC3

**Changes:** Render it inside a `ThreadPageLoader` together with `AddSectionModalContainer`: the "Add section" button is shown, and clicking it opens the "Add new section" modal.

**Verification:** `npm run test -- AddSectionButton` passes.

---

### Step 20: Test the SectionsColumn and the updated ThreadColumns

**New files:**

- `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/SectionsColumn/__tests__/SectionsColumn.test.tsx`

**File:**
`src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/__tests__/ThreadColumns.test.tsx`

**Covers:** AC1, AC17, AC18, AC21

**Changes:**

1. `SectionsColumn` inside `ThreadPageLoader`: with no stored sections, it shows the heading, "Add section" and "No sections yet."; with seeded sections, it shows the cards in order and no message.
2. `ThreadColumns`: now that the Sections column reads the loader context, wrap the render in `ThreadPageLoader`. Keep the existing assertions for the Pages and Content columns, including "Select a section to see its pages.".

**Verification:** `npm run test -- SectionsColumn ThreadColumns` passes.

---

### Step 21: Extend the ThreadPage tests with the create-section flow

**File:**
`src/pages/ThreadPage/__tests__/ThreadPage.test.tsx`

**Covers:** AC1, AC2, AC4, AC10, AC11, AC14, AC15, AC16, AC17, AC20, AC21, AC26, AC27, AC32, AC33, AC34, AC35, AC36, AC37

**Changes:** Add a `describe("creating a section")` block, using the file's `setup` and mocks plus small helpers such as `openAddSectionModal(user)` and `typeSectionName(user, name)`:

1. "Add section" shows for a loaded thread with and without sections, and is absent in the "not found" and load error states.
2. Creating "  Ideas  " closes the modal, shows `Section "Ideas" created.`, adds the "Ideas" card last, hides "No sections yet.", keeps the Pages message, and calls `scrollIntoView` on the new card.
3. Typing a name and submitting the section form (`fireEvent.submit`, which stands in for Enter) creates the section the same way.
4. Creating two sections named "Ideas" shows two cards.
5. After `unmount()` and a new `setup()` (a reload), the sections are still listed. They are not listed for another thread.
6. While `addThreadSection` waits on a deferred, Add is loading and Esc keeps the modal open. A rejection then keeps the modal open with the name and shows "Couldn't save the section. Please try again.".
7. If the thread is removed from `threads` with a `StorageEvent` while the modal is open, Add shows the error notification and the modal stays open.

**Verification:** `npm run test -- ThreadPage.test` passes.

---

### Step 22: Test the dashboard after creating and deleting sections

**File:**
`src/__tests__/App.test.tsx`

**Covers:** AC28, AC29, AC30, AC31

**Changes:** Following the file's existing setup, starting on the dashboard with one seeded thread with 0 sections:

1. Open the thread, create a section, and go back: the card shows "1 section" and the updated time of the creation moment (fake system time).
2. Create a second section: the card shows "2 sections".
3. Delete the thread from the dashboard: `localStorage` `sections` no longer contains its sections.

**Verification:** `npm run test -- App.test` passes, then the whole suite passes with `npm run test`.

## Phase 3: Documentation

---

### Step 1: Document the sections data and the thread page state in CLAUDE.md

**File:**
`CLAUDE.md`

**Covers:** AC26, AC31, AC37

**Changes:**

1. Folder structure, `src/services/` bullet: add `useThreadSectionsService` (`getThreadSections`, `createThreadSection`, `deleteThreadSections`; stored in `localStorage` under the `sections` key), and add `addThreadSection` to the `useThreadsService` methods. Say that `useThreadsService` calls `useThreadSectionsService` to add sections (checking the thread and updating its `totalSections` and `lastUpdated`) and to delete a thread's sections, that the sections service never calls the threads service, and that the UI creates sections through `addThreadSection`.
2. Folder structure, `src/hooks/` bullet: note that `useLocalStorage` caches what it reads per hook instance, and drops the cache when another tab changes the key (`storage` event).
3. Folder structure, `src/pages/` bullet: note that `ThreadPage` state lives in `ThreadPageLoader` (value and action contexts, like `DashboardPageLoader`).

**Verification MANUAL:** Read the updated bullets, and check that they match the code and do not repeat each other.

---

### Step 2: Document the new and extended adapters in CLAUDE.md

**File:**
`CLAUDE.md`

**Covers:** AC4, AC11, AC23, AC24, AC25

**Changes:**

1. In the "Adapter props worth knowing" paragraph, add:
   - `Box` and `Input` forward a ref.
   - `Button` accepts `size`, `type` (default `"button"`) and `form`, and its `onClick` is optional.
   - `VStack` accepts `alignItems="stretch"`, plus `id` and `onSubmit` (with `as="form"`).
   - `TruncatedText` renders one line with an ellipsis, and shows a tooltip with the full text only when the text is cut off.
2. In the `src/components/shared/` bullet, note that `ThreadFormModalActions` takes either `onSubmit` (the submit button calls it on click) or `formId` (the submit button becomes `type="submit"` for the form with that id, so Enter in the form submits it too). Note also that unit tests cannot press Enter to submit a form through a button outside it, and use `fireEvent.submit` instead.
3. Mention `DEFAULT_SWATCH_COLOR` in `ColorPicker.constants.ts` as the default color for color forms.

**Verification MANUAL:** Read the paragraph, and check that every prop named exists in the adapters.
