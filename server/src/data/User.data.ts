// ./data/User.data.ts
import { databaseService } from "../services/Database.service";
import {
  GetCommand,
  PutCommand,
  ScanCommand,
  TransactWriteCommand,
  UpdateCommand,
  UpdateCommandInput,
} from "@aws-sdk/lib-dynamodb";

const dynamoDB = databaseService.getDynamoDbClient();

export class User {
  static pk: string = "cbi:user:account";
  pk: string = User.pk;
  id: string;
  username: string;
  decentraland_name: string;
  decentraland_profile: any;
  dharma_points: number;
  karma_points: number;
  created_at: string;
  avatar_url?: string;
  last_calculation?: number;

  constructor(userConfig: User) {
    this.id = userConfig.id;
    this.username = userConfig.username;
    this.decentraland_name = userConfig.decentraland_name;
    this.decentraland_profile = userConfig.decentraland_profile;
    this.dharma_points = userConfig.dharma_points;
    this.karma_points = userConfig.karma_points;
    this.created_at = userConfig.created_at;
    this.avatar_url = userConfig.avatar_url;
    this.last_calculation = userConfig.last_calculation;
  }
}

export class UserData {
  public static readonly TABLE_NAME = "CBI_Users";

  static async createUser(user: User): Promise<void> {
    const params = {
      TableName: this.TABLE_NAME,
      Item: user,
    };
    try {
      const command = new PutCommand(params);
      await dynamoDB.send(command);
    } catch (error) {
      console.error("Error creating user in DynamoDB:", error);
      throw error;
    }
  }

  static async updateUser(user: User): Promise<void> {
    console.log(`Updating user with ID: ${user.id}, pk: ${user.pk}`);
    const params: UpdateCommandInput = {
      TableName: this.TABLE_NAME,
      Key: { pk: user.pk, id: user.id },
      UpdateExpression: `SET username = :username, decentraland_name = :decentraland_name, decentraland_profile = :decentraland_profile, avatar_url = :avatar_url`,
      ExpressionAttributeValues: {
        ":username": user.username,
        ":decentraland_name": user.decentraland_name,
        ":decentraland_profile": user.decentraland_profile,
        ":avatar_url": user.avatar_url,
      },
    };

    try {
      const command = new UpdateCommand(params);
      await dynamoDB.send(command);
    } catch (error) {
      console.error("Error updating user in DynamoDB:", error);
      throw error;
    }
  }

  static async getAllUsers(): Promise<Partial<User>[]> {
    const params = {
      TableName: this.TABLE_NAME,
      ProjectionExpression:
        "id, username, decentraland_name, avatar_url, dharma_points, karma_points, created_at, last_calculation",
    };

    try {
      const command = new ScanCommand(params);
      const result = await dynamoDB.send(command);
      return result.Items as Partial<User>[];
    } catch (error) {
      console.error("Error fetching users from DynamoDB:", error);
      throw error;
    }
  }

  static async getUser(userId: string): Promise<User | null> {
    console.log(`Fetching user with ID: ${userId}`);
    const params = {
      TableName: this.TABLE_NAME,
      Key: { pk: "cbi:user:account", id: userId },
      ProjectionExpression:
        "id, username, decentraland_name, avatar_url, dharma_points, karma_points, created_at, last_calculation",
    };

    try {
      const command = new GetCommand(params);
      const result = await dynamoDB.send(command);
      return result.Item as User | null;
    } catch (error) {
      console.error("Error fetching user from DynamoDB:", error);
      throw error;
    }
  }

  static async giftDharma(
    fromUserId: string,
    toUserId: string,
    amount: number
  ): Promise<void> {
    console.log(
      `Gifting ${amount} Dharma points from ${fromUserId} to ${toUserId}`
    );
    const params = {
      TransactItems: [
        {
          Update: {
            TableName: this.TABLE_NAME,
            Key: { pk: "cbi:user:account", id: fromUserId },
            UpdateExpression: "SET dharma_points = dharma_points - :amount",
            ConditionExpression: "dharma_points >= :amount",
            ExpressionAttributeValues: { ":amount": Number(amount) },
          },
        },
        {
          Update: {
            TableName: this.TABLE_NAME,
            Key: { pk: "cbi:user:account", id: toUserId },
            UpdateExpression: "SET karma_points = karma_points + :amount",
            ExpressionAttributeValues: { ":amount": Number(amount) },
          },
        },
      ],
    };

    try {
      const command = new TransactWriteCommand(params);
      await dynamoDB.send(command);
    } catch (error) {
      console.error("Error gifting Dharma points:", error);
      throw error;
    }
  }
}
