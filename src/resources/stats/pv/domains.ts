import type { ClientOptions } from "../../../client";
import type { Pager } from "../../../pager";
import { Resource } from "../../../resource";

export declare namespace Domains {
  export type ListInput = Pager.Input & {
    from?: string;
    to?: string;
    domain?: string;
  };
  export type ListResult = Pager.Page<{ domain: string; value: number }> & {
    meta: {
      project_id: string;
      from: string;
      to: string;
    };
  };
}

/**
 * Retrieves page view statistics by domain.
 */
export class Domains extends Resource {
  /**
   * Retrieves a paginated list of page view statistics for each domain.
   * @example
   * ```ts
   * for await (const item of client.stats.pv.domains.list({ from: "2025-08", to: "2025-09" })) {
   *   console.log(item.value);
   * }
   * ```
   */
  list(
    input?: Readonly<Domains.ListInput>,
    options?: Readonly<ClientOptions>,
  ): Pager<Domains.ListResult> {
    return this.client.getList(`/stats/pv/domains`, input, options);
  }
}
