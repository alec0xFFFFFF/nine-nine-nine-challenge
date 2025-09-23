import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcryptjs';
import path from 'path';

let db: any = null;

export async function getDb() {
  if (!db) {
    db = await open({
      filename: path.join(process.cwd(), 'nine-nine-nine.db'),
      driver: sqlite3.Database
    });

    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS competitions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        date DATE NOT NULL,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS participants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        competition_id INTEGER NOT NULL,
        total_score INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (competition_id) REFERENCES competitions (id),
        UNIQUE(user_id, competition_id)
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
        FOREIGN KEY (participant_id) REFERENCES participants (id),
        UNIQUE(participant_id, hole_number)
      );
    `);
  }
  return db;
}

export async function createUser(username: string, password: string) {
  const db = await getDb();
  const hashedPassword = await bcrypt.hash(password, 10);
  
  try {
    const result = await db.run(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      username, hashedPassword
    );
    return { id: result.lastID, username };
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT') {
      throw new Error('Username already exists');
    }
    throw error;
  }
}

export async function validateUser(username: string, password: string) {
  const db = await getDb();
  const user = await db.get('SELECT * FROM users WHERE username = ?', username);
  
  if (!user) return null;
  
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return null;
  
  return { id: user.id, username: user.username };
}

export async function getOrCreateCompetition(date: string = new Date().toISOString().split('T')[0]) {
  const db = await getDb();
  
  let competition = await db.get('SELECT * FROM competitions WHERE date = ?', date);
  
  if (!competition) {
    const result = await db.run(
      'INSERT INTO competitions (name, date) VALUES (?, ?)',
      `9/9/9 Challenge - ${date}`, date
    );
    competition = { id: result.lastID, name: `9/9/9 Challenge - ${date}`, date };
  }
  
  return competition;
}

export async function joinCompetition(userId: number, competitionId: number) {
  const db = await getDb();
  
  try {
    await db.run(
      'INSERT INTO participants (user_id, competition_id) VALUES (?, ?)',
      userId, competitionId
    );
    
    for (let i = 1; i <= 9; i++) {
      await db.run(
        'INSERT INTO hole_scores (participant_id, hole_number) VALUES ((SELECT id FROM participants WHERE user_id = ? AND competition_id = ?), ?)',
        userId, competitionId, i
      );
    }
    
    return true;
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT') {
      return false;
    }
    throw error;
  }
}

export async function updateHoleScore(
  userId: number,
  competitionId: number,
  holeNumber: number,
  strokes: number | null,
  hotDogs: number,
  beers: number,
  beerType?: string
) {
  const db = await getDb();
  
  await db.run(`
    UPDATE hole_scores 
    SET strokes = ?, hot_dogs_consumed = ?, beers_consumed = ?, beer_type = ?, updated_at = CURRENT_TIMESTAMP
    WHERE participant_id = (SELECT id FROM participants WHERE user_id = ? AND competition_id = ?)
    AND hole_number = ?
  `, strokes, hotDogs, beers, beerType, userId, competitionId, holeNumber);
  
  await updateTotalScore(userId, competitionId);
}

async function updateTotalScore(userId: number, competitionId: number) {
  const db = await getDb();
  
  const scores = await db.all(`
    SELECT strokes, hot_dogs_consumed, beers_consumed 
    FROM hole_scores 
    WHERE participant_id = (SELECT id FROM participants WHERE user_id = ? AND competition_id = ?)
  `, userId, competitionId);
  
  let totalScore = 0;
  let strokesTotal = 0;
  let hotDogsTotal = 0;
  let beersTotal = 0;
  
  for (const score of scores) {
    if (score.strokes) strokesTotal += score.strokes;
    hotDogsTotal += score.hot_dogs_consumed || 0;
    beersTotal += score.beers_consumed || 0;
  }
  
  totalScore = strokesTotal + Math.abs(9 - hotDogsTotal) * 5 + Math.abs(9 - beersTotal) * 5;
  
  await db.run(`
    UPDATE participants 
    SET total_score = ? 
    WHERE user_id = ? AND competition_id = ?
  `, totalScore, userId, competitionId);
}

export async function getLeaderboard(competitionId: number) {
  const db = await getDb();
  
  return await db.all(`
    SELECT 
      u.username,
      p.total_score,
      (SELECT SUM(strokes) FROM hole_scores WHERE participant_id = p.id) as total_strokes,
      (SELECT SUM(hot_dogs_consumed) FROM hole_scores WHERE participant_id = p.id) as total_hot_dogs,
      (SELECT SUM(beers_consumed) FROM hole_scores WHERE participant_id = p.id) as total_beers
    FROM participants p
    JOIN users u ON p.user_id = u.id
    WHERE p.competition_id = ?
    ORDER BY p.total_score ASC
  `, competitionId);
}

export async function getParticipantScores(userId: number, competitionId: number) {
  const db = await getDb();
  
  return await db.all(`
    SELECT hole_number, strokes, hot_dogs_consumed, beers_consumed, beer_type
    FROM hole_scores
    WHERE participant_id = (SELECT id FROM participants WHERE user_id = ? AND competition_id = ?)
    ORDER BY hole_number
  `, userId, competitionId);
}