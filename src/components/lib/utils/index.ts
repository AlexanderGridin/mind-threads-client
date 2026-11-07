export const initTestIdCreator = (prefix: string) => {
  return (suffix: string) => `${prefix}${suffix}`;
};
