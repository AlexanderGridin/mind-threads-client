# Delete a thread from the dashboard

**Source:** `implementation-plans/delete-thread-from-dashboard/delete-thread-from-dashboard.draft.md`

## Acceptance criteria

Criteria are numbered in the order they appear in the story.

- AC1: Grid view: every thread card shows a three-dots "Thread actions" button in its top-right corner.
- AC2: List view: every thread card shows the same button in its top-right corner.
- AC3: The "Edit" story has not shipped: the menu opens with exactly one item, "Delete".
- AC4: The "Edit" story has shipped: the menu opens with "Edit", "Delete" in that order. (Out of scope here; the menu is built so Edit only adds an item.)
- AC5: Clicking the three-dots button does not open the thread.
- AC6: Clicking "Delete" does not open the thread.
- AC7: Clicking "Delete" closes the actions menu.
- AC8: Clicking "Delete" for "Testing Strategy" opens the confirmation modal for that thread.
- AC9: Esc closes the actions menu.
- AC10: Clicking outside closes the actions menu.
- AC11: Enter or Space on the focused three-dots button opens the menu.
- AC12: Down/Up arrows move focus between menu items.
- AC13: The button's accessible label is "Thread actions for <thread title>".
- AC14: The modal title is "Delete thread?".
- AC15: The modal text is `"<thread title>" and all its sections and pages will be permanently deleted. This can't be undone.`
- AC16: The modal has "Cancel" (outline) and "Delete" (red, destructive) buttons.
- AC17: "Cancel" has keyboard focus when the modal opens.
- AC18: "Cancel" closes the modal.
- AC19: Esc closes the modal when no deletion is in progress.
- AC20: The × button closes the modal when no deletion is in progress.
- AC21: Clicking outside closes the modal when no deletion is in progress.
- AC22: A modal closed without deleting leaves the thread in the list.
- AC23: A successful deletion closes the modal.
- AC24: A successful deletion removes the thread's card.
- AC25: Deleting the second of three threads keeps the other two in their previous order.
- AC26: A deleted thread stays gone after a page reload.
- AC27: Deleting the only thread shows the empty state "No threads yet. Create your first thread to get started."
- AC28: A successful deletion shows the success notification `Thread "<thread title>" deleted.`
- AC29: While deleting, "Delete" shows a loading indicator.
- AC30: While deleting, "Cancel" and "Delete" are disabled.
- AC31: While deleting, Esc does not close the modal.
- AC32: While deleting, clicking outside does not close the modal.
- AC33: While deleting, the × button is disabled.
- AC34: A failed deletion keeps the modal open.
- AC35: A failed deletion keeps the thread on the dashboard.
- AC36: A failed deletion shows the error notification "Couldn't delete the thread. Please try again."
- AC37: After a failed deletion, "Cancel" and "Delete" are enabled again.
- AC38: Retrying "Delete" after a failure and succeeding removes the card.

## Style notes

