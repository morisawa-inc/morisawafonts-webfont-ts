import { TimeoutError } from "ky";
import { delay, HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { Client } from "./client";

const server = setupServer();

beforeAll(() => {
  server.listen();
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

describe("Client", () => {
  it("get", async () => {
    server.use(
      http.get("https://api.morisawafonts.com/webfont/v1/get", ({ request }) => {
        expect(new URL(request.url).searchParams.get("param")).toBe("42");
        expect(request.headers.get("Authorization")).toBe("Bearer test-token");

        return HttpResponse.json({ data: "some data" });
      }),
    );

    const client = new Client({
      apiToken: "test-token",
    });
    await expect(client.get("/get", { param: 42 })).resolves.toEqual({
      data: "some data",
    });
  });

  it("post", async () => {
    server.use(
      http.post("https://api.morisawafonts.com/webfont/v1/post", async ({ request }) => {
        await expect(request.clone().json()).resolves.toEqual({ param: 42 });
        expect(request.headers.get("Authorization")).toBe("Bearer test-token");

        return HttpResponse.json({ data: "some data" });
      }),
    );

    const client = new Client({
      apiToken: "test-token",
    });
    await expect(client.post("/post", { param: 42 })).resolves.toEqual({
      data: "some data",
    });
  });

  it("delete", async () => {
    server.use(
      http.delete("https://api.morisawafonts.com/webfont/v1/delete", async ({ request }) => {
        expect(request.headers.get("Authorization")).toBe("Bearer test-token");

        return new HttpResponse(undefined, {
          status: 204,
        });
      }),
    );

    const client = new Client({
      apiToken: "test-token",
    });
    await expect(client.delete("/delete")).resolves.toBeUndefined();
  });

  it("error: no token", async () => {
    const client = new Client();
    await expect(client.get("/get")).rejects.toThrowError("You must provide an API token.");
  });

  it("error: api", async () => {
    server.use(
      http.get("https://api.morisawafonts.com/webfont/v1/get", () => {
        return HttpResponse.json({ message: "error message" }, { status: 400 });
      }),
    );

    const client = new Client({
      apiToken: "test-token",
    });
    await expect(client.get("/get")).rejects.toThrowError(
      expect.objectContaining({
        name: "APIError",
        message:
          "Request failed with status code 400 Bad Request: GET https://api.morisawafonts.com/webfont/v1/get: error message",
        status: 400,
      }),
    );
  });

  it("error: network", async () => {
    server.use(
      http.get("https://api.morisawafonts.com/webfont/v1/get", () => {
        return HttpResponse.error();
      }),
    );

    const client = new Client({
      apiToken: "test-token",
    });
    await expect(client.get("/get")).rejects.toThrowError(
      expect.objectContaining({
        name: "TypeError",
        message: "Failed to fetch",
      }),
    );
  });

  it("error: timeout", async () => {
    server.use(
      http.get("https://api.morisawafonts.com/webfont/v1/get", async () => {
        await delay("infinite");
      }),
    );

    const client = new Client({
      apiToken: "test-token",
      timeout: 500,
    });
    await expect(client.get("/get")).rejects.toThrowError(TimeoutError);
  });

  it("retry", async () => {
    let retry = 0;
    server.use(
      http.get("https://api.morisawafonts.com/webfont/v1/get", async () => {
        if (++retry < 3) {
          return new HttpResponse(undefined, {
            status: 429,
          });
        } else {
          return HttpResponse.json({ data: "some data" });
        }
      }),
    );

    const client = new Client({
      apiToken: "test-token",
    });
    await expect(client.get("/get")).resolves.toEqual({
      data: "some data",
    });

    expect(retry).toBe(3);
  });
});
