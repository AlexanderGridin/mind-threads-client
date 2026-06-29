# Dashboard page content

## Implementation Steps

---

### Step 1: Add the `MindThread` type

**New files:**

- `src/types/MindThread.ts`
- `src/types/index.ts`

**Changes:**
1. Create `src/types/MindThread.ts`:
   ```ts
   export type MindThread = {
     title: string;
     totalSections: number;
     totalPages: number;
     lastUpdated: string;
     color: string;
   };
   ```
2. Create `src/types/index.ts` barrel exporting `MindThread`.

**Verification MANUAL:** Run `npm run ts:check` — no errors.

---

### Step 2: Add mock threads data and exclude `__mocks__` from coverage

**New files:**

- `src/__mocks__/threads.ts`

**File:** `vitest.config.ts`

**Changes:**
1. Create `src/__mocks__/threads.ts` with an array of 15 `MindThread` objects. Use a variety of realistic titles, section/page counts, ISO date strings, and hex color values.
2. In `vitest.config.ts`, add `"src/__mocks__/**"` to the `coverage.exclude` array.

**Verification MANUAL:** Run `npm run ts:check` — no type errors.

---

### Step 3: Add `DashboardPageLoader` context, hooks, and provider component

**New files:**

- `src/pages/DashboardPage/components/DashboardPageLoader/DashboardPageLoader.context.ts`
- `src/pages/DashboardPage/components/DashboardPageLoader/DashboardPageLoader.hooks.ts`
- `src/pages/DashboardPage/components/DashboardPageLoader/DashboardPageLoader.tsx`
- `src/pages/DashboardPage/components/DashboardPageLoader/index.ts`

**Context:** React Compiler handles memoization automatically, so no manual `useMemo` is needed for context values. Use two separate contexts (value + action) so consumers only re-render when the slice they use changes.

**Changes:**
1. In `DashboardPageLoader.context.ts`, create and export:
   - `DashboardPageValueContext` typed as `{ threadListMode: 'list' | 'grid'; threads: MindThread[] }`
   - `DashboardPageActionContext` typed as `{ toggleThreadListMode: () => void }`
   - Both created via `createContext` with a `null` initial value.

2. In `DashboardPageLoader.hooks.ts`, create and export:
   - `useDashboardPageValue()` — consumes `DashboardPageValueContext`, throws if used outside provider.
   - `useDashboardPageAction()` — consumes `DashboardPageActionContext`, throws if used outside provider.

3. In `DashboardPageLoader.tsx`:
   ```tsx
   import type { ReactNode } from "react";
   import { useState } from "react";
   import { mockThreads } from "@/__mocks__/threads";
   // import contexts, types

   export const DashboardPageLoader = ({ children }: { children: ReactNode }) => {
     const [threadListMode, setThreadListMode] = useState<'list' | 'grid'>('grid');

     const handleToggleThreadListMode = () => {
       setThreadListMode((current) => (current === 'grid' ? 'list' : 'grid'));
     };

     return (
       <DashboardPageActionContext.Provider value={{ toggleThreadListMode: handleToggleThreadListMode }}>
         <DashboardPageValueContext.Provider value={{ threadListMode, threads: mockThreads }}>
           {children}
         </DashboardPageValueContext.Provider>
       </DashboardPageActionContext.Provider>
     );
   };
   ```
4. Export everything from `index.ts`.

**Verification MANUAL:** Run `npm run ts:check` — no errors.

---

### Step 4: Integrate `DashboardPageLoader` into `DashboardPage`

**File:** `src/pages/DashboardPage/DashboardPage.tsx`

**Changes:**
1. Wrap the existing `DashboardHeader` with `DashboardPageLoader`:
   ```tsx
   import { DashboardPageLoader } from "./components/DashboardPageLoader";

   export const DashboardPage = () => {
     return (
       <DashboardPageLoader>
         <DashboardHeader />
       </DashboardPageLoader>
     );
   };
   ```

**Verification MANUAL:** Run `npm run ts:check` and `npm run test` — all pass.

---

### Step 5: Add `ThreadListModeButton` component

**New files:**

- `src/pages/DashboardPage/components/DashboardHeader/components/ThreadListModeButton/ThreadListModeButton.constants.ts`
- `src/pages/DashboardPage/components/DashboardHeader/components/ThreadListModeButton/ThreadListModeButton.tsx`
- `src/pages/DashboardPage/components/DashboardHeader/components/ThreadListModeButton/index.ts`

**Context:** Follow the same pattern as `ColorModeButton.tsx`. The icon reflects the currently active mode: `LuLayoutGrid` for grid mode, `LuLayoutList` for list mode.

**Changes:**
1. In `ThreadListModeButton.constants.ts`:
   ```ts
   import { initTestIdCreator } from "@/components/lib/utils";
   const createTestId = initTestIdCreator("ThreadListModeButton__");
   export const ThreadListModeButtonTestId = { container: createTestId("container") } as const;
   ```
