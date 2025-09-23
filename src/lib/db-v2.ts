import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { nanoid } from 'nanoid';
import path from 'path';

let db: any = null;

export async function getDb() {
  if (!db) {
    db = await open({
      filename: path.join(process.cwd(), 'nine-nine-nine-v2.db'),
      driver: sqlite3.Database
    });

    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        phone_number TEXT UNIQUE NOT NULL,
        display_name TEXT,
        stytch_user_id TEXT UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        event_code TEXT UNIQUE NOT NULL,
        creator_user_id INTEGER NOT NULL,
        event_date DATE NOT NULL,
        location TEXT,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (creator_user_id) REFERENCES users (id)
      );

      CREATE TABLE IF NOT EXISTS event_participants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        event_id TEXT NOT NULL,
        total_score INTEGER DEFAULT 0,
        joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (event_id) REFERENCES events (id),
        UNIQUE(user_id, event_id)
      );

      CREATE TABLE IF NOT EXISTS hole_scores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        participant_id INTEGER NOT NULL,
        hole_number INTEGER NOT NULL,
        strokes INTEGER,
        hot_dogs_consumed INTEGER DEFAULT 0,
        beers_consumed INTEGER DEFAULT 0,
        beer_type TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (participant_id) REFERENCES event_participants (id),
        UNIQUE(participant_id, hole_number)
      );

      CREATE TABLE IF NOT EXISTS media_uploads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id TEXT NOT NULL,
        user_id INTEGER NOT NULL,
        participant_id INTEGER,
        hole_number INTEGER,
        media_type TEXT NOT NULL,
        r2_key TEXT NOT NULL,
        r2_url TEXT NOT NULL,
        thumbnail_url TEXT,
        caption TEXT,
        uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (event_id) REFERENCES events (id),
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (participant_id) REFERENCES event_participants (id)
      );

      CREATE TABLE IF NOT EXISTS kudos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id TEXT NOT NULL,
        participant_id INTEGER NOT NULL,
        kudos_type TEXT NOT NULL,
        session_id TEXT NOT NULL,
        given_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (event_id) REFERENCES events (id),
        FOREIGN KEY (participant_id) REFERENCES event_participants (id),
        UNIQUE(session_id, participant_id, kudos_type)
      );

      CREATE INDEX IF NOT EXISTS idx_events_code ON events(event_code);
      CREATE INDEX IF NOT EXISTS idx_media_event ON media_uploads(event_id);
      CREATE INDEX IF NOT EXISTS idx_kudos_participant ON kudos(participant_id);
    `);
  }
  return db;
}

// Funny kudos types for the 9/9/9 challenge
export const KUDOS_TYPES = {
  GLIZZY_GLADIATOR: { 
    emoji: '🌭', 
    name: 'Glizzy Gladiator',
    description: 'Dominating the hot dog game'
  },
  BREW_MASTER: { 
    emoji: '🍺', 
    name: 'Brew Master',
    description: 'Keeping the beer pace like a champ'
  },
  SAND_TRAP_WARRIOR: { 
    emoji: '⛳', 
    name: 'Sand Trap Warrior',
    description: 'Making bunkers look easy'
  },
  DOUBLE_FISTING_LEGEND: { 
    emoji: '🍻', 
    name: 'Double Fisting Legend',
    description: 'Two beers, no problem'
  },
  FRANKLY_AMAZING: { 
    emoji: '🎯', 
    name: 'Frankly Amazing',
    description: 'Hot dog consumption on point'
  },
  CART_GIRL_FAVORITE: { 
    emoji: '🛒', 
    name: 'Cart Girl\'s Favorite',
    description: 'Single-handedly funding the beverage cart'
  },
  MULLIGAN_KING: { 
    emoji: '👑', 
    name: 'Mulligan King',
    description: 'Rules are more like guidelines'
  },
  BIRDIE_JUICE: { 
    emoji: '🦅', 
    name: 'Birdie Juice',
    description: 'Playing better with each beer'
  },
  WIENER_WINNER: { 
    emoji: '🏆', 
    name: 'Wiener Winner',
    description: 'Undefeated hot dog champion'
  },
  GRIP_IT_AND_SIP_IT: { 
    emoji: '🏌️', 
    name: 'Grip It & Sip It',
    description: 'Never missing a sip or a swing'
  }
};

// User functions
export async function createOrUpdateUser(phoneNumber: string, stytchUserId: string, displayName?: string) {
  const db = await getDb();
  
  const existing = await db.get('SELECT * FROM users WHERE phone_number = ?', phoneNumber);
  
  if (existing) {
    if (displayName && !existing.display_name) {
      await db.run(
        'UPDATE users SET display_name = ?, stytch_user_id = ? WHERE id = ?',
        displayName, stytchUserId, existing.id
      );
    }
    return existing;
  }
  
  const result = await db.run(
    'INSERT INTO users (phone_number, stytch_user_id, display_name) VALUES (?, ?, ?)',
    phoneNumber, stytchUserId, displayName
  );
  
  return { id: result.lastID, phone_number: phoneNumber, display_name: displayName };
}

// Event functions
export async function createEvent(
  creatorUserId: number,
  name: string,
  eventDate: string,
  description?: string,
  location?: string
) {
  const db = await getDb();
  const eventId = nanoid();
  const eventCode = nanoid(8).toUpperCase();
  
  await db.run(
    'INSERT INTO events (id, name, description, event_code, creator_user_id, event_date, location) VALUES (?, ?, ?, ?, ?, ?, ?)',
    eventId, name, description, eventCode, creatorUserId, eventDate, location
  );
  
  // Creator automatically joins the event
  await joinEvent(creatorUserId, eventCode);
  
  return { id: eventId, event_code: eventCode, name };
}

export async function getEventByCode(eventCode: string) {
  const db = await getDb();
  return await db.get('SELECT * FROM events WHERE event_code = ?', eventCode);
}

export async function joinEvent(userId: number, eventCode: string) {
  const db = await getDb();
  
  const event = await getEventByCode(eventCode);
  if (!event) throw new Error('Event not found');
  
  try {
    await db.run(
      'INSERT INTO event_participants (user_id, event_id) VALUES (?, ?)',
      userId, event.id
    );
    
    const participant = await db.get(
      'SELECT id FROM event_participants WHERE user_id = ? AND event_id = ?',
      userId, event.id
    );
    
    // Initialize hole scores
    for (let i = 1; i <= 9; i++) {
      await db.run(
        'INSERT INTO hole_scores (participant_id, hole_number) VALUES (?, ?)',
        participant.id, i
      );
    }
    
    return true;
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT') {
      return false; // Already joined
    }
    throw error;
  }
}

// Score functions
export async function updateEventHoleScore(
  userId: number,
  eventId: string,
  holeNumber: number,
  strokes: number | null,
  hotDogs: number,
  beers: number,
  beerType?: string
) {
  const db = await getDb();
  
  const participant = await db.get(
    'SELECT id FROM event_participants WHERE user_id = ? AND event_id = ?',
    userId, eventId
  );
  
  if (!participant) throw new Error('Not a participant in this event');
  
  await db.run(`
    UPDATE hole_scores 
    SET strokes = ?, hot_dogs_consumed = ?, beers_consumed = ?, beer_type = ?, updated_at = CURRENT_TIMESTAMP
    WHERE participant_id = ? AND hole_number = ?
  `, strokes, hotDogs, beers, beerType, participant.id, holeNumber);
  
  await updateEventTotalScore(participant.id);
  
  return participant.id;
}

async function updateEventTotalScore(participantId: number) {
  const db = await getDb();
  
  const scores = await db.all(
    'SELECT strokes, hot_dogs_consumed, beers_consumed FROM hole_scores WHERE participant_id = ?',
    participantId
  );
  
  let totalScore = 0;
  let strokesTotal = 0;
  let hotDogsTotal = 0;
  let beersTotal = 0;
  
  for (const score of scores) {
    if (score.strokes) strokesTotal += score.strokes;
    hotDogsTotal += score.hot_dogs_consumed || 0;
    beersTotal += score.beers_consumed || 0;
  }
  
  // Scoring: strokes + 5 points per hot dog/beer away from 9
  totalScore = strokesTotal + Math.abs(9 - hotDogsTotal) * 5 + Math.abs(9 - beersTotal) * 5;
  
  await db.run(
    'UPDATE event_participants SET total_score = ? WHERE id = ?',
    totalScore, participantId
  );
}

// Leaderboard
export async function getEventLeaderboard(eventId: string) {
  const db = await getDb();
  
  return await db.all(`
    SELECT 
      u.phone_number,
      u.display_name,
      p.id as participant_id,
      p.total_score,
      (SELECT SUM(strokes) FROM hole_scores WHERE participant_id = p.id) as total_strokes,
      (SELECT SUM(hot_dogs_consumed) FROM hole_scores WHERE participant_id = p.id) as total_hot_dogs,
      (SELECT SUM(beers_consumed) FROM hole_scores WHERE participant_id = p.id) as total_beers,
      (SELECT COUNT(*) FROM kudos WHERE participant_id = p.id) as total_kudos
    FROM event_participants p
    JOIN users u ON p.user_id = u.id
    WHERE p.event_id = ?
    ORDER BY p.total_score ASC
  `, eventId);
}

// Media functions
export async function saveMediaUpload(
  eventId: string,
  userId: number,
  participantId: number | null,
  mediaType: 'photo' | 'video',
  r2Key: string,
  r2Url: string,
  thumbnailUrl?: string,
  caption?: string,
  holeNumber?: number
) {
  const db = await getDb();
  
  await db.run(
    `INSERT INTO media_uploads 
    (event_id, user_id, participant_id, hole_number, media_type, r2_key, r2_url, thumbnail_url, caption) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    eventId, userId, participantId, holeNumber, mediaType, r2Key, r2Url, thumbnailUrl, caption
  );
}

