// ./services/WebSocket.service.ts

class ReconnectingWebSocket {
  private socket: WebSocket | null = null;
  private readonly url: string;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private readonly reconnectInterval = 5000; // 5 seconds
  private heartbeatInterval: number | null = null;

  private messageHandler: ((ev: MessageEvent) => void) | null = null;
  private openHandler: ((ev: Event) => void) | null = null;
  private closeHandler: ((ev: CloseEvent) => void) | null = null;
  private errorHandler: ((ev: Event) => void) | null = null;

  constructor(url: string) {
    this.url = url;
    this.connect();
  }

  private connect() {
    this.socket = new WebSocket(this.url);

    this.socket.onopen = (e: Event) => {
      console.log("[open] Connection established");
      this.reconnectAttempts = 0;
      this.startHeartbeat();
      if (this.openHandler) this.openHandler(e);
    };

    this.socket.onmessage = (event: MessageEvent) => {
      if (this.messageHandler) this.messageHandler(event);
    };

    this.socket.onclose = (event: CloseEvent) => {
      if (this.closeHandler) this.closeHandler(event);
      this.stopHeartbeat();
      this.reconnect();
    };

    this.socket.onerror = (error: Event) => {
      if (this.errorHandler) this.errorHandler(error);
    };
  }

  private reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
      );
      setTimeout(() => this.connect(), this.reconnectInterval);
    } else {
      console.log(
        "Max reconnection attempts reached. Please refresh the page."
      );
    }
  }

  private startHeartbeat() {
    this.heartbeatInterval = window.setInterval(() => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({ type: "heartbeat" }));
      }
    }, 30000);
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval !== null) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  public send(data: any) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    } else {
      console.log("WebSocket is not open. Message not sent.");
    }
  }

  public setOnMessage(handler: ((ev: MessageEvent) => void) | null) {
    this.messageHandler = handler;
  }
  public setOnOpen(handler: ((ev: Event) => void) | null) {
    this.openHandler = handler;
  }
  public setOnClose(handler: ((ev: CloseEvent) => void) | null) {
    this.closeHandler = handler;
  }
  public setOnError(handler: ((ev: Event) => void) | null) {
    this.errorHandler = handler;
  }
}

export const webSocket = new ReconnectingWebSocket(
  import.meta.env.VITE_WSS_BASE_URL
);
