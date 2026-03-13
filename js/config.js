// config.js — קבועים והגדרות משחק

export const COLORS = {
  background: '#0a0020',
  backgroundGradient: '#1a0040',
  cyan: '#00ffff',
  magenta: '#ff00ff',
  green: '#39ff14',
  gold: '#ffd700',
  red: '#ff0040',
  white: '#ffffff',
  dimWhite: 'rgba(255,255,255,0.6)',
  overlay: 'rgba(10,0,32,0.85)',
};

export const SHIP_COLORS = [
  { name: 'צִיאָן', color: COLORS.cyan },
  { name: 'מָגֶ\'נְטָה', color: COLORS.magenta },
  { name: 'יָרֹק', color: COLORS.green },
  { name: 'זָהָב', color: COLORS.gold },
];

export const DIFFICULTY_LEVELS = {
  1: {
    name: 'כִּתָּה א\'',
    label: 'א\'',
    addition: { min: 1, max: 30 },
    subtraction: { min: 1, max: 20 },
    multiplication: null,
    comparison: { min: 1, max: 30 },
    sequence: { steps: [1, 2], max: 30 },
    words: 'easy',
    timePerPuzzle: 30,
  },
  2: {
    name: 'כִּתָּה ב\'',
    label: 'ב\'',
    addition: { min: 1, max: 80 },
    subtraction: { min: 1, max: 50 },
    multiplication: { min: 1, max: 7 },
    comparison: { min: 1, max: 80 },
    sequence: { steps: [2, 3, 5], max: 80 },
    words: 'medium',
    timePerPuzzle: 25,
  },
  3: {
    name: 'כִּתָּה ג\'',
    label: 'ג\'',
    addition: { min: 1, max: 150 },
    subtraction: { min: 1, max: 150 },
    multiplication: { min: 1, max: 12 },
    comparison: { min: 1, max: 150 },
    sequence: { steps: [2, 3, 5, 10], max: 150 },
    words: 'hard',
    timePerPuzzle: 20,
  },
};

export const PUZZLE_TYPES = {
  addition: { id: 'addition', name: 'חִיבּוּר', icon: '➕', availableFrom: 1 },
  subtraction: { id: 'subtraction', name: 'חִיסּוּר', icon: '➖', availableFrom: 1 },
  multiplication: { id: 'multiplication', name: 'כֶּפֶל', icon: '✖️', availableFrom: 2 },
  comparison: { id: 'comparison', name: 'הַשְׁוָאָה', icon: '⚖️', availableFrom: 1 },
  sequence: { id: 'sequence', name: 'סִדְרוֹת', icon: '🔢', availableFrom: 1 },
  words: { id: 'words', name: 'מִלִּים', icon: '📖', availableFrom: 1 },
};

// Station difficulty scaling — station 1 (warm-up) to station 5 (hardest)
// Steeper curve: station 1 is easy, station 5 is a real challenge
export const STATION_SCALE = [0.3, 0.5, 0.7, 0.9, 1.0];
export const STATION_TIME_OFFSET = [4, 2, 0, -2, -4]; // seconds: +4 for station 1, -4 for station 5

export const GAME_SETTINGS = {
  totalStations: 5,
  puzzlesPerStation: 3,
  canvasMaxWidth: 1200,
  canvasMaxHeight: 675,
  minTouchTarget: 60,
  scorePerCorrect: 100,
  timeBonusMultiplier: 5,
  boostSpeed: 2.0,
  normalSpeed: 1.0,
  brakeSpeed: 0.5,
  streakBonusThreshold: 3,
  streakBonusMultiplier: 1.5,
};

export const PUZZLE_TYPE_MULTIPLIERS = {
  addition: 1.0,
  subtraction: 1.1,
  comparison: 1.0,
  sequence: 1.3,
  multiplication: 1.5,
  words: 1.2,
};

export const MEDAL_THRESHOLDS = {
  gold: 0.8,
  silver: 0.6,
  bronze: 0.4,
};

export const AI_OPPONENTS = [
  {
    name: 'זְרִיזוֹן',
    color: '#ff4444',       // red — distinct from player colors
    speed: 1.3,
    accuracy: 0.65,
    description: 'מָהִיר אֲבָל לִפְעָמִים טוֹעֶה',
  },
  {
    name: 'חַכְמוֹלִי',
    color: '#ff8800',       // orange — distinct from player and other AI
    speed: 0.85,
    accuracy: 0.92,
    description: 'אִיטִי אֲבָל דַּיְקָן',
  },
];

export const STATION_THEMES = [
  {
    name: 'ערפילית הפתיחה',
    bgGradient: ['#0a0020', '#0d0035'],
    nebulaColor: 'rgba(0, 100, 255, 0.06)',
    starTint: '#aaccff',
    accentColor: '#00aaff',
    musicNotes: [130.81, 164.81, 196.00, 261.63],
    musicTempo: 1.0,
  },
  {
    name: 'שדה האסטרואידים',
    bgGradient: ['#0a0520', '#1a0030'],
    nebulaColor: 'rgba(160, 50, 255, 0.06)',
    starTint: '#ddaaff',
    accentColor: '#cc55ff',
    musicNotes: [146.83, 174.61, 220.00, 293.66],
    musicTempo: 1.15,
  },
  {
    name: 'הענן הירוק',
    bgGradient: ['#001a0a', '#002a15'],
    nebulaColor: 'rgba(50, 255, 100, 0.05)',
    starTint: '#aaffcc',
    accentColor: '#33ff77',
    musicNotes: [164.81, 196.00, 246.94, 329.63],
    musicTempo: 1.05,
  },
  {
    name: 'סופת השמש',
    bgGradient: ['#1a0800', '#2a0e00'],
    nebulaColor: 'rgba(255, 120, 30, 0.07)',
    starTint: '#ffddaa',
    accentColor: '#ff8833',
    musicNotes: [196.00, 246.94, 293.66, 392.00],
    musicTempo: 1.25,
  },
  {
    name: 'שער הגלקסיה',
    bgGradient: ['#0a001a', '#1a0040'],
    nebulaColor: 'rgba(255, 50, 200, 0.07)',
    starTint: '#ffaaee',
    accentColor: '#ff44cc',
    musicNotes: [220.00, 261.63, 329.63, 440.00],
    musicTempo: 1.35,
  },
];
