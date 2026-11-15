import type { KeyboardEvent } from "react";
import { Box, Input } from "@/components/lib";
import { TagChip } from "./components";
import {
  TAG_INPUT_LABEL,
  TAG_INPUT_PLACEHOLDER,
  TagRowTestId,
} from "./TagRow.constants";

type TagRowProps = {
  tags: string[];
  tagInput: string;
  isTagFieldOpen: boolean;
  onTagInputChange: (value: string) => void;
  onAddTag: () => void;
  onDiscardTagInput: () => void;
  onRemoveTag: (tag: string) => void;
};

export const TagRow = ({
  tags,
  tagInput,
  isTagFieldOpen,
  onTagInputChange,
  onAddTag,
  onDiscardTagInput,
  onRemoveTag,
}: TagRowProps) => {
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      onAddTag();
    }

    if (event.key === "Escape") {
      event.preventDefault();
      onDiscardTagInput();
    }
  };

  const handleBlur = () => {
    onAddTag();
  };

  return (
    <Box
      data-testid={TagRowTestId.container}
      display="flex"
      flexDirection="column"
      alignItems="stretch"
      gap="2"
      px="3"
      py="2"
      borderBottomWidth="1px"
    >
      {isTagFieldOpen ? (
        <Input
          size="sm"
          autoFocus
          aria-label={TAG_INPUT_LABEL}
          placeholder={TAG_INPUT_PLACEHOLDER}
          value={tagInput}
          onChange={onTagInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          data-testid={TagRowTestId.input}
        />
      ) : null}

      {tags.length ? (
        <Box display="flex" alignItems="center" gap="1.5" overflowX="auto">
          {tags.map((tag) => {
            return <TagChip key={tag} tag={tag} onRemove={onRemoveTag} />;
          })}
        </Box>
      ) : null}
    </Box>
  );
};
