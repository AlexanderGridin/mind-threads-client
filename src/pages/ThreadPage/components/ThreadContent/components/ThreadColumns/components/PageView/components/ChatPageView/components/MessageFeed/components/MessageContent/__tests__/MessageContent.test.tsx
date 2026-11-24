import { describe, it, expect, afterEach, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import { renderWithUIProvider } from "@/components/lib/__test-fixtures__";
import { MessageContent } from "../MessageContent";
import { MessageContentTestId } from "../MessageContent.constants";

const BOLD_CONTENT = "<p><strong>Bold</strong> text</p>";
const INJECTED_IMAGE_CONTENT = `<img src="x" onerror="alert('xss')">`;
const LINK_CONTENT = '<a href="https://example.com">Site</a>';

const setup = (content: string) => {
  renderWithUIProvider(<MessageContent content={content} />);
};

const getContentContainer = () => {
  return screen.getByTestId(MessageContentTestId.container);
};

describe("MessageContent", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the sanitized HTML", () => {
    setup(BOLD_CONTENT);

    const container = getContentContainer();
    const boldText = within(container).getByText("Bold");

    expect(boldText.tagName).toBe("STRONG");
  });

  it("does not run injected event handlers", () => {
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

    setup(INJECTED_IMAGE_CONTENT);

    const container = getContentContainer();
    const image = within(container).getByRole("img", { hidden: true });

    expect(image).not.toHaveAttribute("onerror");
    expect(alertSpy).not.toHaveBeenCalled();
  });

  it("renders links with target=_blank", () => {
    setup(LINK_CONTENT);

    const link = screen.getByRole("link", { name: "Site" });
    expect(link).toHaveAttribute("target", "_blank");
  });
});
