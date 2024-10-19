// ./types/websocket.types.ts

import WebSocket from 'ws';

export interface ExtendedWebSocket extends WebSocket {
  isAlive: boolean;
}