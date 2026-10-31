# Edit a thread from the dashboard

**Source:** `implementation-plans/edit-thread-from-dashboard/edit-thread-from-dashboard.draft.md`

## Acceptance criteria

Criteria are numbered in the order they appear in the story. The "Delete a thread from the dashboard" story has shipped, so the actions menu, its keyboard and dismiss behaviour (`Menu` adapter) and the trigger label (`getThreadActionsLabel`) already exist. This plan adds the "Edit" item to the menu.

- AC1: Grid view: every card shows the three-dots "Thread actions" button in its top-right corner. (Already shipped.)
- AC2: List view: every card shows the same button. (Already shipped.)
- AC3: Delete not shipped: the menu has only "Edit". (Not applicable: Delete has shipped.)
- AC4: Delete shipped: the menu has exactly "Edit", "Delete", in that order.
- AC5: Clicking the three-dots button does not open the thread. (Already shipped.)
- AC6: Clicking "Edit" does not open the thread.
- AC7: Clicking "Edit" closes the actions menu.
- AC8: Clicking "Edit" for "Testing Strategy" opens the edit modal for that thread.
- AC9: Esc closes the actions menu. (Already shipped.)
- AC10: Clicking outside closes the actions menu. (Already shipped.)
- AC11: Enter or Space on the focused button opens the menu. (Already shipped.)
- AC12: Down/Up arrows move focus between menu items. (Already shipped; re-checked with two items.)
- AC13: The button's label is "Thread actions for <thread title>". (Already shipped.)
- AC14: The modal title is "Edit thread".
- AC15: The modal shows the same "Thread name" and "Color" fields as the "Add new thread" modal.
- AC16: "Thread name" is prefilled with the thread's title.
- AC17: "Color" shows the thread's current color.
- AC18: The modal has "Cancel" (outline) and "Save" (accent) buttons.
- AC19: "Save" is disabled when nothing has changed.
- AC20: "Save" is enabled when the name or color differs from the saved thread.
- AC21: Changing the name back to the saved name (color unchanged) disables "Save" again.
- AC22: An empty "Thread name" disables "Save".
- AC23: A "Thread name" of only spaces disables "Save".
- AC24: "Cancel" closes the modal when no save is in progress.
- AC25: Esc closes the modal when no save is in progress.
- AC26: The × button closes the modal when no save is in progress.
- AC27: Clicking outside closes the modal when no save is in progress.
- AC28: Closing with unsaved changes shows no "Discard changes?" prompt.
- AC29: Closing without saving leaves the card's name and color unchanged.
- AC30: Reopening "Edit" after closing with unsaved changes shows the saved name and color.
- AC31: A successful save closes the modal.
- AC32: A successful save shows the new name on the card.
- AC33: A successful save shows the new color on the card.
- AC34: The saved name is trimmed ("  QA Strategy  " → "QA Strategy").
- AC35: The edited thread keeps its position in the list.
- AC36: The card's "Updated" date shows the time of the edit.
- AC37: The card's section and page counts are unchanged.
- AC38: The new name and color survive a page reload.
- AC39: A successful save shows the success notification `Thread "<new title>" updated.`
- AC40: While saving, "Save" shows a loading indicator.
- AC41: While saving, "Cancel" and "Save" are disabled.
- AC42: While saving, the "Thread name" and "Color" fields are disabled.
- AC43: While saving, the × button is disabled.
- AC44: While saving, Esc does not close the modal.
- AC45: While saving, clicking outside does not close the modal.
- AC46: A failed save keeps the modal open.
- AC47: A failed save keeps the name and color the user entered.
- AC48: A failed save leaves the card's name and color unchanged.
- AC49: A failed save shows the error notification "Couldn't save the thread. Please try again."
- AC50: After a failed save, the buttons and fields are enabled again.
- AC51: Retrying "Save" after a failure and succeeding shows the new name and color on the card.

## Style notes

- Components shared between the Add and Edit modals live in `src/components/shared/`, each in its own folder with an `index.ts`, re-exported from `src/components/shared/index.ts` and imported via `@/components/shared` — developer decision.
- `AddNewThreadModalActions` becomes the shared `ThreadFormModalActions` (with `submitLabel` and `isSubmitting` props), used by both modals; no separate `EditThreadModalActions` — developer decision.
- Move files with `git mv` so their history is kept.
- An exported props type goes to `<ComponentName>.types.ts`; a props type that is not exported stays in the component file — developer decision (carried over from `implementation-plans/delete-thread-from-dashboard/delete-thread-from-dashboard.style.md`), `react.md` rules 4–5.
- Follow the existing delete-thread flow for state and wiring: modal state lives in a `use<Action>Thread` hook in `DashboardPageLoader.hooks.ts`, values and actions are split into the two contexts, and a `*ModalContainer` reads them and renders the modal with `? ... : null` — project convention (`src/pages/DashboardPage/components/DashboardPageLoader/`, `.../DeleteThreadModalContainer/`).
- The service is called first and React state is updated only after it resolves, so a failure leaves the list untouched — project convention (`useThreadsState` in `DashboardPageLoader.hooks.ts`).
- User-visible strings are `UPPER_SNAKE_CASE` constants in `*.constants.ts`; strings that embed a thread title are `get...Message` functions in `*.utils.ts` — project convention (`DashboardPageLoader.utils.ts`).
- Test IDs use `initTestIdCreator("<Name>__")` and a `<Name>TestId` `as const` object — project convention (`MindThreadCard.constants.ts`).
- The "Save" button uses `background="accent"`, like "Add" today — project convention (`AddNewThreadModalActions.tsx`).
- Functions with two or more parameters take one destructured object — code guide (`typescript.md` rule 3).
- Do not repeat logic: the "replace a thread by id" mapping is used by the service and by `useThreadsState`, so it is one shared util — code guide (`typescript.md` rule 4).
- Handlers inside components are named `handle<Event>`; no `useMemo`/`useCallback` (React Compiler) — project convention (`CLAUDE.md`).
- Tests: root `describe`, a `setup()` that creates `userEvent.setup()` and renders with `renderWithUIProvider`, elements stored in variables before assertions, `toStrictEqual` for objects and arrays, `vi.clearAllMocks()` before each test, mocks only where nothing else works, one shared mock instead of copies — code guide (`unit-tests.md`) and project convention (`CLAUDE.md`).

## Phase 1: Implementation

---

### Step 1: Add the `MindThreadUpdate` type

**File:**
`src/types/MindThread.ts`

**Covers:** AC31–AC34

