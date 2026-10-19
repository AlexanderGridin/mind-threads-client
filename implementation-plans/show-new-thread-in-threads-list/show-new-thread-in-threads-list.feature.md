# Show created threads on the dashboard

**Source:** `implementation-plans/show-new-thread-in-threads-list/show-new-thread-in-threads-list.draft.md`

## Acceptance criteria

- AC1: The dashboard shows only threads the user created — no demo threads.
- AC2: After "Add" saves a thread, the new thread is the first card on the dashboard.
- AC3: After "Add" saves a thread, the modal closes.
- AC4: A new card shows the picked name and color, 0 sections, 0 pages, and the creation time as "last updated" (same format as other cards).
- AC5: Threads are ordered newest first in both grid and list view.
- AC6: After a page reload, all created threads are still shown in the same order.
- AC7: Two threads with the same name are shown as two separate cards.
- AC8: When the name field contains only spaces, "Add" is disabled.
- AC9: Leading/trailing spaces are trimmed from the saved name.
- AC10: With no threads, the dashboard shows "No threads yet. Create your first thread to get started." and an "Add new thread" button.
- AC11: The empty-state button opens the same "Add new thread" modal as the header button.
- AC12: After the first thread is created, the empty state is replaced by the thread list.
- AC13: On save, a success notification shows `Thread "<thread name>" created.`
- AC14: On save failure, the modal stays open with the entered name and color kept.
- AC15: On save failure, an error notification shows "Couldn't save the thread. Please try again."
- AC16: On save failure, the failed thread does not appear in the list.
- AC17: After a failed save, clicking "Add" again and succeeding puts the thread first on the dashboard.
- AC18: If saved threads can't be read, an error card "Couldn't load your threads. Please reload the page." is shown in place of the empty state.
- AC19: While the error card is shown, neither the empty state nor any load-failure notification is shown.
- AC20: While the error card is shown, the header "Add new thread" button is disabled.
- AC21: A notification closes on its own after 5 seconds.
- AC22: A notification closes right away when its close control is clicked.
- AC23: Notifications appear in the bottom-right corner.
- AC24: Notifications use the colors of the active color mode.

## Style notes

- `useLocalStorage` gets an **opt-in strict mode** (`throwOnError: true`): it rethrows read/write errors after logging them. The default behaviour (log and swallow) stays unchanged for existing callers. — developer decision
- Functions with 2+ parameters take one destructured object. `useLocalStorage` therefore changes from `useLocalStorage(key)` to `useLocalStorage({ key, throwOnError })`, the same shape as `useFetch({ baseUrl, defaultHeaders })`. — code guide (`typescript.md` rule 3), project precedent (`src/hooks/useFetch/useFetch.ts`)
- Services are hooks that return async methods and live in `src/services/<useXService>/`, with the same file split as `src/hooks/useLocalStorage/` (`<name>.ts`, `<name>.types.ts`, `<name>.constants.ts`, `<name>.utils.ts`, `index.ts`). — code guide (`project-structure.md`), project convention (`src/hooks/`)
- Enumerations are `as const` objects in `DashboardPage.constants.ts`, with a derived union type in `DashboardPage.types.ts` (as `ThreadListMode`/`ThreadListModeType` do). — project convention
- Test IDs are built with `initTestIdCreator` in `<Component>.constants.ts`, and every user-visible string is a constant in the same file. — project convention (`AddNewThread.constants.ts`)
- The context file keeps the project's `DashboardPageLoader.context.ts` name (the guide says `.contexts.ts`). — project convention wins
- New component props types are declared in the component file and are not exported. — code guide (`react.md` rule 4)
- Non-component exports (the toaster instance, `notify`) go in a separate `*.toaster.ts` file, because `eslint-plugin-react-refresh` flags component files that also export non-components. — project lint config (`eslint.config.js`)
- Conditional JSX uses ternaries, never `&&`. A component that switches between several views may use early `return`s. — project convention (`CLAUDE.md`)
- The "Add new thread" modal's open state moves from the header into the `DashboardPageLoader` context, so the header and the empty state open the same modal instance. — architectural decision (AC11)

## Phase 1: Implementation

---

### Step 1: Add an id and a draft type to the shared thread type

**File:**
`src/types/MindThread.ts`

**Covers:** AC7

**Context:** List items are currently keyed by `title` (`MindThreadList.tsx:35`), so two threads with the same name would collide. Each thread needs a stable unique id.

**Changes:**

1. Add `id: string` as the first field of `MindThread`.
2. Add the type for user-entered thread data, shared by the form and the service:

   ```ts
   export type NewMindThread = Pick<MindThread, "title" | "color">;
   ```

**Verification MANUAL:** `MindThread` has `id`, and `NewMindThread` is exported through `src/types/index.ts` (it already re-exports `./MindThread`). Type errors in fixtures, mocks, and tests are expected until later steps and Phase 2.

---

### Step 2: Reuse the shared draft type in the thread form

**File:**
`src/pages/DashboardPage/components/DashboardHeader/components/AddNewThread/components/AddNewThreadModal/AddNewThreadModal.types.ts`

**Changes:**

1. Replace the local `Pick` with the shared type, so the form value and the service payload can't drift apart:

   ```ts
   import type { NewMindThread } from "@/types";

   export type ThreadFormValue = NewMindThread;
   ```

**Verification MANUAL:** The `ThreadForm` and `AddNewThreadModal` files still type-check.

---

### Step 3: Add an opt-in strict mode to `useLocalStorage`

**Files:**
- `src/hooks/useLocalStorage/useLocalStorage.types.ts`
- `src/hooks/useLocalStorage/useLocalStorage.ts`
- `src/pages/DashboardPage/components/DashboardPageLoader/DashboardPageLoader.tsx`

**Covers:** AC15, AC16, AC18

