import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { type AppRouterClient } from "@erp_virujhealth/api";
import { createORPCReactQueryUtils } from "@orpc/react-query";

const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3002";
const rpcUrl = serverUrl.endsWith("/rpc")
  ? serverUrl
  : `${serverUrl.replace(/\/$/, "")}/rpc`;

export const client = createORPCClient<AppRouterClient>(
  new RPCLink({
    url: rpcUrl,
    fetch: (request, init) =>
      fetch(request, {
        ...init,
        credentials: "include",
      }),
  })
);

export const orpc = createORPCReactQueryUtils(client);
