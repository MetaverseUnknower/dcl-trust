// src/services/userService.ts
import axios from "axios";
import { authService } from "./authService";
import { DharmaTransaction } from "../models/History";

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

export const userService = {
  async getUsers(): Promise<User[]> {
    const response = await axios.get(`${API_BASE_URL}/users`);
    return response.data;
  },

  async updateUserDisplayName(username: string): Promise<string> {
    const accessToken = authService.getAccessToken();
    if (!accessToken) {
      throw new Error("User must be logged in to update display name");
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/users/update-display-name`,
        { username },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      return response.data.username;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          error.response.data.error || "Failed to update display name"
        );
      }
      throw new Error(
        "An unexpected error occurred while updating display name"
      );
    }
  },

  async giftDharma({
    recipientId,
    reason,
    amount,
  }: {
    recipientId: string;
    reason: string;
    amount: number;
  }): Promise<{ message: string; fromUser: User; toUser: User }> {
    console.log(
      "Gifting Dharma to",
      recipientId,
      "with reason:",
      reason,
      "and amount:",
      amount
    );
    const accessToken = authService.getAccessToken();
    if (!accessToken) {
      throw new Error("User must be logged in to gift Dharma");
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/users/gift-dharma`,
        { recipientId, reason, amount },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.error || "Failed to gift Dharma");
      }
      throw new Error("An unexpected error occurred while gifting Dharma");
    }
  },

  async getUserTransactions(userId: string): Promise<DharmaTransaction[]> {
    try {
      const response = await axios.get<DharmaTransaction[]>(
        `${API_BASE_URL}/users/${userId}/gift-history`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching user transactions:", error);
      throw new Error("Failed to fetch user transactions");
    }
  },
};