**Context:** The hook currently logs and swallows every storage error, so callers can't tell "nothing stored" from "storage failed". Strict mode is opt-in, so the thread-list-mode code keeps its forgiving behaviour.

**Changes:**

1. In `useLocalStorage.types.ts`, add:

   ```ts
   export type UseLocalStorageParams = {
     key: string;
     throwOnError?: boolean;
   };
   ```

2. In `useLocalStorage.ts`, change the signature to one object parameter:

   ```ts
   export const useLocalStorage = <ValueType>({
     key,
     throwOnError = false,
   }: UseLocalStorageParams): UseLocalStorageReturn<ValueType> => {
   ```

3. In the `catch` of `read()`, keep the `console.error` and the `cacheRef.current = null` reset, then add `if (throwOnError) throw error;` before falling through to `return cacheRef.current`.
4. In the `catch` of `set()`, keep the `console.error`, then add `if (throwOnError) throw error;`. `cacheRef.current` must stay unchanged on failure. It already is, because the assignment comes after `setItem`.
5. In `DashboardPageLoader.tsx`, update the only existing caller:

   ```ts
   const threadListModeStorage = useLocalStorage<ThreadListModeType>({
     key: THREAD_LIST_MODE_STORAGE_KEY,
   });
   ```

**Verification MANUAL:** `npm run start`. The grid/list toggle still works and persists across reloads.

---

### Step 4: Create the threads service constants, types, and utils

**New files:**

- `src/services/useThreadsService/useThreadsService.constants.ts`
- `src/services/useThreadsService/useThreadsService.types.ts`
- `src/services/useThreadsService/useThreadsService.utils.ts`

**Covers:** AC4, AC7, AC9, AC18

**Context:** The service is async even though it is backed by `localStorage` today. The story says storage moves to a backend later, and consumers won't have to change then (`useFetch` is already in place for that).

**Changes:**

1. `useThreadsService.constants.ts`:

   ```ts
   export const THREADS_STORAGE_KEY = "threads";
   export const INVALID_THREADS_DATA_ERROR = "Stored threads data is invalid";
   ```

2. `useThreadsService.types.ts`:

   ```ts
   import type { MindThread, NewMindThread } from "@/types";

   export type UseThreadsServiceReturn = {
     getThreads: () => Promise<MindThread[]>;
     createThread: (newThread: NewMindThread) => Promise<MindThread>;
   };
   ```

3. `useThreadsService.utils.ts`, with two pure functions:

   ```ts
   export const buildThread = ({ title, color }: NewMindThread): MindThread => ({
     id: crypto.randomUUID(),
     title: title.trim(),
     color,
     totalSections: 0,
     totalPages: 0,
     lastUpdated: new Date().toISOString(),
   });

   const isMindThread = (value: unknown): value is MindThread =>
     typeof value === "object" &&
     value !== null &&
     typeof (value as MindThread).id === "string" &&
     typeof (value as MindThread).title === "string";

   export const isMindThreadList = (value: unknown): value is MindThread[] =>
     Array.isArray(value) && value.every(isMindThread);
   ```

**Verification MANUAL:** `npm run ts:check` shows no errors in `src/services/`.

---

### Step 5: Create the `useThreadsService` hook

**New files:**

- `src/services/useThreadsService/useThreadsService.ts`
- `src/services/useThreadsService/index.ts`
- `src/services/index.ts`

**Covers:** AC2, AC5, AC6, AC16, AC18

**Context:** New threads are prepended to the stored array, so storage order is always newest first. That order survives reloads and is the same in grid and list view (AC5, AC6). Storage is written before the new thread is returned, so a failed save never reaches the UI state (AC16).

**Changes:**

1. `useThreadsService.ts`:

   ```ts
   export const useThreadsService = (): UseThreadsServiceReturn => {
     const threadsStorage = useLocalStorage<MindThread[]>({
       key: THREADS_STORAGE_KEY,
       throwOnError: true,
     });

     const getThreads = async (): Promise<MindThread[]> => {
       const storedThreads = threadsStorage.read();

       if (storedThreads === null) return [];

       if (!isMindThreadList(storedThreads)) {
         throw new Error(INVALID_THREADS_DATA_ERROR);
       }

       return storedThreads;
     };

     const createThread = async (
       newThread: NewMindThread
     ): Promise<MindThread> => {
       const createdThread = buildThread(newThread);
       const storedThreads = await getThreads();

       threadsStorage.set([createdThread, ...storedThreads]);

       return createdThread;
     };

     return { getThreads, createThread };
   };
   ```

2. `useThreadsService/index.ts`: `export * from "./useThreadsService";` and `export * from "./useThreadsService.types";`.
3. `src/services/index.ts`: `export * from "./useThreadsService";`.

**Verification MANUAL:** `npm run ts:check` shows no errors in `src/services/`, and `import { useThreadsService } from "@/services"` resolves.

---

### Step 6: Create the Notifications adapter

**New files:**

- `src/components/lib/Notifications/Notifications.constants.ts`
- `src/components/lib/Notifications/Notifications.types.ts`
- `src/components/lib/Notifications/Notifications.toaster.ts`
- `src/components/lib/Notifications/Notifications.tsx`
- `src/components/lib/Notifications/index.ts`

**Covers:** AC21, AC22, AC23, AC24

**Context:** This wraps Chakra v3's `createToaster` + `Toaster` + `Toast.*`. Chakra's default success/error toasts use `green.solid`/`red.solid` backgrounds, which don't follow the color mode, so the root is restyled with the theme's mode-aware semantic tokens (`bg.subtle`, `fg`, `border`). Only the status icon is colored. Style props win over recipe styles because Chakra puts utilities in a later cascade layer than recipes.

**Changes:**

