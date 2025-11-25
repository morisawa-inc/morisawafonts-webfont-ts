import ky, { HTTPError, type KyResponse, type RetryOptions } from "ky";
import { version } from "../package.json";
import { APIError } from "./error";
import { Pager } from "./pager";

/**
 * URL search parameters for API requests.
 */
export type SearchParams = Record<string, string | number | boolean>;

/**
 * Configuration options for the API client.
 */
export type ClientOptions = {
  /**
   * API token for authentication.
   */
  apiToken?: string;
  /**
   * Base URL for the API endpoint.
   * @defaultValue "https://api.morisawafonts.com/webfont/v1"
   */
  baseURL?: string;

  /**
   * Request timeout in milliseconds, or false to disable timeout.
   * @defaultValue 30000
   */
  timeout?: number | false;
  /**
   * Number of retry attempts for failed requests.
   * @defaultValue 2
   */
  retry?: number;

  /**
   * Custom fetch implementation.
   */
  fetch?: typeof fetch;
};

type HttpMethod = "GET" | "POST" | "DELETE";

/**
 * HTTP client for making requests.
 */
export class Client {
  readonly #options: ClientOptions;
  readonly #userAgent?: string;

  constructor(options: Readonly<ClientOptions> = {}) {
    this.#options = options;

    // @ts-expect-error
    if (!globalThis.window || !globalThis.navigator?.userAgent) {
      this.#userAgent = `morisawafonts-webfont-ts/${version}`;
    }
  }

  async get<T>(
    path: string,
    searchParams?: Readonly<SearchParams>,
    requestOptions?: Readonly<ClientOptions>,
  ): Promise<T> {
    return (
      await this.#request(path, { method: "GET", searchParams }, requestOptions)
    ).json();
  }

  async post<T>(
    path: string,
    json?: unknown,
    requestOptions?: Readonly<ClientOptions>,
  ): Promise<T> {
    return (
      await this.#request(path, { method: "POST", json }, requestOptions)
    ).json();
  }

  async delete(
    path: string,
    json?: unknown,
    requestOptions?: Readonly<ClientOptions>,
  ): Promise<void> {
    await this.#request(path, { method: "DELETE", json }, requestOptions);
  }

  getList<
    Page extends Pager.Page<T, M>,
    R = Page["result"],
    T = R extends Array<infer V> ? V : never,
    M extends Pager.Metadata = Page["meta"],
  >(
    path: string,
    pagerInput?: Readonly<Pager.Input>,
    requestOptions?: Readonly<ClientOptions>,
  ): Pager<Page, R, T, M> {
    return new Pager(this, path, pagerInput, requestOptions);
  }

  async #request(
    path: string,
    request: {
      method: HttpMethod;
      searchParams?: Readonly<SearchParams> | undefined;
      json?: unknown;
    },
    requestOptions?: Readonly<ClientOptions>,
  ): Promise<KyResponse> {
    if (path.startsWith("/")) {
      path = path.slice(1);
    }

    const options = this.#setupOptions({
      ...this.#options,
      ...requestOptions,
    });

    const headers = new Headers({
      authorization: `Bearer ${options.apiToken}`,
    });
    if (this.#userAgent) {
      headers.set("user-agent", this.#userAgent);
    }

    const retry: RetryOptions = {
      limit: options.retry,
    };

    try {
      return await ky(path, {
        ...request,
        retry,
        headers,
        prefixUrl: options.baseURL,
        timeout: options.timeout,
        fetch: options.fetch,
      });
    } catch (error) {
      if (error instanceof HTTPError) {
        throw new APIError(error, await error.response.text());
      }
      throw error;
    }
  }

  #setupOptions(options: Readonly<ClientOptions>): Required<ClientOptions> {
    if (!options.apiToken) {
      throw new Error("You must provide an API token.");
    }

    return {
      apiToken: options.apiToken,
      baseURL: options.baseURL || "https://api.morisawafonts.com/webfont/v1",
      timeout: options.timeout !== undefined ? options.timeout : 30000,
      retry: options.retry !== undefined ? options.retry : 2,
      fetch: options.fetch || fetch,
    };
  }
}
