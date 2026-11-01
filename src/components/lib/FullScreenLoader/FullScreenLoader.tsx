import { Center, Spinner } from "@chakra-ui/react";
import { FullScreenLoaderTestId } from "./FullScreenLoader.constants";

export type FullScreenLoaderProps = {
  shown: boolean;
  label: string;
};

export const FullScreenLoader = ({ shown, label }: FullScreenLoaderProps) => {
  if (!shown) {
    return null;
  }

  return (
    <Center
      data-testid={FullScreenLoaderTestId.container}
      role="status"
      aria-label={label}
      position="fixed"
      inset="0"
      zIndex="overlay"
      backgroundColor="bg"
    >
      <Spinner size="xl" color="accent" />
    </Center>
  );
};