1. `Notifications.constants.ts`:

   ```ts
   import { initTestIdCreator } from "../utils";

   const createTestId = initTestIdCreator("Notifications__");

   export const NotificationsTestId = {
     notification: createTestId("notification"),
     closeButton: createTestId("close-button"),
   } as const;

   export const NOTIFICATION_DURATION_MS = 5000;
   export const NOTIFICATION_PLACEMENT = "bottom-end";
   export const CLOSE_NOTIFICATION_LABEL = "Close notification";
   ```

2. `Notifications.types.ts`: `export type NotificationType = "success" | "error";`
3. `Notifications.toaster.ts`:

   ```ts
   import { createToaster } from "@chakra-ui/react";

   export const notificationsToaster = createToaster({
     placement: NOTIFICATION_PLACEMENT,
     pauseOnPageIdle: true,
   });

   type ShowNotificationParams = {
     type: NotificationType;
     message: string;
   };

   const showNotification = ({ type, message }: ShowNotificationParams) => {
     notificationsToaster.create({
       type,
       title: message,
       duration: NOTIFICATION_DURATION_MS,
       closable: true,
     });
   };

   export const notify = {
     success: (message: string) => showNotification({ type: "success", message }),
     error: (message: string) => showNotification({ type: "error", message }),
   };
   ```

4. `Notifications.tsx`:

   ```tsx
   import { Portal, Toast, Toaster } from "@chakra-ui/react";

   export const Notifications = () => (
     <Portal>
       <Toaster toaster={notificationsToaster} insetInline={{ mdDown: "4" }}>
         {(toast) => (
           <Toast.Root
             data-testid={NotificationsTestId.notification}
             width={{ md: "sm" }}
             bg="bg.subtle"
             color="fg"
             borderWidth="1px"
             borderColor="border"
           >
             <Toast.Indicator color={toast.type === "error" ? "red" : "green"} />
             <Toast.Title flex="1">{toast.title}</Toast.Title>
             <Toast.CloseTrigger
               data-testid={NotificationsTestId.closeButton}
               aria-label={CLOSE_NOTIFICATION_LABEL}
             />
           </Toast.Root>
         )}
       </Toaster>
     </Portal>
   );
   ```

5. `index.ts`: `export * from "./Notifications";`, `export * from "./Notifications.toaster";`, `export type * from "./Notifications.types";`.
6. In `src/components/lib/index.ts`, add `export { Notifications, notify } from "./Notifications";`.

**Verification MANUAL:** `npm run lint` reports no `react-refresh` warning for the new files, and `npm run ts:check` shows no errors in `src/components/lib/`.

---

### Step 7: Mount Notifications in the UI provider

**File:**
`src/components/lib/ChakraUIProvider.tsx`

**Covers:** AC21, AC22, AC23, AC24

**Context:** Mounting it in the provider makes notifications available app-wide. `renderWithUIProvider` uses this provider, so tests render notifications too.

**Changes:**

1. Import `Notifications` from `./Notifications` (a relative path, not the lib barrel, to avoid a cycle).
2. Render it after the children:

   ```tsx
   <ColorModeProvider>
     {children}
     <Notifications />
   </ColorModeProvider>
   ```

**Verification MANUAL:** `npm run start`. Temporarily call `notify.success("Hi")` from the browser console via a dev hook, or from a component. It appears bottom-right, has a close button, disappears after about 5 s, and matches light and dark mode. Remove the temporary call afterwards.

---

### Step 8: Add a threads-loading status

**Files:**
- `src/pages/DashboardPage/DashboardPage.constants.ts`
- `src/pages/DashboardPage/DashboardPage.types.ts`

**Covers:** AC18, AC19, AC20

**Changes:**

1. In `DashboardPage.constants.ts`, next to `ThreadListMode`:

   ```ts
   export const ThreadsStatus = {
     Loading: "loading",
     Loaded: "loaded",
     Error: "error",
   } as const;
   ```

2. In `DashboardPage.types.ts`:

   ```ts
   export type ThreadsStatusType =
     (typeof ThreadsStatus)[keyof typeof ThreadsStatus];
   ```

**Verification MANUAL:** `npm run ts:check` shows no new errors in these files.

---

### Step 9: Extend the dashboard context contract

**Files:**
- `src/pages/DashboardPage/components/DashboardPageLoader/DashboardPageLoader.types.ts`
- `src/pages/DashboardPage/components/DashboardPageLoader/DashboardPageLoader.constants.ts`
- `src/pages/DashboardPage/components/DashboardPageLoader/DashboardPageLoader.utils.ts` (new)

**Covers:** AC11, AC13, AC15, AC18, AC20

**Changes:**

1. In `DashboardPageLoader.types.ts`:

   ```ts
   export type DashboardPageValue = {
     threadListMode: ThreadListModeType;
     threads: MindThread[];
     threadsStatus: ThreadsStatusType;
     isAddThreadModalOpen: boolean;
   };

   export type DashboardPageAction = {
     toggleThreadListMode: () => void;
     openAddThreadModal: () => void;
     closeAddThreadModal: () => void;
     submitNewThread: (newThread: NewMindThread) => Promise<void>;
   };
   ```

2. In `DashboardPageLoader.constants.ts`, add:

   ```ts
   export const SAVE_THREAD_ERROR_MESSAGE =
     "Couldn't save the thread. Please try again.";
   ```

3. Create `DashboardPageLoader.utils.ts`:

   ```ts
   export const getThreadCreatedMessage = (threadTitle: string) =>
     `Thread "${threadTitle}" created.`;
   ```

**Verification MANUAL:** The types compile. `DashboardPageLoader.tsx` now reports missing context fields, which Step 11 fixes.

---

### Step 10: Add the `useThreadsState` hook

**File:**
`src/pages/DashboardPage/components/DashboardPageLoader/DashboardPageLoader.hooks.ts`

