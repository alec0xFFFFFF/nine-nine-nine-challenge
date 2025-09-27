// Simple in-memory session store for OTP phone_ids
// In production, use Redis or database storage

interface OTPSession {
  phoneId: string;
  userId?: string;
  phoneNumber: string;
  createdAt: number;
}

class SessionStore {
  private sessions = new Map<string, OTPSession>();
  private readonly TTL = 15 * 60 * 1000; // 15 minutes

  // Store phone_id from send OTP response
  store(phoneNumber: string, phoneId: string, userId?: string): string {
    // Create a temporary session key
    const sessionKey = `otp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    this.sessions.set(sessionKey, {
      phoneId,
      userId,
      phoneNumber,
      createdAt: Date.now()
    });

    // Clean up expired sessions
    this.cleanup();

    return sessionKey;
  }

  // Retrieve session data for verification
  retrieve(phoneNumber: string): OTPSession | null {
    // Find the most recent session for this phone number
    let latestSession: OTPSession | null = null;
    let latestTime = 0;

    for (const [_, session] of this.sessions) {
      if (session.phoneNumber === phoneNumber && session.createdAt > latestTime) {
        latestSession = session;
        latestTime = session.createdAt;
      }
    }

    if (!latestSession || Date.now() - latestSession.createdAt > this.TTL) {
      return null;
    }

    return latestSession;
  }

  // Clean up expired sessions
  private cleanup() {
    const now = Date.now();
    for (const [key, session] of this.sessions) {
      if (now - session.createdAt > this.TTL) {
        this.sessions.delete(key);
      }
    }
  }

  // Remove session after successful verification
  remove(phoneNumber: string) {
    for (const [key, session] of this.sessions) {
      if (session.phoneNumber === phoneNumber) {
        this.sessions.delete(key);
      }
    }
  }
}

export const sessionStore = new SessionStore();