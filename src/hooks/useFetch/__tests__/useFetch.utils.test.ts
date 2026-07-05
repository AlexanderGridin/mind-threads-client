import { describe, it, expect } from "vitest";
import { joinUrl, readResponseBody } from "../useFetch.utils";

describe("useFetch.utils", () => {
  describe("joinUrl", () => {
    it("joins base URL with trailing slash and route with leading slash, resulting in a single slash", () => {
      const result = joinUrl("http://api.example.com/", "/users");
      expect(result).toBe("http://api.example.com/users");
    });

    it("joins base URL without trailing slash and route without leading slash, resulting in a single slash", () => {
      const result = joinUrl("http://api.example.com", "users");
      expect(result).toBe("http://api.example.com/users");
    });

    it("joins base URL with trailing slash and route without leading slash, resulting in a single slash", () => {
      const result = joinUrl("http://api.example.com/", "users");
      expect(result).toBe("http://api.example.com/users");
    });

    it("joins base URL without trailing slash and route with leading slash, resulting in a single slash", () => {
      const result = joinUrl("http://api.example.com", "/users");
      expect(result).toBe("http://api.example.com/users");
    });

    it("handles base URL with multiple trailing slashes", () => {
      const result = joinUrl("http://api.example.com///", "/users");
      expect(result).toBe("http://api.example.com/users");
    });

    it("handles route with multiple leading slashes", () => {
      const result = joinUrl("http://api.example.com", "///users");
      expect(result).toBe("http://api.example.com/users");
    });
  });

  describe("readResponseBody", () => {
    it("parses valid JSON response body correctly", async () => {
      const response = new Response(JSON.stringify({ id: 1, name: "John" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });

      const result = await readResponseBody(response);
      expect(result).toStrictEqual({ id: 1, name: "John" });
    });

    it("returns null for empty response body", async () => {
      const response = new Response("", { status: 200 });

      const result = await readResponseBody(response);
      expect(result).toBeNull();
    });

    it("falls back to raw text when response body is not JSON", async () => {
      const htmlBody = "<html><body>Internal Server Error</body></html>";
      const response = new Response(htmlBody, { status: 500 });

      const result = await readResponseBody<string>(response);
      expect(result).toBe(htmlBody);
    });

    it("handles malformed JSON by falling back to raw text", async () => {
      const response = new Response("{invalid json}", { status: 200 });

      const result = await readResponseBody<string>(response);
      expect(result).toBe("{invalid json}");
    });

    it("handles plain text response body", async () => {
      const response = new Response("plain text response", { status: 200 });

      const result = await readResponseBody<string>(response);
      expect(result).toBe("plain text response");
    });
  });
});