**Covers:** AC1, AC2, AC5, AC6, AC16, AC17, AC18, AC19

**Context:** The effect only loads while the status is `Loading`. Without that guard it would re-run in a loop: tests don't run the React Compiler (`vitest.config.ts` has no babel plugin), so the service object is new on every render. State is set only after an `await`, which keeps `react-hooks/set-state-in-effect` satisfied. A load failure only sets the status and shows no notification (AC19).

**Changes:**

1. Add, below the existing context hooks:

   ```ts
   export const useThreadsState = () => {
     const threadsService = useThreadsService();

     const [threads, setThreads] = useState<MindThread[]>([]);
     const [threadsStatus, setThreadsStatus] = useState<ThreadsStatusType>(
       ThreadsStatus.Loading
     );

     useEffect(() => {
       if (threadsStatus !== ThreadsStatus.Loading) return;

       let isActive = true;

       const loadThreads = async () => {
         try {
           const storedThreads = await threadsService.getThreads();

           if (!isActive) return;

           setThreads(storedThreads);
           setThreadsStatus(ThreadsStatus.Loaded);
         } catch {
           if (isActive) setThreadsStatus(ThreadsStatus.Error);
         }
       };

       loadThreads();

       return () => {
         isActive = false;
       };
     }, [threadsStatus, threadsService]);

     const addThread = async (newThread: NewMindThread) => {
       const createdThread = await threadsService.createThread(newThread);

       setThreads((currentThreads) => [createdThread, ...currentThreads]);

       return createdThread;
     };

     return { threads, threadsStatus, addThread };
   };
   ```

2. Add the needed imports: `useEffect` and `useState` from `react`, `useThreadsService` from `@/services`, the types from `@/types`, and `ThreadsStatus`/`ThreadsStatusType` from `../../DashboardPage.constants` / `../../DashboardPage.types`.

**Verification MANUAL:** `npm run lint` reports no `react-hooks` warnings in this file.

---

### Step 11: Wire threads, modal state, and notifications into `DashboardPageLoader`

**Files:**
- `src/pages/DashboardPage/components/DashboardPageLoader/DashboardPageLoader.tsx`
- `src/__mocks__/threads.ts` (deleted)

**Covers:** AC1, AC2, AC3, AC13, AC14, AC15, AC16, AC17

**Context:** `submitNewThread` closes the modal only on success. On failure the modal stays mounted, so its form state (name and color) is kept (AC14), and the user can click "Add" again (AC17).

**Changes:**

1. Remove the `mockThreads` import and use `const { threads, threadsStatus, addThread } = useThreadsState();`.
2. Add the modal state and actions:

   ```ts
   const [isAddThreadModalOpen, setIsAddThreadModalOpen] = useState(false);

   const openAddThreadModal = () => setIsAddThreadModalOpen(true);
   const closeAddThreadModal = () => setIsAddThreadModalOpen(false);

   const submitNewThread = async (newThread: NewMindThread) => {
     try {
       const createdThread = await addThread(newThread);

       closeAddThreadModal();
       notify.success(getThreadCreatedMessage(createdThread.title));
     } catch {
       notify.error(SAVE_THREAD_ERROR_MESSAGE);
     }
   };
   ```

3. Provide the new fields:

   ```tsx
   <DashboardPageActionContext.Provider
     value={{
       toggleThreadListMode,
       openAddThreadModal,
       closeAddThreadModal,
       submitNewThread,
     }}
   >
     <DashboardPageValueContext.Provider
       value={{ threadListMode, threads, threadsStatus, isAddThreadModalOpen }}
     >
   ```

4. Delete `src/__mocks__/threads.ts` (the demo data, AC1). Its only other user is `DashboardPageLoader.test.tsx`, which is rewritten in Phase 2.

**Verification MANUAL:** `npm run start`. The dashboard shows no demo threads, and the browser console has no errors.

---

### Step 12: Turn the header `AddNewThread` into a context-driven button

**File:**
`src/pages/DashboardPage/components/DashboardHeader/components/AddNewThread/AddNewThread.tsx`

**Covers:** AC11, AC20

**Context:** The button is disabled whenever threads aren't `Loaded`. That covers the error state (AC20), and it also stops a thread from being added before the initial load finishes and overwrites it. With `localStorage` the loading state lasts one microtask, so the button doesn't visibly flicker.

**Changes:**

1. Remove the local `useState`, `handleCloseModal`, `handleSubmit`, the `AddNewThreadModal` rendering, and its imports.
2. Read from the context:

   ```ts
   const { threadsStatus } = useDashboardPageValue();
   const { openAddThreadModal } = useDashboardPageAction();
   ```

   Import both from `../../../DashboardPageLoader`.
3. Render only the button:

   ```tsx
   <Button
     data-testid={AddNewThreadTestId.openModalButton}
     background="accent"
     disabled={threadsStatus !== ThreadsStatus.Loaded}
     onClick={openAddThreadModal}
   >
     {ADD_NEW_THREAD_BUTTON_LABEL}
   </Button>
   ```

**Verification MANUAL:** `npm run start`. The header button is enabled after load. Clicking it does nothing visible yet (the modal is re-mounted in Step 14).

---

### Step 13: Move `AddNewThreadModal` under a new page-level container

**New files:**

- `src/pages/DashboardPage/components/AddNewThreadModalContainer/AddNewThreadModalContainer.tsx`
- `src/pages/DashboardPage/components/AddNewThreadModalContainer/index.ts`
- `src/pages/DashboardPage/components/AddNewThreadModalContainer/components/index.ts`

**File:**
`src/pages/DashboardPage/components/DashboardHeader/components/AddNewThread/components/` (folder removed)

**Covers:** AC11, AC14

**Context:** The modal is now opened from both the header and the empty state, so it belongs to the page, not the header. The container unmounts the modal when it closes, so the form resets on every open. While the modal is open (including after a failed save) it stays mounted and keeps its values.

