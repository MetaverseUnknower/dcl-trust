// ./middleware/Auth.middleware.ts

import { Request, Response, NextFunction } from "express";
import { TokenService } from "../services/Token.service";
import { UserLogic } from "../logic/User.logic";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    const payload = TokenService.verifyAccessToken(token);
    console.log(payload);
    const user = await UserLogic.getUser(payload.userId); // Attach the user payload to the request object
    console.log(user);
    if (user) {
      req.user = user;
      next();
    } else {
      return res.status(401).json({ error: "Invalid token." });
    }
  } catch (error) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};
