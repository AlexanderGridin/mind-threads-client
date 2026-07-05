# Add useFetch() hook + services folder rename

## Implementation Steps

---

### Step 1: Rename `src/services/` to `src/hooks/` and `local-storage` to `useLocalStorage`

**New files:**

- `src/hooks/index.ts`
- `src/hooks/useLocalStorage/index.ts`
- `src/hooks/useLocalStorage/useLocalStorage.types.ts`
- `src/hooks/useLocalStorage/useLocalStorage.hooks.ts`
- `src/hooks/useLocalStorage/__tests__/useLocalStorage.hooks.test.ts`

**File:**
`src/pages/DashboardPage/components/DashboardPageLoader/DashboardPageLoader.tsx`

**Context:**
Pure rename/move, no behavior change. Doing it as a single step keeps the tree in a compiling state the whole time — splitting the folder move from the import-path update would leave an intermediate broken build.

**Changes:**

1. `git mv src/services src/hooks`.
2. `git mv src/hooks/local-storage src/hooks/useLocalStorage`.
3. `git mv src/hooks/useLocalStorage/local-storage.types.ts src/hooks/useLocalStorage/useLocalStorage.types.ts`.
4. `git mv src/hooks/useLocalStorage/local-storage.hooks.ts src/hooks/useLocalStorage/useLocalStorage.hooks.ts`.
5. `git mv src/hooks/useLocalStorage/__tests__/local-storage.hooks.test.ts src/hooks/useLocalStorage/__tests__/useLocalStorage.hooks.test.ts`.
6. In `useLocalStorage.hooks.ts`, update the relative import:
   ```ts
   import type {
     LocalStorageUpdater,
     UseLocalStorageReturn,
   } from "./useLocalStorage.types";
   ```
7. In `useLocalStorage/index.ts`, update the re-exports:
   ```ts
   export * from "./useLocalStorage.types";
   export * from "./useLocalStorage.hooks";
   ```
8. In `useLocalStorage/__tests__/useLocalStorage.hooks.test.ts`, update the import:
   ```ts
   import { useLocalStorage } from "../useLocalStorage.hooks";
   ```
9. `src/hooks/index.ts` keeps its existing content (`export * from "./useLocalStorage";`) — no change needed beyond the file move.
10. In `DashboardPageLoader.tsx`, update the import:
    ```ts
    import { useLocalStorage } from "@/hooks/useLocalStorage";
    ```

**Verification MANUAL:** Run `npm run ts:check` and `npm run test` — both should pass with no reference to the old `src/services` path remaining (`grep -r "services" src` returns nothing).

---

### Step 2: Add `useFetch.types.ts` with the hook's param, override, and error types

**New files:**

- `src/hooks/useFetch/useFetch.types.ts`

**Context:**
Mirrors `useLocalStorage.types.ts`'s pattern of keeping all type-only declarations separate from hook logic, per `CLAUDE.md`'s type-only-import convention.

**Changes:**

1. Define the HTTP method union, the hook's constructor params, per-call overrides, and the error payload shape:
   ```ts
   export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

   export type UseFetchParams = {
     baseUrl: string;
     defaultHeaders?: Record<string, string>;
   };

   export type RequestOverrides = {
     headers?: Record<string, string>;
   };

   export type HttpErrorPayload = {
     status: number;
     body: unknown;
   };

   export type UseFetchReturn = {
     get: <ResponseType>(
       route: string,
       overrides?: RequestOverrides
     ) => Promise<ResponseType>;
     post: <ResponseType>(
       route: string,
       body?: unknown,
       overrides?: RequestOverrides
     ) => Promise<ResponseType>;
     put: <ResponseType>(
       route: string,
       body?: unknown,
       overrides?: RequestOverrides
     ) => Promise<ResponseType>;
     patch: <ResponseType>(
       route: string,
       body?: unknown,
       overrides?: RequestOverrides
     ) => Promise<ResponseType>;
     delete: <ResponseType>(
       route: string,
       overrides?: RequestOverrides
     ) => Promise<ResponseType>;
   };
   ```

**Verification MANUAL:** Run `npm run ts:check` — the new file compiles with no consumers yet, so no errors expected.

