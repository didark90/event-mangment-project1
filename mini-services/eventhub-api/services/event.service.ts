import { getDb } from "../config/database.js";
import type { IEventService } from "../interfaces/index.js";
import type { EventCreateInput, EventUpdateInput, EventResponse, EventListResponse, DashboardStats } from "../dto/event.dto.js";

export class EventService implements IEventService {
  async getAll(category?: string, page: number = 1, pageSize: number = 20): Promise<EventListResponse> {
    const db = getDb();
    let whereClause = "";
    const params: any[] = [];

    if (category) {
      whereClause = "WHERE e.category = ?";
      params.push(category);
    }

    const countResult = db.prepare(`SELECT COUNT(*) as total FROM Events e ${whereClause}`).get(...params) as any;
    const totalCount = countResult.total;

    const events = db.prepare(`
      SELECT e.*, u.name as user_name
      FROM Events e
      JOIN Users u ON e.user_id = u.id
      ${whereClause}
      ORDER BY e.date DESC
      LIMIT ? OFFSET ?
    `).all(...params, pageSize, (page - 1) * pageSize) as any[];

    return {
      totalCount,
      page,
      pageSize,
      events: events.map((e) => this.mapToResponse(e)),
    };
  }

  async getById(id: string): Promise<EventResponse | null> {
    const db = getDb();
    const event = db.prepare(`
      SELECT e.*, u.name as user_name
      FROM Events e
      JOIN Users u ON e.user_id = u.id
      WHERE e.id = ?
    `).get(id) as any;

    if (!event) return null;
    return this.mapToResponse(event);
  }

  async create(userId: string, data: EventCreateInput): Promise<EventResponse> {
    const db = getDb();
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    db.prepare(
      "INSERT INTO Events (id, title, description, date, location, category, status, user_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, 'Upcoming', ?, ?, ?)"
    ).run(id, data.title, data.description, data.date, data.location, data.category, userId, now, now);

    const created = await this.getById(id);
    if (!created) throw new Error("Failed to create event");
    return created;
  }

  async update(id: string, userId: string, data: EventUpdateInput): Promise<EventResponse | null> {
    const db = getDb();

    // Check ownership
    const existing = db.prepare("SELECT * FROM Events WHERE id = ? AND user_id = ?").get(id, userId) as any;
    if (!existing) return null;

    const now = new Date().toISOString();
    const sets: string[] = ["title = ?", "description = ?", "date = ?", "location = ?", "category = ?", "updated_at = ?"];
    const values: any[] = [data.title, data.description, data.date, data.location, data.category, now];

    if (data.status !== undefined) {
      sets.push("status = ?");
      values.push(data.status);
    }

    values.push(id);
    db.prepare(`UPDATE Events SET ${sets.join(", ")} WHERE id = ?`).run(...values);

    return this.getById(id);
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const db = getDb();
    const result = db.prepare("DELETE FROM Events WHERE id = ? AND user_id = ?").run(id, userId);
    return result.changes > 0;
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const db = getDb();

    const totalEvents = (db.prepare("SELECT COUNT(*) as count FROM Events").get() as any).count;
    const totalUsers = (db.prepare("SELECT COUNT(*) as count FROM Users").get() as any).count;
    const upcomingEvents = (db.prepare("SELECT COUNT(*) as count FROM Events WHERE status = 'Upcoming'").get() as any).count;
    const contactMessages = (db.prepare("SELECT COUNT(*) as count FROM ContactMessages").get() as any).count;

    const categoryBreakdown = db.prepare(
      "SELECT category, COUNT(*) as count FROM Events GROUP BY category ORDER BY count DESC"
    ).all() as any[];

    const recentEvents = db.prepare(`
      SELECT e.*, u.name as user_name
      FROM Events e
      JOIN Users u ON e.user_id = u.id
      ORDER BY e.created_at DESC
      LIMIT 5
    `).all() as any[];

    return {
      totalEvents,
      totalUsers,
      upcomingEvents,
      contactMessages,
      categoryBreakdown: categoryBreakdown.map((c) => ({ category: c.category, count: c.count })),
      recentEvents: recentEvents.map((e) => this.mapToResponse(e)),
    };
  }

  private mapToResponse(event: any): EventResponse {
    return {
      id: event.id,
      title: event.title,
      description: event.description,
      date: event.date,
      location: event.location,
      category: event.category,
      status: event.status,
      userId: event.user_id,
      userName: event.user_name || "Unknown",
      createdAt: event.created_at,
      updatedAt: event.updated_at,
    };
  }
}
