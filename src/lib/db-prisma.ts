import { prisma } from './prisma';
import { nanoid } from 'nanoid';

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
  const existingUser = await prisma.user.findUnique({
    where: { phoneNumber }
  });
  
  if (existingUser) {
    if (displayName && !existingUser.displayName) {
      return await prisma.user.update({
        where: { id: existingUser.id },
        data: { displayName, stytchUserId }
      });
    }
    return existingUser;
  }
  
  return await prisma.user.create({
    data: {
      phoneNumber,
      stytchUserId,
      displayName
    }
  });
}

// Event functions
function generateJoinCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function createEvent(
  creatorUserId: number,
  name: string,
  eventDate: string,
  description?: string,
  location?: string
) {
  const eventId = nanoid();
  const eventCode = nanoid(8).toUpperCase();
  const joinCode = generateJoinCode();
  
  const event = await prisma.event.create({
    data: {
      id: eventId,
      name,
      description,
      eventCode,
      joinCode,
      creatorId: creatorUserId,
      eventDate: new Date(eventDate),
      location
    }
  });
  
  // Creator automatically joins the event
  await joinEvent(creatorUserId, eventCode);
  
  return { id: eventId, event_code: eventCode, join_code: joinCode, name };
}

export async function getEventByCode(eventCode: string) {
  return await prisma.event.findUnique({
    where: { eventCode }
  });
}

export async function getEventByJoinCode(joinCode: string) {
  return await prisma.event.findUnique({
    where: { joinCode }
  });
}

export async function joinEvent(userId: number, eventCode: string) {
  const event = await getEventByCode(eventCode);
  if (!event) throw new Error('Event not found');
  
  try {
    const participant = await prisma.eventParticipant.create({
      data: {
        userId,
        eventId: event.id
      }
    });
    
    // Initialize hole scores
    const holeScores = Array.from({ length: 9 }, (_, i) => ({
      participantId: participant.id,
      holeNumber: i + 1
    }));
    
    await prisma.holeScore.createMany({
      data: holeScores
    });
    
    return true;
  } catch (error: any) {
    if (error.code === 'P2002') {
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
  const participant = await prisma.eventParticipant.findUnique({
    where: {
      userId_eventId: {
        userId,
        eventId
      }
    }
  });
  
  if (!participant) throw new Error('Not a participant in this event');
  
  await prisma.holeScore.update({
    where: {
      participantId_holeNumber: {
        participantId: participant.id,
        holeNumber
      }
    },
    data: {
      strokes,
      hotDogsConsumed: hotDogs,
      beersConsumed: beers,
      beerType
    }
  });
  
  await updateEventTotalScore(participant.id);
  
  return participant.id;
}

async function updateEventTotalScore(participantId: number) {
  const scores = await prisma.holeScore.findMany({
    where: { participantId }
  });
  
  let totalScore = 0;
  let strokesTotal = 0;
  let hotDogsTotal = 0;
  let beersTotal = 0;
  
  for (const score of scores) {
    if (score.strokes) strokesTotal += score.strokes;
    hotDogsTotal += score.hotDogsConsumed;
    beersTotal += score.beersConsumed;
  }
  
  // Scoring: strokes + 5 points per hot dog/beer away from 9
  totalScore = strokesTotal + Math.abs(9 - hotDogsTotal) * 5 + Math.abs(9 - beersTotal) * 5;
  
  await prisma.eventParticipant.update({
    where: { id: participantId },
    data: { totalScore }
  });
}

// Leaderboard
export async function getEventLeaderboard(eventId: string) {
  const participants = await prisma.eventParticipant.findMany({
    where: { eventId },
    include: {
      user: true,
      holeScores: true,
      kudos: true
    },
    orderBy: { totalScore: 'asc' }
  });
  
  return participants.map(participant => ({
    participant_id: participant.id,
    display_name: participant.user.displayName,
    phone_number: participant.user.phoneNumber,
    total_score: participant.totalScore,
    total_strokes: participant.holeScores.reduce((sum, score) => sum + (score.strokes || 0), 0),
    total_hot_dogs: participant.holeScores.reduce((sum, score) => sum + score.hotDogsConsumed, 0),
    total_beers: participant.holeScores.reduce((sum, score) => sum + score.beersConsumed, 0),
    total_kudos: participant.kudos.length
  }));
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
  await prisma.mediaUpload.create({
    data: {
      eventId,
      userId,
      participantId,
      holeNumber,
      mediaType,
      r2Key,
      r2Url,
      thumbnailUrl,
      caption
    }
  });
}

export async function getEventMedia(eventId: string, limit: number = 50) {
  const media = await prisma.mediaUpload.findMany({
    where: { eventId },
    include: { user: true },
    orderBy: { uploadedAt: 'desc' },
    take: limit
  });
  
  return media.map(m => ({
    ...m,
    display_name: m.user.displayName,
    phone_number: m.user.phoneNumber
  }));
}

// Kudos functions
export async function giveKudos(
  eventId: string,
  participantId: number,
  kudosType: string,
  sessionId: string
) {
  try {
    await prisma.kudos.create({
      data: {
        eventId,
        participantId,
        kudosType,
        sessionId
      }
    });
    return true;
  } catch (error: any) {
    if (error.code === 'P2002') {
      return false; // Already gave this kudos
    }
    throw error;
  }
}

export async function getParticipantKudos(participantId: number) {
  const kudos = await prisma.kudos.groupBy({
    by: ['kudosType'],
    where: { participantId },
    _count: { kudosType: true },
    orderBy: { _count: { kudosType: 'desc' } }
  });
  
  return kudos.map(k => ({
    kudos_type: k.kudosType,
    count: k._count.kudosType
  }));
}

export async function getEventTopKudos(eventId: string) {
  const topKudos = await prisma.kudos.groupBy({
    by: ['participantId', 'kudosType'],
    where: { eventId },
    _count: { kudosType: true },
    orderBy: { _count: { kudosType: 'desc' } },
    take: 10
  });
  
  const participantIds = [...new Set(topKudos.map(k => k.participantId))];
  const participants = await prisma.eventParticipant.findMany({
    where: { id: { in: participantIds } },
    include: { user: true }
  });
  
  const participantMap = new Map(participants.map(p => [p.id, p]));
  
  return topKudos.map(k => {
    const participant = participantMap.get(k.participantId);
    return {
      participant_id: k.participantId,
      display_name: participant?.user.displayName,
      phone_number: participant?.user.phoneNumber,
      kudos_type: k.kudosType,
      kudos_count: k._count.kudosType
    };
  });
}

export async function getParticipantScores(userId: number, eventId: string) {
  const participant = await prisma.eventParticipant.findUnique({
    where: {
      userId_eventId: { userId, eventId }
    },
    include: { holeScores: { orderBy: { holeNumber: 'asc' } } }
  });
  
  if (!participant) return [];
  
  return participant.holeScores.map(score => ({
    hole_number: score.holeNumber,
    strokes: score.strokes,
    hot_dogs_consumed: score.hotDogsConsumed,
    beers_consumed: score.beersConsumed,
    beer_type: score.beerType
  }));
}