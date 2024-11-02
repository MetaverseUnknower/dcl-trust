// src/services/authService.ts
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface User {
  id: string;
  username: string;
  decentraland_name: string;
  decentraland_names: string[];
  dharma_points: number;
  karma_points: number;
  created_at: string;
  avatar_url?: string;
  last_calculation?: number;
}

export interface AuthResponse {
  status: number;
  success: boolean;
  message: string;
  accessToken: string;
  refreshToken: string;
  user: User;
}

interface AuthMessage {
  message: string;
  timestamp: number;
}

export const authService = {
  async requestAuthMessage(address: string): Promise<AuthMessage> {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/message`, {
        address,
      });
      return response.data;
    } catch (error) {
      console.error("Error requesting auth message:", error);
      throw new Error("Failed to request auth message");
    }
  },

  async authenticate(
    address: string,
    signature: string,
    timestamp: number,
    message: string
  ): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth`, {
        address,
        signature,
        timestamp,
        message,
      });
      this.setTokens(response.data.accessToken, response.data.refreshToken);
      return response.data;
    } catch (error) {
      console.error("Error authenticating:", error);
      throw new Error("Failed to authenticate");
    }
  },

  async restoreLoginSession(): Promise<AuthResponse> {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();

    if (!accessToken || !refreshToken) {
      throw new Error("No login session found");
    }

    try {
      const response = await this.refreshToken(refreshToken);
      this.setTokens(response.accessToken, refreshToken);
      return response;
    } catch (error) {
      console.error("Error restoring login session:", error);
      throw new Error("Failed to restore login session");
    }
  },

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
        refreshToken,
      });
      return response.data;
    } catch (error) {
      console.error("Error refreshing token:", error);
      throw new Error("Failed to refresh token");
    }
  },

  setTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
  },

  getAccessToken() {
    return localStorage.getItem("accessToken");
  },

  getRefreshToken() {
    return localStorage.getItem("refreshToken");
  },

  removeTokens() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  },
};
