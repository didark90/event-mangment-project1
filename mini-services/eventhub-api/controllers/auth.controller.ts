import { Request, Response } from "express";
import { AuthService } from "../services/auth.service.js";
import { registerSchema, loginSchema } from "../dto/auth.dto.js";

const authService = new AuthService();

export class AuthController {
  /**
   * POST /api/auth/register
   * Register a new user account
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      const data = registerSchema.parse(req.body);
      const result = await authService.register(data);
      res.status(201).json(result);
    } catch (error: any) {
      if (error.message === "Email already exists") {
        res.status(409).json({ error: error.message });
        return;
      }
      if (error.errors) {
        res.status(400).json({ error: "Validation failed", details: error.errors });
        return;
      }
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * POST /api/auth/login
   * Authenticate user and return JWT token
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const data = loginSchema.parse(req.body);
      const result = await authService.login(data);
      if (!result) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
      }
      res.json(result);
    } catch (error: any) {
      if (error.errors) {
        res.status(400).json({ error: "Validation failed", details: error.errors });
        return;
      }
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * GET /api/auth/me
   * Get current authenticated user profile
   */
  async me(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Not authenticated" });
        return;
      }
      const user = await authService.getUserById(req.user.userId);
      if (!user) {
        res.status(401).json({ error: "User not found" });
        return;
      }
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
