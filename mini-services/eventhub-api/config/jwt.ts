import jwt from "jsonwebtoken";

const JWT_SECRET = "EventHub_SuperSecretKey_ThatIsAtLeast32Chars!!";
const JWT_EXPIRES_IN = "24h";

export interface JwtPayload {
  userId: string;
  email: string;
  name: string;
  role: string;
}

export function generateToken(user: {
  id: string;
  email: string;
  name: string;
  role: string;
}): string {
  return jwt.sign(
    { userId: user.id, email: user.email, name: user.name, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

export function getJwtExpiresIn(): string {
  return JWT_EXPIRES_IN;
}
