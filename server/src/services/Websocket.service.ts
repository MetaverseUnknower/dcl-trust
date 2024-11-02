// ./services/websocket.service.ts

import WebSocket from "ws";
import http from "http";
import { ExtendedWebSocket } from "../types/Websocket.types";

export class WebSocketService {
  private static wss: WebSocket.Server;
  private static pingInterval: NodeJS.Timeout;

  static initialize(server: http.Server) {
    console.log("WebSocket service initialization began");

    this.wss = new WebSocket.Server({
      server,
      verifyClient: (info, callback) => {
        const origin = info.origin || info.req.headers.origin;
        // Add your client's origin(s) here
        const allowedOrigins = [process.env.CLIENT_ORIGIN];
        if (allowedOrigins.includes(origin)) {
          callback(true);
        } else {
          callback(false, 403, "Origin not allowed");
        }
      },
    });

    this.wss.on("connection", (ws: ExtendedWebSocket) => {
      console.log("New WebSocket connection");

      ws.isAlive = true;

      ws.on("pong", () => {
        ws.isAlive = true;
      });

      ws.on("message", (message: string) => {
        // console.log("Received:", message);
        // Handle incoming messages if needed
      });

      ws.on("close", () => {
        console.log("WebSocket connection closed");
      });

      server.on("listening", () => {
        console.log("WebSocket server is listening");
      });
    });

    this.pingInterval = setInterval(() => {
      (this.wss.clients as Set<ExtendedWebSocket>).forEach((ws) => {
        if (ws.isAlive === false) return ws.terminate();

        ws.isAlive = false;
        ws.ping(() => {});
      });
    }, 30000);

    this.wss.on("close", () => {
      clearInterval(this.pingInterval);
    });

    console.log("WebSocket service initialization complete");
  }

  static broadcastPointsUpdate(
    users: {
      id: string;
      dharma_points: number;
      karma_points: number;
    }[],
    last_calculation?: number
  ) {
    if (this.wss) {
      this.wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(
            JSON.stringify({
              type: "update_points",
              users,
              last_calculation,
            })
          );
        }
      });
    }
  }
}