**Changes:**

1. Move the folder with git, so its `__tests__` folder moves too:

   ```bash
   git mv src/pages/DashboardPage/components/DashboardHeader/components/AddNewThread/components/AddNewThreadModal \
          src/pages/DashboardPage/components/AddNewThreadModalContainer/components/AddNewThreadModal
   ```

2. Delete the now-empty `DashboardHeader/components/AddNewThread/components/index.ts`.
3. `AddNewThreadModalContainer/components/index.ts`: `export * from "./AddNewThreadModal";`
4. `AddNewThreadModalContainer.tsx`:

   ```tsx
   import {
     useDashboardPageValue,
     useDashboardPageAction,
   } from "../DashboardPageLoader";
   import { AddNewThreadModal } from "./components";

   export const AddNewThreadModalContainer = () => {
     const { isAddThreadModalOpen } = useDashboardPageValue();
     const { closeAddThreadModal, submitNewThread } = useDashboardPageAction();

     return isAddThreadModalOpen ? (
       <AddNewThreadModal
         onClose={closeAddThreadModal}
         onSubmit={submitNewThread}
       />
     ) : null;
   };
   ```

5. `AddNewThreadModalContainer/index.ts`: `export * from "./AddNewThreadModalContainer";`
6. In `src/pages/DashboardPage/components/index.ts`, add `export * from "./AddNewThreadModalContainer";`.

**Verification MANUAL:** `npm run ts:check` shows no errors in production files under `src/pages/DashboardPage/` (moved and old test files may still error until Phase 2).

---

### Step 14: Render the modal container on the dashboard page

**File:**
`src/pages/DashboardPage/DashboardPage.tsx`

**Covers:** AC2, AC3, AC11, AC13, AC14, AC15, AC17

**Changes:**

1. Import `AddNewThreadModalContainer` from `./components` and render it inside the loader:

   ```tsx
   <DashboardPageLoader>
     <DashboardHeader />
     <DashboardContent />
     <AddNewThreadModalContainer />
   </DashboardPageLoader>
   ```

**Verification MANUAL:** `npm run start`. Click "+ New Thread", enter a name, and click "Add". The modal closes and a success notification `Thread "<name>" created.` appears bottom-right. Then, in DevTools, make `localStorage.setItem` throw (`Storage.prototype.setItem = () => { throw new Error() }`) and click "Add" again. The modal stays open with its values and the error notification appears.

---

### Step 15: Disable "Add" for whitespace-only names

**File:**
`src/pages/DashboardPage/components/AddNewThreadModalContainer/components/AddNewThreadModal/AddNewThreadModal.tsx`

**Covers:** AC8

**Changes:**

1. Change the disabled check:

   ```tsx
   submitDisabled={!formValue.title.trim()}
   ```

**Verification MANUAL:** In the modal, type only spaces. "Add" stays disabled.

---

### Step 16: Key thread list items by id

**File:**
`src/pages/DashboardPage/components/DashboardContent/components/MindThreadList/MindThreadList.tsx`

**Covers:** AC7

**Changes:**

1. Change `key={thread.title}` to `key={thread.id}`.

**Verification MANUAL:** Create two threads named "Testing Strategy". Both cards render, and the console shows no duplicate-key warning.

---

### Step 17: Create the `ThreadsLoadError` card

**New files:**

- `src/pages/DashboardPage/components/DashboardContent/components/ThreadsLoadError/ThreadsLoadError.constants.ts`
- `src/pages/DashboardPage/components/DashboardContent/components/ThreadsLoadError/ThreadsLoadError.tsx`
- `src/pages/DashboardPage/components/DashboardContent/components/ThreadsLoadError/index.ts`

**Covers:** AC18

**Changes:**

1. Constants:

   ```ts
   const createTestId = initTestIdCreator("ThreadsLoadError__");

   export const ThreadsLoadErrorTestId = {
     container: createTestId("container"),
     message: createTestId("message"),
   } as const;

   export const THREADS_LOAD_ERROR_MESSAGE =
     "Couldn't load your threads. Please reload the page.";
   ```

2. Component, a presentational card that uses the `Box`/`Text` adapters and theme tokens:

   ```tsx
   export const ThreadsLoadError = () => (
     <Box
       data-testid={ThreadsLoadErrorTestId.container}
       p="6"
       borderRadius="md"
       borderWidth="1px"
       borderColor="red"
       backgroundColor="bg"
     >
       <Text data-testid={ThreadsLoadErrorTestId.message} color="fg">
         {THREADS_LOAD_ERROR_MESSAGE}
       </Text>
     </Box>
   );
   ```

3. `index.ts`: `export * from "./ThreadsLoadError";`

**Verification MANUAL:** `npm run ts:check` shows no errors in the new folder.

---

### Step 18: Create the `EmptyThreadList` state

**New files:**

- `src/pages/DashboardPage/components/DashboardContent/components/EmptyThreadList/EmptyThreadList.constants.ts`
- `src/pages/DashboardPage/components/DashboardContent/components/EmptyThreadList/EmptyThreadList.tsx`
- `src/pages/DashboardPage/components/DashboardContent/components/EmptyThreadList/index.ts`

**Covers:** AC10, AC11

**Changes:**

1. Constants:

   ```ts
   const createTestId = initTestIdCreator("EmptyThreadList__");

   export const EmptyThreadListTestId = {
     container: createTestId("container"),
     message: createTestId("message"),
     addButton: createTestId("add-button"),
   } as const;

   export const EMPTY_THREAD_LIST_MESSAGE =
     "No threads yet. Create your first thread to get started.";
   export const EMPTY_THREAD_LIST_BUTTON_LABEL = "Add new thread";
   ```

