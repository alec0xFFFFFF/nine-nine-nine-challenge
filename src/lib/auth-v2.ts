import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface AuthUser {
  userId: number;
  phoneNumber: string;
  displayName?: string;
  stytchUserId: string;
}

export async function getUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token');
  
  if (!token) return null;
  
  try {
    const decoded = jwt.verify(token.value, JWT_SECRET) as AuthUser;
    return decoded;
  } catch {
    return null;
  }
}

export function createSessionId(): string {
  // Create a unique session ID for anonymous users (spectators)
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}