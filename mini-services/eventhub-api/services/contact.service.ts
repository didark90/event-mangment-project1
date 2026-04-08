import { getDb } from "../config/database.js";
import type { IContactService } from "../interfaces/index.js";
import type { ContactInput, ContactResponse } from "../dto/contact.dto.js";

export class ContactService implements IContactService {
  async submitMessage(data: ContactInput): Promise<ContactResponse> {
    const db = getDb();
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    db.prepare(
      "INSERT INTO ContactMessages (id, name, email, subject, message, created_at) VALUES (?, ?, ?, ?, ?, ?)"
    ).run(id, data.name, data.email, data.subject, data.message, now);

    return { id, name: data.name, message: "Your message has been sent successfully!" };
  }
}