---

### Step 3: Add `useFetch.utils.ts` with `joinUrl` and `readResponseBody`

**New files:**

- `src/hooks/useFetch/useFetch.utils.ts`
- `src/hooks/useFetch/__tests__/useFetch.utils.test.ts`

**Context:**
Both helpers are pure functions colocated with the hook that uses them, following the `.hooks.ts` / `.types.ts` suffix convention (extended here with `.utils.ts`). The draft flags URL joining as "an easy source of subtle bugs if not tested explicitly," and `readResponseBody` similarly hides the empty-body / non-JSON-body edge cases — both get dedicated unit tests here rather than being exercised only indirectly through `useFetch.hooks.test.ts`.

**Changes:**

1. In `useFetch.utils.ts`, add the URL joiner, stripping exactly one layer of trailing/leading slashes from each side before joining:
   ```ts
   export const joinUrl = (baseUrl: string, route: string): string => {
     const trimmedBaseUrl = baseUrl.replace(/\/+$/, "");
     const trimmedRoute = route.replace(/^\/+/, "");

     return `${trimmedBaseUrl}/${trimmedRoute}`;
   };
   ```
2. In the same file, add the shared body reader — reads `response.text()` exactly once, then `JSON.parse`s it, falling back to the raw text on parse failure and to `null` on an empty string. This covers both the empty-body (204/2xx) and non-JSON error-body (e.g. an HTML 500 page) edge cases from the draft without separate `Content-Length`/status branching or a double body read:
   ```ts
   export const readResponseBody = async <ResponseType>(
     response: Response
   ): Promise<ResponseType | null> => {
     const text = await response.text();

     if (text.length === 0) return null;

     try {
       return JSON.parse(text) as ResponseType;
     } catch {
       return text as unknown as ResponseType;
     }
   };
   ```
3. In `useFetch.utils.test.ts`, follow the `setup()`-less plain-function test style used in `src/utils/__tests__/`, covering:
   - `joinUrl`: base URL with trailing slash + route with leading slash → single slash; base URL without trailing slash + route without leading slash → single slash; empty route → base URL with trailing slash only.
   - `readResponseBody`: valid JSON body parses correctly; empty-string body (204) resolves to `null`; non-JSON body (e.g. an HTML string) falls back to the raw text instead of throwing. Construct real `Response` instances (e.g. `new Response("", { status: 204 })`) rather than hand-rolled mocks.

**Verification MANUAL:** Run `npm run test -- useFetch.utils` and confirm all cases pass.

---

### Step 4: Add `useFetch.errors.ts` with the `HttpError` class

**New files:**

- `src/hooks/useFetch/useFetch.errors.ts`

**Context:**
`HttpError` is runtime logic (a class with a constructor), which is a distinct concern from both the plain-data shapes in `useFetch.types.ts` and the pure helper functions in `useFetch.utils.ts`, so it gets its own suffixed file rather than being folded into either.

**Changes:**

1. Define the error class (holds `status` + the parsed/fallback body from `HttpErrorPayload`):
   ```ts
   import type { HttpErrorPayload } from "./useFetch.types";

   export class HttpError extends Error {
     status: number;
     body: unknown;

     constructor({ status, body }: HttpErrorPayload) {
       super(`Request failed with status ${status}`);

       this.name = "HttpError";
       this.status = status;
       this.body = body;
     }
   }
   ```

**Verification MANUAL:** Run `npm run ts:check` — the new file compiles with no consumers yet, so no errors expected.

---

### Step 5: Implement `useFetch.hooks.ts` with the `request()` closure and REST methods

**New files:**

- `src/hooks/useFetch/useFetch.hooks.ts`

**Changes:**

