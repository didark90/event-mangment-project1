import { Router } from "express";
import authRoutes from "./auth.routes.js";
import eventsRoutes from "./events.routes.js";
import contactRoutes from "./contact.routes.js";
import dashboardRoutes from "./dashboard.routes.js";

const router = Router();

// API routes
router.use("/auth", authRoutes);
router.use("/events", eventsRoutes);
router.use("/contact", contactRoutes);
router.use("/dashboard", dashboardRoutes);

export default router;