export async function getEventMedia(eventId: string, limit: number = 50) {
  const db = await getDb();
  
  return await db.all(`
    SELECT 
      m.*,
      u.display_name,
      u.phone_number
    FROM media_uploads m
    JOIN users u ON m.user_id = u.id
    WHERE m.event_id = ?
    ORDER BY m.uploaded_at DESC
    LIMIT ?
  `, eventId, limit);
}

// Kudos functions
export async function giveKudos(
  eventId: string,
  participantId: number,
  kudosType: string,
  sessionId: string
) {
  const db = await getDb();
  
  try {
    await db.run(
      'INSERT INTO kudos (event_id, participant_id, kudos_type, session_id) VALUES (?, ?, ?, ?)',
      eventId, participantId, kudosType, sessionId
    );
    return true;
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT') {
      return false; // Already gave this kudos
    }
    throw error;
  }
}

export async function getParticipantKudos(participantId: number) {
  const db = await getDb();
  
  return await db.all(`
    SELECT kudos_type, COUNT(*) as count
    FROM kudos
    WHERE participant_id = ?
    GROUP BY kudos_type
    ORDER BY count DESC
  `, participantId);
}

export async function getEventTopKudos(eventId: string) {
  const db = await getDb();
  
  return await db.all(`
    SELECT 
      p.id as participant_id,
      u.display_name,
      u.phone_number,
      k.kudos_type,
      COUNT(*) as kudos_count
    FROM kudos k
    JOIN event_participants p ON k.participant_id = p.id
    JOIN users u ON p.user_id = u.id
    WHERE k.event_id = ?
    GROUP BY p.id, k.kudos_type
    ORDER BY kudos_count DESC
    LIMIT 10
  `, eventId);
}