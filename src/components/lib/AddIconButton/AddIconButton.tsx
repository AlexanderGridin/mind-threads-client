import { LuPlus } from "react-icons/lu";
import { IconButton } from "../IconButton";
import { Tooltip } from "../Tooltip";

export type AddIconButtonProps = {
  tooltipLabel: string;
  onClick: () => void;
  "data-testid"?: string;
};

export const AddIconButton = ({
  tooltipLabel,
  onClick,
  "data-testid": dataTestId,
}: AddIconButtonProps) => {
  return (
    <Tooltip label={tooltipLabel}>
      <IconButton
        data-testid={dataTestId}
        aria-label={tooltipLabel}
        variant="outline"
        size="xs"
        onClick={onClick}
      >
        <LuPlus />
      </IconButton>
    </Tooltip>
  );
};
