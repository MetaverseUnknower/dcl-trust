// ./services/Database.service.ts
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

export class DatabaseService {
  private static instance: DatabaseService;
  private dynamoDb: DynamoDBDocumentClient;

  private constructor() {
    const isProduction = process.env.NODE_ENV === "production";
    let clientConfig: {
      region: string;
      credentials?: { accessKeyId: string; secretAccessKey: string };
    };

    if (isProduction) {
      // In production, assume we're running on EC2 with proper IAM role
      clientConfig = {
        region: process.env.AWS_REGION || "us-east-2",
      };
      console.log("Using IAM role for AWS credentials");
    } else {
      // In development, use access key and secret key
      clientConfig = {
        region: process.env.AWS_REGION || "us-east-2",
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
        },
      };
      console.log("Using AWS access key and secret for credentials");
    }

    // Initialize the DynamoDB client
    const client = new DynamoDBClient(clientConfig);
    this.dynamoDb = DynamoDBDocumentClient.from(client);
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  public getDynamoDbClient(): DynamoDBDocumentClient {
    return this.dynamoDb;
  }
}

// Export a singleton instance
export const databaseService = DatabaseService.getInstance();
