import express from "express";
import cors from "cors";
import cron from "node-cron";
import { AuthController } from "./controllers/Auth.controller";
import { UserController } from "./controllers/User.controller";
import { StatsController } from "./controllers/Stats.controller";
import { DharmaAccrualService } from "./services/DharmaAccrual.service";
import { authMiddleware } from "./middleware/Auth.middleware";

const app = express();

app.use(express.json());
app.use(cors());

// Auth endpoint
// In your routes file
app.post("/auth", AuthController.authenticate);
app.post("/auth/message", AuthController.requestAuthMessage);
app.post("/auth/refresh", AuthController.refreshToken);

// User endpoints
app.get("/users", UserController.getAllUsers);
app.post("/users/gift-dharma", authMiddleware, UserController.giftDharma);
app.get("/users/:userId", UserController.getOrCreateUser);
app.get("/users/:userId/gift-history", UserController.getGiftHistory);

// Stats endpoints
app.get("/stats/cbi-metrics", StatsController.getCBIMetrics);

// Run Dharma accrual check every minute
cron.schedule("* * * * *", () => {
  DharmaAccrualService.updateDharmaPointsAndDecayKarma()
    .then(() => console.log("Dharma accrual update completed"))
    .catch((error) =>
      console.error("Error during Dharma accrual update:", error)
    );
});

// Run an initial Dharma accrual check on startup
DharmaAccrualService.updateDharmaPointsAndDecayKarma()
  .then(() => console.log("Initial Dharma accrual check completed"))
  .catch((error) =>
    console.error("Error during initial Dharma accrual check:", error)
  );

export default app;
