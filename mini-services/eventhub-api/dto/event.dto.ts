import { z } from "zod";

export const eventCreateSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title cannot exceed 200 characters"),
  description: z.string().min(1, "Description is required"),
  date: z.string().min(1, "Date is required").transform((v) => new Date(v).toISOString()),
  location: z.string().min(1, "Location is required").max(200),
  category: z.enum(["Conference", "Workshop", "Meetup", "Webinar", "Social", "Concert"], {
    errorMap: () => ({ message: "Invalid category" }),
  }),
});

export type EventCreateInput = z.infer<typeof eventCreateSchema>;

export const eventUpdateSchema = eventCreateSchema.extend({
  status: z.enum(["Upcoming", "Ongoing", "Completed", "Cancelled"]).optional(),
});

export type EventUpdateInput = z.infer<typeof eventUpdateSchema>;

export interface EventResponse {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  category: string;
  status: string;
  userId: string;
  userName: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventListResponse {
  totalCount: number;
  page: number;
  pageSize: number;
  events: EventResponse[];
}

export interface DashboardStats {
  totalEvents: number;
  totalUsers: number;
  upcomingEvents: number;
  contactMessages: number;
  categoryBreakdown: { category: string; count: number }[];
  recentEvents: EventResponse[];
}
