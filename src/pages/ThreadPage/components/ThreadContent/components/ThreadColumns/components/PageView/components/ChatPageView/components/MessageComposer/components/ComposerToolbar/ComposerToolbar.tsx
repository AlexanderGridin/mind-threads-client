import { Box } from "@/components/lib";
import {
  FORMATTING_COMMANDS,
  STRUCTURE_COMMANDS,
  tagCommand,
} from "../../MessageComposer.commands";
import type { ComposerCommand } from "../../MessageComposer.types";
import { ComposerToolbarButton } from "../ComposerToolbarButton";
import { ComposerToolbarTestId } from "./ComposerToolbar.constants";

type ComposerToolbarProps = {
  isTagActive: boolean;
  onCommand: (command: ComposerCommand) => void;
};

export const ComposerToolbar = ({
  isTagActive,
  onCommand,
}: ComposerToolbarProps) => {
  return (
    <Box
      data-testid={ComposerToolbarTestId.container}
      display="flex"
      flexWrap="wrap"
      alignItems="center"
      gap="1"
      px="2"
      py="1"
      borderBottomWidth="1px"
    >
      {FORMATTING_COMMANDS.map((command) => {
        return (
          <ComposerToolbarButton
            key={command.id}
            command={command}
            onCommand={onCommand}
          />
        );
      })}

      <Box
        data-testid={ComposerToolbarTestId.divider}
        width="1px"
        height="4"
        backgroundColor="border"
      />

      {STRUCTURE_COMMANDS.map((command) => {
        return (
          <ComposerToolbarButton
            key={command.id}
            command={command}
            onCommand={onCommand}
          />
        );
      })}

      <Box marginLeft="auto">
        <ComposerToolbarButton
          command={tagCommand}
          isActive={isTagActive}
          onCommand={onCommand}
        />
      </Box>
    </Box>
  );
};
