import { afterEach, vi } from "vitest";
import "@testing-library/jest-dom";
import { notificationsToaster } from "@/components/lib/Notifications";

afterEach(() => {
  notificationsToaster.remove();
  localStorage.clear();
});

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

globalThis.ResizeObserver = class {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
};

Element.prototype.scrollIntoView = vi.fn();
