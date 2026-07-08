import { Hono } from "hono";

import { createApp } from "./app/create-app";

const app = createApp(new Hono());

export default app;
