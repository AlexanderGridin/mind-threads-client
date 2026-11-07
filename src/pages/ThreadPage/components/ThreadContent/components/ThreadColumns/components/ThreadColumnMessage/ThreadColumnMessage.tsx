import { Text } from "@/components/lib";

type ThreadColumnMessageProps = {
  message: string;
};

export const ThreadColumnMessage = ({ message }: ThreadColumnMessageProps) => {
  return <Text color="fg.muted">{message}</Text>;
};
