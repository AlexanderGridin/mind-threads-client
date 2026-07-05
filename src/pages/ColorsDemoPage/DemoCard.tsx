import type { ReactNode } from "react";
import { Card, Text } from "@chakra-ui/react";

type DemoCardProps = {
  title: string;
  children: ReactNode;
};

export const DemoCard = ({ title, children }: DemoCardProps) => (
  <Card.Root bg="bg.subtle" borderColor="border.subtle" borderWidth="1px">
    <Card.Body gap="4">
      <Text fontSize="md" fontWeight="bold" color="fg">
        {title}
      </Text>
      {children}
    </Card.Body>
  </Card.Root>
);
