// ./data/Stats.data.ts
import { databaseService } from "../services/Database.service";
import { GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const dynamoDB = databaseService.getDynamoDbClient();

export interface CBIMetrics {
  program_start: number;
  dharma_accrual_rate: number;
  karma_decay_rate: number;
  last_calculation?: number;
}

export class StatsData {
  private static readonly TABLE_NAME = "CBI_Metrics";

  static async getCBIMetrics(): Promise<CBIMetrics> {
    const params = {
      TableName: this.TABLE_NAME,
      Key: { pk: "cbi:metrics" },
    };

    try {
      const command = new GetCommand(params);
      const result = await dynamoDB.send(command);
      if (!result.Item) {
        throw new Error("CBI Metrics not found");
      }
      return {
        program_start: result.Item.program_start,
        dharma_accrual_rate: result.Item.dharma_accrual_rate,
        karma_decay_rate: result.Item.karma_decay_rate,
        last_calculation: result.Item.last_calculation || null,
      };
    } catch (error) {
      console.error("Error fetching CBI metrics from DynamoDB:", error);
      throw error;
    }
  }
}
