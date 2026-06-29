export const checkContext = <ContextValueType>(
  ctx: ContextValueType | null,
  ctxName: string,
  hookName: string
): ContextValueType => {
  if (ctx) return ctx;

  throw new Error(
    `[${ctxName}] is not found! ${hookName} must be used within a ${ctxName} provider.`
  );
};