2. Component:

   ```tsx
   export const EmptyThreadList = () => {
     const { openAddThreadModal } = useDashboardPageAction();

     return (
       <VStack
         data-testid={EmptyThreadListTestId.container}
         gap="4"
         alignItems="center"
         p="10"
       >
         <Text
           data-testid={EmptyThreadListTestId.message}
           fontSize="lg"
           color="fg.muted"
         >
           {EMPTY_THREAD_LIST_MESSAGE}
         </Text>

         <Button
           data-testid={EmptyThreadListTestId.addButton}
           background="accent"
           onClick={openAddThreadModal}
         >
           {EMPTY_THREAD_LIST_BUTTON_LABEL}
         </Button>
       </VStack>
     );
   };
   ```

   Import `useDashboardPageAction` from `../../../DashboardPageLoader`.
3. `index.ts`: `export * from "./EmptyThreadList";`

**Verification MANUAL:** `npm run ts:check` shows no errors in the new folder.

---

### Step 19: Create the `ThreadsSection` view switch

**New files:**

- `src/pages/DashboardPage/components/DashboardContent/components/ThreadsSection/ThreadsSection.tsx`
- `src/pages/DashboardPage/components/DashboardContent/components/ThreadsSection/index.ts`

**File:**
`src/pages/DashboardPage/components/DashboardContent/components/index.ts`

**Covers:** AC10, AC12, AC18, AC19

**Context:** Picking between four views (loading, error, empty, list) with nested ternaries would be hard to read, so a dedicated component uses early returns. While loading it renders nothing, so the empty state never flashes before the stored threads arrive.

**Changes:**

1. Component:

   ```tsx
   export const ThreadsSection = () => {
     const { threads, threadsStatus } = useDashboardPageValue();

     if (threadsStatus === ThreadsStatus.Loading) return null;

     if (threadsStatus === ThreadsStatus.Error) return <ThreadsLoadError />;

     return threads.length === 0 ? <EmptyThreadList /> : <MindThreadList />;
   };
   ```

2. `index.ts`: `export * from "./ThreadsSection";`
3. In `DashboardContent/components/index.ts`, add exports for `./ThreadsLoadError`, `./EmptyThreadList`, and `./ThreadsSection`.

**Verification MANUAL:** `npm run ts:check` shows no errors in the new folder.

---

### Step 20: Render `ThreadsSection` in `DashboardContent`

**File:**
`src/pages/DashboardPage/components/DashboardContent/DashboardContent.tsx`

**Covers:** AC1, AC10, AC12, AC18, AC19

**Changes:**

1. Replace `<MindThreadList />` with `<ThreadsSection />` and update the import from `./components`.

**Verification MANUAL:** `npm run start` with cleared site data. The empty state shows, and its button opens the modal. Create a thread: the empty state is replaced by one card showing the name, color, "0 sections", "0 pages", and "Updated: just now". Create two more: the newest is first in grid and list view. Reload: same threads, same order. Set `localStorage.threads = "not-json"` and reload: the error card shows, the header button is disabled, there's no empty state, and no notification appears.

## Phase 2: Unit tests

---

### Step 1: Update the shared thread fixtures and global test cleanup

**Files:**
- `src/__test-fixtures__/threads.ts`
- `vitest.setup.ts`

**Covers:** AC7, AC21

**Changes:**

1. Add a unique `id` (`"thread-1"`, `"thread-2"`, `"test-thread"`) to every fixture.
2. Add `mindThreadFixturesWithSameTitle: MindThread[]`: two threads with the title `"Testing Strategy"` and different ids.
3. In `vitest.setup.ts`, add a global cleanup, so notifications from the module-level toaster can't leak between tests:

   ```ts
   import { notificationsToaster } from "@/components/lib/Notifications";

   afterEach(() => {
     notificationsToaster.remove();
     localStorage.clear();
   });
   ```

**Verification:** `npm run ts:check` passes for fixture consumers.

---

### Step 2: Test `useLocalStorage` strict mode

**File:**
`src/hooks/useLocalStorage/__tests__/useLocalStorage.test.ts`

**Covers:** AC15, AC18

**Changes:**

1. Update `setup` to the object signature: `setup({ key = TEST_STORAGE_KEY, throwOnError } = {})` → `renderHook(() => useLocalStorage<ValueType>({ key, throwOnError }))`.
2. Keep all existing tests (default mode still swallows errors).
3. Add a `describe("with throwOnError")` block:
   - `read()` throws when the stored value is malformed JSON, and still logs `console.error`.
   - `set()` throws when `localStorage.setItem` throws (`vi.spyOn(Storage.prototype, "setItem")`), and the cached value stays the previous one.
   - `read()` still returns `null` when the key is missing (no throw).

**Verification:** `npx vitest run src/hooks/useLocalStorage` — all tests pass.

---

### Step 3: Test the threads service utils

**New files:**

- `src/services/useThreadsService/__tests__/useThreadsService.utils.test.ts`

**Covers:** AC4, AC9, AC18

**Changes:**

1. `buildThread`:
   - It trims the title (`"  My thread  "` → `"My thread"`) and keeps the color.
   - It sets `totalSections`/`totalPages` to `0`.
   - `lastUpdated` equals the current time (`vi.useFakeTimers()` + `vi.setSystemTime`).
   - Two calls return different `id`s.
2. `isMindThreadList`: `true` for the fixtures and for `[]`; `false` for an object, a string, and an array with an item missing `id`.

**Verification:** `npx vitest run src/services` — all tests pass.

---

### Step 4: Test `useThreadsService`

**New files:**

- `src/services/useThreadsService/__tests__/useThreadsService.test.ts`

**Covers:** AC2, AC5, AC6, AC7, AC16, AC18

**Context:** Use the real `useLocalStorage` against jsdom's `localStorage`. Only `Storage.prototype.setItem`/`getItem` are spied on to simulate failures.

