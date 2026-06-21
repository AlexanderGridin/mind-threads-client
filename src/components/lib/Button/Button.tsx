import { Button as ChakraButton } from "@chakra-ui/react";
import type { ReactNode } from "react";

export type ButtonProps = {
  children: ReactNode;
  onClick: () => void;
};

export const Button = ({ children, onClick }: ButtonProps) => {
  return <ChakraButton onClick={onClick}>{children}</ChakraButton>;
};
