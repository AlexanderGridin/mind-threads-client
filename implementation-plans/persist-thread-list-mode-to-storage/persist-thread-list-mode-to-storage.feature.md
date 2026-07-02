# Persist thread list mode to the local storage

## Implementation Steps

---

### Step 1: Integrate `DashboardPageLoader` with `useLocalStorage`

**File:**
`src/pages/DashboardPage/components/DashboardPageLoader/DashboardPageLoader.tsx`

**Context:**
`useLocalStorage` (from `src/services/local-storage/local-storage.hooks.ts`) exposes `read()`, `set()`, and `update()` for a given storage key but is not itself reactive — it does not trigger re-renders. `threadListMode` must remain React state so the UI still reacts to toggles; the storage hook is only used to seed the initial value and to persist every change, mirroring how `useState`'s lazy initializer is already used in this file.

**Changes:**

1. Import `useLocalStorage` from `@/services/local-storage`.
2. Add a module-level constant for the storage key and export it so the test file can assert `useLocalStorage` was called with it instead of hardcoding the string:
   ```ts
   export const THREAD_LIST_MODE_STORAGE_KEY = "threadListMode";
   ```
3. Instantiate the hook inside the component:
   ```ts
   const threadListModeStorage = useLocalStorage<ThreadListModeType>(
     THREAD_LIST_MODE_STORAGE_KEY
   );
   ```
4. Replace the `useState` initializer so it seeds from storage, falling back to `ThreadListMode.Grid` and persisting that default when nothing is stored yet:
   ```ts
   const [threadListMode, setThreadListMode] = useState<ThreadListModeType>(
     () => {
       const storedThreadListMode = threadListModeStorage.read();

       if (storedThreadListMode !== null) return storedThreadListMode;

       threadListModeStorage.set(ThreadListMode.Grid);

       return ThreadListMode.Grid;
     }
   );
   ```
5. Update `toggleThreadListMode` so the newly computed mode is also persisted to storage:
   ```ts
   const toggleThreadListMode = () => {
     setThreadListMode((current) => {
       const newThreadListMode =
         current === ThreadListMode.Grid
           ? ThreadListMode.List
           : ThreadListMode.Grid;

       threadListModeStorage.set(newThreadListMode);

       return newThreadListMode;
     });
   };
   ```

**Verification MANUAL:** Run `npm run ts:check` to confirm the file compiles, then in the browser dev tools Application tab confirm a `threadListMode` key appears in Local Storage on first load of the dashboard, and that its value flips between `"grid"` and `"list"` when the toggle button is clicked, surviving a page refresh.

---

### Step 2: Add/update unit tests for the local storage integration

**File:**
`src/pages/DashboardPage/components/DashboardPageLoader/__tests__/DashboardPageLoader.test.tsx`

**Context:**
`useLocalStorage` already has its own dedicated test suite (`src/services/local-storage/__tests__/local-storage.hooks.test.ts`) covering `read`/`set`/`update` behavior against real `localStorage`. To avoid duplicating that coverage, mock `@/services/local-storage` here and assert only that `DashboardPageLoader` calls `read()`/`set()` correctly — the integration contract, not the storage mechanics.

**Changes:**

1. Import `THREAD_LIST_MODE_STORAGE_KEY` alongside the existing named imports from `../index`, and import `useLocalStorage` from `@/services/local-storage`.
2. Mock the local storage module at the top of the file:
   ```ts
   vi.mock("@/services/local-storage", () => ({
     useLocalStorage: vi.fn(),
   }));
   ```
3. Declare reusable mock functions for `read` and `set`, and wire them into `useLocalStorage`'s mocked return value inside `beforeEach` (alongside the existing `vi.clearAllMocks()`), defaulting `read` to return `null` (no stored value) unless a test overrides it:
   ```ts
   const mockReadThreadListMode = vi.fn();
   const mockSetThreadListMode = vi.fn();

   beforeEach(() => {
     vi.clearAllMocks();

     mockReadThreadListMode.mockReturnValue(null);

     vi.mocked(useLocalStorage).mockReturnValue({
       read: mockReadThreadListMode,
       set: mockSetThreadListMode,
       update: vi.fn(),
     });
   });
   ```
4. Add a new `describe("local storage integration", ...)` block with the following cases:
   - Asserts `useLocalStorage` was called with `THREAD_LIST_MODE_STORAGE_KEY` after `setup()`.
   - Sets `mockReadThreadListMode.mockReturnValue(ThreadListMode.List)` before calling `setup()`, then asserts `THREAD_LIST_MODE_TEST_ID` renders `ThreadListMode.List` (initial value is read from storage).
   - Calls `setup()` with the default mocked `read` returning `null`, then asserts `mockSetThreadListMode` was called with `ThreadListMode.Grid` (default value is persisted when storage was empty).
   - Calls `setup()`, clicks `TOGGLE_BUTTON_TEST_ID`, then asserts `mockSetThreadListMode` was last called with `ThreadListMode.List` (toggle persists the new value).
   - Clicks the toggle button twice and asserts `mockSetThreadListMode` was last called with `ThreadListMode.Grid` again (persisted value stays in sync across multiple toggles).

**Verification MANUAL:** Run `npm run test -- DashboardPageLoader` and confirm all existing and newly added test cases pass.
