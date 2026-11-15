import { LuX } from "react-icons/lu";
import { Box, IconButton, Text } from "@/components/lib";
import { TagChipTestId } from "./TagChip.constants";
import { getRemoveTagLabel } from "./TagChip.utils";

type TagChipProps = {
  tag: string;
  onRemove: (tag: string) => void;
};

export const TagChip = ({ tag, onRemove }: TagChipProps) => {
  const handleRemove = () => {
    onRemove(tag);
  };

  return (
    <Box
      data-testid={TagChipTestId.container}
      display="flex"
      alignItems="center"
      gap="1"
      flexShrink={0}
      whiteSpace="nowrap"
      pl="2"
      pr="1"
      borderRadius="full"
      borderWidth="1px"
      borderColor="border"
      backgroundColor="bg.muted"
    >
      <Text data-testid={TagChipTestId.name} fontSize="xs">
        {tag}
      </Text>

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
    </Box>
  );
};
