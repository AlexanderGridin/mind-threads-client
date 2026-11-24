import { describe, it, expect } from "vitest";
import DOMPurify from "dompurify";
import { sanitizeMessageContent } from "../MessageContent.utils";

const LINK_ATTRIBUTES = 'target="_blank" rel="noopener noreferrer"';
const PLAIN_LINK_HREF = "https://x.test";
const DATA_IMAGE_SRC = "data:image/png;base64,AAAA";
const HTTPS_IMAGE_SRC = "https://example.com/cat.png";

const KEPT_CASES: [string, string, string][] = [
  ["strong", "<p><strong>Bold</strong></p>", "<p><strong>Bold</strong></p>"],
  ["em", "<p><em>Italic</em></p>", "<p><em>Italic</em></p>"],
  [
    "lists",
    "<ul><li>One</li></ul><ol><li>Two</li></ol>",
    "<ul><li>One</li></ul><ol><li>Two</li></ol>",
  ],
  ["line break", "<p>Line<br>break</p>", "<p>Line<br>break</p>"],
  [
    "multiple paragraphs",
    "<p>First</p><p>Second</p>",
    "<p>First</p><p>Second</p>",
  ],
  [
    "https link",
    `<a href="${PLAIN_LINK_HREF}">Site</a>`,
    `<a href="${PLAIN_LINK_HREF}" ${LINK_ATTRIBUTES}>Site</a>`,
  ],
  [
    "data:image/png image with alt",
    `<img src="${DATA_IMAGE_SRC}" alt="dot.png">`,
    `<img src="${DATA_IMAGE_SRC}" alt="dot.png">`,
  ],
  [
    "https image",
    `<img src="${HTTPS_IMAGE_SRC}" alt="cat">`,
    `<img src="${HTTPS_IMAGE_SRC}" alt="cat">`,
  ],
];

const REMOVED_CASES: [string, string, string][] = [
  [
    "script with its contents",
    "<p>Hello<script>alert(1)</script> world</p>",
    "<p>Hello world</p>",
  ],
  ["onclick attribute", '<p onclick="steal()">Click</p>', "<p>Click</p>"],
  [
    "onerror attribute",
    `<img src="${HTTPS_IMAGE_SRC}" onerror="steal()">`,
    `<img src="${HTTPS_IMAGE_SRC}">`,
  ],
  [
    "javascript: href",
    '<a href="javascript:alert(1)">Click</a>',
    `<a ${LINK_ATTRIBUTES}>Click</a>`,
  ],
  [
    "javascript: src",
    '<img src="javascript:alert(1)" alt="x">',
    '<img alt="x">',
  ],
  [
    "data: link href",
    '<a href="data:text/html,hi">Click</a>',
    `<a ${LINK_ATTRIBUTES}>Click</a>`,
  ],
];

const STRIPPED_CASES: [string, string, string][] = [
  ["s", "<s>Struck</s>", "Struck"],
  ["u", "<u>Under</u>", "Under"],
  ["pre and code", "<pre><code>const x = 1;</code></pre>", "const x = 1;"],
  ["h1", "<h1>Title</h1>", "Title"],
  ["style attribute", '<p style="color: red">Plain</p>', "<p>Plain</p>"],
];

const EXISTING_TARGET_CONTENT = `<a href="${PLAIN_LINK_HREF}" target="_self">Site</a>`;
const EXISTING_TARGET_EXPECTED = `<a href="${PLAIN_LINK_HREF}" ${LINK_ATTRIBUTES}>Site</a>`;
const DEFAULT_PURIFIER_LINK_CONTENT = `<a href="${PLAIN_LINK_HREF}">x</a>`;

describe("MessageContent.utils", () => {
  describe("sanitizeMessageContent", () => {
    it.each(KEPT_CASES)("keeps %s", (_name, content, expectedHtml) => {
      const sanitizedHtml = sanitizeMessageContent(content);
      expect(sanitizedHtml).toBe(expectedHtml);
    });

    it.each(REMOVED_CASES)("removes %s", (_name, content, expectedHtml) => {
      const sanitizedHtml = sanitizeMessageContent(content);
      expect(sanitizedHtml).toBe(expectedHtml);
    });

    it.each(STRIPPED_CASES)(
      "strips the tags of %s and keeps the text",
      (_name, content, expectedHtml) => {
        const sanitizedHtml = sanitizeMessageContent(content);
        expect(sanitizedHtml).toBe(expectedHtml);
      }
    );

    it("sets target and rel on every link, replacing an existing target", () => {
      const sanitizedHtml = sanitizeMessageContent(EXISTING_TARGET_CONTENT);
      expect(sanitizedHtml).toBe(EXISTING_TARGET_EXPECTED);
    });

    it("leaves the default DOMPurify instance without the link hook", () => {
      const defaultSanitizedHtml = DOMPurify.sanitize(
        DEFAULT_PURIFIER_LINK_CONTENT
      );

      expect(defaultSanitizedHtml).toBe(DEFAULT_PURIFIER_LINK_CONTENT);
    });
  });
});
