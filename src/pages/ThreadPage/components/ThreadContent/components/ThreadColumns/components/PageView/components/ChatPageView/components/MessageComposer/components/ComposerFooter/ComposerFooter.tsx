import { LuSend } from "react-icons/lu";
import { Box, Button, Text } from "@/components/lib";
import { sendCommand } from "../../MessageComposer.commands";
import { ComposerFooterTestId, SEND_HINT } from "./ComposerFooter.constants";

type ComposerFooterProps = {
  canSend: boolean;
  onSend: () => void;
};

export const ComposerFooter = ({ canSend, onSend }: ComposerFooterProps) => {
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      px="3"
      py="2"
      borderTopWidth="1px"
    >
      <Text
        data-testid={ComposerFooterTestId.hint}
        fontSize="xs"
        color="fg.muted"
      >
        {SEND_HINT}
      </Text>

      <Button
        data-testid={ComposerFooterTestId.sendButton}
        background="accent"
        size="xs"
        disabled={!canSend}
        onClick={onSend}
      >
        <LuSend aria-hidden />
        {sendCommand.label}
      </Button>
    </Box>
  );
};