2. In `ThreadListModeButton.tsx`:
   ```tsx
   import { forwardRef } from "react";
   import { IconButton } from "@chakra-ui/react";
   import { LuLayoutGrid, LuLayoutList } from "react-icons/lu";
   import { useDashboardPageValue, useDashboardPageAction } from "../../../DashboardPageLoader";
   import { ThreadListModeButtonTestId } from "./ThreadListModeButton.constants";

   export const ThreadListModeButton = forwardRef<HTMLButtonElement, unknown>((_, ref) => {
     const { threadListMode } = useDashboardPageValue();
     const { toggleThreadListMode } = useDashboardPageAction();

     return (
       <IconButton
         data-testid={ThreadListModeButtonTestId.container}
         aria-label="Toggle thread list mode"
         variant="outline"
         borderColor="border"
         color="fg"
         size="sm"
         ref={ref}
         css={{ _icon: { width: "5", height: "5" } }}
         onClick={toggleThreadListMode}
       >
         {threadListMode === 'grid' ? <LuLayoutGrid /> : <LuLayoutList />}
       </IconButton>
     );
   });
   ThreadListModeButton.displayName = "ThreadListModeButton";
   ```
3. Export from `index.ts`.
4. Re-export from `src/pages/DashboardPage/components/DashboardHeader/components/index.ts`.

**Verification MANUAL:** Run `npm run ts:check` — no errors.

---

### Step 6: Add `ThreadListModeButton` to `DashboardHeader`

**File:** `src/pages/DashboardPage/components/DashboardHeader/DashboardHeader.tsx`

**Changes:**
1. Import `ThreadListModeButton` from `"./components"`.
2. Add it next to `ColorModeButton` in the `HStack`:
   ```tsx
   <ThreadListModeButton />
   <ColorModeButton />
   ```

**Verification MANUAL:** Run `npm run dev`, open the dashboard — both buttons appear in the header.

---

### Step 7: Add unit tests for `ThreadListModeButton`

**New files:**

- `src/pages/DashboardPage/components/DashboardHeader/components/ThreadListModeButton/__tests__/ThreadListModeButton.test.tsx`

**Context:** Follow the same pattern as `ColorModeButton.test.tsx`. Mock the `DashboardPageLoader` hooks at the module level. Test: renders, has correct accessible name, clicking calls `toggleThreadListMode`, and that the grid icon is shown when mode is `'grid'` and list icon when `'list'`.

**Changes:**
1. Create the test file:
   ```tsx
   import { describe, it, expect } from "vitest";
   import { screen } from "@testing-library/react";
   import userEvent from "@testing-library/user-event";
   import { renderWithUIProvider } from "@/components/lib";
   import { ThreadListModeButton } from "../ThreadListModeButton";
   import { ThreadListModeButtonTestId } from "../ThreadListModeButton.constants";

   const mockUseDashboardPageValueReturn = { threadListMode: 'grid' as const };
   const mockUseDashboardPageActionReturn = { toggleThreadListMode: vi.fn() };

   vi.mock("../../../DashboardPageLoader", () => ({
     useDashboardPageValue: () => mockUseDashboardPageValueReturn,
     useDashboardPageAction: () => mockUseDashboardPageActionReturn,
   }));

   const setup = () => {
     const user = userEvent.setup();
     renderWithUIProvider(<ThreadListModeButton />);
     return { user };
   };

   beforeEach(() => { vi.clearAllMocks(); });

   describe("ThreadListModeButton", () => {
     it("renders properly", () => { ... });
     it("should call toggleThreadListMode when clicked", async () => { ... });
     it("shows grid icon when mode is grid", () => { ... });
     it("shows list icon when mode is list", () => { ... });
   });
   ```

**Verification MANUAL:** Run `npm run test` — all tests pass.

---

### Step 8: Add `MindThreadCard` component

**New files:**

- `src/pages/DashboardPage/components/DashboardContent/components/MindThreadCard/MindThreadCard.constants.ts`
- `src/pages/DashboardPage/components/DashboardContent/components/MindThreadCard/MindThreadCard.tsx`
- `src/pages/DashboardPage/components/DashboardContent/components/MindThreadCard/index.ts`
- `src/pages/DashboardPage/components/DashboardContent/components/index.ts`

**Context:** Render two layouts (grid/list) based on the `thread` prop. In grid mode show a colored top border strip, title, sections count, pages count, and last updated. In list mode show a colored dot, title, and the same meta. Match visual structure from `NoteCard.tsx` in the prototype, but use Chakra UI primitives (`Box`, `HStack`, `VStack`, `Text`) from `@/components/lib`.

**Changes:**
1. In `MindThreadCard.constants.ts`:
   ```ts
   export const MindThreadCardTestId = { container: createTestId("container") } as const;
   ```
