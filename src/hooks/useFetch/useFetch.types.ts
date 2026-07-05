export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type UseFetchParams = {
  baseUrl: string;
  defaultHeaders?: Record<string, string>;
};

export type RequestOverrides = {
  headers?: Record<string, string>;
};

export type HttpErrorPayload = {
  status: number;
  body: unknown;
};

export type UseFetchReturn = {
  get: <ResponseType>(
    route: string,
    overrides?: RequestOverrides
  ) => Promise<ResponseType>;

  post: <ResponseType>(
    route: string,
    body?: unknown,
    overrides?: RequestOverrides
  ) => Promise<ResponseType>;

  put: <ResponseType>(
    route: string,
    body?: unknown,
    overrides?: RequestOverrides
  ) => Promise<ResponseType>;

  patch: <ResponseType>(
    route: string,
    body?: unknown,
    overrides?: RequestOverrides
  ) => Promise<ResponseType>;

  delete: <ResponseType>(
    route: string,
    overrides?: RequestOverrides
  ) => Promise<ResponseType>;
};