- Follow the existing add-thread flow for state and wiring: modal state lives in `DashboardPageLoader`, values and actions are split into the two contexts, and a `*ModalContainer` reads them and renders the modal — project convention (`src/pages/DashboardPage/components/DashboardPageLoader/`, `.../AddNewThreadModalContainer/`).
- Files are split by concern with dotted suffixes (`.constants.ts`, `.types.ts`, `.hooks.ts`, `.utils.ts`); test IDs use `initTestIdCreator("<Name>__")` and a `<Name>TestId` object — project convention (`MindThreadCard.constants.ts`).
- User-visible strings are `UPPER_SNAKE_CASE` constants in the component's `*.constants.ts`; strings that embed a thread title are small `get...Message` functions in `*.utils.ts` — project convention (`DashboardPageLoader.utils.ts`).
- Chakra components are used only inside `src/components/lib/` adapters; features import adapters from `@/components/lib` — project convention (`CLAUDE.md`).
- The destructive colour uses the Nord red semantic token via `background="red"` on `Button` and `color="red"` on menu items; do not use `colorPalette="red"` (it resolves to Chakra's default red, not Nord) — project convention (`theme.ts`, `AddNewThreadModalActions.tsx` uses `background="accent"`).
- Handlers inside components are named `handle<Event>`; ternaries with `: null` for conditional rendering; no `useMemo`/`useCallback` — project convention (`CLAUDE.md`).
- Functions with two or more parameters take one destructured object — code guide (`typescript.md`).
- Adapters that need a DOM ref use `forwardRef` with a `displayName`, like `IconButton` — project convention (`src/components/lib/IconButton/IconButton.tsx`).
- Tests: root `describe`, a `setup()` that creates `userEvent.setup()` and renders with `renderWithUIProvider`, elements stored in variables before assertions, `toStrictEqual` for objects, `vi.clearAllMocks()` before each test, minimal mocking — code guide (`unit-tests.md`) and project convention (`CLAUDE.md`).

## Phase 1: Implementation

---

### Step 1: Add `deleteThread` to the threads service

**File:**
`src/services/useThreadsService/useThreadsService.types.ts`
`src/services/useThreadsService/useThreadsService.ts`

**Covers:** AC24, AC26, AC35, AC38

**Context:** The service already reads and writes the `threads` key with `throwOnError: true`, so a failed write rejects the returned promise. `createThread` is the sibling pattern to follow.

**Changes:**

1. In `useThreadsService.types.ts`, add to `UseThreadsServiceReturn`:

   ```ts
   deleteThread: (threadId: string) => Promise<void>;
   ```

2. In `useThreadsService.ts`, add after `createThread` and include it in the returned object (`return { getThreads, createThread, deleteThread };`):

   ```ts
   const deleteThread = async (threadId: string): Promise<void> => {
     const storedThreads = await getThreads();

     threadsStorage.set(
       storedThreads.filter((thread) => thread.id !== threadId)
     );
   };
   ```

   Filtering keeps the remaining threads in their stored order. Deleting an unknown id is a no-op that still resolves.

**Verification MANUAL:** `npm run ts:check` passes.

---

### Step 2: Add `removeThread` to `useThreadsState`

**File:**
`src/pages/DashboardPage/components/DashboardPageLoader/DashboardPageLoader.hooks.ts`

**Covers:** AC24, AC25, AC27, AC35

**Context:** Same shape as `addThread`: call the service first, update React state only after it resolves, so a failure leaves the list untouched.

**Changes:**

1. Add inside `useThreadsState`, below `addThread`:

   ```ts
   const removeThread = async (threadId: string) => {
     await threadsService.deleteThread(threadId);

     setThreads((currentThreads) =>
       currentThreads.filter((thread) => thread.id !== threadId)
     );
   };
   ```

2. Return it: `return { threads, threadsStatus, addThread, removeThread };`.

**Verification MANUAL:** `npm run ts:check` passes.

---

### Step 3: Add the delete messages

**File:**
`src/pages/DashboardPage/components/DashboardPageLoader/DashboardPageLoader.constants.ts`
`src/pages/DashboardPage/components/DashboardPageLoader/DashboardPageLoader.utils.ts`

**Covers:** AC28, AC36

**Changes:**

1. In `DashboardPageLoader.constants.ts`, add:

   ```ts
   export const DELETE_THREAD_ERROR_MESSAGE =
     "Couldn't delete the thread. Please try again.";
   ```

2. In `DashboardPageLoader.utils.ts`, add next to `getThreadCreatedMessage`:

   ```ts
   export const getThreadDeletedMessage = (threadTitle: string) =>
     `Thread "${threadTitle}" deleted.`;
   ```

**Verification MANUAL:** `npm run ts:check` passes.

---

### Step 4: Add delete-thread state and actions to `DashboardPageLoader`

**File:**
`src/pages/DashboardPage/components/DashboardPageLoader/DashboardPageLoader.types.ts`
`src/pages/DashboardPage/components/DashboardPageLoader/DashboardPageLoader.tsx`

**Covers:** AC8, AC23, AC24, AC28–AC30, AC34–AC38

**Context:** The thread to delete is held as `MindThread | null` (not an id plus a separate flag) so the modal can show the title and the container can render on `!== null`. `isDeletingThread` drives the loading and disabled states.

**Changes:**

1. In `DashboardPageLoader.types.ts`:
   - Add to `DashboardPageValue`: `threadToDelete: MindThread | null;` and `isDeletingThread: boolean;`.
   - Add to `DashboardPageAction`:

     ```ts
     openDeleteThreadModal: (thread: MindThread) => void;
     closeDeleteThreadModal: () => void;
     confirmDeleteThread: () => Promise<void>;
     ```

   - Import `MindThread` from `@/types` (already imported together with `NewMindThread`).

2. In `DashboardPageLoader.tsx`:
   - Destructure `removeThread` from `useThreadsState()`.
   - Add state:

     ```ts
     const [threadToDelete, setThreadToDelete] = useState<MindThread | null>(null);
     const [isDeletingThread, setIsDeletingThread] = useState(false);
     ```

   - Add the actions next to the add-thread ones:

     ```ts
     const openDeleteThreadModal = (thread: MindThread) => setThreadToDelete(thread);
     const closeDeleteThreadModal = () => setThreadToDelete(null);

     const confirmDeleteThread = async () => {
       if (threadToDelete === null) return;

       setIsDeletingThread(true);

       try {
         await removeThread(threadToDelete.id);

         closeDeleteThreadModal();
         notify.success(getThreadDeletedMessage(threadToDelete.title));
       } catch {
         notify.error(DELETE_THREAD_ERROR_MESSAGE);
       } finally {
         setIsDeletingThread(false);
       }
     };
     ```

   - Import `MindThread` (type), `DELETE_THREAD_ERROR_MESSAGE` and `getThreadDeletedMessage`.
   - Add the three actions to the `DashboardPageActionContext.Provider` value, and `threadToDelete` and `isDeletingThread` to the `DashboardPageValueContext.Provider` value.

   Format with Prettier (line width 80) when done.

**Verification MANUAL:** `npm run ts:check` passes (consumers of the contexts still compile).

---

### Step 5: Extend the `Button` adapter with `loading` and a ref

**File:**
`src/components/lib/Button/Button.tsx`

**Covers:** AC17, AC29

**Context:** The Delete button needs Chakra's loading indicator, and the Cancel button must be focusable by the dialog on open. Follow `IconButton.tsx` for `forwardRef` + `displayName`.

**Changes:**

1. Add `loading?: boolean;` to `ButtonProps`.
2. Wrap the component in `forwardRef<HTMLButtonElement, ButtonProps>`, keeping the existing prop defaults (`variant = "solid"`, `disabled = false`) and the explicit prop list. Pass `ref={ref}` and `loading={loading}` (default `false`) to `ChakraButton`.
3. Add `Button.displayName = "Button";`.

**Verification MANUAL:** `npm run ts:check` passes; the existing "Add new thread" modal still renders and behaves the same.

---

### Step 6: Extend the `Dialog` adapter with `closeDisabled` and `initialFocusRef`

**File:**
`src/components/lib/Dialog/Dialog.tsx`

**Covers:** AC17, AC19–AC21, AC31–AC33

**Context:** Both options are generic dialog behaviours, so they belong in the adapter rather than the feature. Defaults keep the "Add new thread" modal unchanged.

**Changes:**

1. Add to `DialogProps`:

   ```ts
   closeDisabled?: boolean;
   initialFocusRef?: RefObject<HTMLElement | null>;
   ```

   (`import type { ReactNode, RefObject } from "react";`)

2. Destructure `closeDisabled = false` and `initialFocusRef`.
3. On `ChakraDialog.Root` add:

   ```tsx
   closeOnEscape={!closeDisabled}
   closeOnInteractOutside={!closeDisabled}
   initialFocusEl={() => initialFocusRef?.current ?? null}
   ```

4. On the `CloseButton` add `disabled={closeDisabled}`.

**Verification MANUAL:** `npm run ts:check` passes; "Add new thread" modal still closes with Esc, outside click and ×.

---

### Step 7: Add a `Menu` adapter

**New files:**

- `src/components/lib/Menu/Menu.tsx`
- `src/components/lib/Menu/index.ts`

**File:**
`src/components/lib/index.ts`

**Covers:** AC3, AC7, AC9–AC13

**Context:** A card needs a trigger button plus a list of items, and the future "Edit" story must be able to add an item without touching the adapter. The adapter therefore takes an `items` array and renders its own icon-button trigger. Chakra's `Menu` already provides Enter/Space opening, arrow-key focus movement, Esc and outside-click closing, and closing after selection.

**Changes:**

1. `Menu.tsx` — follow the structure of `Dialog.tsx` (named export, Chakra namespace import):

   ```tsx
   export type MenuItem = {
     value: string;
     label: string;
     color?: string;
     onSelect: () => void;
   };

   export type MenuProps = {
     triggerLabel: string;
     triggerIcon: ReactNode;
     items: MenuItem[];
     "data-testid"?: string;
   };
   ```

2. Render:
   - `ChakraMenu.Root` with `onSelect={handleSelect}`, where `handleSelect = ({ value }: { value: string }) => items.find((item) => item.value === value)?.onSelect();`. If the installed Chakra 3.36 types expose per-item selection instead, use that; keep the `MenuItem` contract unchanged.
   - `ChakraMenu.Trigger asChild` wrapping Chakra's `IconButton` with `variant="ghost"`, `size="sm"`, `aria-label={triggerLabel}`, `data-testid={dataTestId}` and `{triggerIcon}` as children.
   - `Portal` → `ChakraMenu.Positioner` → `ChakraMenu.Content` with one `ChakraMenu.Item` per item (`key` and `value` from `item.value`, `color={item.color}`, text `item.label`).

3. `index.ts`: `export * from "./Menu";`.
4. In `src/components/lib/index.ts` add `export { Menu, type MenuProps, type MenuItem } from "./Menu";`.

**Verification MANUAL:** `npm run ts:check` passes.

---

### Step 8: Create `DeleteThreadModalActions`

**New files:**

- `src/pages/DashboardPage/components/DeleteThreadModalContainer/components/DeleteThreadModal/components/DeleteThreadModalActions/DeleteThreadModalActions.tsx`
- `src/pages/DashboardPage/components/DeleteThreadModalContainer/components/DeleteThreadModal/components/DeleteThreadModalActions/DeleteThreadModalActions.constants.ts`
- `src/pages/DashboardPage/components/DeleteThreadModalContainer/components/DeleteThreadModal/components/DeleteThreadModalActions/index.ts`
- `src/pages/DashboardPage/components/DeleteThreadModalContainer/components/DeleteThreadModal/components/index.ts`

**Covers:** AC16, AC18, AC29, AC30, AC37

**Context:** Mirrors `AddNewThreadModalActions` (same folder depth and file set). The Cancel button's ref is passed as `cancelButtonRef` so the parent can give it to `Dialog` as the initial focus target.

**Changes:**

1. `DeleteThreadModalActions.constants.ts`: `DeleteThreadModalActionsTestId` with `container`, `cancelButton`, `deleteButton` (via `initTestIdCreator("DeleteThreadModalActions__")`).
2. `DeleteThreadModalActions.tsx`:

   ```tsx
   export type DeleteThreadModalActionsProps = {
     isDeleting: boolean;
     cancelButtonRef: RefObject<HTMLButtonElement | null>;
     onDelete: () => void;
     onCancel: () => void;
   };
   ```

   Render an `HStack gap="2"` with:
   - `Button ref={cancelButtonRef} variant="outline" disabled={isDeleting} onClick={onCancel}` → "Cancel";
   - `Button background="red" loading={isDeleting} disabled={isDeleting} onClick={onDelete}` → "Delete".
3. Both `index.ts` files re-export (`components/index.ts`: `export * from "./DeleteThreadModalActions";`).

**Verification MANUAL:** `npm run ts:check` passes.

---

### Step 9: Create `DeleteThreadModal`

**New files:**

- `src/pages/DashboardPage/components/DeleteThreadModalContainer/components/DeleteThreadModal/DeleteThreadModal.tsx`
- `src/pages/DashboardPage/components/DeleteThreadModalContainer/components/DeleteThreadModal/DeleteThreadModal.constants.ts`
- `src/pages/DashboardPage/components/DeleteThreadModalContainer/components/DeleteThreadModal/DeleteThreadModal.utils.ts`
- `src/pages/DashboardPage/components/DeleteThreadModalContainer/components/DeleteThreadModal/index.ts`
- `src/pages/DashboardPage/components/DeleteThreadModalContainer/components/index.ts`

**Covers:** AC14, AC15, AC17, AC19–AC21, AC31–AC33

**Context:** Follows `AddNewThreadModal.tsx`: a presentational component built on the `Dialog` adapter, with props for everything it shows.

**Changes:**

1. `DeleteThreadModal.constants.ts`: `export const DELETE_THREAD_MODAL_TITLE = "Delete thread?";`
2. `DeleteThreadModal.utils.ts`:

   ```ts
   export const getDeleteThreadModalText = (threadTitle: string) =>
     `"${threadTitle}" and all its sections and pages will be permanently deleted. This can't be undone.`;
   ```

3. `DeleteThreadModal.tsx`:

   ```tsx
   export type DeleteThreadModalProps = {
     threadTitle: string;
     isDeleting: boolean;
     onClose: () => void;
     onDelete: () => void;
   };
   ```

   - `const cancelButtonRef = useRef<HTMLButtonElement>(null);`
   - Render `Dialog` with `open`, `title={DELETE_THREAD_MODAL_TITLE}`, `closeDisabled={isDeleting}`, `initialFocusRef={cancelButtonRef}`, `onClose={onClose}`, `content={<Text>{getDeleteThreadModalText(threadTitle)}</Text>}` and `actions={<DeleteThreadModalActions isDeleting={isDeleting} cancelButtonRef={cancelButtonRef} onDelete={onDelete} onCancel={onClose} />}`.
4. Both `index.ts` files re-export.

**Verification MANUAL:** `npm run ts:check` passes.

---

### Step 10: Create `DeleteThreadModalContainer`

**New files:**

- `src/pages/DashboardPage/components/DeleteThreadModalContainer/DeleteThreadModalContainer.tsx`
- `src/pages/DashboardPage/components/DeleteThreadModalContainer/index.ts`

**Covers:** AC8, AC18–AC23, AC34

**Context:** Same role as `AddNewThreadModalContainer.tsx`: reads the contexts and renders the modal only while a thread is selected, so the modal unmounts after success or cancel.

**Changes:**

1. `DeleteThreadModalContainer.tsx`:

   ```tsx
   export const DeleteThreadModalContainer = () => {
     const { threadToDelete, isDeletingThread } = useDashboardPageValue();
     const { closeDeleteThreadModal, confirmDeleteThread } =
       useDashboardPageAction();

     return threadToDelete !== null ? (
       <DeleteThreadModal
         threadTitle={threadToDelete.title}
         isDeleting={isDeletingThread}
         onClose={closeDeleteThreadModal}
         onDelete={confirmDeleteThread}
       />
     ) : null;
   };
   ```

2. `index.ts`: `export * from "./DeleteThreadModalContainer";`.

**Verification MANUAL:** `npm run ts:check` passes.

---

### Step 11: Register the container on the dashboard

**File:**
`src/pages/DashboardPage/components/index.ts`
`src/pages/DashboardPage/DashboardPage.tsx`

**Covers:** AC8

**Changes:**

1. In `components/index.ts` add `export * from "./DeleteThreadModalContainer";`.
2. In `DashboardPage.tsx` import `DeleteThreadModalContainer` and render it after `<AddNewThreadModalContainer />` inside `DashboardPageLoader`.

**Verification MANUAL:** `npm run start`; the dashboard renders as before.

---

### Step 12: Create the `CardActions` component

**New files:**

- `src/pages/DashboardPage/components/DashboardContent/components/MindThreadCard/components/CardActions.tsx`
- `src/pages/DashboardPage/components/DashboardContent/components/MindThreadCard/utils/getThreadActionsLabel.ts`

**File:**
`src/pages/DashboardPage/components/DashboardContent/components/MindThreadCard/components/index.ts`
`src/pages/DashboardPage/components/DashboardContent/components/MindThreadCard/utils/index.ts`
`src/pages/DashboardPage/components/DashboardContent/components/MindThreadCard/MindThreadCard.constants.ts`

**Covers:** AC1, AC2, AC3, AC5, AC6, AC7, AC13

**Context:** React synthetic events bubble through portals, so a click inside the open menu would reach the card's `onClick`. Stopping propagation once on a wrapper around the whole `Menu` covers the trigger and every item (AC5, AC6). The wrapper is positioned absolutely, so it sits in the top-right corner in both grid and list modes. Following `CardColorIndicator.tsx` / `CardContent.tsx`, it is a separate component under `components/`.

**Changes:**

1. `getThreadActionsLabel.ts`:

   ```ts
   export const getThreadActionsLabel = (threadTitle: string) =>
     `Thread actions for ${threadTitle}`;
   ```

   Export it from `utils/index.ts`.

2. In `MindThreadCard.constants.ts` add `actions: createTestId("actions")` and `actionsMenu: createTestId("actions-menu")` to `MindThreadCardTestId`, plus:

   ```ts
   export const DELETE_THREAD_MENU_ITEM = { value: "delete", label: "Delete" } as const;
   ```

3. `CardActions.tsx`:

   ```tsx
   type CardActionsProps = {
     thread: MindThread;
     onDelete: (thread: MindThread) => void;
   };
   ```

   - `handleContainerClick = (event: MouseEvent) => event.stopPropagation();`
   - `handleDelete = () => onDelete(thread);`
   - Render `Box data-testid={MindThreadCardTestId.actions} position="absolute" top="2" right="2" onClick={handleContainerClick}` containing `Menu` with `triggerLabel={getThreadActionsLabel(thread.title)}`, `triggerIcon={<LuEllipsisVertical />}` (from `react-icons/lu`, as in `ThreadListModeButton.tsx`), `data-testid={MindThreadCardTestId.actionsMenu}` and `items=[{ ...DELETE_THREAD_MENU_ITEM, color: "red", onSelect: handleDelete }]`.
4. Export `CardActions` from `components/index.ts`.

**Verification MANUAL:** `npm run ts:check` passes.

---

### Step 13: Render `CardActions` in `MindThreadCard`

**File:**
`src/pages/DashboardPage/components/DashboardContent/components/MindThreadCard/MindThreadCard.tsx`
`src/pages/DashboardPage/components/DashboardContent/components/MindThreadCard/components/CardContent.tsx`

**Covers:** AC1, AC2, AC5, AC6

**Changes:**

1. In `MindThreadCard.tsx`:
   - Add `onDelete: (thread: MindThread) => void;` to `MindThreadCardProps` and destructure it.
   - Add `position="relative"` to the container `Box`.
   - Render `<CardActions thread={thread} onDelete={onDelete} />` after `<CardContent ... />`.
2. In `CardContent.tsx`, add `pr="12"` to the title container's `VStack` (next to `p="4"`) so long titles do not run under the button.

**Verification MANUAL:** `npm run ts:check` will fail only in `MindThreadList.tsx` until Step 14; the card layout is checked after that step.

---

### Step 14: Pass `onDelete` from `MindThreadList`

**File:**
`src/pages/DashboardPage/components/DashboardContent/components/MindThreadList/MindThreadList.tsx`

**Covers:** AC8

**Changes:**

1. Import `useDashboardPageAction` together with `useDashboardPageValue`.
2. Add `const { openDeleteThreadModal } = useDashboardPageAction();`.
3. Pass `onDelete={openDeleteThreadModal}` to `MindThreadCard`.

**Verification MANUAL:** `npm run start`, with at least two threads in grid and in list view: the three-dots button appears top-right on each card with the "Thread actions for <title>" label; the menu shows only "Delete"; choosing it opens the "Delete thread?" modal with "Cancel" focused and does not open the thread (the console does not log the thread); deleting removes the card, shows `Thread "<title>" deleted.`, and survives a reload; deleting the last thread shows the empty state; making `setItem` throw (DevTools override of `Storage.prototype.setItem`) keeps the modal open with the error notification and enabled buttons; while a delete is running (add a temporary delay) Esc, outside click and × do nothing.

## Phase 2: Unit tests

---

### Step 1: Test `deleteThread` in the threads service

**File:**
`src/services/useThreadsService/__tests__/useThreadsService.test.ts`

**Covers:** AC24–AC26, AC35

**Changes:**

Add a `deleteThread` group using the file's existing `setupHook()` and `seedThreads` from `@/__test-fixtures__`:

1. Removes only the thread with the given id and persists the rest in their original order (seed three threads, delete the second, read back `localStorage`).
2. Resolves and leaves storage unchanged for an unknown id.
3. Resolves with an empty stored list when deleting the only thread.
4. Rejects when `Storage.prototype.setItem` throws (spy, silence `console.error`), and the stored data is unchanged.
5. Rejects with `INVALID_THREADS_DATA_ERROR` when the stored data is malformed (`MALFORMED_JSON` / invalid shape, as the existing `getThreads` tests do).

**Verification:** `npx vitest run src/services/useThreadsService` — all tests pass.

---

### Step 2: Add a deferred-promise test helper

**New files:**

- `src/__test-fixtures__/deferred.ts`

**File:**
`src/__test-fixtures__/index.ts`

**Context:** "Deleting" is only observable if the service call stays pending. The real service is synchronous underneath, so Steps 3 and 8 override `deleteThread` with a promise the test controls. Create the helper once and reuse it.

**Changes:**

1. `deferred.ts`:

   ```ts
   export const createDeferred = <Value = void>() => {
     let resolve!: (value: Value) => void;
     let reject!: (reason?: unknown) => void;

     const promise = new Promise<Value>((promiseResolve, promiseReject) => {
       resolve = promiseResolve;
       reject = promiseReject;
     });

     return { promise, resolve, reject };
   };
   ```

2. Add `export * from "./deferred";` to `index.ts`.

**Verification:** `npx vitest run` — existing tests still pass.

---

### Step 3: Test the delete flow in `DashboardPageLoader`

**File:**
`src/pages/DashboardPage/components/DashboardPageLoader/__tests__/DashboardPageLoader.test.tsx`

**Covers:** AC8, AC23–AC25, AC28–AC30, AC34–AC38

**Changes:**

Extend the existing `TestConsumer` with buttons that call `openDeleteThreadModal(thread)`, `closeDeleteThreadModal()` and `confirmDeleteThread()`, and with `threadToDelete` / `isDeletingThread` outputs. Add tests:

1. `openDeleteThreadModal` sets `threadToDelete`; `closeDeleteThreadModal` clears it.
2. `confirmDeleteThread` removes the thread from `threads`, clears `threadToDelete`, and shows the `getThreadDeletedMessage` notification (find it with `NotificationsTestId`, as the add-thread tests do).
3. Deleting the second of three seeded threads leaves the other two in order and updates `localStorage`.
4. When `setItem` throws (spy, silence `console.error`): `threadToDelete` stays set, the thread remains in `threads`, the `DELETE_THREAD_ERROR_MESSAGE` notification is shown, `isDeletingThread` is `false` again.
5. A retry after a failure succeeds (restore the spy, click confirm again) and removes the thread.
6. `isDeletingThread` is `true` while the service call is pending and `false` after it settles. This is the only scenario that needs a mock: `vi.mock("@/services", ...)` wrapping the real `useThreadsService` so `deleteThread` returns `createDeferred().promise` for this test and calls through otherwise. Define the mock once at the top of the file.

**Verification:** `npx vitest run src/pages/DashboardPage/components/DashboardPageLoader` — all tests pass.

---

### Step 4: Test the `Button` adapter changes

**File:**
`src/components/lib/Button/__tests__/Button.test.tsx`

**Covers:** AC17, AC29

**Changes:**

1. A `loading` button is disabled and does not call `onClick` when clicked.
2. A non-loading button still calls `onClick`.
3. A `ref` passed to `Button` receives the underlying `<button>` element (render with `createRef`).

**Verification:** `npx vitest run src/components/lib/Button` — all tests pass.

---

### Step 5: Test the `Dialog` adapter changes

**File:**
`src/components/lib/Dialog/__tests__/Dialog.test.tsx`

**Covers:** AC17, AC19–AC21, AC31–AC33

**Changes:**

Extend `setup` with the new props and add tests:

1. With `closeDisabled`, pressing Esc does not call `onClose`; the × button is disabled; clicking the backdrop does not call `onClose`.
2. Without `closeDisabled`, Esc and the backdrop click call `onClose`.
3. With `initialFocusRef` pointing at a button inside `actions`, that button has focus after open. Focus is applied asynchronously by the dialog: use `await waitFor(() => expect(button).toHaveFocus())`, the one place this is unavoidable.

**Verification:** `npx vitest run src/components/lib/Dialog` — all tests pass.

---

### Step 6: Test the `Menu` adapter

**New files:**

- `src/components/lib/Menu/__tests__/Menu.test.tsx`

**Covers:** AC3, AC7, AC9–AC13

**Changes:**

`setup()` renders `Menu` with a `triggerLabel`, an icon and two items (the second with `color`), with `userEvent.setup()`. Tests:

1. Renders a trigger button with the given accessible name; items are not shown while closed.
2. Clicking the trigger shows the items in order.
3. Pressing Enter, and separately Space, on the focused trigger opens the menu.
4. Down and Up arrows move focus between items after opening with the keyboard.
5. Selecting an item calls only that item's `onSelect` and closes the menu.
6. Esc closes the menu; clicking outside closes the menu.

**Verification:** `npx vitest run src/components/lib/Menu` — all tests pass.

---

### Step 7: Test `DeleteThreadModalActions`

**New files:**

- `src/pages/DashboardPage/components/DeleteThreadModalContainer/components/DeleteThreadModal/components/DeleteThreadModalActions/__tests__/DeleteThreadModalActions.test.tsx`

**Covers:** AC16, AC18, AC29, AC30, AC37

**Changes:**

Mirror `AddNewThreadModalActions.test.tsx`. Tests:

1. Renders "Cancel" and "Delete" buttons (by `DeleteThreadModalActionsTestId`).
2. Clicking each calls `onCancel` / `onDelete`.
3. With `isDeleting`, both are disabled and "Delete" shows the loading indicator; neither calls its handler on click.
4. With `isDeleting={false}`, both are enabled.
5. `cancelButtonRef.current` points to the Cancel button.

**Verification:** `npx vitest run DeleteThreadModalActions` — all tests pass.

---

### Step 8: Test `DeleteThreadModal` and its utils

**New files:**

- `src/pages/DashboardPage/components/DeleteThreadModalContainer/components/DeleteThreadModal/__tests__/DeleteThreadModal.test.tsx`
- `src/pages/DashboardPage/components/DeleteThreadModalContainer/components/DeleteThreadModal/__tests__/DeleteThreadModal.utils.test.ts`

**Covers:** AC14–AC21, AC29–AC33

**Changes:**

1. `DeleteThreadModal.utils.test.ts`: `getDeleteThreadModalText("Testing Strategy")` returns the exact AC15 text.
2. `DeleteThreadModal.test.tsx`, with `setup({ isDeleting })`:
   - shows the title `DELETE_THREAD_MODAL_TITLE` and the AC15 text for "Testing Strategy";
   - "Cancel" has focus after open (`waitFor` is acceptable here, see Dialog Step 5);
   - Cancel click, Esc, × click and an outside click each call `onClose` when `isDeleting` is `false`;
   - with `isDeleting`, Esc, outside click and × do nothing (× is disabled), and both buttons are disabled.

**Verification:** `npx vitest run DeleteThreadModal` — all tests pass.

---

### Step 9: Test `DeleteThreadModalContainer`

**New files:**

- `src/pages/DashboardPage/components/DeleteThreadModalContainer/__tests__/DeleteThreadModalContainer.test.tsx`

**Covers:** AC8, AC14, AC15, AC18–AC23, AC27–AC38

**Context:** Follow `AddNewThreadModalContainer.test.tsx`: render `DashboardPageLoader` with a small trigger that calls `openDeleteThreadModal(thread)` and a list that prints the threads, so the real state and `localStorage` are used end to end. Seed threads with `seedThreads`.

**Changes:**

1. The modal is not rendered until the trigger is clicked; it then shows the title and the thread-specific text.
2. Cancel closes the modal and the thread is still listed (AC18, AC22); same for Esc and × (AC19, AC20, AC22).
3. Delete: modal closes, thread is gone from the list, `Thread "<title>" deleted.` notification is shown, `localStorage` no longer contains the thread (AC23, AC24, AC26, AC28).
4. Deleting the only thread leaves an empty list (AC27).
5. Failure (spy `Storage.prototype.setItem` to throw, silence `console.error`): the modal stays open, the thread is still listed, the error notification is shown, "Cancel" and "Delete" are enabled (AC34–AC37).
6. After the failure, restore `setItem`, click "Delete" again: the thread is removed (AC38).
7. In progress: reuse the `vi.mock("@/services", ...)` + `createDeferred` approach from Phase 2 Step 3 (move the mock factory to a shared test helper if it would otherwise be duplicated). While pending, "Delete" shows loading, both buttons are disabled, Esc and outside click leave the modal open (AC29–AC33); after resolving, the modal closes.

**Verification:** `npx vitest run DeleteThreadModalContainer` — all tests pass.

---

### Step 10: Test `CardActions` and `getThreadActionsLabel`

**New files:**

- `src/pages/DashboardPage/components/DashboardContent/components/MindThreadCard/components/__tests__/CardActions.test.tsx`
- `src/pages/DashboardPage/components/DashboardContent/components/MindThreadCard/utils/__tests__/getThreadActionsLabel.test.ts`

**Covers:** AC3, AC5–AC7, AC13

**Changes:**

1. `getThreadActionsLabel("Testing Strategy")` returns `"Thread actions for Testing Strategy"`.
2. `CardActions.test.tsx`, rendering `CardActions` inside a parent element that has an `onClick` spy:
   - the button's accessible name is `Thread actions for <title>`;
   - opening the menu shows exactly one item, "Delete";
   - clicking the button and clicking "Delete" never call the parent's `onClick`;
   - clicking "Delete" calls `onDelete` with the thread and closes the menu.

**Verification:** `npx vitest run CardActions getThreadActionsLabel` — all tests pass.

---

### Step 11: Update the `MindThreadCard` tests

**File:**
`src/pages/DashboardPage/components/DashboardContent/components/MindThreadCard/__tests__/MindThreadCard.test.tsx`

**Covers:** AC1, AC2, AC5, AC6

**Changes:**

1. Add a `mockOnDelete = vi.fn()` next to `mockOnClick` and pass it as `onDelete` in `setup()`.
2. In both grid and list modes, the actions button is rendered with the label `Thread actions for Test Thread`.
3. Clicking the actions button does not call `onClick`; choosing "Delete" calls `onDelete` with the thread and does not call `onClick`.
4. Clicking elsewhere on the card still calls `onClick` (existing test remains).

**Verification:** `npx vitest run MindThreadCard` — all tests pass.

---

### Step 12: Update the `MindThreadList` tests

**File:**
`src/pages/DashboardPage/components/DashboardContent/components/MindThreadList/__tests__/MindThreadList.test.tsx`

**Covers:** AC8

**Context:** This file already mocks the `DashboardPageLoader` hooks, so extend that mock once rather than adding a second one.

**Changes:**

1. Add `useDashboardPageAction` returning `{ openDeleteThreadModal: mockOpenDeleteThreadModal }` to the existing `vi.mock`.
2. Add a test: choosing "Delete" from a card's menu calls `mockOpenDeleteThreadModal` with that thread.

**Verification:** `npx vitest run MindThreadList` — all tests pass.

---

### Step 13: Test the full flow on `DashboardPage`

**File:**
`src/pages/DashboardPage/__tests__/DashboardPage.test.tsx`

**Covers:** AC1, AC2, AC5, AC6, AC8, AC24–AC27, AC28

**Changes:**

Using the file's existing `setup()` and seeded threads:

1. In grid mode and in list mode, every card has a "Thread actions for <title>" button.
2. Open the menu on the second of three threads → Delete → the modal names that thread; confirm → the other two remain in their previous order and the success notification is shown.
3. Rendering the page again (unmount, `render` again with the same `localStorage`) does not show the deleted thread.
4. Deleting the only thread shows `No threads yet. Create your first thread to get started.`
5. Choosing "Delete" does not trigger the card's click behaviour (no `console.log` call; spy on `console.log` until the card click is replaced by navigation).

**Verification:** `npx vitest run src/pages/DashboardPage` — all tests pass; then `npm run test` passes in full.

## Phase 3: Documentation

---

### Step 1: Update `CLAUDE.md`

**File:**
`CLAUDE.md`

**Covers:** documentation of the new adapters and service method.

**Changes:**

1. In the `src/services/` bullet under **Architecture → Folder structure**, mention that `useThreadsService` exposes `getThreads`, `createThread` and `deleteThread` (keep the sentence about `localStorage` persistence).
2. In **Third-party Libraries → Chakra UI**, after the `Notifications` paragraph, add one short paragraph: `Menu` takes a trigger label, icon and an `items` array (`{ value, label, color?, onSelect }`); `Dialog` accepts `closeDisabled` (blocks Esc, outside click and the × button) and `initialFocusRef`; `Button` accepts `loading` and forwards a ref.

**Verification MANUAL:** Read the edited `CLAUDE.md` sections; the descriptions match the final adapter props and no unrelated text changed.
