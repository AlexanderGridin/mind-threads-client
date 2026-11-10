export const MALFORMED_JSON = "not-json";

export const dispatchStorageChange = (key: string) => {
  window.dispatchEvent(new StorageEvent("storage", { key }));
};