**Changes:**

1. `setupHook()` → `renderHook(() => useThreadsService())`, returning `result`.
2. Add a helper `storeThreads(threads)` that writes `JSON.stringify(threads)` under `THREADS_STORAGE_KEY`.
3. Scenarios:
   - `getThreads` resolves `[]` when nothing is stored.
   - `getThreads` resolves the stored threads in stored order.
   - `getThreads` rejects for malformed JSON, for a non-array value, and when `getItem` throws.
   - `createThread` resolves the created thread (trimmed title, 0/0) and prepends it in storage.
   - Two `createThread` calls with the same title store two items with different ids, newest first.
   - `createThread` rejects when `setItem` throws, and storage is unchanged.

**Verification:** `npx vitest run src/services` — all tests pass.

---

### Step 5: Test the Notifications adapter

**New files:**

- `src/components/lib/Notifications/__tests__/Notifications.test.tsx`

**Covers:** AC13, AC15, AC21, AC22, AC23

**Changes:**

1. `setup()` → `userEvent.setup({ advanceTimers: vi.advanceTimersByTime })` + `renderWithUIProvider(<div />)` (the provider mounts `Notifications`). Return `{ user }`.
2. Add a helper `showSuccess(message)` that calls `act(() => notify.success(message))`. `act` is required here because the toaster store updates from outside React.
3. Scenarios:
   - `notify.success` renders a notification with the message, and `notify.error` renders one with the message (`findByText`).
   - The toast region has `data-placement="bottom-end"`.
   - Clicking the close button (`NotificationsTestId.closeButton`) removes the notification.
   - With `vi.useFakeTimers()`, the notification disappears after `NOTIFICATION_DURATION_MS` and is still present just before it.
4. Restore real timers in `afterEach`.

**Verification:** `npx vitest run src/components/lib/Notifications` — all tests pass.

---

### Step 6: Rewrite the `DashboardPageLoader` tests

**File:**
`src/pages/DashboardPage/components/DashboardPageLoader/__tests__/DashboardPageLoader.test.tsx`

**Covers:** AC1, AC2, AC3, AC6, AC13, AC14, AC15, AC16, AC17, AC18, AC19

**Context:** Drop the `vi.mock("@/hooks")` mock and the `mockThreads` import (deleted). Use real `localStorage`, seeded per test, following `unit-tests.md` rule 1.

**Changes:**

1. Extend `TestConsumer` to render `threadsStatus`, the thread titles in order, and `isAddThreadModalOpen`, plus buttons for `openAddThreadModal` and `submitNewThread({ title: "  New  ", color: "#000" })`.
2. Keep the existing thread-list-mode scenarios, asserting through `localStorage` instead of mocks.
3. New scenarios:
   - The status goes from `loading` to `loaded`, and threads come from storage (no demo data).
   - The status is `error` when stored threads are malformed, and no notification is shown.
   - A successful submit prepends the thread, closes the modal, and shows `Thread "New" created.`.
   - When `setItem` throws, a failed submit keeps the modal open, leaves threads unchanged, and shows the error message.
   - A retry after a failure succeeds, and the thread is first.

**Verification:** `npx vitest run src/pages/DashboardPage/components/DashboardPageLoader` — all tests pass.

---

### Step 7: Update the header `AddNewThread` tests

**File:**
`src/pages/DashboardPage/components/DashboardHeader/components/AddNewThread/__tests__/AddNewThread.test.tsx`

**Covers:** AC11, AC20

**Changes:**

1. Render `<DashboardPageLoader><AddNewThread /><AddNewThreadModalContainer /></DashboardPageLoader>` in `setup()`, and remove the imports from the old modal path.
2. Scenarios:
   - The button becomes enabled after load (`findByTestId` + `toBeEnabled`).
   - Clicking it opens the modal.
   - The button is disabled when stored threads are malformed.

**Verification:** `npx vitest run src/pages/DashboardPage/components/DashboardHeader` — all tests pass.

---

### Step 8: Update the moved `AddNewThreadModal` tests

**Files:**
- `src/pages/DashboardPage/components/AddNewThreadModalContainer/components/AddNewThreadModal/__tests__/AddNewThreadModal.test.tsx`
- `…/components/AddNewThreadModal/components/ThreadForm/__tests__/ThreadForm.test.tsx`
- `…/components/AddNewThreadModal/components/AddNewThreadModalActions/__tests__/AddNewThreadModalActions.test.tsx`

**Covers:** AC8

**Changes:**

1. Fix any imports broken by the move. Relative imports inside the folder should still resolve.
2. Add these scenarios to `AddNewThreadModal.test.tsx`:
   - "Add" is disabled for a spaces-only name.
   - "Add" is enabled for `"  a  "`.

**Verification:** `npx vitest run src/pages/DashboardPage/components/AddNewThreadModalContainer` — all tests pass.

---

### Step 9: Test `AddNewThreadModalContainer`

**New files:**

- `src/pages/DashboardPage/components/AddNewThreadModalContainer/__tests__/AddNewThreadModalContainer.test.tsx`

**Covers:** AC3, AC14, AC15, AC17

**Changes:**

1. In `setup()`, render inside `DashboardPageLoader` with a small trigger button calling `openAddThreadModal`, and return `{ user }`.
2. Add helpers `openModal(user)` and `fillAndSubmit({ user, title })`.
3. Scenarios:
   - The modal is not rendered until opened.
   - Cancel closes the modal.
   - A successful "Add" closes the modal.
   - When `setItem` throws, the modal stays open, the name and the selected color are kept, and the error notification is shown.
   - Retrying after restoring `setItem` closes the modal and shows the success notification.
   - Reopening shows an empty form.

**Verification:** `npx vitest run src/pages/DashboardPage/components/AddNewThreadModalContainer` — all tests pass.

