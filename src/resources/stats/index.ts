import type { Client } from "../../client";
import { Resource } from "../../resource";
import { PV } from "./pv/index";

export declare namespace Stats {
  export type { PV };
}

/**
 * Provides access to statistics.
 */
export class Stats extends Resource {
  readonly pv: PV;

  constructor(client: Client) {
    super(client);
    this.pv = new PV(client);
  }
}
