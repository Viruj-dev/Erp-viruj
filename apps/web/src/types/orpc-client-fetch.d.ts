declare module "@orpc/client/fetch" {
  import type { ClientContext, ClientLink } from "@orpc/client";

  export interface RPCLinkOptions<T extends ClientContext> {
    baseUrl: string;
    fetch?: (
      request: Request,
      init: RequestInit | undefined,
      options: unknown,
      path: readonly string[],
      input: unknown
    ) => Promise<Response>;
  }

  export class RPCLink<T extends ClientContext> implements ClientLink<T> {
    constructor(options: RPCLinkOptions<T>);
    call(
      path: readonly string[],
      input: unknown,
      options: unknown
    ): Promise<unknown>;
  }
}