1. Define `useFetch`, importing `joinUrl`/`readResponseBody` from `./useFetch.utils`, `HttpError` from `./useFetch.errors`, and the types from `./useFetch.types`:
   ```ts
   export const useFetch = ({
     baseUrl,
     defaultHeaders,
   }: UseFetchParams): UseFetchReturn => {
     const request = async <ResponseType>(
       method: HttpMethod,
       route: string,
       body?: unknown,
       overrides?: RequestOverrides
     ): Promise<ResponseType> => {
       const url = joinUrl(baseUrl, route);

       const headers = {
         "Content-Type": "application/json",
         ...defaultHeaders,
         ...overrides?.headers,
       };

       const response = await fetch(url, {
         method,
         headers,
         body: body === undefined ? undefined : JSON.stringify(body),
       });

       const parsedBody = await readResponseBody<ResponseType>(response);

       if (!response.ok) {
         throw new HttpError({ status: response.status, body: parsedBody });
       }

       return parsedBody as ResponseType;
     };

     return {
       get: (route, overrides) => request("GET", route, undefined, overrides),
       post: (route, body, overrides) => request("POST", route, body, overrides),
       put: (route, body, overrides) => request("PUT", route, body, overrides),
       patch: (route, body, overrides) =>
         request("PATCH", route, body, overrides),
       delete: (route, overrides) =>
         request("DELETE", route, undefined, overrides),
     };
   };
   ```

**Verification MANUAL:** Run `npm run ts:check` — the hook and its five methods compile with no type errors.

---

### Step 6: Add the `useFetch` barrel and re-export it from `src/hooks/index.ts`

**New files:**

- `src/hooks/useFetch/index.ts`

**File:**
`src/hooks/index.ts`

**Changes:**

1. In `src/hooks/useFetch/index.ts`:
   ```ts
   export * from "./useFetch.types";
   export * from "./useFetch.errors";
   export * from "./useFetch.hooks";
   ```
2. In `src/hooks/index.ts`, add:
   ```ts
   export * from "./useFetch";
   ```

**Verification MANUAL:** Run `npm run ts:check` and confirm `import { useFetch } from "@/hooks"` resolves without errors from a scratch file (or the test file added in Step 7).

---

### Step 7: Write tests for `useFetch.hooks.ts`

**New files:**

- `src/hooks/useFetch/__tests__/useFetch.hooks.test.ts`

**Context:**
Mock `global.fetch` with `vi.fn()` and resolve it with real `Response` instances (Node's built-in `Response`, available globally under the `jsdom` test environment) rather than hand-rolled mock objects, so `response.text()` / `response.ok` / `response.status` behave exactly as they would against a real server.

**Changes:**

1. Follow the `setup()` pattern from `useLocalStorage.hooks.test.ts` (via `renderHook`), calling `useFetch({ baseUrl: TEST_BASE_URL, defaultHeaders: ... })`.
2. Cover:
   - `get()` resolves with the parsed JSON body on a 200 response, and `fetch` was called with the joined URL and default `Content-Type` header.
   - `post()` serializes the given body with `JSON.stringify` and sends it as the request body.
   - Per-call `overrides.headers` are merged on top of `defaultHeaders` (override wins on key collision).
   - A non-2xx JSON error response causes the returned promise to reject with an `HttpError` whose `status` and `body` match the response.
   - A non-2xx response with a non-JSON body (e.g. an HTML string) causes the `HttpError.body` to fall back to the raw text.
   - `delete()` against a 204 empty-body response resolves with `null` instead of throwing.
3. Example fetch mock setup:
   ```ts
   global.fetch = vi.fn().mockResolvedValue(
     new Response(JSON.stringify({ id: 1 }), {
       status: 200,
       headers: { "Content-Type": "application/json" },
     })
   );
   ```

**Verification MANUAL:** Run `npm run test -- useFetch` and confirm all cases pass; run `npm run test:coverage` to confirm the new files meet the 90% threshold configured in `vitest.config.ts`.

---

### Step 8: Update `CLAUDE.md`'s folder structure section

**File:**
`CLAUDE.md`

**Changes:**

1. In the "Folder structure" bullet list, replace the `src/services/` line with a `src/hooks/` line reflecting the rename and the new `useFetch` addition:
   ```markdown
   - `src/hooks/` — Reusable hooks (e.g., `useLocalStorage`, `useFetch`), organized as a folder per hook.
   ```

**Verification MANUAL:** Read the updated section and confirm it no longer references `src/services/` or the `local-storage` service naming.
