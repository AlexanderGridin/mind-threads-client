import { describe, it, expect } from "vitest";
import { MESSAGE_DATE_FORMAT_OPTIONS } from "../MessageItem.constants";
import { formatMessageDate } from "../MessageItem.utils";

const FIXED_CREATED_AT = "2026-06-20T12:00:00.000Z";

describe("MessageItem.utils", () => {
  describe("formatMessageDate", () => {
    it("formats the date with the message date options", () => {
      const expectedDate = new Intl.DateTimeFormat(
        undefined,
        MESSAGE_DATE_FORMAT_OPTIONS
      ).format(new Date(FIXED_CREATED_AT));

      const formattedDate = formatMessageDate(FIXED_CREATED_AT);
      expect(formattedDate).toBe(expectedDate);
    });
  });
});
