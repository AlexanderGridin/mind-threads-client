import { Input as ChakraInput } from "@chakra-ui/react";
import type { ChangeEvent } from "react";

export type InputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "email" | "password" | "number" | "search";
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "outline" | "subtle" | "flushed";
  disabled?: boolean;
  name?: string;
  id?: string;
  "data-testid"?: string;
};

export const Input = ({ onChange, ...restProps }: InputProps) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <ChakraInput
      onChange={handleChange}
      _hover={{ borderColor: "accent" }}
      _focus={{ borderColor: "accent", outlineColor: "accent" }}
      {...restProps}
    />
  );
};
