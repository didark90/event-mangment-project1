import { Router } from "express";
import { EventsController } from "../controllers/events.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();
const controller = new EventsController();

// Public routes
router.get("/", (req, res) => controller.index(req, res));
router.get("/:id", (req, res) => controller.show(req, res));

// Protected routes
router.post("/", authenticate, (req, res) => controller.create(req, res));
router.put("/:id", authenticate, (req, res) => controller.update(req, res));
router.delete("/:id", authenticate, (req, res) => controller.delete(req, res));

export default router;
