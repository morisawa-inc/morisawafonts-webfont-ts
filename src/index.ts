import { Client, type ClientOptions, type SearchParams } from "./client";
import type { APIError } from "./error";
import type { Pager } from "./pager";
import { Domains } from "./resources/domains";
import { Stats } from "./resources/stats";

export declare namespace MorisawaFontsWebFont {
  export type { Client, ClientOptions, SearchParams };
  export type { APIError };
  export type { Pager };
  export type { Domains };
  export type { Stats };
}

/**
 * Client for the Morisawa Fonts web font API.
 */
export class MorisawaFontsWebFont {
  readonly client: Client;

  readonly domains: Domains;
  readonly stats: Stats;

  /**
   * Creates a new instance of the Morisawa Fonts web font API client.
   * @param options - Configuration options for the API client.
   */
  constructor(options?: Readonly<ClientOptions>) {
    this.client = new Client(options);
    this.domains = new Domains(this.client);
    this.stats = new Stats(this.client);
  }
}

export default MorisawaFontsWebFont;
