import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { Client } from "./client";
import { Pager } from "./pager";

const server = setupServer(
  http.get("https://api.morisawafonts.com/webfont/v1/pager", ({ request }) => {
    const url = new URL(request.url);
    switch (url.searchParams.get("cursor")) {
      case null:
        return HttpResponse.json<Pager.Page<number>>({
          result: [1, 2, 3],
          meta: {
            has_next: true,
            next_cursor: "cursor1",
          },
        });
      case "cursor1":
        return HttpResponse.json<Pager.Page<number>>({
          result: [4, 5, 6],
          meta: {
            has_next: true,
            next_cursor: "cursor2",
          },
        });
      case "cursor2":
        return HttpResponse.json<Pager.Page<number>>({
          result: [7, 8, 9],
          meta: {
            has_next: false,
          },
        });
    }
    return new HttpResponse(undefined, { status: 400 });
  }),
  http.get("https://api.morisawafonts.com/webfont/v1/empty", () => {
    return HttpResponse.json<Pager.Page<number>>({
      result: [],
      meta: {
        has_next: false,
      },
    });
  }),
);

beforeAll(() => {
  server.listen();
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

function createClient() {
  return new Client({
    apiToken: "test-token",
  });
}

describe("Pager", () => {
  it("paging", async () => {
    const pager = new Pager<Pager.Page<number>>(createClient(), "/pager");

    expect(pager.hasNextPage()).toBe(true);

    // Page 1
    await expect(pager.getNextPage()).resolves.toEqual({
      result: [1, 2, 3],
      meta: {
        has_next: true,
        next_cursor: "cursor1",
      },
    });
    expect(pager.hasNextPage()).toBe(true);

    // Page 2
    await expect(pager.getNextPage()).resolves.toEqual({
      result: [4, 5, 6],
      meta: {
        has_next: true,
        next_cursor: "cursor2",
      },
    });
    expect(pager.hasNextPage()).toBe(true);

    // Page 3
    await expect(pager.getNextPage()).resolves.toEqual({
      result: [7, 8, 9],
      meta: {
        has_next: false,
      },
    });
    expect(pager.hasNextPage()).toBe(false);

    // Page overflow
    await expect(pager.getNextPage()).rejects.toThrowError("No more pages available.");
  });

  it("paging: empty", async () => {
    const pager = new Pager<Pager.Page<number>>(createClient(), "/empty");

    expect(pager.hasNextPage()).toBe(true);

    // Page 1
    await expect(pager.getNextPage()).resolves.toEqual({
      result: [],
      meta: {
        has_next: false,
      },
    });
    expect(pager.hasNextPage()).toBe(false);

    // Page overflow
    await expect(pager.getNextPage()).rejects.toThrowError("No more pages available.");
  });

  it("for-of", async () => {
    const pager = new Pager<Pager.Page<number>>(createClient(), "/pager");

    expect(pager.hasNextPage()).toBe(true);

    let i = 0;
    for await (const item of pager) {
      ++i;
      expect(item).toEqual({
        value: i,
        meta: {
          has_next: i <= 6,
          next_cursor: i <= 6 ? `cursor${Math.ceil(i / 3)}` : undefined,
        },
      });
    }

    expect(pager.hasNextPage()).toBe(false);
  });

  it("for-of: empty", async () => {
    const pager = new Pager<Pager.Page<number>>(createClient(), "/empty");

    expect(pager.hasNextPage()).toBe(true);

    for await (const _ of pager) {
      expect.unreachable();
    }

    expect(pager.hasNextPage()).toBe(false);
  });
});
