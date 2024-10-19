// ./controllers/Stats.controller.ts
import { Request, Response } from 'express';
import { StatsLogic } from '../logic/Stats.logic';

export class StatsController {
  static async getCBIMetrics(req: Request, res: Response) {
    try {
      const metrics = await StatsLogic.getCBIMetrics();
      res.json(metrics);
    } catch (error) {
      console.error('Error in stats controller while fetching CBI metrics:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}