**Context:** The service takes one object that names the thread and its new values, so `updateThread` has a single parameter (`typescript.md` rule 3).

**Changes:**

1. Add below `NewMindThread`:

   ```ts
   export type MindThreadUpdate = Pick<MindThread, "id" | "title" | "color">;
   ```

**Verification MANUAL:** `npm run ts:check` passes.

---

### Step 2: Add the shared `replaceThread` util

**New files:**

- `src/utils/replaceThread.ts`

**File:**
`src/utils/index.ts`

**Covers:** AC35

**Context:** The service (Step 4) and `useThreadsState` (Step 5) both replace one thread in a list by id while keeping the order. `src/utils/` holds flat util files (`checkContext.ts`).

**Changes:**

1. `replaceThread.ts`:

   ```ts
   import type { MindThread } from "@/types";

   type ReplaceThreadParams = {
     threads: MindThread[];
     updatedThread: MindThread;
   };

   export const replaceThread = ({
     threads,
     updatedThread,
   }: ReplaceThreadParams): MindThread[] =>
     threads.map((thread) =>
       thread.id === updatedThread.id ? updatedThread : thread
     );
   ```

2. Add `export * from "./replaceThread";` to `src/utils/index.ts`.

**Verification MANUAL:** `npm run ts:check` passes.

---

### Step 3: Add the thread-update helper to the service utils

**File:**
`src/services/useThreadsService/useThreadsService.types.ts`
`src/services/useThreadsService/useThreadsService.utils.ts`
`src/services/useThreadsService/useThreadsService.constants.ts`

**Covers:** AC34, AC36, AC37

**Context:** Mirrors `buildThread`: trimming and the timestamp live in one pure helper, and everything else on the thread (id, counts) is kept from the stored thread.

**Changes:**

1. In `useThreadsService.types.ts`, import `MindThreadUpdate` from `@/types` and add:

   ```ts
   export type ApplyThreadUpdateParams = {
     thread: MindThread;
     threadUpdate: MindThreadUpdate;
   };
   ```

2. In `useThreadsService.utils.ts`, add below `buildThread`:

   ```ts
   export const applyThreadUpdate = ({
     thread,
     threadUpdate,
   }: ApplyThreadUpdateParams): MindThread => ({
     ...thread,
     title: threadUpdate.title.trim(),
     color: threadUpdate.color,
     lastUpdated: new Date().toISOString(),
   });
   ```

3. In `useThreadsService.constants.ts`, add:

   ```ts
   export const THREAD_NOT_FOUND_ERROR = "Thread not found";
   ```

**Verification MANUAL:** `npm run ts:check` passes.

---

### Step 4: Add `updateThread` to the threads service

**File:**
`src/services/useThreadsService/useThreadsService.types.ts`
`src/services/useThreadsService/useThreadsService.ts`

**Covers:** AC32–AC38, AC46, AC48

**Context:** Same shape as `deleteThread`. The storage is created with `throwOnError: true`, so a failed write rejects the promise, which the UI turns into the error notification. An unknown id also rejects, because there is nothing to update.

**Changes:**

1. In `useThreadsService.types.ts`, add to `UseThreadsServiceReturn`:

   ```ts
   updateThread: (threadUpdate: MindThreadUpdate) => Promise<MindThread>;
   ```

2. In `useThreadsService.ts`, import `replaceThread` from `@/utils`, `applyThreadUpdate` from the utils file, `THREAD_NOT_FOUND_ERROR` from the constants file and `MindThreadUpdate` from `@/types`. Add after `createThread`:

   ```ts
   const updateThread = async (
     threadUpdate: MindThreadUpdate
   ): Promise<MindThread> => {
     const storedThreads = await getThreads();
     const storedThread = storedThreads.find(
       (thread) => thread.id === threadUpdate.id
     );

     if (storedThread === undefined) {
       throw new Error(THREAD_NOT_FOUND_ERROR);
     }

     const updatedThread = applyThreadUpdate({
       thread: storedThread,
       threadUpdate,
     });

     threadsStorage.set(
       replaceThread({ threads: storedThreads, updatedThread })
     );

     return updatedThread;
   };
   ```

3. Return it: `return { getThreads, createThread, updateThread, deleteThread };`.

**Verification MANUAL:** `npm run ts:check` passes.

---

### Step 5: Add `editThread` to `useThreadsState`

**File:**
`src/pages/DashboardPage/components/DashboardPageLoader/DashboardPageLoader.hooks.ts`

**Covers:** AC32, AC33, AC35, AC48

**Context:** Same shape as `addThread`: the service first, then React state, so a rejected save leaves the card as it was.

**Changes:**

1. Import `replaceThread` from `@/utils` (next to `checkContext`) and `MindThreadUpdate` from `@/types`.
2. Add inside `useThreadsState`, between `addThread` and `removeThread`:

   ```ts
   const editThread = async (threadUpdate: MindThreadUpdate) => {
     const updatedThread = await threadsService.updateThread(threadUpdate);

     setThreads((currentThreads) =>
       replaceThread({ threads: currentThreads, updatedThread })
     );

     return updatedThread;
   };
   ```

3. Return it: `return { threads, threadsStatus, addThread, editThread, removeThread };`.

**Verification MANUAL:** `npm run ts:check` passes.

---

### Step 6: Add the "thread updated" message

**File:**
`src/pages/DashboardPage/components/DashboardPageLoader/DashboardPageLoader.utils.ts`

**Covers:** AC39

**Context:** The error text "Couldn't save the thread. Please try again." already exists as `SAVE_THREAD_ERROR_MESSAGE` in `DashboardPageLoader.constants.ts` and is reused (AC49), so no new constant is added.

**Changes:**

1. Add between `getThreadCreatedMessage` and `getThreadDeletedMessage`:

   ```ts
   export const getThreadUpdatedMessage = (threadTitle: string) =>
     `Thread "${threadTitle}" updated.`;
   ```

**Verification MANUAL:** `npm run ts:check` passes.

---

### Step 7: Add the `useEditThread` hook

**File:**
`src/pages/DashboardPage/components/DashboardPageLoader/DashboardPageLoader.types.ts`
`src/pages/DashboardPage/components/DashboardPageLoader/DashboardPageLoader.hooks.ts`

**Covers:** AC8, AC24–AC27, AC30, AC31, AC39–AC41, AC46, AC49–AC51

**Context:** Mirrors `useDeleteThread`. `threadToEdit` is a `MindThread | null`, so the container renders on it and the modal gets the saved values. Closing sets it to `null`, which unmounts the modal and throws away unsaved form state (AC30). On failure the modal stays mounted, so the entered values stay (AC47).

