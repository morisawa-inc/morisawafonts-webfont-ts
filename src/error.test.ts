import { HTTPError } from "ky";
import { describe, expect, it } from "vitest";
import { APIError } from "./error";

function createHTTPError() {
  // @ts-expect-error
  return new HTTPError(
    new Response(undefined, {
      status: 404,
      statusText: "Not Found",
    }),
    new Request("http://example.com/"),
  );
}

describe("APIError", () => {
  it("text: empty", () => {
    const cause = createHTTPError();
    const error = new APIError(cause, "");

    expect(error.message).toBe(
      "Request failed with status code 404 Not Found: GET http://example.com/",
    );
    expect(error.cause).toBe(cause);
    expect(error.name).toBe("APIError");
    expect(error.status).toBe(404);
  });

  it("text: string", () => {
    const cause = createHTTPError();
    const error = new APIError(cause, "this is a test");

    expect(error.message).toBe(
      "Request failed with status code 404 Not Found: GET http://example.com/: this is a test",
    );
    expect(error.cause).toBe(cause);
    expect(error.name).toBe("APIError");
    expect(error.status).toBe(404);
  });

  it("text: json", () => {
    const cause = createHTTPError();
    const error = new APIError(cause, '{"message": "this is a test"}');

    expect(error.message).toBe(
      "Request failed with status code 404 Not Found: GET http://example.com/: this is a test",
    );
    expect(error.cause).toBe(cause);
    expect(error.name).toBe("APIError");
    expect(error.status).toBe(404);
  });
});
