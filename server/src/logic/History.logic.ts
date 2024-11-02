// ./logic/History.logic.ts

import { HistoryData, DharmaGiftLog } from "../data/History.data";
import { ErrorLoggerService } from "../services/ErrorLogger.service";

export class HistoryLogic {
  static async logDharmaGift(
    fromUserId: string,
    toUserId: string,
    amount: number,
    reason: string
  ): Promise<void> {
    try {
      const log: Omit<DharmaGiftLog, "sk"> = {
        fromUserId,
        toUserId,
        amount,
        reason,
        timestamp: Date.now(),
      };

      console.log("Logging Dharma gift:", log);

      await HistoryData.logDharmaGift(log);
    } catch (error) {
      ErrorLoggerService.logError("History.logic - Error logging Dharma gift", error);
      console.error("Error in history logic while logging Dharma gift:", error);
      throw error;
    }
  }

  static async getUserGiftHistory(
    userId: string,
    limit: number = 100
  ): Promise<DharmaGiftLog[]> {
    try {
      return await HistoryData.getUserGiftHistory(userId, limit);
    } catch (error) {
      ErrorLoggerService.logError("History.logic - Error fetching user gift history", error);
      console.error(
        "Error in history logic while fetching user gift history:",
        error
      );
      throw error;
    }
  }
}
