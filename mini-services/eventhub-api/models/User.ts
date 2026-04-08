export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: "User" | "Admin";
  created_at: string;
  updated_at: string;
}

// Public user (no password)
export type PublicUser = Omit<User, "password_hash">;
