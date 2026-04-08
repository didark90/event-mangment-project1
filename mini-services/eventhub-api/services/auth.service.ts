import { getDb } from "../config/database.js";
import bcrypt from "bcryptjs";
import { generateToken, getJwtExpiresIn } from "../config/jwt.js";
import type { IAuthService } from "../interfaces/index.js";
import type { RegisterInput, LoginInput, RegisterResponse, LoginResponse } from "../dto/auth.dto.js";
import type { PublicUser } from "../models/User.js";

export class AuthService implements IAuthService {
  async register(data: RegisterInput): Promise<RegisterResponse> {
    const db = getDb();

    // Check duplicate email
    const existing = db.prepare("SELECT id FROM Users WHERE email = ?").get(data.email);
    if (existing) {
      throw new Error("Email already exists");
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const passwordHash = await bcrypt.hash(data.password, 10);

    db.prepare(
      "INSERT INTO Users (id, name, email, password_hash, role, created_at, updated_at) VALUES (?, ?, ?, ?, 'User', ?, ?)"
    ).run(id, data.name, data.email.toLowerCase(), passwordHash, now, now);

    return {
      id,
      name: data.name,
      email: data.email.toLowerCase(),
      message: "Account created successfully",
    };
  }

  async login(data: LoginInput): Promise<LoginResponse | null> {
    const db = getDb();

    const user = db.prepare("SELECT * FROM Users WHERE email = ?").get(data.email.toLowerCase()) as any;
    if (!user) return null;

    const valid = await bcrypt.compare(data.password, user.password_hash);
    if (!valid) return null;

    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    return {
      token,
      expiresIn: getJwtExpiresIn(),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async getUserById(id: string): Promise<PublicUser | null> {
    const db = getDb();
    const user = db.prepare("SELECT id, name, email, role, created_at, updated_at FROM Users WHERE id = ?").get(id) as any;
    if (!user) return null;
    return user;
  }
}
