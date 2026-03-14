// ScoreSystem.js — חישוב ניקוד, מדליות, בוסטים

import { GAME_SETTINGS, MEDAL_THRESHOLDS, PUZZLE_TYPE_MULTIPLIERS } from '../config.js';
import UI from '../data/uiStrings.js';

export function calculateScore(timeLeft, totalTime, difficulty, puzzleType) {
  const typeMultiplier = PUZZLE_TYPE_MULTIPLIERS[puzzleType] || 1.0;
  const difficultyMultiplier = difficulty; // 1, 2, or 3
  const base = Math.round(GAME_SETTINGS.scorePerCorrect * typeMultiplier);
  const timeBonus = Math.round((timeLeft / totalTime) * 100 * GAME_SETTINGS.timeBonusMultiplier * difficultyMultiplier * typeMultiplier);
  return base + timeBonus;
}

export function getMaxScoreForPuzzle(totalTime, difficulty, puzzleType) {
  return calculateScore(totalTime, totalTime, difficulty, puzzleType);
}

export function getMedal(score, maxScore) {
  if (maxScore === 0) return null;
  const ratio = score / maxScore;
  if (ratio >= MEDAL_THRESHOLDS.gold) return 'gold';
  if (ratio >= MEDAL_THRESHOLDS.silver) return 'silver';
  if (ratio >= MEDAL_THRESHOLDS.bronze) return 'bronze';
  return null;
}

export function calculateBoost(isCorrect, streak) {
  if (!isCorrect) return GAME_SETTINGS.brakeSpeed;

  let boost = GAME_SETTINGS.boostSpeed;
  if (streak >= GAME_SETTINGS.streakBonusThreshold) {
    boost *= GAME_SETTINGS.streakBonusMultiplier;
  }
  return boost;
}

export function getBadges(puzzleHistory) {
  const badges = [];
  const byType = {};

  for (const p of puzzleHistory) {
    if (p.correct) {
      byType[p.type] = (byType[p.type] || 0) + 1;
    }
  }

  if ((byType.addition || 0) >= 10) badges.push(UI.badges.additionKing);
  if ((byType.subtraction || 0) >= 10) badges.push(UI.badges.subtractionStar);
  if ((byType.multiplication || 0) >= 8) badges.push(UI.badges.multiplicationHero);

  // Speed demon: 5+ answers under 5 seconds
  const fastAnswers = puzzleHistory.filter(p => p.correct && p.timeMs < 5000);
  if (fastAnswers.length >= 5) badges.push(UI.badges.speedDemon);

  // Streak master
  let maxStreak = 0;
  let currentStreak = 0;
  for (const p of puzzleHistory) {
    if (p.correct) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }
  if (maxStreak >= 7) badges.push(UI.badges.streakMaster);

  // Perfect score: all correct
  if (puzzleHistory.length > 0 && puzzleHistory.every(p => p.correct)) {
    badges.push(UI.badges.perfectScore);
  }

  return badges;
}

export default { calculateScore, getMaxScoreForPuzzle, getMedal, calculateBoost, getBadges };
