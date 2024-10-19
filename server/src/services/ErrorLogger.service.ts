// ./services/ErrorLogger.service.ts

import { databaseService } from "./Database.service";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import axios from "axios"; // Make sure to install axios: npm install axios

const dynamoDB = databaseService.getDynamoDbClient();

export class ErrorLoggerService {
  private static readonly ERROR_LOG_TABLE = "CBI_ErrorLogs";
  private static readonly DISCORD_WEBHOOK_URL =
    process.env.DISCORD_WEBHOOK_URL || "";

  // Method to log errors to both DynamoDB and Discord
  static async logError(
    errorMessage: string,
    errorDetails: any
  ): Promise<void> {
    const timestamp = new Date().toISOString();
    const errorLog = {
      pk: "cbi:log:error",
      timestamp,
      errorMessage,
      errorDetails: JSON.stringify(errorDetails),
    };

    // Log to DynamoDB
    await this.logToDynamoDB(errorLog);

    // Log to Discord
    await this.logToDiscord(errorLog);
  }

  // Method to log errors to DynamoDB
  private static async logToDynamoDB(errorLog: any): Promise<void> {
    const params = {
      TableName: this.ERROR_LOG_TABLE,
      Item: errorLog,
    };

    try {
      const command = new PutCommand(params);
      await dynamoDB.send(command);
      console.log("Error logged to DynamoDB");
    } catch (error) {
      console.error("Failed to log error to DynamoDB:", error);
    }
  }

  // Method to log errors to Discord via webhook
  private static async logToDiscord(errorLog: any): Promise<void> {
    if (!this.DISCORD_WEBHOOK_URL) {
      console.warn(
        "Discord webhook URL not set. Skipping Discord error logging."
      );
      return;
    }

    const discordMessage = {
      content: "An error occurred in the Dharma Accrual Service",
      embeds: [
        {
          title: "Error Details",
          fields: [
            { name: "Timestamp", value: errorLog.timestamp },
            { name: "Error Message", value: errorLog.errorMessage },
            { name: "Error Details", value: errorLog.errorDetails },
          ],
          color: 15158332, // Red color
        },
      ],
    };

    try {
      await axios.post(this.DISCORD_WEBHOOK_URL, discordMessage);
      console.log("Error logged to Discord");
    } catch (error) {
      console.error("Failed to log error to Discord:", error);
    }
  }
}
