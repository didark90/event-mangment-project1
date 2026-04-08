import { Router } from "express";
import { DashboardController } from "../controllers/dashboard.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();
const controller = new DashboardController();

router.get("/stats", authenticate, (req, res) => controller.stats(req, res));

export default router;
