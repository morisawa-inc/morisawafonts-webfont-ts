import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { Client } from "../client";
import { Domains } from "./domains";

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

function createClient() {
  return new Client({
    apiToken: "test-token",
  });
}

describe("Domains", () => {
  it("list", async () => {
    server.use(
      http.get(
        "https://api.morisawafonts.com/webfont/v1/domains",
        ({ request }) => {
          const url = new URL(request.url);
          switch (url.searchParams.get("cursor")) {
            case null:
              return HttpResponse.json<Domains.ListResult>({
                result: ["1.example.com", "2.example.com"],
                meta: {
                  has_next: true,
                  next_cursor: "cursor1",
                  project_id: "project",
                },
              });
            case "cursor1":
              return HttpResponse.json<Domains.ListResult>({
                result: ["3.example.com", "4.example.com"],
                meta: {
                  has_next: true,
                  next_cursor: "cursor2",
                  project_id: "project",
                },
              });
            case "cursor2":
              return HttpResponse.json<Domains.ListResult>({
                result: ["5.example.com", "6.example.com"],
                meta: {
                  has_next: false,
                  project_id: "project",
                },
              });
          }
          expect.unreachable();
        },
      ),
    );

    const domains = new Domains(createClient());
    const list = domains.list();

    let i = 0;
    for await (const item of list) {
      ++i;
      expect(item).toEqual({
        value: `${i}.example.com`,
        meta: {
          has_next: i <= 4,
          next_cursor: i <= 4 ? `cursor${Math.ceil(i / 2)}` : undefined,
          project_id: "project",
        },
      });
    }
  });

  it("add", async () => {
    server.use(
      http.post(
        "https://api.morisawafonts.com/webfont/v1/domains",
        async ({ request }) => {
          await expect(request.clone().json()).resolves.toEqual({
            domains: ["example.com", "example.net"],
          });
          return HttpResponse.json({
            domains: ["example.com", "example.net"],
          });
        },
      ),
    );

    const domains = new Domains(createClient());
    await expect(domains.add(["example.com", "example.net"])).resolves.toEqual({
      domains: ["example.com", "example.net"],
    });
  });

  it("delete", async () => {
    server.use(
      http.delete(
        "https://api.morisawafonts.com/webfont/v1/domains",
        async ({ request }) => {
          await expect(request.clone().json()).resolves.toEqual({
            domains: ["example.com", "example.net"],
          });
          return new HttpResponse(undefined, { status: 204 });
        },
      ),
    );

    const domains = new Domains(createClient());
    await expect(
      domains.delete(["example.com", "example.net"]),
    ).resolves.toBeUndefined();
  });
});
