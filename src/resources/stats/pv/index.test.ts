import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { Client } from "../../../client";
import { PV } from "./index";

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

describe("PV", () => {
  it("get", async () => {
    server.use(
      http.get("https://api.morisawafonts.com/webfont/v1/stats/pv", ({ request }) => {
        const url = new URL(request.url);
        expect(url.searchParams.get("from")).toBe("2025-08");
        expect(url.searchParams.get("to")).toBe("2025-09");
        return HttpResponse.json<PV.GetResult>({
          pv: {
            total: 42,
          },
          meta: {
            project_id: "project",
            from: "2025-08",
            to: "2025-09",
          },
        });
      }),
    );

    const pv = new PV(createClient());
    await expect(pv.get({ from: "2025-08", to: "2025-09" })).resolves.toEqual({
      pv: { total: 42 },
      meta: {
        project_id: "project",
        from: "2025-08",
        to: "2025-09",
      },
    });
  });
});
