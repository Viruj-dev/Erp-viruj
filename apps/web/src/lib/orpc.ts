import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { type AppRouter } from "@erp_virujhealth/api";
import { createORPCReactQueryUtils } from "@orpc/react-query";

export const client = createORPCClient<AppRouter>(new RPCLink({
  baseUrl: process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000/rpc",
}));

export const orpc = createORPCReactQueryUtils(client);
