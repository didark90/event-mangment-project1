import { Request, Response } from "express";
import { EventService } from "../services/event.service.js";

const eventService = new EventService();

export class DashboardController {
  /**
   * GET /api/dashboard/stats
   * Get dashboard statistics (authenticated)
   */
  async stats(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Authentication required" });
        return;
      }
      const result = await eventService.getDashboardStats();
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
