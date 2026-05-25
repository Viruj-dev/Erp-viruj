import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { type AppRouterClient } from "@erp_virujhealth/api";
import { createORPCReactQueryUtils } from "@orpc/react-query";

export const client = createORPCClient<AppRouterClient>(
  new RPCLink({
    baseUrl: process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000/rpc",
    fetch: (request, init) =>
      fetch(request, {
        ...init,
        credentials: "include",
      }),
  })
);

export const orpc = createORPCReactQueryUtils(client);