**Changes:**

1. In `DashboardPageLoader.types.ts`, import `MindThreadUpdate` from `@/types` and add:

   ```ts
   export type UseEditThreadParams = {
     editThread: (threadUpdate: MindThreadUpdate) => Promise<MindThread>;
   };
   ```

2. In `DashboardPageLoader.hooks.ts`, import `getThreadUpdatedMessage` and `UseEditThreadParams`, and add between `useThreadsState` and `useDeleteThread`:

   ```ts
   export const useEditThread = ({ editThread }: UseEditThreadParams) => {
     const [threadToEdit, setThreadToEdit] = useState<MindThread | null>(null);
     const [isSavingThread, setIsSavingThread] = useState(false);

     const openEditThreadModal = (thread: MindThread) => {
       setThreadToEdit(thread);
     };

     const closeEditThreadModal = () => {
       setThreadToEdit(null);
     };

     const submitEditedThread = async (threadChanges: NewMindThread) => {
       if (threadToEdit === null) {
         return;
       }

       setIsSavingThread(true);

       try {
         const updatedThread = await editThread({
           id: threadToEdit.id,
           ...threadChanges,
         });

         closeEditThreadModal();
         notify.success(getThreadUpdatedMessage(updatedThread.title));
       } catch {
         notify.error(SAVE_THREAD_ERROR_MESSAGE);
       } finally {
         setIsSavingThread(false);
       }
     };

     return {
       threadToEdit,
       isSavingThread,
       openEditThreadModal,
       closeEditThreadModal,
       submitEditedThread,
     };
   };
   ```

   The notification uses `updatedThread.title`, which is already trimmed (AC34, AC39).

**Verification MANUAL:** `npm run ts:check` passes.

---

### Step 8: Provide the edit-thread state and actions from `DashboardPageLoader`

**File:**
`src/pages/DashboardPage/components/DashboardPageLoader/DashboardPageLoader.types.ts`
`src/pages/DashboardPage/components/DashboardPageLoader/DashboardPageLoader.tsx`

**Covers:** AC8, AC31, AC40–AC45

**Changes:**

1. In `DashboardPageLoader.types.ts`:
   - Add to `DashboardPageValue`: `threadToEdit: MindThread | null;` and `isSavingThread: boolean;` (before `threadToDelete`).
   - Add to `DashboardPageAction` (before `openDeleteThreadModal`):

     ```ts
     openEditThreadModal: (thread: MindThread) => void;
     closeEditThreadModal: () => void;
     submitEditedThread: (threadChanges: NewMindThread) => Promise<void>;
     ```

2. In `DashboardPageLoader.tsx`:
   - Import `useEditThread`; destructure `editThread` from `useThreadsState()`.
   - Call the hook between `useAddThread` and `useDeleteThread`:

     ```ts
     const {
       threadToEdit,
       isSavingThread,
       openEditThreadModal,
       closeEditThreadModal,
       submitEditedThread,
     } = useEditThread({ editThread });
     ```

   - Add `openEditThreadModal`, `closeEditThreadModal`, `submitEditedThread` to the action context value and `threadToEdit`, `isSavingThread` to the value context value, before the delete entries.

**Verification MANUAL:** `npm run ts:check` passes.

---

### Step 9: Add `disabled` to the `ColorPicker` adapter

**File:**
`src/components/lib/ColorPicker/ColorPicker.tsx`

**Covers:** AC42, AC50

**Context:** The adapter has no way to disable the picker yet. Chakra's `ColorPicker.Root` accepts `disabled`, which also disables the trigger and the hidden input. `Input` already supports `disabled`.

**Changes:**

1. Add `disabled?: boolean;` to `ColorPickerProps`.
2. Destructure it with a default: `disabled = false,`.
3. Pass it to the root: `<ChakraColorPicker.Root ... disabled={disabled} onValueChange={handleValueChange}>`.

**Verification MANUAL:** `npm run ts:check` passes; in the "Add new thread" modal the picker still opens and changes color as before.

---

### Step 10: Move `ThreadForm` to `src/components/shared/`

**New files:**

- `src/components/shared/index.ts`
- `src/components/shared/ThreadForm/ThreadForm.types.ts`

**File:**
`src/components/shared/ThreadForm/ThreadForm.tsx` (moved)
`src/components/shared/ThreadForm/ThreadForm.constants.ts` (moved)
`src/components/shared/ThreadForm/index.ts` (moved)
`src/pages/DashboardPage/components/AddNewThreadModalContainer/components/AddNewThreadModal/AddNewThreadModal.tsx`
`src/pages/DashboardPage/components/AddNewThreadModalContainer/components/AddNewThreadModal/AddNewThreadModal.constants.ts`
`src/pages/DashboardPage/components/AddNewThreadModalContainer/components/AddNewThreadModal/AddNewThreadModal.types.ts` (deleted)
`src/pages/DashboardPage/components/AddNewThreadModalContainer/components/AddNewThreadModal/index.ts`
`src/pages/DashboardPage/components/AddNewThreadModalContainer/components/AddNewThreadModal/components/index.ts`

**Covers:** AC15

**Context:** The Edit modal must show the same fields as the Add modal, so both use one `ThreadForm`. Only production files move here; the `ThreadForm` test folder is moved in Phase 2 Step 7.

**Changes:**

1. `git mv` `ThreadForm.tsx`, `ThreadForm.constants.ts` and `index.ts` from `src/pages/DashboardPage/components/AddNewThreadModalContainer/components/AddNewThreadModal/components/ThreadForm/` to `src/components/shared/ThreadForm/`. Leave the old `__tests__/` folder where it is for now.
2. Create `ThreadForm.types.ts` with the form value type (moved from `AddNewThreadModal.types.ts`) and the props type (moved out of `ThreadForm.tsx`, because it is exported):

   ```ts
   import type { NewMindThread } from "@/types";

   export type ThreadFormValue = NewMindThread;

   export type ThreadFormProps = {
     value: ThreadFormValue;
     onChange: (value: ThreadFormValue) => void;
   };
   ```

3. In `ThreadForm.tsx`, remove the inline `ThreadFormProps` and import it from `./ThreadForm.types` (`import type`).
4. In `src/components/shared/ThreadForm/index.ts`:

   ```ts
   export * from "./ThreadForm";
   export type { ThreadFormValue, ThreadFormProps } from "./ThreadForm.types";
   ```

