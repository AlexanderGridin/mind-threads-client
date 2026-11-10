import { useEffect, useRef } from "react";
import { Box, TruncatedText } from "@/components/lib";
import type { ThreadSection } from "@/types";
import { SectionCardTestId } from "./SectionCard.constants";
import { SectionCardActions } from "./components";

type SectionCardProps = {
  section: ThreadSection;
  isLastCreated: boolean;
  onDelete: (section: ThreadSection) => void;
};

export const SectionCard = ({
  section,
  isLastCreated,
  onDelete,
}: SectionCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isLastCreated) {
      cardRef.current?.scrollIntoView({ block: "nearest" });
    }
  }, [isLastCreated]);

  return (
    <Box
      ref={cardRef}
      data-testid={SectionCardTestId.container}
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      gap="2"
      py="2"
      pl="3"
      pr="1"
      minWidth="0"
      borderRadius="md"
      borderWidth="1px"
      borderColor="border"
      borderLeftWidth="4px"
      borderLeftColor={section.color}
      backgroundColor="bg"
    >
      <TruncatedText data-testid={SectionCardTestId.name} fontWeight="medium">
        {section.name}
      </TruncatedText>

      <SectionCardActions section={section} onDelete={onDelete} />
    </Box>
  );
};
