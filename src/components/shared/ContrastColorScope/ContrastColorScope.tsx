import type { ReactNode } from "react";
import { DarkMode, LightMode } from "@/components/lib";
import { getContrastColorMode } from "@/utils";

type ContrastColorScopeProps = {
  backgroundColor?: string;
  children: ReactNode;
};

export const ContrastColorScope = ({
  backgroundColor,
  children,
}: ContrastColorScopeProps) => {
  if (!backgroundColor) {
    return children;
  }

  const colorMode = getContrastColorMode(backgroundColor);

  return colorMode === "light" ? (
    <LightMode>{children}</LightMode>
  ) : (
    <DarkMode>{children}</DarkMode>
  );
};