5. Create `src/components/shared/index.ts`: `export * from "./ThreadForm";`.
6. Delete `AddNewThreadModal.types.ts`. In `AddNewThreadModal.tsx` and `AddNewThreadModal.constants.ts`, import `ThreadForm` / `type ThreadFormValue` from `@/components/shared`.
7. In `AddNewThreadModal/index.ts`, remove the line `export type { ThreadFormValue } from "./AddNewThreadModal.types";`.
8. In `AddNewThreadModal/components/index.ts`, remove `export * from "./ThreadForm";`.

**Verification MANUAL:** `npm run ts:check` reports errors only in `__tests__` files that import the old `ThreadForm` paths (fixed in Phase 2 Step 7); the "Add new thread" modal in the browser looks and works as before.

---

### Step 11: Add `disabled` to `ThreadForm`

**File:**
`src/components/shared/ThreadForm/ThreadForm.types.ts`
`src/components/shared/ThreadForm/ThreadForm.tsx`

**Covers:** AC42, AC50

**Changes:**

1. Add `disabled?: boolean;` to `ThreadFormProps`.
2. In `ThreadForm.tsx`, destructure `disabled = false` and pass `disabled={disabled}` to both `Input` and `ColorPicker`.

**Verification MANUAL:** `npm run ts:check` shows no new errors.

---

### Step 12: Turn `AddNewThreadModalActions` into the shared `ThreadFormModalActions`

**New files:**

- `src/components/shared/ThreadFormModalActions/ThreadFormModalActions.types.ts`

**File:**
`src/components/shared/ThreadFormModalActions/ThreadFormModalActions.tsx` (moved from `AddNewThreadModalActions.tsx`)
`src/components/shared/ThreadFormModalActions/ThreadFormModalActions.constants.ts` (moved from `AddNewThreadModalActions.constants.ts`)
`src/components/shared/ThreadFormModalActions/index.ts` (moved)
`src/components/shared/index.ts`

**Covers:** AC18, AC19, AC40, AC41, AC50

**Context:** Both modals show "Cancel" (outline) and an accent submit button. The submit label differs ("Add" / "Save"), and only the Edit modal has a saving state, so `isSubmitting` is optional and defaults to `false`. Only production files move here; the old test folder is handled in Phase 2 Step 8.

**Changes:**

1. `git mv` the three production files from `src/pages/DashboardPage/components/AddNewThreadModalContainer/components/AddNewThreadModal/components/AddNewThreadModalActions/` to `src/components/shared/ThreadFormModalActions/`, renaming `AddNewThreadModalActions*` to `ThreadFormModalActions*`. Leave the old `__tests__/` folder in place.
2. `ThreadFormModalActions.constants.ts`:

   ```ts
   import { initTestIdCreator } from "@/components/lib/utils";

   const createTestId = initTestIdCreator("ThreadFormModalActions__");

   export const ThreadFormModalActionsTestId = {
     container: createTestId("container"),
     cancelButton: createTestId("cancel-button"),
     submitButton: createTestId("submit-button"),
   } as const;

   export const CANCEL_BUTTON_LABEL = "Cancel";
   ```

3. `ThreadFormModalActions.types.ts`:

   ```ts
   export type ThreadFormModalActionsProps = {
     submitLabel: string;
     submitDisabled: boolean;
     isSubmitting?: boolean;
     onSubmit: () => void;
     onCancel: () => void;
   };
   ```

4. `ThreadFormModalActions.tsx`:

   ```tsx
   export const ThreadFormModalActions = ({
     submitLabel,
     submitDisabled,
     isSubmitting = false,
     onSubmit,
     onCancel,
   }: ThreadFormModalActionsProps) => {
     return (
       <HStack gap="2" data-testid={ThreadFormModalActionsTestId.container}>
         <Button
           data-testid={ThreadFormModalActionsTestId.cancelButton}
           variant="outline"
           disabled={isSubmitting}
           onClick={onCancel}
         >
           {CANCEL_BUTTON_LABEL}
         </Button>

         <Button
           data-testid={ThreadFormModalActionsTestId.submitButton}
           background="accent"
           loading={isSubmitting}
           disabled={submitDisabled || isSubmitting}
           onClick={onSubmit}
         >
           {submitLabel}
         </Button>
       </HStack>
     );
   };
   ```

5. `index.ts`:

   ```ts
   export * from "./ThreadFormModalActions";
   export type { ThreadFormModalActionsProps } from "./ThreadFormModalActions.types";
   ```

6. Add `export * from "./ThreadFormModalActions";` to `src/components/shared/index.ts`.

**Verification MANUAL:** `npm run ts:check` reports errors only in `AddNewThreadModal.tsx` (fixed in the next step) and in `__tests__` files that use the old paths.

---

### Step 13: Use `ThreadFormModalActions` in `AddNewThreadModal`

**File:**
`src/pages/DashboardPage/components/AddNewThreadModalContainer/components/AddNewThreadModal/AddNewThreadModal.tsx`
`src/pages/DashboardPage/components/AddNewThreadModalContainer/components/AddNewThreadModal/AddNewThreadModal.constants.ts`
`src/pages/DashboardPage/components/AddNewThreadModalContainer/components/AddNewThreadModal/components/index.ts` (deleted)

**Covers:** AC15, AC18

**Changes:**

1. In `AddNewThreadModal.constants.ts`, add `export const ADD_BUTTON_LABEL = "Add";`.
2. In `AddNewThreadModal.tsx`, import `ThreadForm` and `ThreadFormModalActions` from `@/components/shared`, and replace the actions:

   ```tsx
   actions={
     <ThreadFormModalActions
       submitLabel={ADD_BUTTON_LABEL}
       submitDisabled={!formValue.title.trim()}
       onSubmit={handleAdd}
       onCancel={onClose}
     />
   }
   ```

3. `AddNewThreadModal/components/` now holds only `index.ts` and the old test folders. Delete `components/index.ts`; the remaining `__tests__` folders under it are moved in Phase 2.

**Verification MANUAL:** `npm run ts:check` reports errors only in `__tests__` files that use the old paths; in the browser, "Add new thread" still shows "Cancel" and "Add", "Add" is disabled for an empty name, and creating a thread works.

---

### Step 14: Create `EditThreadModal`

**New files:**

