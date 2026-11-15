import { IconButton, Tooltip } from "@/components/lib";
import type {
  ComposerCommand,
  ComposerToolbarCommand,
} from "../../MessageComposer.types";
import { getCommandTooltip } from "../../MessageComposer.utils";

type ComposerToolbarButtonProps = {
  command: ComposerToolbarCommand;
  isActive?: boolean;
  onCommand: (command: ComposerCommand) => void;
};

export const ComposerToolbarButton = ({
  command,
  isActive,
  onCommand,
}: ComposerToolbarButtonProps) => {
  const { icon: CommandIcon } = command;

  const handleClick = () => {
    onCommand(command);
  };

  return (
    <Tooltip label={getCommandTooltip(command)}>
      <IconButton
        aria-label={command.label}
        aria-pressed={isActive}
        variant={isActive ? "subtle" : "ghost"}
        size="xs"
        onClick={handleClick}
      >
        <CommandIcon aria-hidden />
      </IconButton>
    </Tooltip>
  );
};
