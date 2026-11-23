import { Box, Button, Input } from "@/components/lib";
import type { KeyboardEvent } from "react";
import {
  CANCEL_LINK_LABEL,
  CONFIRM_LINK_LABEL,
  LINK_URL_LABEL,
  LINK_URL_PLACEHOLDER,
  LinkFieldTestId,
} from "./LinkField.constants";

type LinkFieldProps = {
  url: string;
  error: string;
  onChange: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
};

export const LinkField = ({
  url,
  error,
  onChange,
  onConfirm,
  onCancel,
}: LinkFieldProps) => {
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      onConfirm();
    }

    if (event.key === "Escape") {
      event.preventDefault();
      onCancel();
    }
  };

  return (
    <Box
      data-testid={LinkFieldTestId.container}
      display="flex"
      alignItems="flex-start"
      gap="2"
      px="3"
      py="2"
      borderBottomWidth="1px"
    >
      <Input
        size="sm"
        autoFocus
        aria-label={LINK_URL_LABEL}
        placeholder={LINK_URL_PLACEHOLDER}
        value={url}
        errorText={error}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        data-testid={LinkFieldTestId.input}
      />

      <Button background="accent" size="xs" onClick={onConfirm}>
        {CONFIRM_LINK_LABEL}
      </Button>

      <Button size="xs" variant="ghost" onClick={onCancel}>
        {CANCEL_LINK_LABEL}
      </Button>
    </Box>
  );
};
