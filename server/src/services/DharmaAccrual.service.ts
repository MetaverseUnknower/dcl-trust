// ./services/DharmaAccrual.service.ts

import { StatsData } from "../data/Stats.data";
import { UserData, User } from "../data/User.data";
import { databaseService } from "./Database.service";
import { ErrorLoggerService } from "./ErrorLogger.service";
import {
  GetCommand,
  TransactWriteCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { WebSocketService } from "./Websocket.service";

const dynamoDB = databaseService.getDynamoDbClient();
let interval: NodeJS.Timeout;

export class DharmaAccrualService {
  private static readonly CBI_METRICS_TABLE = "CBI_Metrics";
  private static readonly MAX_DHARMA_POINTS = 10;
  private static readonly MIN_KARMA_POINTS = 0;

  static async updateDharmaPointsAndDecayKarma(): Promise<void> {
    try {
      // Step 1: Gather necessary data
      const metrics = await StatsData.getCBIMetrics();
      const users = await UserData.getAllUsers();
      const currentTime = this.roundToNearestMinute(Date.now());
      const dharmaStartDate = metrics.program_start || 0;

      // Check if Dharma accrual has started
      if (currentTime < dharmaStartDate) {
        console.log(
          `${new Date().toLocaleString()} - Dharma accrual has not started yet`
        );
        console.log(
          `Current time: ${currentTime}, Dharma start date: ${dharmaStartDate}`
        );
        return;
      }

      // Determine the effective last accrual time
      const globalLastAccrualTime = metrics.last_calculation || dharmaStartDate;

      // Calculate the minutes passed since the last accrual
      const minutesPassed = Math.floor(
        (currentTime - globalLastAccrualTime) / (1000 * 60)
      );

      // Calculate the amount of Dharma to accrue and Karma to decay based on the rates and time passed
      const dharmaAccrualAmount = metrics.dharma_accrual_rate * minutesPassed;
      const karmaDecayAmount = metrics.karma_decay_rate * minutesPassed;

      // Step 2: Update Dharma points, decay Karma, and convert half of decayed Karma to Dharma if time has passed
      if (minutesPassed >= 1) {
        await this.updateUserPointsInTransaction(
          users,
          dharmaAccrualAmount,
          karmaDecayAmount,
          currentTime
        );
        await this.updateGlobalLastAccrualTime(currentTime);
      } else {
        console.log("No time has passed since last accrual, skipping update");
        return;
      }

      console.log(
        `${new Date().toLocaleString()} - Dharma update process for completed successfully.`
      );
    } catch (error) {
      console.error("Error in Dharma accrual and Karma decay process:", error);
      await ErrorLoggerService.logError(
        "Dharma accrual and Karma decay process failed",
        error
      );
      throw error;
    }
  }

  private static async updateUserPointsInTransaction(
    users: User[] | Partial<User>[],
    dharmaAccrualAmount: number,
    karmaDecayAmount: number,
    currentTime: number
  ): Promise<void> {
    const updatedUsers: {
      id: string;
      dharma_points: number;
      karma_points: number;
    }[] = [];
    const updateOperations = await Promise.all(
      users.map(async (user) => {
        const userLastCalculation = user.last_calculation || 0;
        const globalLastCalculation = await this.getGlobalLastCalculationTime();
        const minutesPassed = Math.floor(
          (globalLastCalculation - userLastCalculation) / (1000 * 60)
        );
        // Check if the user's last calculation is behind the global last calculation
        if (minutesPassed >= 1) {
          console.log("User " + user.id + " is behind");
          console.log("Global last calculation: " + globalLastCalculation);
          console.log("User last calculation: " + userLastCalculation);

          // 5 minutes threshold
          // Use fixUserPoints for this user
          await this.fixUserPoints(user.id);
          return null; // Return null to indicate this user was handled separately
        }

        // Regular update logic for users who don't need fixing
        const actualKarmaDecay = Math.min(user.karma_points, karmaDecayAmount);
        const karmaToDharmaConversion = actualKarmaDecay * 0.5;

        const newDharmaPoints = Math.min(
          Number(user.dharma_points) +
            dharmaAccrualAmount +
            karmaToDharmaConversion,
          this.MAX_DHARMA_POINTS
        ).toFixed(4);

        const newKarmaPoints = Math.max(
          Number(user.karma_points) - actualKarmaDecay,
          this.MIN_KARMA_POINTS
        ).toFixed(4);

        return {
          Update: {
            TableName: UserData.TABLE_NAME,
            Key: { pk: "cbi:user:account", id: user.id },
            UpdateExpression:
              "SET dharma_points = :newDharmaPoints, karma_points = :newKarmaPoints, last_calculation = :lastCalculation",
            ExpressionAttributeValues: {
              ":newDharmaPoints": Number(newDharmaPoints),
              ":newKarmaPoints": Number(newKarmaPoints),
              ":lastCalculation": currentTime,
            },
          },
        };
      })
    );

    // Filter out null values (users that were fixed individually)
    const validUpdateOperations = updateOperations.filter((op) => op !== null);

    // Process in batches of 25 due to DynamoDB transaction limit
    for (let i = 0; i < validUpdateOperations.length; i += 25) {
      const batch = validUpdateOperations.slice(i, i + 25);
      const params = { TransactItems: batch };

      try {
        const command = new TransactWriteCommand(params);
        await dynamoDB.send(command);
        console.log(
          `Successfully updated points for users ${i} to ${i + batch.length}`
        );
        for (const operation of batch) {
          const userId = operation.Update.Key.id;
          const newDharmaPoints =
            operation.Update.ExpressionAttributeValues[":newDharmaPoints"];
          const newKarmaPoints =
            operation.Update.ExpressionAttributeValues[":newKarmaPoints"];

          updatedUsers.push({
            id: userId,
            dharma_points: Number(newDharmaPoints),
            karma_points: Number(newKarmaPoints),
          });
        }
      } catch (error) {
        console.error(
          `Error updating points in transaction for batch starting at ${i}:`,
          error
        );
        await ErrorLoggerService.logError(
          `Points update failed for batch starting at ${i}`,
          error
        );
        throw error;
      }

      // Clear the interval and set a new one after the first successful batch
      clearInterval(interval);

      // Broadcast the updated points to all clients
      WebSocketService.broadcastPointsUpdate(updatedUsers, currentTime);

      // Set a new interval to broadcast points every 15 seconds
      interval = setInterval(() => {
        WebSocketService.broadcastPointsUpdate(updatedUsers, currentTime);
      }, 15000);
    }
  }

  // Add this method to get the global last calculation time
  private static async getGlobalLastCalculationTime(): Promise<number> {
    const params = {
      TableName: this.CBI_METRICS_TABLE,
      Key: { pk: "cbi:metrics" },
      ProjectionExpression: "last_calculation",
    };

    try {
      const command = new GetCommand(params);
      const result = await dynamoDB.send(command);
      return result.Item?.last_calculation || 0;
    } catch (error) {
      console.error("Error getting global last calculation time:", error);
      throw error;
    }
  }

  private static async updateGlobalLastAccrualTime(
    timestamp: number
  ): Promise<void> {
    const params = {
      TableName: this.CBI_METRICS_TABLE,
      Key: { pk: "cbi:metrics" },
      UpdateExpression: "SET #last_calculation = :last_calculation",
      ExpressionAttributeNames: { "#last_calculation": "last_calculation" },
      ExpressionAttributeValues: { ":last_calculation": timestamp },
    };

    try {
      const command = new UpdateCommand(params);
      await dynamoDB.send(command);
    } catch (error) {
      console.error("Error updating global last accrual time:", error);
      throw error;
    }
  }

  static async fixUserPoints(userId: string): Promise<void> {
    try {
      const user = await UserData.getUser(userId);
      const metrics = await StatsData.getCBIMetrics();

      if (!user) {
        throw new Error(`User not found: ${userId}`);
      }

      const currentTime = this.roundToNearestMinute(Date.now());
      const userLastAccrualTime =
        user.last_calculation || metrics.program_start;
      const minutesPassed = Math.floor(
        (currentTime - userLastAccrualTime) / (1000 * 60)
      );

      console.log(minutesPassed + " minutes passed for user " + userId);

      if (minutesPassed > 1) {
        const dharmaAccrualAmount = metrics.dharma_accrual_rate * minutesPassed;
        const karmaDecayAmount = metrics.karma_decay_rate * minutesPassed;

        // Calculate karma decay
        const actualKarmaDecay = Math.min(user.karma_points, karmaDecayAmount);
        const karmaToDharmaConversion = actualKarmaDecay * 0.5;

        // Calculate new Dharma points, including the conversion from karma
        const newDharmaPoints = Math.min(
          Number(user.dharma_points) +
            dharmaAccrualAmount +
            karmaToDharmaConversion,
          this.MAX_DHARMA_POINTS
        ).toFixed(4);

        // Calculate new Karma points after decay
        const newKarmaPoints = Math.max(
          Number(user.karma_points) - actualKarmaDecay,
          this.MIN_KARMA_POINTS
        ).toFixed(4);

        const params = {
          TableName: UserData.TABLE_NAME,
          Key: { pk: "cbi:user:account", id: userId },
          UpdateExpression:
            "SET dharma_points = :newDharmaPoints, karma_points = :newKarmaPoints, last_calculation = :lastAccrual",
          ExpressionAttributeValues: {
            ":newDharmaPoints": Number(newDharmaPoints),
            ":newKarmaPoints": Number(newKarmaPoints),
            ":lastAccrual": currentTime,
          },
        };

        const command = new UpdateCommand(params);
        await dynamoDB.send(command);
        console.log(`Successfully fixed points for user ${userId}`);
      } else {
        console.log(`No update needed for user ${userId}`);
      }
    } catch (error) {
      console.error(`Error fixing points for user ${userId}:`, error);
      await ErrorLoggerService.logError(
        `Points fix failed for user ${userId}`,
        error
      );
      throw error;
    }
  }

  private static roundToNearestMinute(timestamp: number): number {
    const date = new Date(timestamp);
    date.setSeconds(0, 0); // Set seconds and milliseconds to 0
    if (date.getSeconds() >= 30) {
      date.setMinutes(date.getMinutes() + 1);
    }
    return date.getTime(); // Return the timestamp in milliseconds
  }
}
