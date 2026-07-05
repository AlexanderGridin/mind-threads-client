import { joinUrl, readResponseBody } from "./useFetch.utils";
import { HttpError } from "./useFetch.errors";
import type {
  HttpMethod,
  RequestOverrides,
  UseFetchParams,
  UseFetchReturn,
} from "./useFetch.types";

export const useFetch = ({
  baseUrl,
  defaultHeaders,
}: UseFetchParams): UseFetchReturn => {
  const request = async <ResponseType>(
    method: HttpMethod,
    route: string,
    body?: unknown,
    overrides?: RequestOverrides
  ): Promise<ResponseType> => {
    const url = joinUrl(baseUrl, route);

    const headers = {
      "Content-Type": "application/json",
      ...defaultHeaders,
      ...overrides?.headers,
    };

    const response = await fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    const parsedBody = await readResponseBody<ResponseType>(response);

    if (!response.ok) {
      throw new HttpError({ status: response.status, body: parsedBody });
    }

    return parsedBody as ResponseType;
  };

  return {
    get: (route, overrides) => request("GET", route, undefined, overrides),
    post: (route, body, overrides) => request("POST", route, body, overrides),
    put: (route, body, overrides) => request("PUT", route, body, overrides),
    patch: (route, body, overrides) => request("PATCH", route, body, overrides),
    delete: (route, overrides) =>
      request("DELETE", route, undefined, overrides),
  };
};
