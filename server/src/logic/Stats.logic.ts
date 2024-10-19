// ./logic/Stats.logic.ts
import { StatsData, CBIMetrics } from '../data/Stats.data';

export class StatsLogic {
  static async getCBIMetrics(): Promise<CBIMetrics> {
    try {
      return await StatsData.getCBIMetrics();
    } catch (error) {
      console.error('Error in stats logic while fetching CBI metrics:', error);
      throw error;
    }
  }
}