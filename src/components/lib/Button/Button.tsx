import { forwardRef } from "react";
import { Button as ChakraButton } from "@chakra-ui/react";
import type { ReactNode } from "react";

export type ButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  "data-testid"?: string;
  background?: string;
  disabled?: boolean;
  loading?: boolean;
  size?: "xs" | "sm" | "md";
  type?: "button" | "submit";
  form?: string;
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
  (props, ref) => {
    const {
      "data-testid": dataTestId,
      variant = "solid",
      children,
      background,
      disabled = false,
      loading = false,
      size,
      type = "button",
      form,
      onClick,
    } = props;

    return (
      <ChakraButton
        ref={ref}
        data-testid={dataTestId}
        background={background}
        variant={variant}
        size={size}
        type={type}
        form={form}
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
