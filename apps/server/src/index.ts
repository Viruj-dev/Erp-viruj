import { Hono } from "hono";

import { createApp } from "./app/create-app";

const app: Hono = createApp();

export default app;
