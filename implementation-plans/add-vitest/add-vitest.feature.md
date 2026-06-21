
# Adding Vitest

## Implementation Steps

---

### Step 1: Install Vitest and testing dependencies

**Changes:**
1. Install packages:
   ```bash
   npm install --save-dev vitest @vitest/coverage-v8 @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom
   ```

**Verification MANUAL:** Run `npm ls vitest` and confirm the package is listed without errors.

---

### Step 2: Configure Vitest in `vite.config.ts`

**File:** `vite.config.ts`

**Context:** Vitest reads its config from the same `vite.config.ts` file via a `test` key. We add a `/// <reference types="vitest/config" />` triple-slash directive so TypeScript picks up the `test` property type.

**Changes:**
1. Add triple-slash reference at the top of the file:
   ```ts
   /// <reference types="vitest/config" />
   ```
2. Add `test` block inside `defineConfig`:
   ```ts
   test: {
     environment: 'jsdom',
     globals: true,
     setupFiles: ['./vitest.setup.ts'],
   },
   ```

**Verification MANUAL:** Run `npx vitest --run` and confirm it exits cleanly (no config errors), even if it reports "no test files found".

---

### Step 3: Create the Vitest setup file

**New files:**

- `vitest.setup.ts`

**Changes:**
1. Create `vitest.setup.ts` at the project root with:
   ```ts
   import '@testing-library/jest-dom';
   ```

**Verification MANUAL:** Run `npx vitest --run`; confirm no import errors in the setup file.

---

### Step 4: Add Vitest types to `tsconfig.app.json`

**File:** `tsconfig.app.json`

**Context:** With `globals: true`, Vitest injects `describe`, `it`, `expect`, etc. globally. Adding `"vitest/globals"` to `types` makes TypeScript aware of these without explicit imports in every test file.

**Changes:**
1. Extend the `"types"` array:
   ```json
   "types": ["vite/client", "vitest/globals"]
   ```
2. Extend `"include"` to also cover the root-level setup file:
   ```json
   "include": ["src", "vitest.setup.ts"]
   ```

**Verification MANUAL:** Run `npm run build`; confirm TypeScript compiles without errors.

---

### Step 5: Add `test` script to `package.json`

**File:** `package.json`

**Changes:**
1. Add to `"scripts"`:
   ```json
   "test": "vitest run",
   "test:watch": "vitest",
   "test:coverage": "vitest run --coverage"
   ```

**Verification MANUAL:** Run `npm test` and `npm run test:coverage`; confirm both exit without errors (may report "no test files found").

---

### Step 6: Update `App.tsx` to toggle "MindThreads" text visibility

**File:** `src/App.tsx`

**Context:** The React Compiler is active, so no manual `useCallback`/`useMemo` is needed — just plain `useState`.

**Changes:**
1. Add a `useState` boolean for visibility, defaulting to `true`.
2. Render the `<h1>MindThreads</h1>` conditionally on that state.
3. Add a `<button>` that toggles the state; use a descriptive accessible label (e.g. `"Toggle visibility"`):
   ```tsx
   import { useState } from 'react';

   export const App = () => {
     const [visible, setVisible] = useState(true);

     return (
       <>
         <button onClick={() => setVisible(v => !v)}>Toggle visibility</button>
         {visible && <h1>MindThreads</h1>}
       </>
     );
   };
   ```

**Verification MANUAL:** Run `npm run dev`, open the browser, click "Toggle visibility", and confirm the heading appears and disappears.

---

### Step 7: Add unit tests for `App`

**New files:**

- `src/__tests__/App.test.tsx`

**Changes:**
1. Create `src/__tests__/App.test.tsx`:
   ```tsx
   import { render, screen } from '@testing-library/react';
   import userEvent from '@testing-library/user-event';
   import { App } from '../App';

   describe('App', () => {
     it('renders the MindThreads heading by default', () => {
       render(<App />);
       expect(screen.getByRole('heading', { name: 'MindThreads' })).toBeInTheDocument();
     });

     it('hides the heading when the toggle button is clicked', async () => {
       const user = userEvent.setup();
       render(<App />);
       await user.click(screen.getByRole('button', { name: 'Toggle visibility' }));
       expect(screen.queryByRole('heading', { name: 'MindThreads' })).not.toBeInTheDocument();
     });

     it('shows the heading again when the toggle button is clicked a second time', async () => {
       const user = userEvent.setup();
       render(<App />);
       await user.click(screen.getByRole('button', { name: 'Toggle visibility' }));
       await user.click(screen.getByRole('button', { name: 'Toggle visibility' }));
       expect(screen.getByRole('heading', { name: 'MindThreads' })).toBeInTheDocument();
     });
   });
   ```

**Verification MANUAL:** Run `npm test`; confirm all three tests pass.

---

### Step 8: Update `CLAUDE.md`

**File:** `CLAUDE.md`

**Changes:**
1. Replace the note about no test runner with the actual test commands:
   ```markdown
   npm run test           # Run all unit tests once (vitest run)
   npm run test:watch     # Run tests in watch mode
   npm run test:coverage  # Run tests with coverage report
   ```
2. Remove or update the sentence: _"No test runner is configured yet — a draft to add Vitest lives in `.doc/add-vitest.draft.md`."_
3. Note the test file convention in the Architecture section: tests live in `src/__tests__/` with `.test.tsx` / `.test.ts` extensions; the Vitest setup file is at `vitest.setup.ts` (project root).

**Verification MANUAL:** Read `CLAUDE.md` and confirm the test commands appear under `## Commands` and the stale draft note is gone.
