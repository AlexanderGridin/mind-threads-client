import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useFetch } from "../useFetch";
import { HttpError } from "../useFetch.errors";

const TEST_BASE_URL = "http://api.example.com";

beforeEach(() => {
  vi.clearAllMocks();
  globalThis.fetch = vi.fn();
});

describe("useFetch", () => {
  describe("get()", () => {
    it("resolves with parsed JSON body on 200 response", async () => {
      const mockResponseBody = { id: 1, name: "John" };

      globalThis.fetch = vi.fn().mockResolvedValue(
        new Response(JSON.stringify(mockResponseBody), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      );

      const { result } = renderHook(() => useFetch({ baseUrl: TEST_BASE_URL }));
      const response = await result.current.get("/users");

      expect(globalThis.fetch).toHaveBeenCalledWith(
        "http://api.example.com/users",
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          body: undefined,
        }
      );

      expect(response).toStrictEqual(mockResponseBody);
    });

    it("includes default headers in the request", async () => {
      globalThis.fetch = vi
        .fn()
        .mockResolvedValue(new Response(JSON.stringify({}), { status: 200 }));

      const { result } = renderHook(() =>
        useFetch({
          baseUrl: TEST_BASE_URL,
          defaultHeaders: { Authorization: "Bearer token123" },
        })
      );

      await result.current.get("/users");

      expect(globalThis.fetch).toHaveBeenCalledWith(
        "http://api.example.com/users",
        {
          method: "GET",
          body: undefined,
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer token123",
          },
        }
      );
    });
  });

  describe("post()", () => {
    it("serializes body with JSON.stringify and sends as request body", async () => {
      const mockBody = { name: "Jane" };

      globalThis.fetch = vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify({ id: 2 }), { status: 200 })
        );

      const { result } = renderHook(() => useFetch({ baseUrl: TEST_BASE_URL }));

      await result.current.post("/users", mockBody);

      expect(globalThis.fetch).toHaveBeenCalledWith(
        "http://api.example.com/users",
        {
          method: "POST",
          body: JSON.stringify(mockBody),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    });
  });

  describe("request overrides", () => {
    it("merges per-call override headers on top of default headers, with overrides winning on collision", async () => {
      globalThis.fetch = vi
        .fn()
        .mockResolvedValue(new Response(JSON.stringify({}), { status: 200 }));

      const { result } = renderHook(() =>
        useFetch({
          baseUrl: TEST_BASE_URL,
          defaultHeaders: {
            Authorization: "Bearer default",
            "X-Custom": "default-value",
          },
        })
      );

      await result.current.get("/users", {
        headers: {
          Authorization: "Bearer override",
          "X-Another": "another-value",
        },
      });

      expect(globalThis.fetch).toHaveBeenCalledWith(
        "http://api.example.com/users",
        {
          method: "GET",
          body: undefined,
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer override",
            "X-Custom": "default-value",
            "X-Another": "another-value",
          },
        }
      );
    });
  });

  describe("error handling", () => {
    it("rejects with HttpError on non-2xx JSON error response", async () => {
      const errorData = { error: "Unauthorized" };

      globalThis.fetch = vi.fn().mockResolvedValue(
        new Response(JSON.stringify(errorData), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        })
      );

      const { result } = renderHook(() => useFetch({ baseUrl: TEST_BASE_URL }));

      await expect(result.current.get("/users")).rejects.toThrow(HttpError);

      try {
        await result.current.get("/users");
      } catch (error) {
        if (error instanceof HttpError) {
          expect(error.status).toBe(401);
          expect(error.body).toStrictEqual(errorData);
        }
      }
    });

    it("falls back to raw text for non-2xx response with non-JSON body", async () => {
      const htmlBody = "<html><body>Unauthorized</body></html>";

      globalThis.fetch = vi
        .fn()
        .mockResolvedValue(new Response(htmlBody, { status: 401 }));

      const { result } = renderHook(() => useFetch({ baseUrl: TEST_BASE_URL }));

      try {
        await result.current.get("/users");
      } catch (error) {
        if (error instanceof HttpError) {
          expect(error.status).toBe(401);
          expect(error.body).toBe(htmlBody);
        }
      }
    });
  });

  describe("PUT, PATCH, and DELETE HTTP methods", () => {
    it("put() sends PUT request with body", async () => {
      const requestBody = { name: "Updated" };

      globalThis.fetch = vi
        .fn()
        .mockResolvedValue(new Response(JSON.stringify({}), { status: 200 }));

      const { result } = renderHook(() => useFetch({ baseUrl: TEST_BASE_URL }));

      await result.current.put("/users/1", requestBody);

      expect(globalThis.fetch).toHaveBeenCalledWith(
        "http://api.example.com/users/1",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        }
      );
    });

    it("patch() sends PATCH request with body", async () => {
      const requestBody = { status: "active" };

      globalThis.fetch = vi
        .fn()
        .mockResolvedValue(new Response(JSON.stringify({}), { status: 200 }));

      const { result } = renderHook(() => useFetch({ baseUrl: TEST_BASE_URL }));

      await result.current.patch("/users/1", requestBody);

      expect(globalThis.fetch).toHaveBeenCalledWith(
        "http://api.example.com/users/1",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        }
      );
    });

    it("delete() sends DELETE request without body", async () => {
      globalThis.fetch = vi
        .fn()
        .mockResolvedValue(new Response("", { status: 200 }));

      const { result } = renderHook(() => useFetch({ baseUrl: TEST_BASE_URL }));
      const response = await result.current.delete("/users/1");

      expect(response).toBeNull();

      expect(globalThis.fetch).toHaveBeenCalledWith(
        "http://api.example.com/users/1",
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: undefined,
        }
      );
    });
  });
});
