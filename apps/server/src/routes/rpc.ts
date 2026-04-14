import { createContext } from "@erp_virujhealth/api/context";
import type { Hono } from "hono";

import { apiHandler, rpcHandler } from "../handlers/orpc";

export function registerRpcRoutes(app: Hono) {
  app.use("/*", async (context, next) => {
    const requestContext = await createContext({ context });

    const rpcResult = await rpcHandler.handle(context.req.raw, {
      prefix: "/rpc",
      context: requestContext,
    });

    if (rpcResult.matched) {
      return rpcResult.response;
    }

    const apiResult = await apiHandler.handle(context.req.raw, {
      prefix: "/api-reference",
      context: requestContext,
    });

    if (apiResult.matched) {
      return apiResult.response;
    }

    await next();
  });
}