- `src/pages/DashboardPage/components/EditThreadModalContainer/components/EditThreadModal/EditThreadModal.tsx`
- `src/pages/DashboardPage/components/EditThreadModalContainer/components/EditThreadModal/EditThreadModal.constants.ts`
- `src/pages/DashboardPage/components/EditThreadModalContainer/components/EditThreadModal/EditThreadModal.types.ts`
- `src/pages/DashboardPage/components/EditThreadModalContainer/components/EditThreadModal/EditThreadModal.utils.ts`
- `src/pages/DashboardPage/components/EditThreadModalContainer/components/EditThreadModal/index.ts`
- `src/pages/DashboardPage/components/EditThreadModalContainer/components/index.ts`

**Covers:** AC14–AC28, AC40–AC47, AC50

**Context:** Built like `AddNewThreadModal`, with `DeleteThreadModal`'s `closeDisabled` handling. The form state starts from the thread, and the modal is unmounted on close, so reopening always shows the saved values (AC30) and there is nothing to "discard" (AC28). Colors are compared case-insensitively because the picker emits lowercase hex while stored colors may be uppercase (for example `#FF6B6B` in the fixtures).

**Changes:**

1. `EditThreadModal.constants.ts`:

   ```ts
   export const EDIT_THREAD_MODAL_TITLE = "Edit thread";
   export const SAVE_BUTTON_LABEL = "Save";
   ```

2. `EditThreadModal.types.ts`:

   ```ts
   import type { ThreadFormValue } from "@/components/shared";
   import type { MindThread } from "@/types";

   export type EditThreadModalProps = {
     thread: MindThread;
     isSaving: boolean;
     onClose: () => void;
     onSave: (value: ThreadFormValue) => void;
   };

   export type CanSaveThreadChangesParams = {
     thread: MindThread;
     formValue: ThreadFormValue;
   };
   ```

3. `EditThreadModal.utils.ts`:

   ```ts
   export const canSaveThreadChanges = ({
     thread,
     formValue,
   }: CanSaveThreadChangesParams) => {
     const trimmedTitle = formValue.title.trim();

     if (!trimmedTitle) {
       return false;
     }

     const titleChanged = trimmedTitle !== thread.title;
     const colorChanged =
       formValue.color.toLowerCase() !== thread.color.toLowerCase();

     return titleChanged || colorChanged;
   };
   ```

   An empty or whitespace-only name is never saveable (AC22, AC23); a name that only differs by outer spaces counts as unchanged, because it would be saved trimmed (AC21, AC34).

4. `EditThreadModal.tsx`:

   ```tsx
   export const EditThreadModal = ({
     thread,
     isSaving,
     onClose,
     onSave,
   }: EditThreadModalProps) => {
     const [formValue, setFormValue] = useState<ThreadFormValue>({
       title: thread.title,
       color: thread.color,
     });

     const handleSave = () => {
       onSave(formValue);
     };

     return (
       <Dialog
         open
         title={EDIT_THREAD_MODAL_TITLE}
         closeDisabled={isSaving}
         onClose={onClose}
         content={
           <ThreadForm
             value={formValue}
             disabled={isSaving}
             onChange={setFormValue}
           />
         }
         actions={
           <ThreadFormModalActions
             submitLabel={SAVE_BUTTON_LABEL}
             submitDisabled={!canSaveThreadChanges({ thread, formValue })}
             isSubmitting={isSaving}
             onSubmit={handleSave}
             onCancel={onClose}
           />
         }
       />
     );
   };
   ```

   Imports: `useState` from `react`, `Dialog` from `@/components/lib`, `ThreadForm`, `ThreadFormModalActions` and `type ThreadFormValue` from `@/components/shared`.

5. `EditThreadModal/index.ts`:

   ```ts
   export * from "./EditThreadModal";
   export type { EditThreadModalProps } from "./EditThreadModal.types";
   ```

6. `components/index.ts`: `export * from "./EditThreadModal";`.

**Verification MANUAL:** `npm run ts:check` shows no new errors.

---

### Step 15: Create `EditThreadModalContainer`

**New files:**

- `src/pages/DashboardPage/components/EditThreadModalContainer/EditThreadModalContainer.tsx`
- `src/pages/DashboardPage/components/EditThreadModalContainer/index.ts`

**Covers:** AC8, AC24–AC27, AC30, AC31

**Context:** Same pattern as `DeleteThreadModalContainer.tsx`.

**Changes:**

1. `EditThreadModalContainer.tsx`:

   ```tsx
   export const EditThreadModalContainer = () => {
     const { threadToEdit, isSavingThread } = useDashboardPageValue();
     const { closeEditThreadModal, submitEditedThread } =
       useDashboardPageAction();

     return threadToEdit ? (
       <EditThreadModal
         thread={threadToEdit}
         isSaving={isSavingThread}
         onClose={closeEditThreadModal}
         onSave={submitEditedThread}
       />
     ) : null;
   };
   ```

   Import the hooks from `../DashboardPageLoader` and `EditThreadModal` from `./components`.

2. `index.ts`: `export * from "./EditThreadModalContainer";`.

**Verification MANUAL:** `npm run ts:check` shows no new errors.

---

### Step 16: Register `EditThreadModalContainer` on the dashboard

**File:**
`src/pages/DashboardPage/components/index.ts`
`src/pages/DashboardPage/DashboardPage.tsx`

**Covers:** AC8

**Changes:**

1. In `components/index.ts`, add `export * from "./EditThreadModalContainer";` between the Add and Delete container exports.
2. In `DashboardPage.tsx`, import it and render `<EditThreadModalContainer />` between `<AddNewThreadModalContainer />` and `<DeleteThreadModalContainer />`.

**Verification MANUAL:** `npm run ts:check` shows no new errors; the dashboard renders as before.

---

### Step 17: Add the "Edit" item to `CardActions`

**File:**
`src/pages/DashboardPage/components/DashboardContent/components/MindThreadCard/MindThreadCard.constants.ts`
`src/pages/DashboardPage/components/DashboardContent/components/MindThreadCard/components/CardActions.tsx`

**Covers:** AC4, AC6, AC7, AC12

**Context:** The menu was built so the Edit story only adds an item. The `stopPropagation` wrapper already keeps menu clicks from opening the thread (AC6), and the `Menu` adapter closes on select (AC7).

**Changes:**

1. In `MindThreadCard.constants.ts`, add above `DELETE_THREAD_MENU_ITEM`:

   ```ts
   export const EDIT_THREAD_MENU_ITEM = {
     value: "edit",
     label: "Edit",
   } as const;
   ```

