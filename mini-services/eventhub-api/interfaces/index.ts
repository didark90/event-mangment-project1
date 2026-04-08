import type { PublicUser } from "../models/User.js";
import type { EventResponse, EventListResponse, DashboardStats } from "../dto/event.dto.js";
import type { EventCreateInput, EventUpdateInput } from "../dto/event.dto.js";
import type { RegisterInput, LoginInput, RegisterResponse, LoginResponse } from "../dto/auth.dto.js";
import type { ContactInput, ContactResponse } from "../dto/contact.dto.js";

export interface IAuthService {
  register(data: RegisterInput): Promise<RegisterResponse>;
  login(data: LoginInput): Promise<LoginResponse | null>;
  getUserById(id: string): Promise<PublicUser | null>;
}

export interface IEventService {
  getAll(category?: string, page?: number, pageSize?: number): Promise<EventListResponse>;
  getById(id: string): Promise<EventResponse | null>;
  create(userId: string, data: EventCreateInput): Promise<EventResponse>;
  update(id: string, userId: string, data: EventUpdateInput): Promise<EventResponse | null>;
  delete(id: string, userId: string): Promise<boolean>;
  getDashboardStats(): Promise<DashboardStats>;
}

export interface IContactService {
  submitMessage(data: ContactInput): Promise<ContactResponse>;
}
