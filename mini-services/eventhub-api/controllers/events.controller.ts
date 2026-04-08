import { Request, Response } from "express";
import { EventService } from "../services/event.service.js";
import { eventCreateSchema, eventUpdateSchema } from "../dto/event.dto.js";

const eventService = new EventService();

export class EventsController {
  /**
   * GET /api/events
   * List events with optional category filter and pagination
   */
  async index(req: Request, res: Response): Promise<void> {
    try {
      const category = req.query.category as string | undefined;
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 20;
      const result = await eventService.getAll(category, page, pageSize);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * GET /api/events/:id
   * Get a single event by ID
   */
  async show(req: Request, res: Response): Promise<void> {
    try {
      const event = await eventService.getById(req.params.id);
      if (!event) {
        res.status(404).json({ error: "Event not found" });
        return;
      }
      res.json(event);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * POST /api/events
   * Create a new event (authenticated)
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Authentication required" });
        return;
      }
      const data = eventCreateSchema.parse(req.body);
      const result = await eventService.create(req.user.userId, data);
      res.status(201).json(result);
    } catch (error: any) {
      if (error.errors) {
        res.status(400).json({ error: "Validation failed", details: error.errors });
        return;
      }
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * PUT /api/events/:id
   * Update an event (owner only)
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Authentication required" });
        return;
      }
      const data = eventUpdateSchema.parse(req.body);
      const result = await eventService.update(req.params.id, req.user.userId, data);
      if (!result) {
        res.status(404).json({ error: "Event not found or you don't have permission" });
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
   * DELETE /api/events/:id
   * Delete an event (owner only)
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Authentication required" });
        return;
      }
      const deleted = await eventService.delete(req.params.id, req.user.userId);
      if (!deleted) {
        res.status(404).json({ error: "Event not found or you don't have permission" });
        return;
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
