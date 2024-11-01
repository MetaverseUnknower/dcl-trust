// ./logic/User.logic.ts
import { UserData, User } from "../data/User.data";
import { DecentralandService } from "../services/Decentraland.service";
import { ErrorLoggerService } from "../services/ErrorLogger.service";
import { WebSocketService } from "../services/Websocket.service";
import { HistoryLogic } from "./History.logic";

export class UserLogic {
  static async getAllUsers(): Promise<Partial<User>[]> {
    try {
      return await UserData.getAllUsers();
    } catch (error) {
      console.error("Error in user logic while fetching all users:", error);
      throw error;
    }
  }

  static async getUser(userId: string): Promise<User | null> {
    try {
      return await UserData.getUser(userId);
    } catch (error) {
      console.error("Error in user logic while fetching user:", error);
      throw error;
    }
  }

  static async updateUser(user: User): Promise<void> {
    try {
      await UserData.updateUser(user);
    } catch (error) {
      console.error("Error in user logic while updating user:", error);
      throw error;
    }
  }

  static async createUser(
    userId: string
  ): Promise<{ status: number; message: string; user?: User }> {
    try {
      // Validate Decentraland name
      const decentralandProfile =
        await DecentralandService.checkForDecentralandName(userId);

      console.log("Decentraland profile:", decentralandProfile);

      if (!decentralandProfile) {
        return {
          status: 202,
          message: "User does not have a Decentraland name",
        };
      }

      const totalBadgesRequired = 5;

      const requiredBadges = [
        "dclcitizen",
        "land_architect",
        "emotionista",
        "fashionista",
        "event_enthusiast",
        "emote_creator",
        "wearable_designer",
      ];
      const requiredTiers = [
        null,
        null,
        "emotionista-bronze",
        "fashionista-bronze",
        "event-enthusiast-starter",
        "emote-creator-starter",
        "wearable-designer-starter",
      ];

      const requiredSteps = [null, null, null, null, 5, null, null];

      const acquiredBadges = await DecentralandService.checkUserBadges(
        userId,
        requiredBadges,
        requiredTiers,
        requiredSteps
      );

      if (acquiredBadges < totalBadgesRequired) {
        console.error(
          `User ${userId} only has ${acquiredBadges}/${totalBadgesRequired} badges`
        );
        return {
          status: 202,
          message: `You need ${
            totalBadgesRequired - acquiredBadges
          } more badges.`,
        };
      }

      // Create user object
      const newUser: User = {
        pk: "cbi:user:account",
        id: userId,
        username: decentralandProfile?.name,
        decentraland_name: decentralandProfile?.name,
        decentraland_profile: decentralandProfile,
        dharma_points: 0,
        karma_points: 0,
        avatar_url: decentralandProfile?.avatar?.snapshots?.face256,
        created_at: new Date().toISOString(),
      };

      // Save user to database
      await UserData.createUser(newUser);

      return {
        status: 200,
        message:
          "Congratulations! You are eligible for the Decentraland Trust program.",
        user: newUser,
      };
    } catch (error) {
      console.error("Error in user logic while creating user:", error);
      await ErrorLoggerService.logError("User creation failed", error);
      throw error;
    }
  }

  static async getOrCreateUser(
    userId: string
  ): Promise<{ status: number; message: string; user?: User }> {
    try {
      // First, try to get the existing user
      let user = await this.getUser(userId);

      // If user exists, get latest profile data and return user
      if (user) {
        const userProfile = await DecentralandService.getDecentralandProfile(
          user.id
        );

        user.decentraland_profile = userProfile;
        user.avatar_url = userProfile?.avatar?.snapshots?.face256;
        user.decentraland_name = userProfile?.name;

        await this.updateUser(new User(user));
        return { status: 200, message: "Welcome Back!", user };
      }

      // If user doesn't exist, create a new one
      return await this.createUser(userId);
    } catch (error) {
      console.error(
        "Error in user logic while getting or creating user:",
        error
      );
      await ErrorLoggerService.logError("User get or create failed", error);
      throw error;
    }
  }

  static async giftDharma(
    fromUser: User,
    toUserId: string,
    amount: number,
    reason: string
  ): Promise<void> {
    try {
      const fromUserId = fromUser.id;
      if (fromUserId === toUserId) {
        throw new Error("Cannot gift Dharma points to yourself");
      }
      if (amount <= 0) {
        throw new Error("Gifted amount must be positive");
      }

      const toUser = await this.getUser(toUserId);

      if (!fromUser || !toUser) {
        console.error(fromUser, toUser);
        throw new Error("One or both users not found");
      }
      if (fromUser.dharma_points < amount) {
        throw new Error("Insufficient Dharma points");
      }
      await UserData.giftDharma(fromUserId, toUserId, amount);

      // Log the Dharma gift
      await HistoryLogic.logDharmaGift(fromUserId, toUserId, amount, reason);

      const updatedUsers = [
        { ...fromUser, dharma_points: fromUser.dharma_points - amount },
        { ...toUser, dharma_points: toUser.dharma_points + amount },
      ];

      WebSocketService.broadcastPointsUpdate(updatedUsers);
    } catch (error) {
      console.error("Error in user logic while gifting Dharma:", error);
      throw error;
    }
  }
}
