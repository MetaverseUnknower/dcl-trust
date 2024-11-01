// ./data/History.data.ts

import { databaseService } from "../services/Database.service";
import { PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";

export interface DharmaGiftLog {
  sk: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  reason: string;
  timestamp: number;
}

export class HistoryData {
  private static readonly TABLE_NAME = process.env.NODE_ENV === "production" ? "CBI_History" : "CBI_History_Dev";

  static async logDharmaGift(log: Omit<DharmaGiftLog, "sk">): Promise<void> {
    const dynamoDB = databaseService.getDynamoDbClient();
    const sk = uuidv4();

    const params = {
      TableName: this.TABLE_NAME,
      Item: {
        pk: "cbi:history:gift",
        sk,
        ...log,
      },
    };

    try {
      await dynamoDB.send(new PutCommand(params));
    } catch (error) {
      console.error("Error logging Dharma gift:", error);
      throw error;
    }
  }

  static async getUserGiftHistory(
    userId: string,
    limit: number = 10
  ): Promise<DharmaGiftLog[]> {
    const dynamoDB = databaseService.getDynamoDbClient();

    const params = {
      TableName: this.TABLE_NAME,
      KeyConditionExpression: "pk = :pk",
      FilterExpression: "fromUserId = :userId OR toUserId = :userId",
      ExpressionAttributeValues: {
        ":pk": "cbi:history:gift",
        ":userId": userId,
      },
      Limit: limit,
      ScanIndexForward: false, // to get the most recent gifts first
    };

    try {
      const result = await dynamoDB.send(new QueryCommand(params));
      return result.Items as DharmaGiftLog[];
    } catch (error) {
      console.error("Error fetching user gift history:", error);
      throw error;
    }
  }
}
