import type { ClientOptions } from "../../client";
import type { Pager } from "../../pager";
import { Resource } from "../../resource";

export declare namespace Domains {
  export type ListInput = Pager.Input;
  export type ListResult = Pager.Page<string> & {
    meta: {
      project_id: string;
    };
  };

  export type AddResult = {
    domains: string[];
  };
}

/**
 * Manages domains.
 */
export class Domains extends Resource {
  /**
   * Retrieves a paginated list of domains registered to the project.
   * @example
   * ```ts
   * for await (const domain of client.domains.list()) {
   *   console.log(domain.value);
   * }
   * ```
   */
  list(
    input?: Readonly<Domains.ListInput>,
    options?: Readonly<ClientOptions>,
  ): Pager<Domains.ListResult> {
    return this.client.getList(`/domains`, input, options);
  }

  /**
   * Adds domains to the project.
   * @param domains - Array of domain names to add.
   * @example
   * ```ts
   * await client.domains.add(['example.com', 'example.org']);
   * ```
   */
  add(domains: readonly string[], options?: Readonly<ClientOptions>): Promise<Domains.AddResult> {
    return this.client.post(`/domains`, { domains }, options);
  }

  /**
   * Removes domains from the project.
   * @param domains - Array of domain names to remove.
   * @example
   * ```ts
   * await client.domains.delete(['example.com', 'example.org']);
   * ```
   */
  delete(domains: readonly string[], options?: Readonly<ClientOptions>): Promise<void> {
    return this.client.delete(`/domains`, { domains }, options);
  }
}
