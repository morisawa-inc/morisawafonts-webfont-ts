import type { Client } from "./client";

export abstract class Resource {
  readonly #client: Client;

  constructor(client: Client) {
    this.#client = client;
  }

  protected get client(): Client {
    return this.#client;
  }
}
