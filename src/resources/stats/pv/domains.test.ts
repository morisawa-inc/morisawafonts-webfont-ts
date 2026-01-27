import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { Client } from "../../../client";
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
        "https://api.morisawafonts.com/webfont/v1/stats/pv/domains",
        ({ request }) => {
          const url = new URL(request.url);
          expect(url.searchParams.get("from")).toBe("2025-08");
          expect(url.searchParams.get("to")).toBe("2025-09");
          switch (url.searchParams.get("cursor")) {
            case null:
              return HttpResponse.json<Domains.ListResult>({
                result: [
                  { domain: "1.example.com", value: 100 },
                  { domain: "2.example.com", value: 200 },
                ],
                meta: {
                  has_next: true,
                  next_cursor: "cursor1",
                  project_id: "project",
                  from: "2025-08",
                  to: "2025-09",
                },
              });
            case "cursor1":
              return HttpResponse.json<Domains.ListResult>({
                result: [
                  { domain: "3.example.com", value: 300 },
                  { domain: "4.example.com", value: 400 },
                ],
                meta: {
                  has_next: false,
                  project_id: "project",
                  from: "2025-08",
                  to: "2025-09",
                },
              });
          }
          expect.unreachable();
        },
      ),
    );

    const domains = new Domains(createClient());
    const list = domains.list({ from: "2025-08", to: "2025-09" });

    let i = 0;
    for await (const item of list) {
      ++i;
      expect(item).toEqual({
        value: {
          domain: `${i}.example.com`,
          value: i * 100,
        },
        meta: {
          has_next: i <= 2,
          next_cursor: i <= 2 ? `cursor${Math.ceil(i / 2)}` : undefined,
          project_id: "project",
          from: "2025-08",
          to: "2025-09",
        },
      });
    }
  });
});
