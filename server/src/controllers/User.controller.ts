// ./controllers/User.controller.ts
import { Request, Response } from "express";
import { UserLogic } from "../logic/User.logic";
import { HistoryLogic } from "../logic/History.logic";
import { User } from "../data/User.data";
import { ErrorLoggerService } from "../services/ErrorLogger.service";

export class UserController {
  static async getAllUsers(req: Request, res: Response) {
    try {
      const users = await UserLogic.getAllUsers();
      res.json(users);
    } catch (error) {
      ErrorLoggerService.logError(
        "User.controller - Error fetching all users",
        error
      );
      console.error(
        "Error in user controller while fetching all users:",
        error
      );
      res.status(500).json({ error: "Internal server error" });
    }
  }

  static async updateUserDisplayName(req: Request, res: Response) {
    try {
      const { username } = req.body;
      const userId = req.user?.id;

      if (!userId || !username) {
        return res
          .status(400)
          .json({ error: "Missing required parameters: userId, displayName" });
      }

      const user = await UserLogic.getUser(userId.toLowerCase());

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      user.username = username;
      await UserLogic.updateUserDisplayName(new User(user));

      res.json({ message: "Display name updated successfully", username });
    } catch (error) {
      ErrorLoggerService.logError(
        "User.controller - Error updating display name",
        error
      );
      console.error(
        "Error in user controller while updating display name:",
        error
      );
      res.status(500).json({ error: "Internal server error" });
    }
  }

  static async getOrCreateUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res
          .status(400)
          .json({ error: "Missing required parameter: userId" });
      }

      const user = await UserLogic.getOrCreateUser(userId.toLowerCase());

      if (user && user.status && user.message) {
        return res.status(user.status).json({ error: user.message });
      }

      if (user.status === 200 && user.user) {
        res.status(200).json(user.user);
      } else {
        res.status(400).json({
          error:
            "Failed to get or create user. User may not meet the required criteria.",
        });
      }
    } catch (error) {
      ErrorLoggerService.logError(
        "User.controller - Error getting or creating user",
        error
      );
      console.error(
        "Error in user controller while getting or creating user:",
        error
      );
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }

  static async giftDharma(req: Request, res: Response) {
    try {
      const { recipientId, amount, reason } = req.body;
      const fromUser = req.user as User;
      console.log(reason);

      if (!recipientId || amount === undefined) {
        return res.status(400).json({ error: "Missing required parameters" });
      }

      if (!fromUser) {
        return res.status(403).json({ error: "Forbidden" });
      }

      if (recipientId.toLowerCase() === fromUser.id.toLowerCase()) {
        return res
          .status(403)
          .json({ error: "Cannot gift Dharma points to yourself" });
      }

      await UserLogic.giftDharma(
        fromUser,
        recipientId.toLowerCase(),
        Number(amount),
        reason
      );

      const updatedFromUser = await UserLogic.getUser(
          fromUser.id.toLowerCase()
        ),
        updatedToUser = await UserLogic.getUser(recipientId.toLowerCase());

      res.json({
        message: "Dharma points gifted successfully",
        fromUser: updatedFromUser,
        toUser: updatedToUser,
      });
    } catch (error) {
      ErrorLoggerService.logError(
        "User.controller - Error gifting Dharma",
        error
      );
      console.error("Error in user controller while gifting Dharma:", error);
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }

  static async getGiftHistory(req: Request, res: Response) {
    try {
      const userId = req.params.userId;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const history = await HistoryLogic.getUserGiftHistory(
        userId.toLowerCase(),
        limit
      );
      res.json(history);
    } catch (error) {
      ErrorLoggerService.logError(
        "User.controller - Error fetching gift history",
        error
      );
      console.error(
        "Error in user controller while fetching gift history:",
        error
      );
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }
}
