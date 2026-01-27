import type { Client, ClientOptions } from "../../../client";
import { Resource } from "../../../resource";
import { Domains } from "./domains";

export declare namespace PV {
  export type GetInput = {
    from?: string;
    to?: string;
  };
  export type GetResult = {
    pv: {
      total: number;
    };
    meta: {
      project_id: string;
      from: string;
      to: string;
    };
  };

  export type { Domains };
}

/**
 * Retrieves page view statistics.
 */
export class PV extends Resource {
  readonly domains: Domains;

  constructor(client: Client) {
    super(client);
    this.domains = new Domains(client);
  }

  /**
   * Retrieves page view statistics for the project.
   * @example
   * ```ts
   * const result = await client.stats.pv.get({ from: "2025-08", to: "2025-09" });
   * console.log(result.pv.total);
   * ```
   */
  get(
    input?: Readonly<PV.GetInput>,
    options?: Readonly<ClientOptions>,
  ): Promise<PV.GetResult> {
    return this.client.get(`/stats/pv`, input, options);
  }
}
