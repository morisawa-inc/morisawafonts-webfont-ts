import type { Client, ClientOptions } from "./client";

export declare namespace Pager {
  /**
   * Input parameters for pagination requests.
   */
  export type Input = {
    limit?: number;
    cursor?: string;
  };
  /**
   * Metadata returned with paginated responses.
   */
  export type Metadata =
    | {
        has_next: true;
        next_cursor: string;
      }
    | {
        has_next: false;
      };
  /**
   * Individual item with its associated metadata.
   */
  export type Item<T, M extends Metadata = Metadata> = {
    value: T;
    meta: M;
  };
  /**
   * A page of results from the API.
   */
  export type Page<T, M extends Metadata = Metadata> = {
    result: T[];
    meta: M;
  };
}

/**
 * Handles pagination for API responses with cursor-based navigation.
 */
export class Pager<
  Page extends Pager.Page<T, M>,
  R = Page["result"],
  T = R extends Array<infer V> ? V : never,
  M extends Pager.Metadata = Page["meta"],
> implements AsyncIterable<Pager.Item<T, M>>
{
  readonly #client: Client;
  readonly #path: string;
  readonly #pagerInput: Pager.Input;
  readonly #requestOptions: ClientOptions | undefined;

  #nextPage: boolean;

  constructor(
    client: Client,
    path: string,
    pagerInput: Readonly<Pager.Input> = {},
    requestOptions?: Readonly<ClientOptions>,
  ) {
    this.#client = client;
    this.#path = path;
    this.#pagerInput = pagerInput;
    this.#requestOptions = requestOptions;
    this.#nextPage = true;
  }

  /**
   * Checks if there are more pages available.
   */
  hasNextPage(): boolean {
    return this.#nextPage;
  }

  /**
   * Fetches the next page of results.
   */
  async getNextPage(): Promise<Pager.Page<T, M>> {
    if (!this.#nextPage) {
      throw new Error("No more pages available.");
    }

    const page = await this.#client.get<Pager.Page<T, M>>(
      this.#path,
      this.#pagerInput,
      this.#requestOptions,
    );

    this.#nextPage = page.meta.has_next;
    if (page.meta.has_next) {
      this.#pagerInput.cursor = page.meta.next_cursor;
    }

    return page;
  }

  /**
   * Implements async iteration over all pages.
   */
  async *[Symbol.asyncIterator](): AsyncGenerator<Pager.Item<T, M>> {
    while (this.#nextPage) {
      const page = await this.getNextPage();
      for (const value of page.result) {
        yield { value, meta: page.meta };
      }
    }
  }
}
