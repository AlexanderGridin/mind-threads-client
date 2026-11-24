import { LuX } from "react-icons/lu";
import { Box, IconButton, Text } from "@/components/lib";
import { TagChipTestId } from "./TagChip.constants";
import { getRemoveTagLabel } from "./TagChip.utils";

type TagChipProps = {
  tag: string;
  onRemove?: (tag: string) => void;
};

export const TagChip = ({ tag, onRemove }: TagChipProps) => {
  const handleRemove = () => {
    onRemove?.(tag);
  };

  return (
    <Box
      data-testid={TagChipTestId.container}
      display="flex"
      alignItems="center"
      gap="1"
      flexShrink={onRemove ? 0 : 1}
      whiteSpace={onRemove ? "nowrap" : "normal"}
      minWidth="0"
      pl="2"
      pr={onRemove ? "1" : "2"}
      borderRadius="full"
      borderWidth="1px"
      borderColor="border"
      backgroundColor="bg.muted"
    >
      <Text
        data-testid={TagChipTestId.name}
        fontSize="xs"
        overflowWrap="anywhere"
      >
        {tag}
      </Text>

      {onRemove ? (
        <IconButton
          size="2xs"
          variant="ghost"
          height="4"
          minWidth="4"
          px="0"
          aria-label={getRemoveTagLabel(tag)}
          onClick={handleRemove}
        >
          <LuX aria-hidden />
        </IconButton>
      ) : null}
    </Box>
  );
};
