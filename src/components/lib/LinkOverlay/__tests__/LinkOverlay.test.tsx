import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen } from "@testing-library/react";
import { LinkOverlay, type LinkOverlayProps } from "../LinkOverlay";
import { renderWithUIProvider } from "../../utils";

const LINK_OVERLAY_CLASS_NAME = "chakra-linkbox__overlay";

const setup = (props: Partial<LinkOverlayProps> = {}) => {
  const defaultProps: LinkOverlayProps = {
    children: "Title",
    ...props,
  };

  return renderWithUIProvider(<LinkOverlay {...defaultProps} />);
};

describe("LinkOverlay", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the child link as the overlay link when asChild is set", () => {
    const { container } = setup({
      asChild: true,
      children: <a href="/target">Title</a>,
    });

    const anchors = container.querySelectorAll("a");
    expect(anchors).toHaveLength(1);

    const link = screen.getByRole("link", { name: "Title" });

    expect(link).toHaveAttribute("href", "/target");
    expect(link).toHaveClass(LINK_OVERLAY_CLASS_NAME);
  });

  it("renders its own link with the children as text when asChild is not set", () => {
    const { container } = setup({
      children: <a href="/target">Title</a>,
    });

    const anchors = container.querySelectorAll("a");
    expect(anchors).toHaveLength(2);

    const link = screen.getByRole("link", { name: "Title" });
    expect(link).toHaveAttribute("href", "/target");

    const overlayLink = link.parentElement;

    if (!overlayLink) {
      throw new Error("Unable to find a parent element");
    }

    expect(overlayLink.tagName).toBe("A");
    expect(overlayLink).toHaveClass(LINK_OVERLAY_CLASS_NAME);
    expect(overlayLink).not.toHaveAttribute("href");
  });
});