2. In `CardActions.tsx`:
   - Add `onEdit: (thread: MindThread) => void;` to `CardActionsProps` (before `onDelete`) and destructure it.
   - Add the handler next to `handleDelete`:

     ```ts
     const handleEdit = () => {
       onEdit(thread);
     };
     ```

   - Put the Edit item first:

     ```ts
     const menuItems: MenuItem[] = [
       { ...EDIT_THREAD_MENU_ITEM, onSelect: handleEdit },
       { ...DELETE_THREAD_MENU_ITEM, color: "red", onSelect: handleDelete },
     ];
     ```

**Verification MANUAL:** `npm run ts:check` reports an error only in `MindThreadCard.tsx` (missing `onEdit`, fixed next) and in test files.

---

### Step 18: Pass `onEdit` through `MindThreadCard`

**File:**
`src/pages/DashboardPage/components/DashboardContent/components/MindThreadCard/MindThreadCard.tsx`

**Covers:** AC8

**Changes:**

1. Add `onEdit: (thread: MindThread) => void;` to `MindThreadCardProps` (before `onDelete`) and destructure it.
2. Pass it on: `<CardActions thread={thread} forMode={forMode} onEdit={onEdit} onDelete={onDelete} />`.

**Verification MANUAL:** `npm run ts:check` reports an error only in `MindThreadList.tsx` (fixed next) and in test files.

---

### Step 19: Pass `openEditThreadModal` from `MindThreadList`

**File:**
`src/pages/DashboardPage/components/DashboardContent/components/MindThreadList/MindThreadList.tsx`

**Covers:** AC8, AC32, AC33, AC35

**Changes:**

1. Destructure `openEditThreadModal` from `useDashboardPageAction()` next to `openDeleteThreadModal`.
2. Pass `onEdit={openEditThreadModal}` to `MindThreadCard`, before `onDelete`.

**Verification MANUAL:** `npm run ts:check` reports errors only in test files. In the browser (`npm run start`): open a card's menu → "Edit", "Delete"; "Edit" opens "Edit thread" with the name and color filled in; "Save" is disabled until something changes; renaming "  QA Strategy  " and saving closes the modal, shows `Thread "QA Strategy" updated.`, updates the card in place with "Updated: just now", and survives a reload; while editing in list view, the same works.

## Phase 2: Unit tests

---

### Step 1: Test `replaceThread`

**New files:**

- `src/utils/__tests__/replaceThread.test.ts`

**Covers:** AC35

**Changes:**

Use `mindThreadFixtures` and `mindThreadFixture` from `@/__test-fixtures__`:

1. Replaces the thread with the same id and keeps every other thread and the order (`toStrictEqual` on the whole array).
2. Returns a list equal to the input when no thread has that id.
3. Does not mutate the input array.

**Verification:** `npx vitest run src/utils` — all tests pass.

---

### Step 2: Test `applyThreadUpdate`

**File:**
`src/services/useThreadsService/__tests__/useThreadsService.utils.test.ts`

**Covers:** AC34, AC36, AC37

**Changes:**

Add an `applyThreadUpdate` group. Fix the time with `vi.useFakeTimers()` / `vi.setSystemTime(FIXED_NOW)` and restore real timers afterwards, as the existing `buildThread` tests do (reuse their `FIXED_NOW`):

1. Returns the thread with the new trimmed title, the new color and `lastUpdated` set to the current time; `id`, `totalSections` and `totalPages` are unchanged (`toStrictEqual`).
2. Does not mutate the input thread.

**Verification:** `npx vitest run src/services/useThreadsService` — all tests pass.

---

### Step 3: Test `updateThread` in the threads service

**File:**
`src/services/useThreadsService/__tests__/useThreadsService.test.ts`

**Covers:** AC32–AC38, AC46, AC48

**Changes:**

Add an `updateThread` group using the file's existing `setupHook()` and `seedThreads`:

1. Seed three threads, update the second: resolves with the updated thread (trimmed title, new color, new `lastUpdated`, unchanged counts), and `localStorage` holds all three in the same order with only the second changed.
2. Rejects with `THREAD_NOT_FOUND_ERROR` for an unknown id and leaves storage unchanged.
3. Rejects when `Storage.prototype.setItem` throws (spy, silence `console.error`), and the stored data is unchanged.
4. Rejects with `INVALID_THREADS_DATA_ERROR` when the stored data is malformed, as the `deleteThread` tests do.

**Verification:** `npx vitest run src/services/useThreadsService` — all tests pass.

---

### Step 4: Share the threads-service mock

**New files:**

- `src/__test-fixtures__/threadsService.ts`

**File:**
`src/__test-fixtures__/index.ts`
`src/pages/DashboardPage/components/DashboardPageLoader/__tests__/DashboardPageLoader.test.tsx`
`src/pages/DashboardPage/components/DeleteThreadModalContainer/__tests__/DeleteThreadModalContainer.test.tsx`

**Context:** `DashboardPageLoader.test.tsx` and `DeleteThreadModalContainer.test.tsx` already copy the same `vi.mock("@/services", ...)` factory with a `deleteThreadOverride`, and Steps 5 and 10 need the same thing for `updateThread`. Define it once (`unit-tests.md` rules 7, 16). `vi.mock` is hoisted, so each file still calls `vi.mock` itself, but the factory loads the shared helper with a dynamic `import`.

**Changes:**

1. `threadsService.ts`:

   ```ts
   import type { UseThreadsServiceReturn } from "@/services";

   type ServicesModule = typeof import("@/services");

   type ThreadsServiceOverrides = Partial<
     Pick<UseThreadsServiceReturn, "updateThread" | "deleteThread">
   >;

   export const threadsServiceOverrides: ThreadsServiceOverrides = {};

   export const resetThreadsServiceOverrides = () => {
     delete threadsServiceOverrides.updateThread;
     delete threadsServiceOverrides.deleteThread;
   };

   export const createServicesMock = (
     actualServices: ServicesModule
   ): ServicesModule => ({
     ...actualServices,
     useThreadsService: () => {
       const threadsService = actualServices.useThreadsService();

       return {
         ...threadsService,
         updateThread: (threadUpdate) =>
           (threadsServiceOverrides.updateThread ?? threadsService.updateThread)(
             threadUpdate
           ),
         deleteThread: (threadId) =>
           (threadsServiceOverrides.deleteThread ?? threadsService.deleteThread)(
             threadId
           ),
       };
     },
   });
   ```

   The override is read at call time, so a test can set it after rendering, like the current `deleteThreadOverride.current`.

