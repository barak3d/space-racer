// PuzzleGenerator.js — מחולל חידות לכל 6 הסוגים

import { DIFFICULTY_LEVELS, PUZZLE_TYPES, STATION_SCALE, STATION_TIME_OFFSET } from '../config.js';
import { getRandomWord, getAllWords, resetUsedWords } from '../data/hebrewWords.js';
import COMMON_HEBREW_WORDS from '../data/commonHebrewWords.js';

// Pre-compute base-letter forms of every word in the bank, then merge with the
// comprehensive common Hebrew words list.  This ensures that wrong-letter
// candidates never accidentally form *any* common Hebrew word — not just the
// ones that appear in the game's own word bank.
const ALL_BASE_WORD_FORMS = new Set([
  ...getAllWords().map(w => w.word.replace(/[\u0591-\u05C7]/g, '')),
  ...COMMON_HEBREW_WORDS,
]);

// Track used questions across all puzzle types within a game session
const usedQuestions = new Set();

export function resetUsedPuzzles() {
  usedQuestions.clear();
  resetUsedWords();
}

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
  // Target sum: at least 60% of max to ensure later stations are challenging
  const targetFloor = Math.floor(max * 0.6);
  const targetMin = Math.max(min + min, targetFloor);
  const target = randInt(Math.min(targetMin, max), max);
  // Split target into a and b with variety
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
  // a is always from upper 60% of range to ensure big numbers at later stations
  const aFloor = Math.max(min, Math.floor(max * 0.6));
  const a = randInt(aFloor, max);
  // b ranges from 1 up to a (ensure non-negative result)
  const b = randInt(Math.max(1, min), a);
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

