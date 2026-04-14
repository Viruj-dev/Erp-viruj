import { createApp } from "./app/create-app";

const port = process.env.PORT || 3002;
const app = createApp();

console.log(`ERP Server starting on port ${port}`);

export default {
  port,
  fetch: app.fetch,
};
