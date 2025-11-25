import type { HTTPError } from "ky";

/**
 * API error.
 */
export class APIError extends Error {
  /**
   * HTTP status code.
   */
  readonly status: number;

  constructor(cause: HTTPError, text: string) {
    let message = cause.message;
    if (text) {
      try {
        const json = JSON.parse(text);
        if (json.message) {
          message = `${message}: ${json.message}`;
        } else {
          message = `${message}: ${text}`;
        }
      } catch {
        message = `${message}: ${text}`;
      }
    }

    super(message, { cause });

    this.status = cause.response.status;
    this.name = "APIError";
  }
}
