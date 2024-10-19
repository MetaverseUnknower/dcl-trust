// index.ts
import * as dotenv from "dotenv";
import http from "http";
import { join } from "path";

// Load environment variables from the root .env file
dotenv.config({ path: join(__dirname, "../.env") });

import app from "./app";
import { WebSocketService } from "./services/Websocket.service";

const port = process.env.PORT || 34567;

const server = http.createServer(app);

WebSocketService.initialize(server);

console.log("WebSocket service initialized");

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

export default app;
