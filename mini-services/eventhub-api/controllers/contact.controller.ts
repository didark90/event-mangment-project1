import { Request, Response } from "express";
import { ContactService } from "../services/contact.service.js";
import { contactSchema } from "../dto/contact.dto.js";

const contactService = new ContactService();

export class ContactController {
  /**
   * POST /api/contact
   * Submit a contact form message
   */
  async submit(req: Request, res: Response): Promise<void> {
    try {
      const data = contactSchema.parse(req.body);
      const result = await contactService.submitMessage(data);
      res.json(result);
    } catch (error: any) {
      if (error.errors) {
        res.status(400).json({ error: "Validation failed", details: error.errors });
        return;
      }
      res.status(400).json({ error: error.message });
    }
  }
}
