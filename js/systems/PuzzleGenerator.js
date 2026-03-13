// PuzzleGenerator.js — מחולל חידות לכל 6 הסוגים

import { DIFFICULTY_LEVELS, PUZZLE_TYPES, STATION_SCALE, STATION_TIME_OFFSET } from '../config.js';
import { getRandomWord } from '../data/hebrewWords.js';

// Scale number ranges by station: station 1 = warm-up (30%), station 5 = full difficulty (100%)
// Also raises the minimum operand so later stations produce bigger numbers
function getScaledRange(cfg, type, station) {
  const base = cfg[type];
  if (!base || typeof base === 'string') return base; // words = 'easy'/'medium'/'hard'
  const scale = STATION_SCALE[Math.max(0, Math.min(station - 1, STATION_SCALE.length - 1))];
  const scaledMax = Math.max(base.min + 1, Math.floor(base.max * scale));
  // Raise the floor: station 1 keeps original min, later stations start higher
  const floorScale = Math.max(0, (station - 1) / 8); // 0, 0.125, 0.25, 0.375, 0.5
  const scaledMin = Math.max(base.min, Math.floor(scaledMax * floorScale));
  return { min: scaledMin, max: scaledMax };
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateWrongAnswers(correct, count, min, max) {
  const wrongs = new Set();
  // Close wrong answers
  const offsets = [-3, -2, -1, 1, 2, 3, -5, 5, -10, 10];
  for (const off of shuffle(offsets)) {
    const val = correct + off;
    if (val !== correct && val >= min && val <= max) {
      wrongs.add(val);
    }
    if (wrongs.size >= count) break;
  }
  // Fill remaining with random
  let attempts = 0;
  while (wrongs.size < count && attempts < 50) {
    const val = randInt(Math.max(min, correct - 15), Math.min(max, correct + 15));
    if (val !== correct) wrongs.add(val);
    attempts++;
  }
  return [...wrongs].slice(0, count);
}

function buildPuzzle(type, question, questionDisplay, correct, options, correctIndex, level, timeLimit) {
  return {
    type,
    question,
    questionDisplay,
    options,
    correctIndex,
    difficulty: level,
    timeLimit,
  };
}

// === חיבור ===
function generateAddition(level, station) {
  const cfg = DIFFICULTY_LEVELS[level];
  if (!cfg.addition) return null;

  const { min, max } = getScaledRange(cfg, 'addition', station);
  // Pick a target sum first (between min*2 and max), then split it into two operands
  const targetMin = min + min;
  const targetMax = max;
  const target = randInt(Math.min(targetMin, targetMax), targetMax);
  // Split target into a and b, both at least 1
  const aMin = Math.max(1, Math.floor(target * 0.2));
  const aMax = Math.min(target - 1, Math.floor(target * 0.8));
  const a = randInt(aMin, aMax);
  const b = target - a;
  const correct = a + b;

  const wrongs = generateWrongAnswers(correct, 3, 0, max + 10);
  const options = shuffle([correct, ...wrongs]);
  const correctIndex = options.indexOf(correct);

  const timeLimit = cfg.timePerPuzzle + STATION_TIME_OFFSET[station - 1];
  return buildPuzzle(
    'addition',
    `${a} + ${b} = ?`,
    `${a} + ${b}`,
    correct,
    options,
    correctIndex,
    level,
    timeLimit,
  );
}

// === חיסור ===
function generateSubtraction(level, station) {
  const cfg = DIFFICULTY_LEVELS[level];
  if (!cfg.subtraction) return null;

  const { min, max } = getScaledRange(cfg, 'subtraction', station);
  // a is big (upper half of range), b is from min up to a
  const lowerBound = Math.max(min, Math.floor(max / 2));
  const a = randInt(lowerBound, max);
  const b = randInt(min, a); // ensure positive result
  const correct = a - b;

  const wrongs = generateWrongAnswers(correct, 3, 0, max);
  const options = shuffle([correct, ...wrongs]);
  const correctIndex = options.indexOf(correct);

  const timeLimit = cfg.timePerPuzzle + STATION_TIME_OFFSET[station - 1];
  return buildPuzzle(
    'subtraction',
    `${a} - ${b} = ?`,
    `${a} - ${b}`,
    correct,
    options,
    correctIndex,
    level,
    timeLimit,
  );
}

// === כפל ===
function generateMultiplication(level, station) {
  const cfg = DIFFICULTY_LEVELS[level];
  if (!cfg.multiplication) return null;

  const { min, max } = getScaledRange(cfg, 'multiplication', station);
  const a = randInt(min, max);
  const b = randInt(min, max);
  const correct = a * b;

  const wrongs = generateWrongAnswers(correct, 3, 0, (max * max) + 10);
  const options = shuffle([correct, ...wrongs]);
  const correctIndex = options.indexOf(correct);

  const timeLimit = cfg.timePerPuzzle + STATION_TIME_OFFSET[station - 1];
  return buildPuzzle(
    'multiplication',
    `${a} × ${b} = ?`,
    `${a} × ${b}`,
    correct,
    options,
    correctIndex,
    level,
    timeLimit,
  );
}

// === השוואת מספרים ===
function generateComparison(level, station) {
  const cfg = DIFFICULTY_LEVELS[level];
  if (!cfg.comparison) return null;

  const { min, max } = getScaledRange(cfg, 'comparison', station);
  const a = randInt(min, max);
  let b;
  do { b = randInt(min, max); } while (b === a);

  const askBigger = Math.random() > 0.5;
  const question = askBigger
    ? `מִי גָּדוֹל יוֹתֵר?\n${a}  אוֹ  ${b}`
    : `מִי קָטָן יוֹתֵר?\n${a}  אוֹ  ${b}`;
  const questionDisplay = askBigger ? 'מִי גָּדוֹל יוֹתֵר?' : 'מִי קָטָן יוֹתֵר?';

  const correct = askBigger ? Math.max(a, b) : Math.min(a, b);

  // Options: the two numbers plus 2 distractors from the same range
  const distractor1 = randInt(min, max);
  let distractor2;
  do { distractor2 = randInt(min, max); } while (distractor2 === distractor1 || distractor2 === a || distractor2 === b);

  const optionsSet = new Set([a, b, distractor1, distractor2]);
  let options = [...optionsSet].slice(0, 4);
  if (options.length < 4) {
    while (options.length < 4) {
      const extra = randInt(min, max);
      if (!options.includes(extra)) options.push(extra);
    }
  }
  options = shuffle(options);
  const correctIndex = options.indexOf(correct);

  const timeLimit = cfg.timePerPuzzle + STATION_TIME_OFFSET[station - 1];
  return buildPuzzle(
    'comparison',
    question,
    questionDisplay,
    correct,
    options,
    correctIndex,
    level,
    timeLimit,
  );
}

// === סדרות מספרים ===
function generateSequence(level, station) {
  const cfg = DIFFICULTY_LEVELS[level];
  if (!cfg.sequence) return null;

  const scale = STATION_SCALE[Math.max(0, Math.min(station - 1, STATION_SCALE.length - 1))];
  const steps = cfg.sequence.steps;
  // Limit available steps by station: station 1 uses fewer step options, station 5 uses all
  const availableCount = Math.max(1, Math.ceil(steps.length * scale));
  const availableSteps = steps.slice(0, availableCount);
  const step = availableSteps[Math.floor(Math.random() * availableSteps.length)];

  const scaledMax = Math.max(step * 5 + 1, Math.floor(cfg.sequence.max * scale));
  const maxStart = Math.max(1, scaledMax - step * 5);
  const start = randInt(1, maxStart);

  // Build sequence of 4 numbers, ask for 5th
  const seq = [];
  for (let i = 0; i < 4; i++) {
    seq.push(start + step * i);
  }
  const correct = start + step * 4;

  const question = `מָה הַמִּסְפָּר הַבָּא?\n${seq.join(' , ')} , ?`;
  const questionDisplay = 'מָה הַמִּסְפָּר הַבָּא?';

  const wrongs = generateWrongAnswers(correct, 3, 0, cfg.sequence.max + 20);
  const options = shuffle([correct, ...wrongs]);
  const correctIndex = options.indexOf(correct);

  const timeLimit = cfg.timePerPuzzle + STATION_TIME_OFFSET[station - 1];
  return buildPuzzle(
    'sequence',
    question,
    questionDisplay,
    correct,
    options,
    correctIndex,
    level,
    timeLimit,
  );
}

// === תרגילי מילים ===
// Helper: split a nikud word into grapheme clusters (letter + its nikud marks)
function splitToGraphemes(word) {
  // Each grapheme is a base Hebrew letter followed by zero or more combining marks (nikud)
  // Hebrew nikud range: U+0591-U+05C7
  const graphemes = [];
  for (let i = 0; i < word.length; i++) {
    const code = word.charCodeAt(i);
    // If this is a combining mark (nikud), append to previous grapheme
    if (code >= 0x0591 && code <= 0x05C7 && graphemes.length > 0) {
      graphemes[graphemes.length - 1] += word[i];
    } else {
      graphemes.push(word[i]);
    }
  }
  return graphemes;
}

// Helper: get the base letter (without nikud) from a grapheme
function baseLetter(grapheme) {
  return grapheme.replace(/[\u0591-\u05C7]/g, '');
}

function generateWordPuzzle(level, station) {
  const cfg = DIFFICULTY_LEVELS[level];
  const wordData = getRandomWord(level);
  const word = wordData.word;

  // Split into grapheme clusters so we pick whole letters, not nikud marks
  const graphemes = splitToGraphemes(word);

  // Missing letter exercise — pick a random grapheme
  const letterIndex = randInt(0, graphemes.length - 1);
  const missingGrapheme = graphemes[letterIndex];
  const missingBase = baseLetter(missingGrapheme);

  // Build display word with underscore replacing the missing grapheme
  const displayGraphemes = [...graphemes];
  displayGraphemes[letterIndex] = '_';
  const displayWord = displayGraphemes.join('');

  const question = `הַשְׁלֵם אֶת הָאוֹת הַחֲסֵרָה:\n${displayWord}`;
  const questionDisplay = 'הַשְׁלֵם אֶת הָאוֹת הַחֲסֵרָה';

  // Generate wrong letters (base letters without nikud as answer options)
  const hebrewLetters = 'אבגדהוזחטיכלמנסעפצקרשת';
  const wrongLetters = new Set();
  let attempts = 0;
  while (wrongLetters.size < 3 && attempts < 50) {
    const letter = hebrewLetters[Math.floor(Math.random() * hebrewLetters.length)];
    if (letter !== missingBase) wrongLetters.add(letter);
    attempts++;
  }

  const options = shuffle([missingBase, ...[...wrongLetters].slice(0, 3)]);
  const correctIndex = options.indexOf(missingBase);

  const timeLimit = cfg.timePerPuzzle + STATION_TIME_OFFSET[Math.max(0, Math.min(station - 1, STATION_TIME_OFFSET.length - 1))];
  return buildPuzzle(
    'words',
    question,
    questionDisplay,
    missingBase,
    options,
    correctIndex,
    level,
    timeLimit,
  );
}

// === Main Entry Point ===
export function generatePuzzle(type, level, station = 5) {
  switch (type) {
    case 'addition': return generateAddition(level, station);
    case 'subtraction': return generateSubtraction(level, station);
    case 'multiplication': return generateMultiplication(level, station);
    case 'comparison': return generateComparison(level, station);
    case 'sequence': return generateSequence(level, station);
    case 'words': return generateWordPuzzle(level, station);
    default: return generateAddition(level, station);
  }
}

export default { generatePuzzle };
