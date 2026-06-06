import dotenv from "dotenv";
dotenv.config();

import http from "http";
import app from "./app.js";
import { logger } from "./lib/logger.js";
import { connectDB } from "./lib/db.js";

const rawPort = process.env["PORT"];
if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

async function start() {
  await connectDB();

  const server = http.createServer(app);

  server.listen(port, () => {
    logger.info({ port }, "Server listening");
  });

  server.on("error", (err) => {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  });
}

start().catch((err) => {
  logger.error({ err }, "Failed to start server");
  process.exit(1);
});
