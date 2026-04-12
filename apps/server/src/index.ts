import { createContext } from "@erp_virujhealth/api/context";
import { appRouter } from "@erp_virujhealth/api/routers/index";
import { auth } from "@erp_virujhealth/auth";
import { env } from "@erp_virujhealth/env/server";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

const app = new Hono();

app.onError((err, c) => {
  console.error("Hono error:", err);
  return c.json(
    {
      error: "Internal Server Error",
      message: err.message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    },
    500
  );
});

app.use(logger());
app.use(
  "/*",
  cors({
    origin: env.CORS_ORIGIN,
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "Cookie"],
    credentials: true,
  })
);

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

export const apiHandler = new OpenAPIHandler(appRouter, {
  plugins: [
    new OpenAPIReferencePlugin({
      schemaConverters: [new ZodToJsonSchemaConverter()],
    }),
  ],
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
});

export const rpcHandler = new RPCHandler(appRouter, {
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
});

app.use("/*", async (c, next) => {
  const context = await createContext({ context: c });

  const rpcResult = await rpcHandler.handle(c.req.raw, {
    prefix: "/rpc",
    context: context,
  });

  if (rpcResult.matched) {
    return rpcResult.response;
  }

  const apiResult = await apiHandler.handle(c.req.raw, {
    prefix: "/api-reference",
    context: context,
  });

  if (apiResult.matched) {
    return apiResult.response;
  }

  await next();
});

app.get("/test-panel", (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ERP Test Panel</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            body { font-family: 'Inter', sans-serif; background-color: #0f172a; color: #f8fafc; }
            .glass { background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.1); }
        </style>
    </head>
    <body class="min-h-screen p-8">
        <div class="max-w-4xl mx-auto space-y-8">
            <header class="text-center">
                <h1 class="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400 mb-2">ERP Test Panel</h1>
                <p class="text-slate-400">Explore routing and data manipulation with oRPC & Drizzle</p>
            </header>

            <div class="grid md:grid-cols-2 gap-8">
                <!-- Ping Section -->
                <section class="glass p-6 rounded-2xl shadow-xl">
                    <h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
                        <span class="w-2 h-2 rounded-full bg-blue-500"></span>
                        Server Status (Ping)
                    </h2>
                    <button onclick="pingServer()" class="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 transition-colors rounded-xl font-medium shadow-lg shadow-blue-900/20">
                        Send Ping
                    </button>
                    <div id="ping-result" class="mt-4 p-3 bg-slate-900/50 rounded-lg text-xs font-mono text-blue-300 hidden whitespace-pre-wrap"></div>
                </section>

                <!-- Counter Section -->
                <section class="glass p-6 rounded-2xl shadow-xl">
                    <h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
                        <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                        State Manipulation (Counter)
                    </h2>
                    <div class="space-y-4">
                        <div class="flex gap-2">
                            <input id="counter-name" type="text" placeholder="Counter Name" value="test-counter" 
                                class="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all">
                            <button onclick="getCounter()" class="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-xl transition-all">Load</button>
                        </div>
                        <div id="counter-display" class="bg-slate-900/80 p-6 rounded-xl text-center">
                            <div class="text-sm text-slate-400 uppercase tracking-wider mb-1">Current Value</div>
                            <div id="counter-value" class="text-4xl font-bold text-emerald-400">?</div>
                        </div>
                        <div class="grid grid-cols-2 gap-2">
                            <button onclick="incrementCounter()" class="py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold transition-all">+ Increment</button>
                            <button onclick="resetCounter()" class="py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold transition-all">Reset</button>
                        </div>
                    </div>
                </section>
            </div>

            <section class="glass p-6 rounded-2xl shadow-xl">
                <h2 class="text-xl font-semibold mb-4">Raw Response Log</h2>
                <div id="log" class="bg-black/40 p-4 rounded-xl h-48 overflow-y-auto text-xs font-mono text-slate-300 space-y-1">
                    <div class="text-slate-500 italic">Logs will appear here...</div>
                </div>
            </section>
        </div>

        <script>
            function logResponse(action, data) {
                const log = document.getElementById('log');
                const entry = document.createElement('div');
                entry.className = 'border-l-2 border-slate-700 pl-3 py-1 mb-2';
                entry.innerHTML = \`<span class="text-emerald-500">[\${new Date().toLocaleTimeString()}]</span> <span class="text-blue-400 italic">\${action}:</span> <br/> \${JSON.stringify(data, null, 2)}\`;
                log.prepend(entry);
            }

            async function rpcCall(path, input = {}) {
                try {
                    const response = await fetch('/rpc/' + path, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(input)
                    });
                    const data = await response.json();
                    logResponse(path, data);
                    return data;
                } catch (err) {
                    console.error(err);
                    logResponse('ERROR (' + path + ')', err.message);
                }
            }

            async function pingServer() {
                const res = await rpcCall('test.ping');
                const box = document.getElementById('ping-result');
                box.classList.remove('hidden');
                box.innerText = JSON.stringify(res, null, 2);
            }

            async function getCounter() {
                const name = document.getElementById('counter-name').value;
                const res = await rpcCall('test.getCounter', { name });
                if (res) document.getElementById('counter-value').innerText = res.value;
            }

            async function incrementCounter() {
                const name = document.getElementById('counter-name').value;
                const res = await rpcCall('test.incrementCounter', { name, amount: 1 });
                if (res) document.getElementById('counter-value').innerText = res.value;
            }

            async function resetCounter() {
                const name = document.getElementById('counter-name').value;
                const res = await rpcCall('test.resetCounter', { name });
                if (res) document.getElementById('counter-value').innerText = res.value;
            }

            // Initial load
            getCounter();
        </script>
    </body>
    </html>
  `);
});

app.get("/", (c) => {
  return c.text("OK");
});

const port = process.env.PORT || 3002;
console.log(`ERP Server starting on port ${port}`);

export default {
  port,
  fetch: app.fetch,
};
