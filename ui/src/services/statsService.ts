// src/services/statsService.ts
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface CBIMetrics {
  program_start: string;
  dharma_accrual_rate: number;
  karma_decay_rate: number;
  last_calculation: string | null;
}

export const statsService = {
  async getCBIMetrics(): Promise<CBIMetrics> {
    try {
      const response = await axios.get<CBIMetrics>(
        `${API_BASE_URL}/stats/cbi-metrics`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching CBI metrics:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          error.response.data.error || "Failed to fetch CBI metrics"
        );
      }
      throw new Error(
        "An unexpected error occurred while fetching CBI metrics"
      );
    }
  },
};
