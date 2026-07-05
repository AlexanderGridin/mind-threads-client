export type LocalStorageUpdater<ValueType> = (
  prevValue: ValueType | null
) => ValueType;

export type UseLocalStorageReturn<ValueType> = {
  read: () => ValueType | null;
  set: (newValue: ValueType) => void;
  update: (updater: LocalStorageUpdater<ValueType>) => void;
};
