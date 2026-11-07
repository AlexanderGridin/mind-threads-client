type FormatCountParams = {
  count: number;
  singular: string;
  plural: string;
};

export const formatCount = ({ count, singular, plural }: FormatCountParams) => {
  const noun = count === 1 ? singular : plural;
  return `${count} ${noun}`;
};
