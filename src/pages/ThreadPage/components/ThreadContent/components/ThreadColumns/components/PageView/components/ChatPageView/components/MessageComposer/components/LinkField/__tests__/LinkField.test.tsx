import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithUIProvider } from "@/components/lib/__test-fixtures__";
import { LinkField } from "../LinkField";
import {
  CANCEL_LINK_LABEL,
  CONFIRM_LINK_LABEL,
  LINK_URL_LABEL,
} from "../LinkField.constants";

const ERROR_MESSAGE = "Enter a valid http or https URL";

type SetupParams = {
  url?: string;
  error?: string;
};

const setup = ({ url = "", error = "" }: SetupParams = {}) => {
  const user = userEvent.setup();
  const onChange = vi.fn();
  const onConfirm = vi.fn();
  const onCancel = vi.fn();

  renderWithUIProvider(
    <LinkField
      url={url}
      error={error}
      onChange={onChange}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );

  return { user, onChange, onConfirm, onCancel };
};

const getUrlInput = () => {
  return screen.getByRole("textbox", { name: LINK_URL_LABEL });
};

const getConfirmButton = () => {
  return screen.getByRole("button", { name: CONFIRM_LINK_LABEL });
};

const getCancelButton = () => {
  return screen.getByRole("button", { name: CANCEL_LINK_LABEL });
};

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("LinkField", () => {
  it("focuses the URL input on mount", () => {
    setup();

    const urlInput = getUrlInput();
    expect(urlInput).toHaveFocus();
  });

  it("calls onChange with the typed value", async () => {
    const { user, onChange } = setup();

    const urlInput = getUrlInput();
    await user.type(urlInput, "h");

    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith("h");
  });

  it("calls onConfirm when Enter is pressed in the input", async () => {
    const { user, onConfirm } = setup();

    const urlInput = getUrlInput();
    await user.type(urlInput, "{Enter}");

    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it("calls onConfirm when the Add link button is clicked", async () => {
    const { user, onConfirm } = setup();

    const confirmButton = getConfirmButton();
    await user.click(confirmButton);

    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it("calls onCancel when Escape is pressed in the input", async () => {
    const { user, onCancel } = setup();

    await user.keyboard("{Escape}");

    expect(onCancel).toHaveBeenCalledOnce();
  });

  it("calls onCancel when the Cancel button is clicked", async () => {
    const { user, onCancel } = setup();

    const cancelButton = getCancelButton();
    await user.click(cancelButton);

    expect(onCancel).toHaveBeenCalledOnce();
  });

  it("shows the error as inline text", () => {
    setup({ error: ERROR_MESSAGE });

    const errorText = screen.getByText(ERROR_MESSAGE);
    expect(errorText).toBeInTheDocument();
  });

  it("shows no error text when there is no error", () => {
    setup({ error: "" });

    const errorText = screen.queryByText(ERROR_MESSAGE);
    expect(errorText).not.toBeInTheDocument();
  });
});
