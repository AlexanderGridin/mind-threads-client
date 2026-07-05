# Add useFetch() hook + services folder rename

## Goal

Add a useFetch() hook (a thin, Axios-like wrapper around fetch() supporting GET/POST/PUT/PATCH/DELETE with default headers and a base URL) inside a renamed src/hooks/ folder (renamed from src/services/), and rename src/services/local-storage/ to src/hooks/useLocalStorage/ with all nested files renamed to match.

### Implementation notes

useFetch() defines a single request<T>(method, route, body?, overrides?) => Promise<T> closure that does URL joining, header merging, fetch(), status check, and JSON parsing exactly once. The five exposed methods (get, post, etc.) are one-liners calling request(...) with the method fixed.

Response parsing edge case: response.json() throws if the body is empty (e.g., a 204 No Content DELETE response, or a 2xx response with no body). The thin wrapper needs to check response.status === 2xx (with no body) or Content-Length: 0 before parsing (check a more reliable approach).

HTTP error shape: The confirmed approach throws Error with status + parsed body attached. Since attempting response.json() on an error body could itself throw (e.g., a 500 with an HTML error page), the implementation needs a fallback - try/catch around parsing the error body, falling back to response.text() or null.

Base URL / route joining: Needs a small utility to avoid double/missing slashes when joining baseUrl (e.g., https://api.com) and route (e.g., /threads or threads) — an easy source of subtle bugs if not tested explicitly.

body serialization assumption: Wrapping every request body in JSON.stringify(body) and always setting Content-Type: application/json assumes JSON-only APIs (consistent with "excluding all advanced features" — no FormData/multipart support planned). This is acceptable for now as this is a known simplification.

### High-level plan

1. Rename src/services/ to src/hooks/ and src/services/local-storage/ to src/hooks/useLocalStorage/, renaming all nested files (local-storage.hooks.ts → useLocalStorage.hooks.ts, local-storage.types.ts → useLocalStorage.types.ts, and the test file), updating all internal relative imports and the one external consumer (DashboardPageLoader.tsx).
2. Add useFetch.types.ts defining the hook's params, default-headers type, per-call overrides type, and the HTTP error type.
3. Implement useFetch.hooks.ts with the internal request() helper and the five exposed REST methods, including header merging, URL joining, and error throwing on non-2xx responses.
4. Add the barrel index.ts for useFetch/ and re-export it from src/hooks/index.ts.
5. Write co-located tests in src/hooks/useFetch/__tests__/ mocking global.fetch, covering success responses, header merging/override, non-2xx error throwing, and empty-body responses (e.g., DELETE/204).
6. Update CLAUDE.md's "Folder structure" section to reflect the src/hooks/ rename.

## References

@src/services/