// === השוואת תרגילים ===
function generateComparison(level, station) {
  const cfg = DIFFICULTY_LEVELS[level];
  if (!cfg.comparison) return null;

  const { min, max } = getScaledRange(cfg, 'comparison', station);
  const ops = cfg.comparison.ops || ['+'];
  // Pick a single operator for both expressions so the student focuses on one operation
  let op = ops[Math.floor(Math.random() * ops.length)];
  // Fall back to addition if the subtraction range is too narrow for variety
  if (op === '-' && max < min + 3) op = '+';

  let exprA, exprB, valA, valB;
  let attempts = 0;

  do {
    let a, b, c, d;
    if (op === '-') {
      // Ensure non-negative results: a > b and c > d
      a = randInt(Math.max(min + 1, 2), max);
      b = randInt(min, a - 1);
      c = randInt(Math.max(min + 1, 2), max);
      d = randInt(min, c - 1);
    } else {
      a = randInt(min, max);
      b = randInt(min, max);
      c = randInt(min, max);
      d = randInt(min, max);
    }
    valA = op === '+' ? a + b : a - b;
    valB = op === '+' ? c + d : c - d;
    exprA = `${a} ${op} ${b}`;
    exprB = `${c} ${op} ${d}`;
    attempts++;
  } while (valA === valB && attempts < 50);

  // Guaranteed fallback for the extremely rare case all attempts produced equal values
  if (valA === valB) {
    const a = randInt(min, max);
    const b = randInt(min, max);
    const adjustedB = b < max ? b + 1 : b - 1;
    exprA = `${a} + ${b}`;
    exprB = `${a} + ${adjustedB}`;
    valA = a + b;
    valB = a + adjustedB;
  }

  const askBigger = Math.random() > 0.5;
  const questionDisplay = askBigger ? 'מִי גָּדוֹל יוֹתֵר?' : 'מִי קָטָן יוֹתֵר?';
  const question = `${questionDisplay}\n${exprA}  אוֹ  ${exprB}`;

  const correctExpr = askBigger
    ? (valA > valB ? exprA : exprB)
    : (valA < valB ? exprA : exprB);

  // Options: the two expressions being compared
  const options = shuffle([exprA, exprB]);
  const correctIndex = options.indexOf(correctExpr);

  const timeLimit = cfg.timePerPuzzle + STATION_TIME_OFFSET[station - 1];
  return buildPuzzle(
    'comparison',
    question,
    questionDisplay,
    correctExpr,
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
  let availableSteps = steps.slice(0, availableCount);
  // At harder stations (4-5, scale > 0.7), drop the easiest step to force larger jumps
  if (scale > 0.7 && availableSteps.length > 1) {
    availableSteps = availableSteps.slice(1);
  }
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

  // Generate wrong letters — we pick base letters, then dress them with the
  // same nikud marks as the missing grapheme so all options look consistent.
  // Skip any candidate that would turn the blank into another known word.
  const wouldFormKnownWord = (candidate) => {
    const testBase = graphemes.map((g, i) => (i === letterIndex ? candidate : baseLetter(g))).join('');
    return ALL_BASE_WORD_FORMS.has(testBase);
  };

  const hebrewLetters = 'אבגדהוזחטיכלמנסעפצקרשת';
  const wrongLetters = new Set();
  let attempts = 0;
  while (wrongLetters.size < 3 && attempts < 100) {
    const letter = hebrewLetters[Math.floor(Math.random() * hebrewLetters.length)];
    if (letter !== missingBase && !wouldFormKnownWord(letter)) wrongLetters.add(letter);
    attempts++;
  }

  // Apply the same nikud marks to wrong letters so all options look consistent
  const nikudMarks = missingGrapheme.replace(/[^\u0591-\u05C7]/g, '');
  const wrongWithNikud = [...wrongLetters].slice(0, 3).map(l => l + nikudMarks);

  const options = shuffle([missingGrapheme, ...wrongWithNikud]);
  const correctIndex = options.indexOf(missingGrapheme);

  const timeLimit = cfg.timePerPuzzle + STATION_TIME_OFFSET[Math.max(0, Math.min(station - 1, STATION_TIME_OFFSET.length - 1))];
  return buildPuzzle(
    'words',
    question,
    questionDisplay,
    missingGrapheme,
    options,
    correctIndex,
    level,
    timeLimit,
  );
}

// For commutative operations (addition, multiplication), generate the
// swapped-operands version of the question so both orderings are treated as duplicates.
function getCommutativeQuestion(type, question) {
  if (type === 'addition') {
    const match = question.match(/^(\d+) \+ (\d+) = \?$/);
    if (match) return `${match[2]} + ${match[1]} = ?`;
  } else if (type === 'multiplication') {
    const match = question.match(/^(\d+) × (\d+) = \?$/);
    if (match) return `${match[2]} × ${match[1]} = ?`;
  }
  return null;
}

// === Main Entry Point ===
export function generatePuzzle(type, level, station = 5) {
  const generator = {
    addition: generateAddition,
    subtraction: generateSubtraction,
    multiplication: generateMultiplication,
    comparison: generateComparison,
    sequence: generateSequence,
    words: generateWordPuzzle,
  }[type] || generateAddition;

  // Retry up to 20 times to avoid duplicate questions within a game session
  let puzzle;
  for (let attempt = 0; attempt < 20; attempt++) {
    puzzle = generator(level, station);
    if (!puzzle) return null;
    if (!usedQuestions.has(puzzle.question)) {
      usedQuestions.add(puzzle.question);
      // For commutative operations, also mark the swapped version as used
      const commutative = getCommutativeQuestion(type, puzzle.question);
      if (commutative) usedQuestions.add(commutative);
      return puzzle;
    }
  }
  // Fallback: return last generated puzzle even if duplicate
  if (puzzle) {
    usedQuestions.add(puzzle.question);
    const commutative = getCommutativeQuestion(type, puzzle.question);
    if (commutative) usedQuestions.add(commutative);
  }
  return puzzle;
}

export default { generatePuzzle, resetUsedPuzzles };
