import { Router } from "express";
import { ContactController } from "../controllers/contact.controller.js";

const router = Router();
const controller = new ContactController();

router.post("/", (req, res) => controller.submit(req, res));

export default router;
