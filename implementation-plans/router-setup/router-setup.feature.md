
# React Router Setup

## Implementation Steps

---

### Step 1: Install react-router

**Changes:**
1. Run `npm install react-router` and verify the package is added with an exact version in `package.json` (remove any `^` or `~` prefix, per project convention).

**Verification MANUAL:** Run `npm run ts:check` — no TypeScript errors.

---

### Step 2: Create `HomePage` component

**New files:**

- `src/pages/HomePage/HomePage.tsx`
- `src/pages/HomePage/index.ts`

**Changes:**
1. Create `HomePage.tsx` as an arrow-function component following the same conventions as `src/components/lib/Button/Button.tsx`:
   ```tsx
   export const HomePage = () => {
     return <h1>HomePage</h1>;
   };
   ```
2. Create `index.ts` barrel:
   ```ts
   export * from "./HomePage";
   ```

**Verification MANUAL:** Run `npm run ts:check` — no TypeScript errors.

---

### Step 3: Add unit tests for `HomePage`

**New files:**

- `src/pages/HomePage/__tests__/HomePage.test.tsx`

**Context:**
`HomePage` does not use Chakra UI, so use `render` from `@testing-library/react` directly instead of `renderWithUIProvider`.

**Changes:**
1. Create the test file with a `setup()` function and a single test verifying the `h1` heading renders:
   ```tsx
   import { render, screen } from "@testing-library/react";
   import { HomePage } from "../HomePage";

   const setup = () => {
     render(<HomePage />);
   };

   describe("HomePage", () => {
     it("renders the page heading", () => {
       setup();
       expect(screen.getByRole("heading", { name: "HomePage" })).toBeInTheDocument();
     });
   });
   ```

**Verification MANUAL:** Run `npm run test` — all tests pass including the new `HomePage` test.

---

### Step 4: Create `ThreadPage` component

**New files:**

- `src/pages/ThreadPage/ThreadPage.tsx`
- `src/pages/ThreadPage/index.ts`

**Changes:**
1. Create `ThreadPage.tsx` following the same pattern as `src/pages/HomePage/HomePage.tsx`:
   ```tsx
   export const ThreadPage = () => {
     return <h1>ThreadPage</h1>;
   };
   ```
2. Create `index.ts` barrel:
   ```ts
   export * from "./ThreadPage";
   ```

**Verification MANUAL:** Run `npm run ts:check` — no TypeScript errors.

---

### Step 5: Add unit tests for `ThreadPage`

**New files:**

- `src/pages/ThreadPage/__tests__/ThreadPage.test.tsx`

**Changes:**
1. Create the test file following the same pattern as `src/pages/HomePage/__tests__/HomePage.test.tsx`:
   ```tsx
   import { render, screen } from "@testing-library/react";
   import { ThreadPage } from "../ThreadPage";

   const setup = () => {
     render(<ThreadPage />);
   };

   describe("ThreadPage", () => {
     it("renders the page heading", () => {
       setup();
       expect(screen.getByRole("heading", { name: "ThreadPage" })).toBeInTheDocument();
     });
   });
   ```

**Verification MANUAL:** Run `npm run test` — all tests pass including the new `ThreadPage` test.

---

### Step 6: Create `src/pages/index.ts` barrel

**New files:**

- `src/pages/index.ts`

**Changes:**
1. Re-export both page components:
   ```ts
   export * from "./HomePage";
   export * from "./ThreadPage";
   ```

**Verification MANUAL:** Run `npm run ts:check` — no TypeScript errors.

---

### Step 7: Create `AppRoutes` component in `src/routing/`

**New files:**

- `src/routing/AppRoutes.tsx`
- `src/routing/index.ts`

**Context:**
Routing config is extracted into `AppRoutes` rather than inlined in `App.tsx` so that tests can wrap it with `MemoryRouter` independently of the provider hierarchy.

**Changes:**
1. Create `AppRoutes.tsx`:
   ```tsx
   import { Routes, Route } from "react-router";
   import { HomePage, ThreadPage } from "@/pages";

   export const AppRoutes = () => {
     return (
       <Routes>
         <Route index element={<HomePage />} />
         <Route path="threads/:threadId" element={<ThreadPage />} />
       </Routes>
     );
   };
   ```
2. Create `index.ts` barrel:
   ```ts
   export * from "./AppRoutes";
   ```

**Verification MANUAL:** Run `npm run ts:check` — no TypeScript errors.

---

### Step 8: Update `App.tsx` to render `AppRoutes`

**File:** `src/App.tsx`

**Changes:**
1. Replace the current content with a minimal component that renders `<AppRoutes />`:
   ```tsx
   import { AppRoutes } from "@/routing";

   export const App = () => {
     return <AppRoutes />;
   };
   ```

**Verification MANUAL:** Run `npm run ts:check` — no TypeScript errors.

---

### Step 9: Wrap app with `BrowserRouter` in `main.tsx`

**File:** `src/main.tsx`

**Changes:**
1. Import `BrowserRouter` from `react-router` and wrap `<App />` with it, inside the existing `ChakraUIProvider`:
   ```tsx
   import { BrowserRouter } from "react-router";

   // wrap order: StrictMode > ChakraUIProvider > BrowserRouter > App
   <StrictMode>
     <ChakraUIProvider>
       <BrowserRouter>
         <App />
       </BrowserRouter>
     </ChakraUIProvider>
   </StrictMode>
   ```

**Verification MANUAL:** Run `npm run dev`, open the browser at `http://localhost:5173` and confirm the `HomePage` heading is visible; navigate to `/threads/1` and confirm the `ThreadPage` heading is visible.

---

### Step 10: Update `App.test.tsx` for the routing-based `App`

**File:** `src/__tests__/App.test.tsx`

**Context:**
`App` no longer owns any UI of its own — it renders routes. Tests must supply a `MemoryRouter` to provide routing context. `renderWithUIProvider` from `@/components/lib` handles Chakra; routing context must be added on top.

**Changes:**
1. Rewrite the test file to verify that the correct page renders for each route, using `MemoryRouter` with `initialEntries`:
   ```tsx
   import { screen } from "@testing-library/react";
   import { MemoryRouter } from "react-router";
   import { renderWithUIProvider } from "@/components/lib";
   import { App } from "../App";

   const setup = (initialPath: string = "/") => {
     renderWithUIProvider(
       <MemoryRouter initialEntries={[initialPath]}>
         <App />
       </MemoryRouter>
     );
   };

   describe("App", () => {
     it("renders HomePage at the root path", () => {
       setup("/");
       expect(screen.getByRole("heading", { name: "HomePage" })).toBeInTheDocument();
     });

     it("renders ThreadPage at /threads/:threadId", () => {
       setup("/threads/42");
       expect(screen.getByRole("heading", { name: "ThreadPage" })).toBeInTheDocument();
     });
   });
   ```

**Verification MANUAL:** Run `npm run test` — all tests pass with no failures.
