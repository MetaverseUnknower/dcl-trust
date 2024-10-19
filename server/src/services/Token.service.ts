// ./services/Token.service.ts
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET_KEY || "your-secret-key";
const REFRESH_SECRET_KEY =
  process.env.JWT_REFRESH_SECRET_KEY || "your-refresh-secret-key";

export class TokenService {
  static generateAccessToken(userId: string): string {
    return jwt.sign({ userId }, SECRET_KEY, { expiresIn: "1h" });
  }

  static generateRefreshToken(userId: string): string {
    return jwt.sign({ userId }, REFRESH_SECRET_KEY, { expiresIn: "7d" });
  }

  static verifyAccessToken(token: string): any {
    try {
      return jwt.verify(token, SECRET_KEY);
    } catch (error) {
      console.error("Access token verification error:", error);
      return null;
    }
  }

  static verifyRefreshToken(token: string): any {
    try {
      return jwt.verify(token, REFRESH_SECRET_KEY);
    } catch (error) {
      console.error("Refresh token verification error:", error);
      return null;
    }
  }
}
