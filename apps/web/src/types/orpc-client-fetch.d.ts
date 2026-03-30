declare module "@orpc/client/fetch" {
  import type { ClientContext, ClientLink } from "@orpc/client";

  export interface RPCLinkOptions {
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
    constructor(options: RPCLinkOptions);
    call(
      path: readonly string[],
      input: unknown,
      options: unknown
    ): Promise<unknown>;
  }
}