---

### Step 10: Update the `MindThreadList` and `MindThreadCard` tests

**Files:**
- `src/pages/DashboardPage/components/DashboardContent/components/MindThreadList/__tests__/MindThreadList.test.tsx`
- `src/pages/DashboardPage/components/DashboardContent/components/MindThreadCard/__tests__/MindThreadCard.test.tsx`

**Covers:** AC4, AC5, AC7

**Changes:**

1. Adjust to the fixtures with `id`s, and to any context-mock shape changes (the new `DashboardPageValue` fields).
2. `MindThreadList`:
   - With `mindThreadFixturesWithSameTitle`, two list items render.
   - Items render in the given order in both `Grid` and `List` mode.
3. `MindThreadCard`: a thread with `totalSections: 0`, `totalPages: 0`, and `lastUpdated` = now shows "0 sections", "0 pages", and "Updated: just now".

**Verification:** `npx vitest run src/pages/DashboardPage/components/DashboardContent/components` — all tests pass.

---

### Step 11: Test `ThreadsLoadError`

**New files:**

- `src/pages/DashboardPage/components/DashboardContent/components/ThreadsLoadError/__tests__/ThreadsLoadError.test.tsx`

**Covers:** AC18

**Changes:**

1. It renders the container and the exact `THREADS_LOAD_ERROR_MESSAGE` text.

**Verification:** `npx vitest run …/ThreadsLoadError` — passes.

---

### Step 12: Test `EmptyThreadList`

**New files:**

- `src/pages/DashboardPage/components/DashboardContent/components/EmptyThreadList/__tests__/EmptyThreadList.test.tsx`

**Covers:** AC10, AC11

**Changes:**

1. Render inside `DashboardPageLoader` with `AddNewThreadModalContainer`.
2. Scenarios:
   - It renders the exact message and the "Add new thread" button.
   - Clicking the button opens the "Add new thread" modal (the dialog title `ADD_NEW_THREAD_MODAL_TITLE` is visible).

**Verification:** `npx vitest run …/EmptyThreadList` — passes.

---

### Step 13: Test `ThreadsSection`

**New files:**

- `src/pages/DashboardPage/components/DashboardContent/components/ThreadsSection/__tests__/ThreadsSection.test.tsx`

**Covers:** AC10, AC18, AC19

**Changes:**

1. Render inside `DashboardPageLoader`, seeding `localStorage` per scenario.
2. Scenarios:
   - Empty storage shows the empty state.
   - Stored threads show the list.
   - Malformed storage shows the error card, no empty state, and no notification (`queryByTestId(NotificationsTestId.notification)` is null).

**Verification:** `npx vitest run …/ThreadsSection` — passes.

---

### Step 14: Update the `DashboardContent` tests

**File:**
`src/pages/DashboardPage/components/DashboardContent/__tests__/DashboardContent.test.tsx`

**Covers:** AC1

**Changes:**

1. Replace mocks that rely on the old context shape. Render inside `DashboardPageLoader` with seeded storage.
2. Assert that the container renders and contains `ThreadsSection` output (the list for seeded threads).

**Verification:** `npx vitest run …/DashboardContent/__tests__` — passes.

---

### Step 15: Rewrite the `DashboardPage` tests as an integration flow

**File:**
`src/pages/DashboardPage/__tests__/DashboardPage.test.tsx`

**Covers:** AC1, AC2, AC3, AC5, AC6, AC7, AC9, AC12, AC13, AC17, AC20

**Context:** Remove the `DashboardPageLoader.hooks` mock. Its old shape no longer matches, and the page is the right place for an end-to-end check with real storage. Keep the color-mode mock.

**Changes:**

1. In `setup()`, render `<DashboardPage />` and return `{ user, unmount }`. Add a helper `createThread({ user, title })`.
2. Scenarios:
   - With no storage, it shows the empty state and no demo threads.
   - Creating a thread from the empty state replaces it with one card showing the trimmed name.
   - Creating three threads shows them newest first, in grid and after toggling to list view.
   - Two threads named "Testing Strategy" show two cards.
   - `unmount` + re-render (simulating a reload) shows the same threads in the same order.
   - The header button is disabled when storage is malformed.

**Verification:** `npm run test` — the whole suite passes. `npm run test:coverage` stays at or above the 90% thresholds.

## Phase 3: Documentation

---

### Step 1: Document services and notifications in `CLAUDE.md`

**File:**
`CLAUDE.md`

**Changes:**

1. Under **Architecture → Folder structure**, add, after `src/hooks/`:
   `src/services/` — Data-access hooks that return async methods (e.g., `useThreadsService`), organized as a folder per service. Threads are currently persisted in `localStorage` under the `threads` key.
2. In the `src/hooks/` bullet, note that `useLocalStorage` takes `{ key, throwOnError }`. With `throwOnError: true`, read and write errors are rethrown instead of swallowed.
3. Under **Third-party Libraries → Chakra UI**, add a short paragraph: app-wide notifications are rendered by `Notifications` (mounted inside `ChakraUIProvider`) and triggered with `notify.success(message)` / `notify.error(message)` from `@/components/lib`. They appear bottom-right, auto-close after 5 s, and follow the color mode. Tests rendered with `renderWithUIProvider` see them, and `vitest.setup.ts` clears them after each test.

**Verification MANUAL:** Review that the three additions sit in the existing sections and match the implemented names and paths.

---

### Step 2: Fix the `services/` entry in the README project structure

**File:**
`README.md`

**Changes:**

1. In **Project Structure**, change `services/  # App services (e.g. local-storage)` to `services/  # Data-access hooks (e.g. useThreadsService)`, and add `hooks/  # Shared hooks (e.g. useLocalStorage, useFetch)` if it is missing.

**Verification MANUAL:** Review that the README tree matches the actual `src/` folders.
