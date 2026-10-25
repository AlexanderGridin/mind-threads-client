import { forwardRef } from "react";
import { Button as ChakraButton } from "@chakra-ui/react";
import type { ReactNode } from "react";

export type ButtonProps = {
  children: ReactNode;
  onClick: () => void;
  "data-testid"?: string;
  background?: string;
  disabled?: boolean;
  loading?: boolean;
  variant?:
    | "solid"
    | "subtle"
    | "surface"
    | "outline"
    | "ghost"
    | "plain"
    | undefined;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      "data-testid": dataTestId,
      variant = "solid",
      children,
      background,
      disabled = false,
      loading = false,
      onClick,
    },
    ref
  ) => {
    return (
      <ChakraButton
        ref={ref}
        data-testid={dataTestId}
        background={background}
        variant={variant}
        disabled={disabled}
        loading={loading}
        onClick={onClick}
      >
        {children}
      </ChakraButton>
    );
  }
);

Button.displayName = "Button";
