import { useRef } from "react";
import type {
  LocalStorageUpdater,
  UseLocalStorageParams,
  UseLocalStorageReturn,
} from "./useLocalStorage.types";

export const useLocalStorage = <ValueType>({
  key,
  throwOnError = false,
}: UseLocalStorageParams): UseLocalStorageReturn<ValueType> => {
  const cacheRef = useRef<ValueType | null>(null);

  const read = (): ValueType | null => {
    if (cacheRef.current !== null) return cacheRef.current;

    try {
      const storedValue = localStorage.getItem(key);

      cacheRef.current =
        storedValue === null ? null : (JSON.parse(storedValue) as ValueType);
    } catch (error) {
      console.error(
        `Failed to read from localStorage for key "${key}":`,
        error
      );
      cacheRef.current = null;

      if (throwOnError) throw error;
    }

    return cacheRef.current;
  };

  const set = (newValue: ValueType): void => {
    try {
      localStorage.setItem(key, JSON.stringify(newValue));
      cacheRef.current = newValue;
    } catch (error) {
      console.error(`Failed to write to localStorage for key "${key}":`, error);

      if (throwOnError) throw error;
    }
  };

  const update = (updater: LocalStorageUpdater<ValueType>): void => {
    set(updater(read()));
  };

  return { read, set, update };
};
