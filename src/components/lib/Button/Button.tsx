import { Button as ChakraButton } from "@chakra-ui/react";
import type { ReactNode } from "react";

export type ButtonProps = {
  children: ReactNode;
  onClick: () => void;
  "data-testid"?: string;
  background?: string;
  disabled?: boolean;
  variant?:
    | "solid"
    | "subtle"
    | "surface"
    | "outline"
    | "ghost"
    | "plain"
    | undefined;
};

export const Button = ({
  "data-testid": dataTestId,
  variant = "solid",
  children,
  background,
  disabled = false,
  onClick,
}: ButtonProps) => {
  return (
    <ChakraButton
      data-testid={dataTestId}
      background={background}
      variant={variant}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </ChakraButton>
  );
};
