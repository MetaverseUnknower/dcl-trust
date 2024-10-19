// ./logic/History.logic.ts

import { HistoryData, DharmaGiftLog } from "../data/History.data";

export class HistoryLogic {
  static async logDharmaGift(
    fromUserId: string,
    toUserId: string,
    amount: number
  ): Promise<void> {
    try {
      const log: Omit<DharmaGiftLog, "sk"> = {
        fromUserId,
        toUserId,
        amount,
        timestamp: Date.now(),
      };

      await HistoryData.logDharmaGift(log);
    } catch (error) {
      console.error("Error in history logic while logging Dharma gift:", error);
      throw error;
    }
  }

  static async getUserGiftHistory(
    userId: string,
    limit: number = 10
  ): Promise<DharmaGiftLog[]> {
    try {
      return await HistoryData.getUserGiftHistory(userId, limit);
    } catch (error) {
      console.error(
        "Error in history logic while fetching user gift history:",
        error
      );
      throw error;
    }
  }
}