2. Add `export * from "./threadsService";` to `src/__test-fixtures__/index.ts`.
3. In both existing test files, replace the `deleteThreadOverride` `vi.hoisted` block and the inline factory with:

   ```ts
   vi.mock("@/services", async (importOriginal) => {
     const { createServicesMock } = await import("@/__test-fixtures__");

     return createServicesMock(
       await importOriginal<typeof import("@/services")>()
     );
   });
   ```

   Replace `deleteThreadOverride.current = ...` with `threadsServiceOverrides.deleteThread = ...`, and reset with `resetThreadsServiceOverrides()` in the file's existing `afterEach`.

**Verification:** `npx vitest run DashboardPageLoader DeleteThreadModalContainer` — all existing tests still pass.

---

### Step 5: Test the edit flow in `DashboardPageLoader`

**File:**
`src/pages/DashboardPage/components/DashboardPageLoader/__tests__/DashboardPageLoader.test.tsx`

**Covers:** AC8, AC30–AC35, AC39–AC41, AC46–AC51

**Changes:**

Extend the existing `TestConsumer` with an "open edit" button per thread (like `ThreadDeleteButton`), buttons that call `closeEditThreadModal()` and `submitEditedThread({ title: "  QA Strategy  ", color: "#000000" })`, and outputs for `threadToEdit` and `isSavingThread`. Tests:

1. `openEditThreadModal` sets `threadToEdit`; `closeEditThreadModal` clears it.
2. `submitEditedThread` on the second of three seeded threads: that thread's title becomes "QA Strategy" and its color changes, the order stays the same, `threadToEdit` is cleared, `localStorage` holds the change, and the `getThreadUpdatedMessage("QA Strategy")` notification is shown.
3. Failure (`setItem` throws, `console.error` silenced): `threadToEdit` stays set, `threads` is unchanged, the `SAVE_THREAD_ERROR_MESSAGE` notification is shown, `isSavingThread` is `false` again.
4. A retry after the failure (restore the spy, submit again) updates the thread.
5. `isSavingThread` is `true` while `threadsServiceOverrides.updateThread` returns a pending `createDeferred<MindThread>().promise`, and `false` after it resolves.

**Verification:** `npx vitest run src/pages/DashboardPage/components/DashboardPageLoader` — all tests pass.

---

### Step 6: Test the `ColorPicker` `disabled` prop

**File:**
`src/components/lib/ColorPicker/__tests__/ColorPicker.test.tsx`

**Covers:** AC42, AC50

**Changes:**

1. With `disabled`, the trigger (`ColorPickerTestId.trigger`) is disabled and clicking it does not open the content.
2. Without `disabled`, clicking the trigger opens the content (keep or reuse the existing test).

**Verification:** `npx vitest run src/components/lib/ColorPicker` — all tests pass.

---

### Step 7: Move and extend the `ThreadForm` tests

**File:**
`src/components/shared/ThreadForm/__tests__/ThreadForm.test.tsx` (moved)
`src/pages/DashboardPage/components/AddNewThreadModalContainer/components/AddNewThreadModal/__tests__/AddNewThreadModal.test.tsx`
`src/pages/DashboardPage/components/AddNewThreadModalContainer/__tests__/AddNewThreadModalContainer.test.tsx`
`src/pages/DashboardPage/__tests__/DashboardPage.test.tsx`

**Covers:** AC15, AC42, AC50

**Changes:**

1. `git mv` the old `AddNewThreadModal/components/ThreadForm/__tests__/` folder to `src/components/shared/ThreadForm/__tests__/`, and change its `ThreadFormValue` import to `../ThreadForm.types`.
2. In the three other files, import `ThreadFormTestId` from `@/components/shared/ThreadForm/ThreadForm.constants`.
3. Add tests to `ThreadForm.test.tsx`: with `disabled`, the name input and the color trigger are disabled and typing does not call `onChange`; by default both are enabled.

**Verification:** `npx vitest run ThreadForm AddNewThreadModal DashboardPage` — all tests pass.

---

### Step 8: Move and rewrite the `ThreadFormModalActions` tests

**File:**
`src/components/shared/ThreadFormModalActions/__tests__/ThreadFormModalActions.test.tsx` (moved from `AddNewThreadModalActions.test.tsx`)
`src/pages/DashboardPage/components/AddNewThreadModalContainer/components/AddNewThreadModal/__tests__/AddNewThreadModal.test.tsx`
`src/pages/DashboardPage/components/AddNewThreadModalContainer/__tests__/AddNewThreadModalContainer.test.tsx`
`src/pages/DashboardPage/__tests__/DashboardPage.test.tsx`

**Covers:** AC18, AC19, AC40, AC41, AC50

**Changes:**

1. `git mv` the old `AddNewThreadModalActions/__tests__/AddNewThreadModalActions.test.tsx` to the new path, then delete the now-empty `AddNewThreadModal/components/` folder.
2. Rewrite it for the new props with `setup({ submitDisabled, isSubmitting })` and a fixed `submitLabel`:
   - shows "Cancel" and the given submit label (by `ThreadFormModalActionsTestId`);
   - clicking each calls `onCancel` / `onSubmit`;
   - `submitDisabled` disables only the submit button;
   - with `isSubmitting`, both buttons are disabled, the submit button shows the loading indicator, and clicks call nothing;
   - without `isSubmitting`, both are enabled.
3. In the three Add-flow files, replace `AddNewThreadModalActionsTestId.addButton` / `.cancelButton` with `ThreadFormModalActionsTestId.submitButton` / `.cancelButton`, imported from `@/components/shared/ThreadFormModalActions/ThreadFormModalActions.constants`.

**Verification:** `npx vitest run ThreadFormModalActions AddNewThreadModal DashboardPage` — all tests pass; `npm run ts:check` passes.

---

### Step 9: Test `EditThreadModal` and its utils

**New files:**

- `src/pages/DashboardPage/components/EditThreadModalContainer/components/EditThreadModal/__tests__/EditThreadModal.test.tsx`
- `src/pages/DashboardPage/components/EditThreadModalContainer/components/EditThreadModal/__tests__/EditThreadModal.utils.test.ts`

**Covers:** AC14–AC28, AC40–AC45, AC47

**Changes:**

1. `EditThreadModal.utils.test.ts` — `canSaveThreadChanges` returns:
   - `false` for the unchanged title and color;
   - `true` for a changed title; `true` for a changed color;
   - `false` for the same color in a different letter case;
   - `false` for an empty title and for a title of only spaces, even with a changed color;
   - `false` for the saved title with outer spaces added.
