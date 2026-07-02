# Local storage service

## Implementation Steps

---

### Step 1: Create the local storage service folder and types

**New files:**

- `src/services/local-storage/local-storage.types.ts`
- `src/services/local-storage/index.ts`

**Context:**
Follows the folder-per-unit pattern used by `src/components/lib/color-mode` (e.g. `color-mode.types.ts` + `color-mode.hooks.ts` + `index.ts`), which the project uses for multi-level barrel exports.

**Changes:**

1. In `local-storage.types.ts`, define the return type of the hook:
   ```ts
   export type UseLocalStorageReturn<ValueType> = {
     read: () => ValueType | null;
     set: (newValue: ValueType) => void;
     update: (updater: (prevValue: ValueType | null) => ValueType) => void;
   };
   ```
2. In `index.ts`, re-export the types (the hooks export will be added in Step 2):
   ```ts
   export * from "./local-storage.types";
   ```

**Verification MANUAL:** Run `npm run ts:check` and confirm the new files compile with no errors.

---

### Step 2: Implement the useLocalStorage hook

**New files:**

- `src/services/local-storage/local-storage.hooks.ts`

**File:**
`src/services/local-storage/index.ts`

**Context:**
Caching follows a lazy-signal approach: nothing is read from `localStorage` until the first `read()` call, after which the value is cached in a `useRef` and reused on subsequent reads. `cacheRef.current === null` doubles as the "not yet cached" sentinel — a stored value that is genuinely absent or a malformed/erroring read also resolves to `null`, so those cases simply re-read on every call instead of short-circuiting, which is harmless. `set`/`update` write through to `localStorage` and refresh the cache. Any error (e.g. malformed JSON, storage access failure) is caught and logged via `console.error`, and `read()` resolves to `null` in that case.

**Changes:**

1. In `local-storage.hooks.ts`, implement:
   ```ts
   import { useRef } from "react";

   export const useLocalStorage = <ValueType>(
     key: string
   ): UseLocalStorageReturn<ValueType> => {
     const cacheRef = useRef<ValueType | null>(null);

     const read = (): ValueType | null => {
       if (cacheRef.current !== null) return cacheRef.current;

       try {
         const storedValue = localStorage.getItem(key);
         cacheRef.current =
           storedValue === null ? null : (JSON.parse(storedValue) as ValueType);
       } catch (error) {
         console.error(error);
         cacheRef.current = null;
       }

       return cacheRef.current;
     };

     const set = (newValue: ValueType): void => {
       try {
         localStorage.setItem(key, JSON.stringify(newValue));
         cacheRef.current = newValue;
       } catch (error) {
         console.error(error);
       }
     };

     const update = (
       updater: (prevValue: ValueType | null) => ValueType
     ): void => {
       set(updater(read()));
     };

     return { read, set, update };
   };
   ```
2. Add the barrel export for the hook in `local-storage/index.ts`:
   ```ts
   export * from "./local-storage.hooks";
   ```

**Verification MANUAL:** Run `npm run ts:check` and confirm the hook compiles; manually import it in a scratch component and confirm `read()`/`set()`/`update()` behave against the browser's dev tools `localStorage` panel.

---

### Step 3: Create the services barrel export

**New files:**

- `src/services/index.ts`

**Changes:**

1. Re-export the local-storage module:
   ```ts
   export * from "./local-storage";
   ```

**Verification MANUAL:** Confirm `import { useLocalStorage } from "@/services"` resolves without a TypeScript error.

---

### Step 4: Add unit tests for useLocalStorage

**New files:**

- `src/services/local-storage/__tests__/local-storage.hooks.test.ts`

**Context:**
jsdom (the test environment configured via `vitest.config.ts`) provides a working native `localStorage`, so tests can exercise the hook against the real API instead of mocking it — clear it in `beforeEach` to isolate tests. Use `renderHook` from `@testing-library/react`, matching the pattern in `src/components/lib/color-mode/__tests__/color-mode.hooks.test.tsx`.

**Changes:**

1. Scaffold:
   ```ts
   import { describe, it, expect, beforeEach, vi } from "vitest";
   import { renderHook } from "@testing-library/react";
   import { useLocalStorage } from "../local-storage.hooks";

   beforeEach(() => {
     localStorage.clear();
   });
   ```
2. Cover these cases:
   - `read()` returns `null` when the key is not present.
   - `read()` returns a cached non-null value on a second call without re-reading `localStorage` (spy on `Storage.prototype.getItem` with `vi.spyOn` and assert it was called only once across two `read()` calls).
   - `read()` re-reads `localStorage` on every call when the key is absent (cached value is `null`) — documents the accepted tradeoff of using `null` as the "not cached" sentinel (spy on `Storage.prototype.getItem` and assert it was called on each of two `read()` calls).
   - `set(newValue)` persists the value to `localStorage` (assert via `localStorage.getItem(key)`) and updates the cache so a subsequent `read()` returns the new value without touching `localStorage` again.
   - `update((prevValue) => updatedValue)` receives the previously cached/read value and persists the updater's result.
   - `read()` catches a malformed stored value (e.g. `localStorage.setItem(key, "not-json")`), logs via `console.error` (assert with `vi.spyOn(console, "error").mockImplementation(() => {})`), and returns `null`.
   - Two independent `renderHook` calls with different `key` values do not share a cache.

**Verification MANUAL:** Run `npm run test` and confirm all new tests in `local-storage.hooks.test.ts` pass.

---

### Step 5: Format and lint the new service

**File:**
`src/services/**`

**Changes:**

1. Run `npm run format` to apply Prettier formatting to the new files under `src/`.
2. Run `npm run lint` and resolve any ESLint findings in the new files.

**Verification MANUAL:** Confirm both `npm run format` and `npm run lint` complete with no reported issues in `src/services/`.
