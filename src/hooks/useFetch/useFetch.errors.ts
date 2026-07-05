import type { HttpErrorPayload } from "./useFetch.types";

export class HttpError extends Error {
  status: number;
  body: unknown;

  constructor({ status, body }: HttpErrorPayload) {
    super(`Request failed with status ${status}`);

    this.name = "HttpError";
    this.status = status;
    this.body = body;
  }
}