2. `EditThreadModal.test.tsx`, with `setup({ isSaving })` rendering a "Testing Strategy" thread (`mindThreadFixturesWithSameTitle[0]`) and `vi.fn()` callbacks:
   - the title is `EDIT_THREAD_MODAL_TITLE`; "Thread name" holds "Testing Strategy"; the color trigger shows the thread's color (compare with `parseColor`, as `ThreadForm.test.tsx` does);
   - "Save" is disabled at first; typing a new name enables it; typing the saved name back disables it; clearing the name or typing only spaces disables it; picking another swatch enables it;
   - clicking "Save" calls `onSave` with the entered `{ title, color }` (`toStrictEqual`);
   - Cancel, Esc, × and an outside click (`clickOutside` from `@/__test-fixtures__`) each call `onClose`, and no other dialog appears;
   - with `isSaving`, "Save" shows loading, both buttons, the name input and the color trigger are disabled, the × button is disabled, and Esc and an outside click do not call `onClose`;
   - re-rendering with `isSaving` going from `true` to `false` keeps the entered values (`rerender`).

**Verification:** `npx vitest run EditThreadModal` — all tests pass.

---

### Step 10: Test `EditThreadModalContainer`

**New files:**

- `src/pages/DashboardPage/components/EditThreadModalContainer/__tests__/EditThreadModalContainer.test.tsx`

**Covers:** AC8, AC24–AC27, AC29–AC34, AC38–AC51

**Context:** Follow `DeleteThreadModalContainer.test.tsx`: render `DashboardPageLoader` with a small "open edit" trigger per thread and a list that prints each thread's title and color, so the real state and `localStorage` are used. Use the shared services mock from Step 4.

**Changes:**

1. The modal is not rendered until the trigger is clicked; it then shows "Edit thread" with that thread's values.
2. Cancel, Esc and × close the modal, and the listed thread is unchanged (AC24–AC26, AC29).
3. Change the name, close, reopen: the form shows the saved name again (AC30).
4. Rename to "  QA Strategy  " and save: the modal closes, the list shows "QA Strategy", `localStorage` holds it, and `Thread "QA Strategy" updated.` is shown (AC31, AC32, AC34, AC38, AC39).
5. Failure (`setItem` throws, `console.error` silenced): the modal stays open with the entered name, the listed thread is unchanged, the error notification is shown, and buttons and fields are enabled (AC46–AC50).
6. After the failure, restore `setItem` and click "Save" again: the list shows the new name (AC51).
7. In progress (`threadsServiceOverrides.updateThread` returns a pending deferred): "Save" shows loading, buttons, fields and × are disabled, Esc and an outside click leave the modal open (AC40–AC45); after resolving, the modal closes.

**Verification:** `npx vitest run EditThreadModalContainer` — all tests pass.

---

### Step 11: Update the `CardActions` tests

**File:**
`src/pages/DashboardPage/components/DashboardContent/components/MindThreadCard/components/__tests__/CardActions.test.tsx`

**Covers:** AC4, AC6, AC7, AC12

**Changes:**

1. Add `mockOnEdit = vi.fn()` and pass it as `onEdit` in `setup()`.
2. Change the "exactly one item" test: the menu shows exactly "Edit", "Delete", in that order.
3. Clicking "Edit" calls `onEdit` with the thread, does not call `onDelete` or the parent's `onClick`, and closes the menu.
4. After opening the menu with the keyboard, Down/Up move focus between "Edit" and "Delete".

**Verification:** `npx vitest run CardActions` — all tests pass.

---

### Step 12: Update the `MindThreadCard` tests

**File:**
`src/pages/DashboardPage/components/DashboardContent/components/MindThreadCard/__tests__/MindThreadCard.test.tsx`

**Covers:** AC6, AC8

**Changes:**

1. Add `mockOnEdit = vi.fn()` next to `mockOnDelete` and pass it in `setup()`.
2. Choosing "Edit" calls `onEdit` with the thread and does not call `onClick`.

**Verification:** `npx vitest run MindThreadCard` — all tests pass.

---

### Step 13: Update the `MindThreadList` tests

**File:**
`src/pages/DashboardPage/components/DashboardContent/components/MindThreadList/__tests__/MindThreadList.test.tsx`

**Covers:** AC8

**Context:** This file already mocks the `DashboardPageLoader` hooks; extend that mock instead of adding another.

**Changes:**

1. Add `openEditThreadModal: mockOpenEditThreadModal` to the mocked `useDashboardPageAction` return value.
2. Choosing "Edit" from a card's menu calls `mockOpenEditThreadModal` with that thread.

**Verification:** `npx vitest run MindThreadList` — all tests pass.

---

### Step 14: Test the full edit flow on `DashboardPage`

**File:**
`src/pages/DashboardPage/__tests__/DashboardPage.test.tsx`

**Covers:** AC4, AC6, AC8, AC32, AC33, AC35–AC38

**Changes:**

Using the file's existing `setup()` and `seedThreads`:

1. In grid mode and in list mode, opening a card's menu shows "Edit", "Delete".
2. On the second of three threads, choose "Edit" → the modal shows that thread's name; rename it and pick another swatch → Save. The second card shows the new title, its color indicator has the new color, its "Updated" text is "Updated: just now", its section and page counts are unchanged, and the other two cards keep their places.
3. Unmount and render again with the same `localStorage`: the card still shows the new name and color.
4. Choosing "Edit" does not trigger the card's click behaviour (spy on `console.log`, as the delete test does).

**Verification:** `npx vitest run src/pages/DashboardPage` — all tests pass; then `npm run test` and `npm run lint` pass in full.

## Phase 3: Documentation

---

### Step 1: Update `CLAUDE.md`

**File:**
`CLAUDE.md`

**Covers:** documentation of the shared components folder, the new service method and the new adapter prop.

**Changes:**

1. In **Architecture → Folder structure**, add a bullet after `src/components/lib/`: `src/components/shared/` — app components shared between features (e.g., `ThreadForm` and `ThreadFormModalActions`, used by the Add and Edit thread modals), one folder per component, re-exported from `src/components/shared/index.ts` and imported via `@/components/shared`.
2. In the `src/services/` bullet, change the list to `getThreads`, `createThread`, `updateThread` and `deleteThread` (keep the sentence about `localStorage`).
3. In **Third-party Libraries → Chakra UI**, in the "Adapter props worth knowing" paragraph, add: `ColorPicker` accepts `disabled`.

**Verification MANUAL:** Read the edited `CLAUDE.md` sections; they match the final code (folder names, service methods, `ColorPicker` props) and no unrelated text changed.
