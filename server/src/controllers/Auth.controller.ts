// ./controllers/Auth.controller.ts
import { Request, Response } from "express";
import { ethers } from "ethers";
import { TokenService } from "../services/Token.service";
import { UserLogic } from "../logic/User.logic";
import crypto from "crypto";

export class AuthController {
  private static readonly MESSAGE_EXPIRATION_TIME = 90; // seconds

  static async requestAuthMessage(req: Request, res: Response) {
    try {
      const { address } = req.body;

      if (!address) {
        return res
          .status(400)
          .json({ error: "Missing required parameter: address" });
      }

      // Generate a random nonce
      const nonce = crypto.randomBytes(16).toString("hex");

      // Get the current timestamp
      const timestamp = Math.floor(Date.now() / 1000);

      // Create a message for the user to sign
      const message = `Please sign this message to authenticate.\n\nAddress: ${address}\nNonce: ${nonce}\nTimestamp: ${timestamp}`;

      console.log("Generated auth message:", message);

      res.json({ message, timestamp });
    } catch (error) {
      console.error("Error in requestAuthMessage:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  static async authenticate(req: Request, res: Response) {
    try {
      const { address, signature, message, timestamp } = req.body;

      console.log("Received authentication request:", {
        address,
        signature,
        message,
        timestamp,
      });

      if (!address || !signature || !message || !timestamp) {
        return res.status(400).json({ error: "Missing required parameters" });
      }

      // Check if the message has expired
      const currentTime = Math.floor(Date.now() / 1000);
      if (currentTime - timestamp > AuthController.MESSAGE_EXPIRATION_TIME) {
        return res
          .status(400)
          .json({ error: "Authentication request has expired" });
      }

      const isValid = await AuthController.verifySignature(
        address,
        signature,
        message
      );

      console.log("Signature verification result:", isValid);

      if (isValid) {
        // Get or create user
        const userResponse = await UserLogic.getOrCreateUser(
          address.toLowerCase()
        );

        if (userResponse.status === 202 && userResponse.message) {
          return res.status(202).json({
            success: false,
            status: 202,
            message:
              userResponse.message ||
              "Sorry, you are not yet eligible for the CBI program.",
          });
        }

        // Generate tokens
        const accessToken = TokenService.generateAccessToken(
          userResponse.user.id
        );
        const refreshToken = TokenService.generateRefreshToken(
          userResponse.user.id
        );

        res.json({
          success: true,
          message: userResponse.message,
          accessToken,
          refreshToken,
          user: userResponse.user,
        });
      } else {
        res.status(401).json({ error: "Invalid signature" });
      }
    } catch (error) {
      console.error("Authentication error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  private static async verifySignature(
    address: string,
    signature: string,
    message: string
  ): Promise<boolean> {
    try {
      const signerAddress = ethers.utils.verifyMessage(message, signature);
      console.log("Recovered signer address:", signerAddress);
      console.log("Expected address:", address);
      return signerAddress.toLowerCase() === address.toLowerCase();
    } catch (error) {
      console.error("Signature verification error:", error);
      return false;
    }
  }

  static async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({ error: "Missing refresh token" });
      }

      const payload = TokenService.verifyRefreshToken(refreshToken);
      const user = await UserLogic.getUser(payload.userId);

      if (!user) {
        return res.status(400).json({ error: "User not found" });
      }

      const newAccessToken = TokenService.generateAccessToken(user.id);
      const newRefreshToken = TokenService.generateRefreshToken(user.id);

      res.json({
        status: 200,
        success: true,
        message: "Welcome back!",
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        user,
      });
    } catch (error) {
      console.error("Token refresh error:", error);
      res.status(401).json({ error: "Invalid refresh token" });
    }
  }
}
