import { forwardRef } from "react";
import { IconButton } from "@chakra-ui/react";

import { useColorMode } from "../../color-mode.hooks";
import { ColorModeIcon } from "../../components";
import { ColorModeButtonTestId } from "./ColorModeButton.constants";

export const ColorModeButton = forwardRef<HTMLButtonElement, unknown>(
  (_, ref) => {
    const { toggleColorMode } = useColorMode();

    return (
      <IconButton
        data-testid={ColorModeButtonTestId.container}
        aria-label="Toggle color mode"
        variant="ghost"
        size="sm"
        ref={ref}
        css={{
          _icon: {
            width: "5",
            height: "5",
          },
        }}
        onClick={toggleColorMode}
      >
        <ColorModeIcon />
      </IconButton>
    );
  }
);

ColorModeButton.displayName = "ColorModeButton";