2. In `MindThreadCard.tsx`:
   ```tsx
   import type { MindThread } from "@/types";
   type MindThreadCardProps = { thread: MindThread; onClick: (thread: MindThread) => void; };
   export const MindThreadCard = ({ thread, onClick }: MindThreadCardProps) => { ... };
   ```
   - Accept both grid and list layout via a `layout: 'grid' | 'list'` prop (default `'grid'`).
   - For the click handler: `const handleClick = () => onClick(thread);`

**Verification MANUAL:** Run `npm run ts:check` — no errors.

---

### Step 9: Add unit tests for `MindThreadCard`

**New files:**

- `src/pages/DashboardPage/components/DashboardContent/components/MindThreadCard/__tests__/MindThreadCard.test.tsx`

**Context:** Follow the same `setup()` pattern as existing component tests. Use a fixed `MindThread` fixture object (not the full mock array). Test: renders title, sections, pages, last updated, and calls `onClick` with the thread when clicked.

**Changes:**
1. Create `MindThreadCard.test.tsx` with a `thread` fixture and a spy for `onClick`. Verify grid and list layouts render the correct elements.

**Verification MANUAL:** Run `npm run test` — all pass.

---

### Step 10: Add `MindThreadList` component and `DashboardContent` container

**New files:**

- `src/pages/DashboardPage/components/DashboardContent/components/MindThreadList/MindThreadList.constants.ts`
- `src/pages/DashboardPage/components/DashboardContent/components/MindThreadList/MindThreadList.tsx`
- `src/pages/DashboardPage/components/DashboardContent/components/MindThreadList/index.ts`
- `src/pages/DashboardPage/components/DashboardContent/DashboardContent.constants.ts`
- `src/pages/DashboardPage/components/DashboardContent/DashboardContent.tsx`
- `src/pages/DashboardPage/components/DashboardContent/index.ts`

**Context:** `MindThreadList` reads `threads` and `threadListMode` from `useDashboardPageValue()` and renders a grid or column of `MindThreadCard` items. `DashboardContent` is a thin wrapper that adds the `<main>` semantic container with padding.

**Changes:**
1. `MindThreadList.tsx`:
   ```tsx
   import { useDashboardPageValue } from "../../DashboardPageLoader";
   import { MindThreadCard } from "../components";

   export const MindThreadList = () => {
     const { threads, threadListMode } = useDashboardPageValue();

     const handleThreadClick = (thread: MindThread) => { /* placeholder */ };

     return (
       <Box display={threadListMode === 'grid' ? 'grid' : 'flex'} /* grid/flex layout props */>
         {threads.map((thread) => (
           <MindThreadCard
             key={thread.title}
             thread={thread}
             layout={threadListMode}
             onClick={handleThreadClick}
           />
         ))}
       </Box>
     );
   };
   ```
2. `DashboardContent.tsx`:
   ```tsx
   export const DashboardContent = () => (
     <Box as="main" px="6" py="6">
       <MindThreadList />
     </Box>
   );
   ```
3. Export from respective `index.ts` files.
4. Re-export `DashboardContent` from `src/pages/DashboardPage/components/index.ts`.

**Verification MANUAL:** Run `npm run ts:check` — no errors.

---

### Step 11: Add unit tests for `MindThreadList` and `DashboardContent`

**New files:**

- `src/pages/DashboardPage/components/DashboardContent/components/MindThreadList/__tests__/MindThreadList.test.tsx`
- `src/pages/DashboardPage/components/DashboardContent/__tests__/DashboardContent.test.tsx`

**Context:** Mock `useDashboardPageValue` at module level. For `MindThreadList`, test that the correct number of cards is rendered and that switching `threadListMode` changes the layout container. For `DashboardContent`, verify the `<main>` element is present.

**Changes:**
1. `MindThreadList.test.tsx` — mock `DashboardPageLoader` hooks, provide a small array of 2 fixture threads, assert cards are rendered.
2. `DashboardContent.test.tsx` — smoke test for the `<main>` container.

**Verification MANUAL:** Run `npm run test` — all pass.

---

### Step 12: Wire `DashboardContent` into `DashboardPage`

**File:** `src/pages/DashboardPage/DashboardPage.tsx`

**Changes:**
1. Import `DashboardContent` from `"./components"`.
2. Add it as a sibling below `DashboardHeader` inside `DashboardPageLoader`:
   ```tsx
   <DashboardPageLoader>
     <DashboardHeader />
     <DashboardContent />
   </DashboardPageLoader>
   ```

**Verification MANUAL:** Run `npm run dev`, open the dashboard — the thread grid renders under the header, and clicking the mode toggle button switches between grid and list layouts.

---

### Step 13: Update `DashboardPage` test to cover `DashboardContent`

**File:** `src/pages/DashboardPage/__tests__/DashboardPage.test.tsx`

**Changes:**
1. Add a mock for `useDashboardPageValue` (return a small threads array and `threadListMode: 'grid'`).
2. Add an assertion that the `DashboardContent` container test ID is present in the rendered output.

**Verification MANUAL:** Run `npm run test` — all pass including the updated `DashboardPage` test.
