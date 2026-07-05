const TRAILING_SLASHES = /\/+$/;
const LEADING_SLASHES = /^\/+/;

export const joinUrl = (baseUrl: string, route: string): string => {
  const trimmedBaseUrl = baseUrl.replace(TRAILING_SLASHES, "");
  const trimmedRoute = route.replace(LEADING_SLASHES, "");

  return `${trimmedBaseUrl}/${trimmedRoute}`;
};

export const readResponseBody = async <ResponseType>(
  response: Response
): Promise<ResponseType | null> => {
  const text = await response.text();

  if (text.length === 0) return null;

  try {
    return JSON.parse(text) as ResponseType;
  } catch {
    return text as unknown as ResponseType;
  }
};
